const express = require('express');
const { adminProductListPageination } = require('../public/javascripts/middleware')
const router = express.Router();
const productHelpers=require('../helpers/product_helpers')
const adminHelpers=require('../helpers/admin_helper')
const path=require('path')
const graphHelper=require('../helpers/graph_helper')
const multer=require('multer');
const { Db } = require('mongodb');
const { response } = require('../app');
const user_helper = require('../helpers/user_helper');
require('dotenv').config()

const storage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,'public/pro_img')
  },
  filename:(req,file,cb)=>{
    
    cb(null,Date.now()+path.extname(file.originalname))
    console.log(file);
  }
})
let upload=multer({storage:storage})

//-------------multer for banner-------------------
const storag1=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,'public/banners')
  },
  filename:(req,file,cb)=>{
    
    cb(null,Date.now()+path.extname(file.originalname))
    console.log(file);
  }
})
let upload1=multer({storage:storag1})
//-------------multer for banner-------------------



const verifyAdminLogin=(req,res,next)=>{
  if(req.session.adminLogin){
    next()
  }else{
    res.redirect('/admin')
  }
}




/* GET admin listing. */
router.get('/', function(req, res, next) {
  if(req.session.adminLogin){
    console.log('----------121212----------------');
    console.log(req.session.adminLogin);
    console.log('----------121212----------------');

    res.redirect('/admin/adminpanel')

  }else{
    console.log('----------121212----------------');
    console.log(req.session.adminLogin);
    console.log('----------121212----------------');
    

    res.render('admin/adminlogin',{error:req.session.loginErr});
    req.session.loginErr = false


  }
  })
// post ADMIN LOGIN 
  router.post('/adminlogin',async(req,res)=>{
    console.log(req.body);
    let login = await adminHelpers.adminLogin(req.body)
    console.log('----------121212----------------');
    console.log(login.status);
    console.log('----------121212----------------');

      if(login.status){
      
     req.session.adminLogin=true
      res.redirect('/admin/adminpanel')
    }else{
      req.session.loginErr = login.msg
     res.redirect('/admin')
      
    }
   })

  // logout
  router.get('/adminlogout',(req,res)=>{
   
    req.session.destroy()
   
    res.render('admin/adminlogin')
  })

// admin dashbord

router.get('/adminpanel',verifyAdminLogin,async function(req, res, next) {
  let totalSalesGraph=await graphHelper.getTotalSalesGraph()
  let todayOrderCount= await graphHelper.getTotalsaleCount()
  let monthlYTotalSale=await graphHelper.getMonthlyTotalSale()
  console.log("todayOrderCount");
  console.log(todayOrderCount);
  console.log("todayOrderCount");
  console.log("monthSales");
  console.log(monthlYTotalSale);
  console.log("monthSales");
  console.log("dailySale");
  if(totalSalesGraph || todayOrderCount || monthlYTotalSale){
    let {yearlySale,monthSales,dailySale}=totalSalesGraph
console.log('haiiiiii');
    res.render('admin/adminpanel',{yearlySale,monthSales,dailySale,admin:true,todayOrderCount,monthlYTotalSale});
  }
  else{
console.log('oooooooooooo');

    res.render('admin/adminpanel',{admin:true});

  }
});



// product showing

router.get('/productmanagement',verifyAdminLogin,adminProductListPageination, async function(req, res, next) {
  let results = res.getPaginatedResultForAdmin;
  console.log(req.query);
  // let product=results
console.log('---------------paginated result admin----------------');
// console.log(product);
console.log('---------------paginated result admin----------------');

    res.render('admin/productmanagement',{admin:true,results});
  })
 

//------------------------------------ add product---------------------------------------------


router.get('/addproduct',verifyAdminLogin,async function(req, res, next) {
  let allcategory=await adminHelpers.getCategory()
 
  res.render('admin/addproduct',{admin:true,allcategory});
 
  
});


//post addproduct

router.post('/productmanagement',upload.array("image"),(req,res)=>{
  const files = req.files
 const file = files.map((file)=>{
      return file
  })
 
  const fileName = file.map((file)=>{
      return file.filename
  })
  const product = req.body
  product.img = fileName

  // console.log(req.body);
  // console.log(req.file,'fileeeesdsfds');
  productHelpers.addProduct(req.body)
console.log(req.body);
  res.redirect('/admin/productmanagement/?page=1')
})

//add product in product management



  // productHelpers.addProduct(req.body,(result)=>{
  //   res.render('ad')

  // })



  // user view
  router.get('/view_user',verifyAdminLogin, async(req,res)=>{
    let user=await adminHelpers.getAllUsers()
      res.render('admin/view_user',{admin:true,user})
    })
 
    
   
 

// BLOCK USER 

router.get('/blockUser/:id',async(req,res)=>{
  // console.log('heloo');
  // console.log(req.params.id,'uuuuuuuuuuuuuu');
  let block = await adminHelpers.blockUser(req.params.id)
  res.redirect('back')
})

//unblock user
router.get('/unBlockUser/:id',async(req,res)=>{
  let unblock=await adminHelpers.unBlockUser(req.params.id)
  res.redirect('back')
})




//delete product
router.get('/deleteproduct/:id',async(req,res)=>{
  let productId=req.params.id
productHelpers.deleteProduct(req.params.id)

 res.redirect('/admin/productmanagement/?page=1')


}) 

//------------------------------ EDIT product ------------------------------------


  router.get('/editproduct/:id',async(req,res)=>{
   let productData=await productHelpers.getProductDetailsForAdmin(req.params.id)
console.log('------------get products for admin edit--------------');
console.log(req.params.id);
console.log(productData.productData);
let product=productData.productData[0]
let category=productData.categoryData
console.log('--------------------555555555----------------');
console.log(product);
console.log(category);
   res.render('admin/editproduct',{admin:true,product,category})
  
   
  })

  router.post('/updateproduct/:id',upload.array('image'),(req,res)=>{
    const files = req.files
    console.log('rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');
    const file = files.map((file)=>{
         return file
     }) 
      
     const fileName = file.map((file)=>{
         return file.filename
     })
     const product = req.body
     product.img = fileName
     console.log('--------------upate porduct detais in req.body----------------');
    console.log(req.body);
    productHelpers.updateProduct(req.params.id,product).then(()=>{
     
      res.redirect('/admin/productmanagement/?page=1')
    })
  
    })

    // ----------------------------banner management-------------------------------

router.get('/bannermanagement',verifyAdminLogin,((req,res)=>{
  console.log('haiiiiaaaaaaaaaaaaaaaaaaaaaaaaa');
  res.render('admin/bannermanagement',{admin:true})
})
)

// -------------------------------------------------------------
router.post('/banneradding',upload1.array('image'),(async(req,res)=>{

  console.log(req.body);
  const files = req.files
  const file = files.map((file)=>{
       return file
   })
  
   const fileName = file.map((file)=>{
       return file.filename
   })
   const product = req.body
   product.img = fileName
 
   // console.log(req.body);
   // console.log(req.file,'fileeeesdsfds');
  await adminHelpers.addBanner(req.body)
 console.log(req.body);
   res.redirect('/admin/bannermanagement')
}))

    // ----------------------------banner management-------------------------------



    router.get('/categorymanagement',verifyAdminLogin,async(req,res)=>{

      
    

      let categories=await adminHelpers.getCategory()


      console.log(categories);

        res.render('admin/categorymanagement',{admin:true,categories})  
     
      
    })

  
router.post('/addcategory',(req,res)=>{
  console.log("req.body");
  console.log(req.body);
  console.log("req.body");
  adminHelpers.addCategory(req.body).then((data)=>{
    res.redirect('/admin/categorymanagement')
  })
 
 
})
router.post('/editcategory/:id',(req,res)=>{
  console.log("req.body");
  console.log(req.body);
  console.log(req.params.id);
  console.log("req.body");
  adminHelpers.updateCategory(req.params.id,req.body).then((data)=>{
    res.redirect('/admin/categorymanagement')
  })
})
router.post('/removecategory',async(req,res)=>{
  console.log(req.body);

  console.log("---------------7686------------------"); 

  let cat=await adminHelpers.deleteCategory(req.body.catId)
  console.log("---------------7686------------------");
  console.log(cat);
  console.log("---------------7686------------------");
  res.redirect('back')
})
router.post('/test',(req,res)=>{
  console.log('haoiiiiiiiiii');
})


//------------------------------order management------------------------------------
router.get('/admin_ordermanage',verifyAdminLogin,async(req,res)=>{
 let orders= await adminHelpers.getOrderDetails()
 //let orderData=await adminHelpers.getAllOrders()
//  console.log(typeof(orderData));
//  console.log(orderData);
//  console.log("ha ha ha...");
//  console.log(typeof(orderData));
//  let walletStatus=await adminHelpers.getUserData()
//  let products=await adminHelpers.getProductsForAdmin()

    res.render('admin/admin_ordermanage',{admin:true,orders})
  })
    
  
  //console.log(orders);


//------------------------------------------------ delivery status updation when cancel product----------------------------------------

router.post('/deliveryStatusUpdation',async(req,res,next)=>{
  console.log('---------------5555555555-----------------------');
console.log(req.body);

  console.log('---------------5555555555-----------------------');
  await adminHelpers.deliveryStatusUpdation(req.body).then((response)=>{

   response.forEach((element)=>{
    user_helper.productStockIncrement(element)
   })
    res.json(response)
  })

})



router.post('/deliveryStatusUpdationForReturn',async(req,res)=>{
  let returnproductstatus= await adminHelpers.deliveryStatusUpdationForReturn(req.body)
  res.json({returnproductstatus})
})

//---------------------------------------- coupon-------------------------------------------------------
router.get('/admin_coupon_generator',verifyAdminLogin,async(req,res)=>{
 await adminHelpers.getCoupons().then((response)=>{
let coupon=response
console.log("--------5-------");
console.log(coupon);
console.log("-----------5-------");
   res.render('admin/admin_coupon_generator',{admin:true,coupon})
 })
})

router.post('/coupon-generator',async(req,res)=>{
  console.log(req.body);
  await adminHelpers.addCoupons(req.body).then((response)=>{
    res.redirect('/admin/admin_coupon_generator')
  })
})

//---------------------------------------------------- delete coupon-------------------------------------------
router.get('/delete-coupon/:id',async(req,res)=>{
  console.log(req.params.id);
  await adminHelpers.deleteCoupon(req.params.id).then((response)=>{
res.redirect('/admin/admin_coupon_generator')
  })
})
// ---------------------------------sales report---------------------------------------------------------------
router.get('/admin_sales_report',async(req,res)=>{
  let SalesReport=await adminHelpers.getSalesReport()
let {weeklyReport, monthlyReport, yearlyReport}= SalesReport
console.log("------------wwwwww--------------");
console.log(weeklyReport);
console.log("------------wwwwwww---------------");
  res.render('admin/admin_sales_report',{admin:true,weeklyReport, monthlyReport, yearlyReport})
})

//------------------------------return payment---------------------------------------------------------------------

router.get('/return-payment/:orderId/:userId',async(req,res)=>{
 
  orderId=req.params.orderId
  userId=req.params.userId
  console.log(',.,...................vvvvvvvvvvvvvvv  ...,,,,,,,,,,,,,,,,,,,,,,,,,,,');
  console.log(orderId,"orderId");
  console.log(userId,"userId");
  console.log(',.,...................vvvvvvvvvvvvvvv  ...,,,,,,,,,,,,,,,,,,,,,,,,,,,');

  let orderStatus=await productHelpers.refundOrderStatusUpdate(orderId,userId).then(response)
  console.log("-------------------------refund completed------------------------------");
  console.log("-------------------------entering return payment------------------------------");
  let PaymentMethod=await productHelpers.returnPayment(orderId,userId)
  res.redirect('/admin/admin_ordermanage')



}),

module.exports = router;



