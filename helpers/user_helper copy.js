var db = require('../config/connection')
const collection = require('../config/collections')
const bcrypt = require('bcrypt')
const objectId = require('mongodb').ObjectId



const Razorpay = require('razorpay');
const { resolve } = require('path');
const { response } = require('../app');

var instance = new Razorpay({
    key_id: 'rzp_test_rDyALEYvpGsNTJ',
    key_secret: 'ZVnvbrHUxtFpyQUuNV6lzGCg',
});

//const {ObjectId}=require('mongodb');
module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.status = true;
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })

            if (user) {
                response.message = 'User Already exist, Choose another Mail'
                response.status = false
                resolve(response)
            } else {
                userData.password = await bcrypt.hash(userData.password, 10)


                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                    response.status = true
                    response.user = userData
                    resolve(response)


                })
            }

        })

    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })


            if (user) {

                bcrypt.compare(userData.password, user.password).then((status) => {


                    if (status) {
                        if (user.status) {
                            // console.log("login success");
                            response.user = user
                            response.status = true
                            resolve(response)
                        } else {

                            response.message = 'Account Blocked'
                            console.log("login failed");
                            resolve(response)
                        }
                    } else {
                        //  console.log("login failed");
                        response.message = 'Incorrect Password'
                        response.status = false
                        resolve(response)
                    }
                })
            }
            else {
                //  console.log("login failed no matching data");
                response.message = 'Mail not found'
                response.status = false
                resolve(response)
            }
        })

    },
    getUserDetails: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((user) => {
                resolve(user)
            })
        })
    },
    userStatusForOtp: (number) => {
        let otpmsg = {}
        return new Promise((res, rej) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ mobno: number }).then((response) => {

                if (response) {

                    if (response.status) {
                        otpmsg.status = true
                        otpmsg.exist = true;
                        res(otpmsg)

                    } else {
                        otpmsg.status = false
                        otpmsg.message = "you are blocked by admin"
                        res(otpmsg)
                    }
                } else {
                    otpmsg.exist = false;
                    otpmsg.message = "eneter registered mobile number"

                    res(otpmsg)
                }
            })
        })
    },



    addToCart: (productId, userId) => {
        let proObj = {
            item: objectId(productId),
            quantity: 1
        }

        return new Promise(async (res, rej) => {
            let userCart = await db.get().collection(collection.CART_COLLECTON).findOne({ user: objectId(userId) })

            // console.log('userCart')
            // // console.log(userCart)
            // // console.log(productId)
            // console.log('productId')

            if (userCart) {

                let proExist = userCart.products.findIndex(products => products.item == productId)
                console.log(proExist);

                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTON)
                        .updateOne({ user: objectId(userId), 'products.item': objectId(productId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then((data) => {
                            res()

                        })


                } else {

                    db.get().collection(collection.CART_COLLECTON)
                        .updateOne({ user: objectId(userId) },
                            {

                                $push: { products: proObj }

                            }
                        ).then((response) => {
                            console.log(response,'---------------------------------------------');
                            res()
                        })
                }
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTON).insertOne(cartObj).then((response) => {
                    res()
                })
            }

        })
    },



    getCartProducts: (userId) => {
        return new Promise(async (res, rej) => {

            let cartItems = await db.get().collection(collection.CART_COLLECTON).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: ({ $arrayElemAt: ['$product', 0] })
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: 1, total: { $multiply: ['$quantity', { $toInt: '$product.price' }] }
                    }
                }


            ]).toArray()
            res(cartItems)

        })
    },



    getCartCount: (userId) => {
        return new Promise(async (res, rej) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTON).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            res(count)
        })
    },

    // changeProductQuantity: (details) => {
    //     details.quantity=parseInt(details.quantity)

    //     let response={

    //     }
    //     let signOfCount=Math.sign(details.count)
    //       console.log('55555555555555555555555555555555555555');
    //     details.count = parseInt(details.count)
    //     console.log(details);


    //     return new Promise((resolve, reject) => {

    //         if (details.count == -1 && details.quantity == 1) {
    //             db.get().collection(collection.CART_COLLECTON).updateOne({ _id: objectId(details.cart) },
    //                 {
    //                     $pull: { products: { item: objectId(details.product) } }
    //                 }).then((response) => {
    //                     console.log(response,'77777777777777777777777777777777777777777777777');
    //                     resolve({ remove: true })
    //                     console.log('----------');
    //                 })


    //         } else {
    //             db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(details.product)}).then((response)=>{
    //                 console.log("response");
    //                 console.log(response);

    //                 console.log("response");
    //                 response.quantity = parseInt(response.quantity)

    //                 if(response.quantity>details.quantity){
    //                     db.get().collection(collection.CART_COLLECTON)
    //                     .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
    //                         {
    //                             $inc: { 'products.$.quantity':details.count }
    //                         }
    //                     ).then((response)=>{
    //                         response.inc=true
    //                         response.err=false
    //                         resolve(response)
    //                     })

    //                 }else if(signOfCount== -1 && response.quantity== details.quantity){
    //                     db.get().collection(collection.CART_COLLECTON).updateOne({_id:objectId(details.product),'products.item':objectId(details.product)},
    //                     {
    //                         $inc:{'products.$.quantity':details.count}
    //                     }).then((response)=>{
    //                         response.inc=true
    //                         response.err=false
    //                         resolve(response)
    //                     })
    //                 }else{
    //                     response.outOfStock='Out of stock'
    //                     response.stockErr=true
    //                     resolve(response)
    //                 }
    //             })
    //             // db.get().collection(collection.CART_COLLECTON)
    //             //     .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
    //             //         {
    //             //             $inc: { 'products.$.quantity': count }
    //             //         }
    //             //     ).then((data) => {
    //             //        console.log('decrease...................');
    //             //         // resolve('increased')
    //             //         let response={
    //             //             changeQuantity:true
    //             //         }
    //             //        resolve(response)
    //             //     })
    //         }

    //     })
    // },
    changeProductQuantity:({cart,product,count,quantity})=>{
        console.log(count)
        console.log(quantity)
        let response = {}

        count = parseInt(count)
        quantity = parseInt(quantity)

        return new Promise((resolve,reject)=>{
            if(count == -1 && quantity == 1 ){
                resolve({disable:true})
            }else{
                db.get().collection(collection.CART_COLLECTON).updateOne({_id:objectId(cart),'products.item':objectId(product)},
                {
                    $inc:{'products.$.quantity':count}
                }).then((response)=>{
                    console.log(response)
                    resolve(response)
                    // resolve()
                }).catch((e)=>{
                    console.log('---------------------',e)
                    reject()
                })
            }
        })
    },
    removeCartItem: (data) => {
console.log(data.cartid);
console.log(data.proid);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTON).updateOne({ _id: objectId(data.cartid) },
                {
                    $pull: { products: { item: objectId(data.proid) } }
                }).then((response) => {
                    resolve(response)
console.log('..........',response,'........');
                })
        })
    },

    getGrandTotal: (userId) => {
        return new Promise(async (resolve, reject) => {

            let totalPrice = await db
                .get()
                .collection(collection.CART_COLLECTON)
                .aggregate([
                    { $match: { user: objectId(userId) } },

                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: "$products.item",
                            quantity: "$products.quantity"
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'

                        }
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            product: { $arrayElemAt: ['$product', 0] }
                        }
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            price: { $toInt: '$product.price' }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            grandTotal: { $sum: { $multiply: ['$quantity', '$price'] } }
                        }

                    }

                ])

                .toArray();


            resolve(totalPrice);
        });
    },



    placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {

console.log(order);
            total.grandTotal = parseInt(total[0].grandTotal)

            let status = order['payment-method'] === 'cod' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetails: {
                    productname: products.productname,
                    name: order.buyername,
                    address: order.buyeraddress,
                    city: order.buyercity,
                    district: order.buyerdistrict,
                    state: order.buyerstate,
                    pincode: order.buyerpin,
                    phone: order.buyerphone
                },
                userId: objectId(order.buyerid),
                paymentMethod: order['payment-method'],
                products: products,
                totalAmount: total.grandTotal,
                date: new Date(),
                status: status
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {

                console.log(response);


                db.get().collection(collection.CART_COLLECTON).deleteOne({ user: objectId(order.buyerid) }).then((data) => {

                })
                console.log('--------------');
                console.log(response);
                console.log('---------------');
                resolve(response.insertedId)
            })
        })
    },




    getCartProductlist: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTON).findOne({ user: objectId(userId) })

            resolve(cart.products)
        })
    },



    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) }).toArray()

            resolve(orders)
        })
    },
    getOrderProducts: (orderId) => {
        return new Promise(async (res, rej) => {

            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                }
                ,
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: ({ $arrayElemAt: ['$product', 0] })
                    }
                }


            ]).toArray()

            res(orderItems)

        })
    },
    

    generateRazorpay: (orderId, total) => {
        total = total.grandTotal;
        console.log(total);
        console.log("orderID:", orderId);
        return new Promise((resolve, reject) => {
            let options = {
                amount: total * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: '' + orderId
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                } else {
                    //console.log("order",orderId,total);
                    resolve(order)
                    console.log("new order:", order);
                }
            });

        })
    },

    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto')
            let createHmac = null;
            //const hmac = createHmac('sha256', 'ZVnvbrHUxtFpyQUuNV6lzGCg');
            let hmac = crypto.createHmac('sha256', 'ZVnvbrHUxtFpyQUuNV6lzGCg');

            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
            console.log(hmac.digest('hex'));
        })
    },
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id: objectId(orderId) }, {
                $set: {
                    status: 'placed'
                }
            }
           
            ).then(() => {
                console.log('12345');
                resolve()
            })
        })
    },


    //add address
    addAddress:(data)=>{
        data.userId=objectId(data.userId)
        console.log(data,'---------------------------2222')
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.ADDRESS_COLLECTION).insertOne(data)
            resolve(data)
        })
        
    },

    //get address
    getaddress:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let userAddress=await db.get().collection(collection.ADDRESS_COLLECTION).find({userId:objectId(userId)}).toArray()
          
            resolve(userAddress)
        })
    },
    getDefaultAddress:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let userAddress=await db.get().collection(collection.ADDRESS_COLLECTION).find({userId:objectId(userId)}).limit(1).toArray()
           
            resolve(userAddress)
        })
    },



}