var express = require('express');
const { ObjectId, Db } = require('mongodb');
const { response, resource } = require('../app');
const product_helpers = require('../helpers/product_helpers');
const { getCartProducts } = require('../helpers/user_helper');
var router = express.Router();
const userHelpers = require('../helpers/user_helper')
let usernumber;
let otpnumber = {}
let message = null

const { userProductListPageination } = require('../public/javascripts/middleware')
//-----------------me------------------
// let ACCOUNT_SID = "ACf72c50f8c289190335d2beeabaee4ba4"
// let AUTH_TOKEN = "b7dc01beefad3209f2f3157dd6b8d8e0"
// let SERVICE_ID = "MGb1032e495f5fe9ae70b1f8b6eb7a5fe8";
//--------------vishnu-----------------------
// let ACCOUNT_SID = "ACf72c50f8c289190335d2beeabaee4ba4";
// let AUTH_TOKEN = "b7dc01beefad3209f2f3157dd6b8d8e0";
// let SERVICE_ID = "VA1773037b4ec7259ce2818c077e26f20e";
//----------------------rahul-------------------
require('dotenv').config()

let ACCOUNT_SID = process.env.TWILIOACCOUNTSID;
let AUTH_TOKEN = process.env.TWILIOAUTHTOKEN;
let SERVICE_ID = process.env.TWILIOSERVICEID;
const client = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);

const paypal = require('paypal-rest-sdk');
const admin_helper = require('../helpers/admin_helper');
paypal.configure({
  'mode': 'sandbox',
  'client_id': process.env.PAYPALCLIENTID,

  'client_secret': process.env.PAYPALCLIENTSECRET
});

/* GET home page. */
router.get('/', async function (req, res, next) {
  console.log('----tetsts-----------');
  console.log(req.session.user);
  console.log('----tetsts-----------');


  let banner = await userHelpers.getBanners()

  if (req.session.loggedIn) {
  let banner = await userHelpers.getBanners()

    console.log('-------------user login true--------------');
    let user = req.session.user
    console.log(req.session.user);
    res.render('user/home', { userHeader: true, user,banner })
  } else
  console.log('-------------normal home-------------');
console.log('the people who  still')
console.log('havent met are')
console.log('going to love you...')
console.log()
    res.render('user/home', { userHeader: true, banner })

})
router.get('/home', async function (req, res, next) {
  let user = req.session.user
  let cartCount = null
  if (req.session.loggedIn) {
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
    let banner = await userHelpers.getBanners()

    //(cartCount);
    res.render('user/home', { userHeader: true, user, banner })

  } else {
    res.redirect('/')

  }


});


// verify login

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}


// login and logout

router.get('/login', function (req, res, next) {

  if (req.session.loggedIn) {
    res.redirect('/')
  } else {

    res.render('user/login', ({ userHeader: true, error: req.session.loginErr }));
    req.session.loginErr = false
  }
});




// userlogin
router.post('/login', (req, res) => {

  userHelpers.doLogin(req.body).then((response) => {

    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/home')

    } else {

      req.session.loginErr = response.message

      res.redirect('/login')
    }
  })
})


router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})


// create account

router.get('/signup', (req, res) => {
  res.render('user/signup', { userHeader: true })
})
// registering user via login page

router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    const errormsg = response.message
    if (response.status) {

      req.session.loggedIn = true
      req.session.user = response.user

      res.redirect('/')

    } else {
      res.render('user/signup', { errormsg })

    }
  })
})
// OTP login
router.get("/otplogin", (req, res) => {
  res.render("user/otplogin", { userHeader: true, message })
  message = ""
})
//OTP submit
router.post('/otpsubmit', (req, res) => {
  let number = req.body.otpphnno;
  usernumber = number
  otpnumber = number;
  userHelpers.userStatusForOtp(number).then((response) => {
    if (response.status) {
      let errormsg = response.message

      client.verify.services(SERVICE_ID)
        .verifications.create({
          to: `+91${otpnumber}`,
          channel: "sms"
        })
        .then((data) => {
          //(data);
          res.render('user/otpsubmit')
        })
        .catch((err) => {
          //(err);
        })
    } else {
      message = response.message;
      res.render('user/otplogin', { message })
    }
  })
})
//OTP verify
router.post('/otpverify', (req, res) => {
  req.session.user = false
  const chknumber = (req.body.otpno);
  client.verify
    .services(SERVICE_ID)
    .verificationChecks.create({
      to: `+91${otpnumber}`,
      code: chknumber,
    })
    .then(async(data) => {
      if (data.valid == true) {
       let otpLoginData=await userHelpers.doLoginOtp(otpnumber)
        console.log("-----------------otpLoginData-------------------");
        console.log(otpLoginData);
        console.log("-----------------otpLoginData-------------------");
          req.session.user = otpLoginData.user
          req.session.loggedIn=true;
          let user = req.session.user
          console.log('------------------7777777777--------------');
          console.log(req.session.user);
          console.log('------------------7777777777--------------');
          res.redirect('/')
      } else {
        req.session.message = "invalid otp"
        let msg = "invalid OTP please enter valid OTP!!"
        res.render('user/otpsubmit', { msg })
      }
    })
})
router.get('/resendotp', (req, res) => {
  //('----------------------dghdfghdfgh----------------------');
  if (usernumber)
    //('-------------------------0000000000---------------------');
    client.verify.services(SERVICE_ID)
      .verifications.create({
        to: `+91${otpnumber}`,
        channel: "sms"
      })
      .then(() => {
    res.render('user/otpsubmit')
      })
})
//update user details
router.get('/user_profile', verifyLogin, async (req, res) => {
  let user = req.session.user
  res.render('user/user_profile_update', { userHeader: true, user })
})
//ajax route update user details
router.post('/updateUserDetail', async (req, res, next) => {
  await userHelpers.updateUserDetail(req.body).then((response) => {
    //("________0000______");
    //(response);
    //("_______00000________");
    // req.session.destroy()
    res.redirect('/useraccount')
  })
})
//---------------------------------product list page----------------------------------------
router.get('/products', userProductListPageination, async function (req, res, next) {
  let user = req.session.user
  let results = res.paginatedResults;
  console.log("--------------4-------------");
  console.log(results);
  console.log("--------------4--------------");
  let products = await product_helpers.getAllProducts()
  let category = await product_helpers.getCategory()
  res.render('user/product_show', { userHeader: true, user, products, results, category });
});
//-----------------------------filter products----------------------------------------------
router.post('/productfilter', async (req, res) => {
  let user = req.session.user
  let products = await userHelpers.getFilterProducts(req.body)
  let category = await product_helpers.getCategory()
  if (products == true) {
    console.log("--------empty filterbutton click----------------");
    res.redirect('/products/?page=1')
  } else {
    console.log("-----666666666-----------------");
    console.log(products);
    console.log("----------66666--------------");
    res.render('user/product_show_filter', { userHeader: true, products, user, category })
  }
})
//--------------------------------- product details-----------------------------------------
router.get('/productdetails/:id', (req, res) => {
  product_helpers.getProductDetails(req.params.id).then((products) => {
    let user = req.session.user
    res.render('user/product_details', { userHeader: true, user, products })
  })
});
//---------------------------------------------- cart------------------------------------------
router.get('/addtocart/:id', verifyLogin, async (req, res) => {
  let user = req.session.user
  userHelpers.addToCart(req.params.id, req.session.user._id).then(async (response) => {
    let products = await userHelpers.getCartProducts(req.session.user._id)
    let total = await userHelpers.getGrandTotal(req.session.user._id)
    let grandtotal = (total.length != 0) ? (total) : null
    res.redirect('/cart')
  })
})
router.get('/cart', verifyLogin, async (req, res) => {
  let user = req.session.user
  let products = await userHelpers.getCartProducts(req.session.user._id)
  let total = ""
  let grandtotal = ""
  let cartCount = await userHelpers.getCartCount(req.session.user._id)
  if (cartCount != 0) {
    total = await userHelpers.getGrandTotal(req.session.user._id)
    grandtotal = (total.length != 0) ? (total) : null
  console.log('----------status grandTotal--------');
  console.log(grandtotal);
  console.log('----------status grandTotal--------');
  res.render('user/usercart', { userHeader: true, products, grandtotal, user, cartCount })
  }else{
    console.log('--------------------hhhaaaiii-----------');
  res.render('user/usercart',{ userHeader: true,user})
  }
})
router.get('/product_show', (req, res) => {
  res.redirect('/products/?page=1');
})
// ---------------------------------------------product quantity change----------------------------------
router.post('/change-product-quantity', async (req, res, next) => {
  let obj = {}
  let response = await userHelpers.changeProductQuantity(req.body)
  let total = await userHelpers.getGrandTotal(req.session.user._id)
  console.log("---------666-------");
  console.log('total', total);
  console.log(req.body);
  console.log("-----------666--------");
  obj.total = total
  obj.disable = response.disable
  obj.stock = response.stock
  res.json(obj)
})
// ----------------------------placeorder confirm get--------------------------------------------------
router.get('/place_order', verifyLogin, async (req, res) => {
  let user = await userHelpers.getUserData(req.session.user._id)
  if (user.coupon != null) { 
    let couponPercent = parseInt(user.coupon.Offer_Percentage)
    let maxAmount=parseInt(user.coupon.max_amount)
    console.log('--------max amount------------');
    console.log(maxAmount);
    console.log('----------max amount---------');
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
    let total = await userHelpers.getGrandTotal(req.session.user._id)
    let grandtotal = total
    let offerAmount = parseInt((couponPercent * grandtotal) / 100)
    if(offerAmount>=maxAmount){
      offerAmount=maxAmount
    }
    let finalPrice = grandtotal - offerAmount
    let products = await userHelpers.getCartProducts(req.session.user._id)
    let address = await userHelpers.getaddress(user._id)
    let defaultAddress = await userHelpers.getDefaultAddress(user._id)
    res.render('user/user_checkout', { userHeader: true, user, products, total, grandtotal, cartCount, address, defaultAddress, offerAmount, finalPrice, couponstatus: true })
  }
  else {
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
    let total = await userHelpers.getGrandTotal(req.session.user._id)
    let products = await userHelpers.getCartProducts(req.session.user._id)
    let address = await userHelpers.getaddress(user._id)
    let defaultAddress = await userHelpers.getDefaultAddress(user._id)
    let grandtotal = total
    res.render('user/user_checkout', { userHeader: true, user, products, total, grandtotal, cartCount, address, defaultAddress })
  }
})
// ----------------------------placeorder confirm post--------------------------------------------------
router.post('/placeorderconfirm', async (req, res) => {
  let user = req.session.user
  let userId = req.session.user._id
  let total = await userHelpers.getGrandTotal(req.session.user._id)
  let finalprice = parseInt(req.body.finalprice)
  let cartProducts = await userHelpers.getCartProductlist(req.session.user._id)
  req.session.user.finalprice = finalprice
  userHelpers.placeOrder(req.body, cartProducts, finalprice).then(async (orderid) => {
      console.log("-------------element1----------------");
      console.log(orderid);
      console.log("-------------element----------------");
    let orderId1 = orderid
    req.session.orderid=orderid
    let orderId = orderid.insertedId
    if (req.body['payment-method'] == 'cod') {
      orderId1.details.forEach((element) => {
        console.log("-------------element----------------");
        console.log(element);
        console.log("-------------element----------------");
      })
      res.json({ codSuccess: true })
    }
    else if (req.body['payment-method'] == 'paypal') {
      res.json({ paypalSuccess: true, total, orderId, finalprice })
    }
    else if (req.body['payment-method'] == 'wallet') {
      let walletAmountCheck = await userHelpers.walletAmountCheck(req.session.user._id, finalprice)
      if (walletAmountCheck != null) {
        let paymentWallet = await userHelpers.WalletAmountReduce(req.session.user._id, finalprice, walletAmountCheck)
        res.json({ wallet: true, orderId: orderId })
      } else {
        res.json({ walleterr: true })
      }
    }
    else {
      userHelpers.generateRazorpay(orderId, finalprice).then((response) => {
        console.log(response, "00000000000000000");
        res.json(response)
      })
    }
  })
})
//-------------------------------------order success--------------------------------------------------
router.get('/order_success', verifyLogin, async (req, res) => {
  let userId = req.session.user._id
  let orderId = (req.query.orderId)
  let orderid=req.session.orderid.insertedId
  console.log('-----------------q------------------');
  console.log(orderid);
  console.log('-----------------q------------------');
  let user = await userHelpers.getUserData(userId)
  let cartCount = await userHelpers.getCartCountDoc()
  console.log("cartCount");
  console.log(cartCount);
  console.log("cartCount");
  let orderdata=await userHelpers.getCartProductsDetails(orderid)
    console.log('---------------3-----------');
    console.log(orderdata);
    console.log('---------------3-----------');
    orderdata.forEach((element) => {
      console.log("-------------element----------------");
      console.log(element);
      console.log("-------------element----------------");
      userHelpers.productStockDecrement(element)
    })
  if (user.coupon) {
    let couponId = user.coupon._id
    await userHelpers.getSuccessStatus(orderId, userId)
    console.log(cartCount);
    await userHelpers.clearCart(userId)
    console.log(cartCount);
    await userHelpers.addCouponToUsedCoupon(userId, couponId)
    await userHelpers.couponRemoveInUser(userId)
    res.render('user/order_success', { user: req.session.user })
  }
  else {
    await userHelpers.getSuccessStatus(orderId, userId)
    await userHelpers.clearCart(userId)
    res.render('user/order_success', { user: req.session.user })

  }
})
//--------------------------------------------------- wishlist ----------------------------------
router.get('/addtowishlist1/:id', verifyLogin, async (req, res) => {
  let user = req.session.user._id
  let productId = (req.params.id)
  await product_helpers.addToWishlist1(productId, user)
  res.redirect('back')
})
//---------------------------------------- wishlist---------------------------------------
router.get('/wishlist', verifyLogin, async (req, res) => {
  let user = req.session.user._id
  let wishList = await product_helpers.getUserWishlist(user)
  res.render('user/user_wishlist', { userHeader: true, user, wishList })
})
router.post('/remove_wish_product', verifyLogin, async (req, res, next) => {
  let user = req.session.user._id
  await product_helpers.removeWishProduct(user, req.body).then((result) => {
    res.json(result)
  })
})
//------------------------------------------ paypal pay------------------------------------
router.post('/p', (req, res) => {
  let total = parseInt(req.session.user.finalprice)
  let orderId = req.query.orderId
  const create_payment_json = {

    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:3000/order_success/?orderId=" + orderId,
      "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": "shinas",
          "price": total,
          "currency": "USD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "USD",
        "total": total,
      },
      "description": "Hat for the best team ever"
    }]
  };
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          res.json(payment.links[i].href);
        }
      }
    }
  });
});
router.post('/verifyPayment', (req, res) => {
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      res.json({ status: true })
    })
  }).catch((err) => {
    res.json({ status: false, errMsg: '' })
  })
})
// -----------------------------------------orders view---------------------------------------
router.get('/orders', verifyLogin, async (req, res) => {
  let user = req.session.user
  let cartCount = await userHelpers.getCartCount(req.session.user._id)
  let orders = await userHelpers.getUserOrders(req.session.user._id)
  console.log(orders);
  res.render('user/orders', { user, orders, userHeader: true })
})
//---------------------------order summary and invoice in user account page-----------------------------------
router.get('/ordersummary',verifyLogin,async(req,res)=>{
  let user = req.session.user
  let userId = req.session.user._id
  let order = await userHelpers.getUserOrders(req.session.user._id)
console.log("order");
console.log(order);
console.log("order");
  res.render('user/ordersummary',{user,userHeader:true,order})
})


//------------------------------------- user Account------------------------------------

router.get('/useraccount', verifyLogin, async (req, res) => {
  let user = req.session.user
  let userId = (user._id)
  let userdata = await userHelpers.getUserData(userId)
  let cartCount = await userHelpers.getCartCount(req.session.user._id)
  let wishlistcount = await userHelpers.getwishlistCount(userId)
  res.render('user/user_account', { userHeader: true, userdata, user, cartCount, wishlistcount })
})

//----------------------- remove cart item individual-------------------------------------

router.post('/removeCartItem', async (req, res, next) => {

  await userHelpers.removeCartItem(req.body).then((response) => {
    res.json(response)
  })
})


//user address----------------------------------------------
router.post('/user_address', (req, res) => {
  let address = req.body;

  userHelpers.addAddress(address).then((data) => {
    res.redirect('back')
  })
})
// -------------------apply coupon----------------
router.post('/couponApply', async (req, res) => {
  let userId = ObjectId(req.session.user._id)

  let grandTotal = await userHelpers.getGrandTotal(req.session.user._id)
  await userHelpers.couponApplyFunction(userId, req.body.coupon, grandTotal).then((response) => {
   

    res.json({ response })
  })
})
// -----------------------------remove coupon--------------------------------
router.get('/removecoupon', (req, res) => {
  //("--------------1----------------");

  let userId = ObjectId(req.session.user._id)

  userHelpers.removeUserCoupon(userId).then((response) => {

    res.redirect('/place_order')
  })
})
// ---------------------------------------remove address from checkout page ajax--------------------------------
router.post('/remove_address_from_collection', async (req, res) => {
  let addressId = ObjectId(req.body.addressId);
  await userHelpers.removeAddressInUserCheckout(addressId).then((response) => {
    res.json({ response })
  })
})
//-------------------------------------------search-----------------------------------------
router.post('/getSearchProducts', async (req, res) => {
  let searchItems = req.body.searchItems.trim();
  let search = await userHelpers.getSearchProducts(searchItems)
  search = search.slice(0, 10);
  res.send({ searchItems: search });
})
router.post('/products/testroute', async (req, res) => {
  //("aaaaaaaaaaaaaaaaa");
})

// -----------------------------wallet history-----------------------------------------------
router.get('/wallethistory',verifyLogin,async(req,res)=>{
  let user = req.session.user

  let userId = ObjectId(req.session.user._id)
   let getWalletHistoryDataa= await userHelpers.getWalletDetails(userId)
  //  dataDetails
   if(getWalletHistoryDataa){
    console.log("getWalletHistoryData");
    console.log(getWalletHistoryDataa);
    console.log("getWalletHistoryData");
   res.render('user/wallet_history',{userHeader: true,user,getWalletHistoryDataa}) 
   }else{
  let user = req.session.user

   res.render('user/wallet_history', {userHeader: true,user}) 

   }
 
}) 


router.get('/wallethistoryback',(req,res)=>{
  console.log('hai');
  res.redirect('/useraccount')
})
module.exports = router; 
   