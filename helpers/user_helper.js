var db = require('../config/connection')
const collection = require('../config/collections')
const bcrypt = require('bcrypt')
const objectId = require('mongodb').ObjectId



const Razorpay = require('razorpay');

const { resolve } = require('path');
const { response } = require('../app');
const { ObjectId } = require('mongodb');
const { report } = require('process');

var instance = new Razorpay({
    key_id: 'rzp_test_rDyALEYvpGsNTJ',
    key_secret: 'ZVnvbrHUxtFpyQUuNV6lzGCg',
});



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
    doLoginOtp: (userData) => {
        console.log("userData");
        console.log(userData);
        console.log("userData");
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobno: userData })

            console.log("user");
            console.log(user);
            console.log("user");
            if (user) {
                console.log("-------------------user finded------------------");

                if (user.status) {

                    console.log("--------login success status true---------");
                    response.user = user
                    response.status = true
                    resolve(response)
                } else {
                    console.log("--------login failed status false---------");

                    response.message = 'Account Blocked'
                    console.log("login failed");
                    resolve(response)
                }
            } else {
                 console.log("----------login failed wrong number-----------------");
                response.message = 'wrong number'
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
        console.log(number, "-------------------------------------------------");
        return new Promise((res, rej) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ mobno: number }).then((response) => {
                console.log(response);
                if (response) {

                    if (response.status) {
                        otpmsg.status = true
                        otpmsg.exist = true;
                        res(response)

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
                console.log("-----------------");
                console.log(otpmsg);
                console.log("---------------");
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
                            console.log(response, '---------------------------------------------');
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



    // getCartProducts: (userId) => {
    //     return new Promise(async (res, rej) => {

    //         let cartItems = await db.get().collection(collection.CART_COLLECTON).aggregate([
    //             {
    //                 $match: { user: objectId(userId) }
    //             },
    //             {
    //                 $unwind: '$products'
    //             },
    //             {
    //                 $project: {
    //                     item: '$products.item',
    //                     quantity: '$products.quantity'
    //                 }
    //             },
    //             {
    //                 $lookup: {
    //                     from: collection.PRODUCT_COLLECTION,
    //                     localField: 'item',
    //                     foreignField: '_id',
    //                     as: 'product'
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     item: 1, quantity: 1, product: ({ $arrayElemAt: ['$product', 0] })
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     item: 1, quantity: 1, product: 1, total: { $multiply: ['$quantity', { $toInt: '$product.price' }] }
    //                 }
    //             }


    //         ]).toArray()
    //         res(cartItems)

    //     })
    // },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTON).findOne({ user: objectId(userId) })
            if (cart) {


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
                            as: 'products'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
                        }
                    },
                    {
                        $lookup: {
                            from: 'category',
                            localField: 'product.category',
                            foreignField: '_id',
                            as: 'categoryDetails'
                        }
                    },
                    {
                        $unwind: '$categoryDetails'
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: 1, categoryDetails: 1,
                            discountOff: { $cond: { if: { $gt: ['$product.poffer', '$categoryDetails.coffer'] }, then: { $toInt: '$product.poffer' }, else: { $toInt: '$categoryDetails.coffer' } } },

                        }
                    },
                    {
                        $addFields: {

                            discountedAmount: { $round: { $divide: [{ $multiply: [{ $toInt: '$product.price' }, { $toInt: '$discountOff' }] }, 100] } },
                        }
                    },
                    {
                        $addFields: {

                            priceAfterDiscount: { $round: { $subtract: [{ $toInt: '$product.price' }, { $toInt: '$discountedAmount' }] } }
                        }
                    },
                    {
                        $addFields: {

                            totalAfterDiscount: { $multiply: ['$quantity', { $toInt: '$priceAfterDiscount' }] }
                        }
                    }
                ]).toArray();
                console.log('===============cartItems==================');
                console.log(cartItems);
                console.log('===============cartItems==================');

                resolve(cartItems);
            } else {
                resolve(cart)
                console.log('----------haiiiiiiiii-----------');
            }
        });
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

    getCartCountDoc: (userId) => {
        return new Promise(async (res, rej) => {
            let cart = await db.get().collection(collection.CART_COLLECTON).countDocuments({ user: objectId(userId) })

            res(cart)
        })
    },
    getwishlistCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let wishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            if (wishlist) {
                count = wishlist.products.length
            } resolve(count)
        })
    },


    changeProductQuantity: ({ cart, product, count, quantity, stockCount }) => {
        // console.log('---------------qqqqqq-------------------------')
        // console.log(count)
        // console.log(quantity)
        // console.log(stockCount)
        // console.log(product);
        // console.log('---------------qqqqqq-------------------------')

        let response = {}

        count = parseInt(count)
        quantity = parseInt(quantity)
        stockCount = parseInt(stockCount)
        return new Promise((resolve, reject) => {
            if (count == -1 && quantity == 1) {
                db.get().collection(collection.CART_COLLECTON).updateOne({ _id: ObjectId(cart), 'products.item': objectId(product) },
                    {
                        $set: { 'products.$.quantity': 1 }
                    }

                ).then(() => {
                    resolve({ disable: true })
                })
            } else {
                if (count != -1) {

                    db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(product) })
                    if (quantity >= stockCount) {
                        resolve({ stock: true })
                    } else {

                        db.get().collection(collection.CART_COLLECTON).updateOne({ _id: objectId(cart), 'products.item': objectId(product) },
                            {
                                $inc: { 'products.$.quantity': count }
                            }).then((response) => {
                               
                                resolve({ status: true })
                                // resolve()
                            }).catch((e) => {
                                console.log('---------------------', e)
                                reject()
                            })
                    }
                } else {
                    db.get().collection(collection.CART_COLLECTON).updateOne({ _id: objectId(cart), 'products.item': objectId(product) },
                        {
                            $inc: { 'products.$.quantity': count }
                        }).then((response) => {
                           
                            resolve({ status: true })
                            // resolve()
                        }).catch((e) => {
                            console.log('---------------------', e)
                            reject()
                        })

                }
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
                    console.log('..........', response, '........');
                })
        })
    },

    getGrandTotal: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTON).find({ user: objectId(userId) }).toArray();
            console.log(cart, 'cartyyyy');
            if (cart.length != 0) {
                let totalAmount = await db.get().collection(collection.CART_COLLECTON).aggregate([
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
                            as: 'products'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
                        }
                    },
                    {
                        $lookup: {
                            from: collection.CATEGORY_COLLECTION,
                            localField: 'product.category',
                            foreignField: '_id',
                            as: 'categoryDetails'
                        }
                    },
                    {
                        $unwind: '$categoryDetails'
                    },
                    {
                        $addFields: {
                            discountOff: { $cond: { if: { $gt: ['$product.poffer', '$categoryDetails.coffer'] }, then: { $toInt: '$product.poffer' }, else: { $toInt: '$categoryDetails.coffer' } } },

                        }
                    },
                    {
                        $addFields: {
                            discountedAmount: { $round: { $divide: [{ $multiply: [{ $toInt: '$product.price' }, { $toInt: '$discountOff' }] }, 100] } },
                        }
                    },
                    {
                        $addFields: {
                            priceAfterDiscount: { $round: { $subtract: [{ $toInt: '$product.price' }, { $toInt: '$discountedAmount' }] } }

                        }
                    },
                    {
                        $group: {
                            _id: null, total: { $sum: { $multiply: ['$quantity', { $toInt: '$priceAfterDiscount' }] } }
                        }
                    }
                ]).toArray();
                console.log('*********total-amount');
                console.log(totalAmount);

                console.log('*********total-amount');
                resolve(totalAmount[0].total);

            } else {
                resolve(cart);
            }
            //console.log(cart);
        });
    },



    placeOrder: (order, products, finalprice) => {
        let d = new Date()
        let month = '' + (d.getMonth() + 1)
        let day = '' + d.getDate()
        let year = d.getFullYear()

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        let time = [year, month, day].join('-');
        let monthofbusiness = [year, month].join('-');
        let yearofbusiness = year
        return new Promise((resolve, reject) => {

            console.log(order, '------------------------------------aaaaaassssssssssssssddddddddddddddd---------');
            //total.grandTotal = parseInt(total[0].grandTotal)

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
                    phone: order.buyerphone,

                },
                userId: objectId(order.buyerid),
                paymentMethod: order['payment-method'],
                products: products,
                totalAmount: finalprice,
                date: time,
                month: monthofbusiness,
                year: yearofbusiness,
                status: status,
                createdAt: new Date()
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: {
                            _id: response.insertedId
                        }
                    },
                    {
                        $unwind: "$products"


                    }, {
                        $project: {
                            proId: '$products.item',
                            qty: '$products.quantity'
                        }
                    }
                ]).toArray().then((details) => {
                    response.details = details
                    resolve(response)
                    console.log("------cod response---------");
                    console.log(response);
                })
            })
        })
    },

    clearCart: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTON).deleteOne({ user: objectId(userId) }).then((data) => {
                resolve(data)
            })
        })

    },

    // ----------------------------------------stock decrement-----------------------
    productStockDecrement: ({ proId, qty }) => {

        let proQty = parseInt(qty)
        proQty = -Math.abs(qty)
        console.log("-------------stock decrement--------------");
        console.log(proQty);
        console.log(qty);
        console.log("-------------stock decrement---------------");

        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: proId }, {
                $inc: { stock: proQty }
            })
        })

    },
    // --------------------------stock increment----------------------

    productStockIncrement: ({ proId, qty }) => {


        let proQty = parseInt(qty)

        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) }, {
                $inc: { stock: proQty }
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
        console.log(userId);
        userId = objectId(userId)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).aggregate([{
                $match: { userId: userId }
            }, {
                $project: { products: 1 }
            },
            {
                $unwind: '$products'
            }, {
                $project: { productId: '$products.item', quantity: '$products.quantity' }
            },
            {
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'products'
                }
            },
            {
                $unwind: '$products'
            },
            {
                $group: { _id: "$_id", productList: { $push: { product: '$products', quantity: "$quantity", discount: '$discount' } } }
            },
            
            {
                $lookup: {
                    from: collection.ORDER_COLLECTION,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'orderDetails'
                }
            }, {
                $unwind: '$orderDetails'
            }, {
                $sort: { _id: -1 }
            }
            ]).toArray().then((orders) => {

                resolve(orders)
            })
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


    generateRazorpay: (orderId, finalPrice) => {

        console.log("---------55555----------");
        console.log(orderId, finalPrice);
        console.log("--------555555-------");
        console.log("orderID:", orderId);
        return new Promise((resolve, reject) => {
            let options = {
                amount: finalPrice * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: '' + orderId
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                } else {
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
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                $set: {
                    status: 'placed'
                }
            }

            ).then(() => {

                resolve()
            })
        })
    },





    //add address
    addAddress: (data) => {
        data.userId = objectId(data.userId)
        console.log(data, '---------------------------2222')
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ADDRESS_COLLECTION).insertOne(data)
            resolve(data)
        })

    },

    //get address
    getaddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let userAddress = await db.get().collection(collection.ADDRESS_COLLECTION).find({ userId: objectId(userId) }).toArray()

            resolve(userAddress)
        })
    },
    getDefaultAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let userAddress = await db.get().collection(collection.ADDRESS_COLLECTION).find({ userId: objectId(userId) }).limit(1).toArray()

            resolve(userAddress)
        })
    },

    //update user details
    updateUserDetail: ({ name, pwd, number, userId }) => {


        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) },
                {
                    $set: {
                        name: name,
                        mobno: number,
                        password: pwd

                    }
                }).then((data) => {
                    resolve(data)
                    console.log(data)
                }).catch((error) => {
                    console.log(error);
                })
        })
    },
    getUserData: (userId) => {
        return new Promise(async (resolve, reject) => {
            let userData = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
            resolve(userData)
        })
    },
    //    ----------------------------------------------------purchase success---------------------------
    getSuccessStatus: (orderId, userId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                {
                    $set: {
                        status: "placed"

                    }
                }).then((data) => {
                    resolve(data)
                    console.log(data)
                }).catch((error) => {
                    console.log(error);
                })

        })
    },

    // --------------------apply coupon function-----------------
    couponApplyFunction: (userId, data, grandTotal) => {
        console.log(grandTotal, '------------------grandTotal-------------');
        let d = new Date()
        let month = '' + (d.getMonth() + 1)
        let day = '' + d.getDate()
        let year = d.getFullYear()

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        let time = [year, month, day].join('-');
        return new Promise(async (resolve, reject) => {
            let couponObj = {}
            let couponObject = await db.get().collection(collection.COUPON_COLLECTION).findOne({ Coupon: data })


            if (couponObject) {

                if (couponObject.Expiry_date >= time) {
                    let couponUsed = await db.get().collection(collection.USED_COUPON_COLLECTION).
                        findOne({
                            $and: [{ userId: objectId(userId) },
                            { coupon: { $in: [objectId(couponObject._id)] } }]
                        })
                    console.log("---------0000000-------------");
                    console.log(couponObject._id, userId);
                    console.log(couponUsed);
                    console.log("---------0000000-------------");

                    if (couponUsed) {
                        couponObj.status = false
                        couponObj.usedStatus = false
                        couponObj.msg = "coupon already used"
                        resolve(couponObj)
                    } else {
                        db.get().collection(collection.USER_COLLECTION).
                            updateOne({ _id: objectId(userId) }, { $set: { coupon: couponObject } })
                        couponObj.status = true
                        couponObj.usedStatus = true
                        couponObj.msg = "coupon applied"
                        couponObject.Offer_Percentage = parseInt(couponObject.Offer_Percentage)                        
                        couponObject.max_amount = parseInt(couponObject.max_amount)
                        couponObj.discountedAmount = grandTotal * (couponObject.Offer_Percentage / 100)
                        console.log('------------ffy----------------');                       
                        console.log(couponObject.max_amount);
                        console.log(couponObj.discountedAmount);                    
                        console.log('------------ffy----------------');
                        if (couponObj.discountedAmount >= couponObject.max_amount) {

                            couponObj.discountedAmount = couponObject.max_amount
                        }
                        console.log('------------ffy----------------');                       
                        console.log(couponObject.max_amount);
                        console.log(couponObj.discountedAmount);                    
                        console.log('------------ffy----------------');
                        couponObj.finalGrandTotal = grandTotal - couponObj.discountedAmount
                        resolve(couponObj)
                    }
                } else {
                    couponObj.status = false
                    couponObj.msg = "sorry coupon expired"
                    console.log(couponObj);

                    resolve(couponObj)
                }

            } else {
                couponObj.status = false
                couponObj.msg = "invalid coupon please add valid coupon"


                resolve(couponObj)
            }
        })
    },
    removeUserCoupon: (userId) => {
        console.log("--------------11----------------");
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: userId }, { $set: { coupon: null } }).then((data) => {
                resolve(data)
            }).catch((e) => {
                reject(e)
            })
        })
    },
    couponRemoveInUser: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {

            let couponremoving = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                $set: {
                    coupon: null
                }
            })
            // console.log("couponremoving------------------------");
            // console.log(couponremoving);
            // console.log("couponremoving------------------------");
            resolve()
        })
    },
    // -----------------------remove address in user checkout--------------------------------------
    removeAddressInUserCheckout: (addressId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({ _id: addressId }).then((response) => {
                resolve(response)
            }).catch((e) => {
                console.log(e);
            })
        })
    },
    addCouponToUsedCoupon: (userId, couponId) => {
        return new Promise(async (resolve, reject) => {

            const result = await db.get().collection(collection.USED_COUPON_COLLECTION).updateOne({ userId: objectId(userId) },
                {
                    $push: {
                        coupon: objectId(couponId)
                    }
                }, { upsert: true })
            resolve(result)
            console.log(result, 'upsert result');
        })
    },
    //-------------------------------get banner------------------------------
    getBanners: () => {
        return new Promise(async (resolve, reject) => {
            let bannerData = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            console.log(bannerData);
            resolve(bannerData)
        })
    },
    //--------------------------------------------------------wallet amount--------------------------------------
    walletAmountCheck: (userId, totalprice) => {
        console.log(userId);
        userId = userId
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
            console.log(user.wallet + " wallet amount");
            wallet = user.wallet
            if (wallet >= totalprice) {

                resolve(wallet)
                console.log('haiiiiiiiiiiiiii');
            }
            else {
                resolve(null)
                console.log('oooooooooooooooooo');
            }
        })
    },
    //-------------------------------------------------
    WalletAmountReduce: (userId, totlAmount) => {
        console.log('---------------wallet reduce-----------------');
        console.log(userId);
        console.log(totlAmount);
        console.log('---------------wallet reduce-----------------');
        return new Promise(async (resolve, reject) => {

            let retunPayment = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                $inc: { "wallet": -totlAmount }
            })
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
            console.log(user.wallet + "new wallet amount");
            resolve()
        })
    },
    // --------------------------------------------------search products----------------------------------
    getSearchProducts: (searchProducts) => {
        console.log('------------------------------------');
        console.log(searchProducts);
        return new Promise(async (resolve, reject) => {
            try {
                let searchedItem = await db.get().collection(collection.PRODUCT_COLLECTION).find({ productname: { '$regex': searchProducts, $options: 'i' } }).limit(10).toArray()
                resolve(searchedItem)
            } catch (err) {
                let error = {}
                error.message = "Something went wrong"
                reject(error)
            }
 


        })
    },
    getFilterProducts: (data) => {
        let arrayObj
        if (Array.isArray(data.category)) {
            arrayObj = data.category
        } else {
            arrayObj = Object.values(data)

        }
        let arrayfilterwihtobjectid = arrayObj.map((element) => {
            return objectId(element)
        })
        return new Promise(async (resolve, reject) => {
            if (arrayObj[0]) {
                let product = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                    {
                        $match: {
                            category: {
                                $in: arrayfilterwihtobjectid
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: collection.CATEGORY_COLLECTION,
                            localField: 'category',
                            foreignField: '_id',
                            as: 'categoryDetails'
                        }
                    },
                    {
                        $unwind: "$categoryDetails"
                    },

                    {
                        $addFields: {
                            discountOff: { $cond: { if: { $gt: ["$poffer", "$categoryDetails.coffer"] }, then: { $toInt: "$poffer" }, else: { $toInt: "$categoryDetails.coffer" } } },
                        }
                    },
                    {
                        $addFields: {
                            discountedAmount: { $round: { $divide: [{ $multiply: [{ $toInt: "$price" }, { $toInt: "$discountOff" }] }, 100] } },
                        }
                    },
                    {
                        $addFields: {
                            priceAfterDiscount: { $round: { $subtract: [{ $toInt: "$price" }, { $toInt: "$discountedAmount" }] } }
                        }
                    }
                ]).toArray()
                resolve(product)
            } else {
                resolve(true)
                console.log("-------------getFilterProducts---------------");
            }
        })
    },
    // ---------------------------stock decrease razorpay-------------
    getCartProductsDetails: (orderId) => {
        let response = {}
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(orderId)
                    }
                },
                {
                    $unwind: "$products"


                }, {
                    $project: {
                        proId: '$products.item',
                        qty: '$products.quantity'
                    }
                }
            ]).toArray().then((details) => {
                console.log("details");
                console.log(details);
                console.log("details");

                // response.details = details
                resolve(details)

            })
            // resolve(response)
        })
    },
    // -------------------------------wallet history------------------------
    getWalletDetails:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let refundedUser= await db.get().collection(collection.ORDER_COLLECTION).findOne({userId: objectId(userId), refund: 'complete' })
            if(refundedUser){
            let data= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{userId:objectId(userId),refund:"complete"}
                },
            ]).toArray()
            resolve(data)
            console.log("data");
            console.log(data);
            console.log("data");
            }else{
                resolve()
            }
            let dataDetails=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{userId:objectId(userId),refund:"complete"}
                },
                {
                    $project: { products: 1 }
                },
                {
                    $unwind: '$products'
                }, {
                    $project: { productId: '$products.item', quantity: '$products.quantity' }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $group: { _id: "$_id", productList: { $push: { product: '$products', quantity: "$quantity" } } }
                },
                {
                    $lookup: {
                        from: collection.ORDER_COLLECTION,
                        localField: '_id',
                        foreignField: '_id',
                        as: 'orderDetails'
                    }
                }, {
                    $unwind: '$orderDetails'
                }, {
                    $sort: { _id: -1 }
                }
                ]).toArray()
            resolve(dataDetails)
            // console.log('---------------------datadetails in userHealper-------------------');
            // console.log(dataDetails);
            // console.log('----------------------datadetails userHealper------------------');
        }) 
    }

}








