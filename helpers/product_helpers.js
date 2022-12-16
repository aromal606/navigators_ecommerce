var db = require('../config/connection')
const collection = require('../config/collections');
const { ObjectId } = require('mongodb');
const { CATEGORY_COLLECTION } = require('../config/collections');

const objectid = require('mongodb').ObjectId
module.exports = {
    addProduct: (product, image) => {
        product.category = objectid(product.category)
        product.price = parseInt(product.price)
        product.stock = parseInt(product.stock)
        product.poffer = parseInt(product.poffer)
        return new Promise(async (res, rej) => {
            // product.image = image;

            let data = await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product)
            res(data)
        })
    },
    getAllProducts: (limit, startIndex) => {
        return new Promise(async (resolve, reject) => {
            try {
                let product = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([

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
                            // discountOffer : {$cond : [ {$gt : [{$toInt: "$productOffer"}, {$toInt:"$categoryDetails.discount"}]}, {$toInt: "$productOffer"}, {$toInt:"$categoryDetails.discount"}] },
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
                    },
                ]).toArray()
                resolve(product)
            } catch (error) {
                console.log(error);
            }
        })
    },
    //-----------------------------------admin pagination get all products------------------------------------------------
    getAllProductsForAdmin: () => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(product)

        })
    },
    getPaginatedResultForAdmin: (limit, startIndex) => {
        return new Promise(async (resolve, reject) => {
            // let result= await db.get().collection(collection.PRODUCT_COLLECTION).find().limit({toInt:limit}).skip(startIndex).toArray()
            let result = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
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
                    $skip: startIndex
                },
                {
                    $limit: limit

                }
            ]).toArray()
            // console.log("----------------getPaginatedResultForAdmin----------------------");
            // console.log(result);
            // console.log("---------------getPaginatedResultForAdmin----------------------");
            resolve(result)
        })

    },

    //-----------------------------------------------------------------------------------------------------------------------
    updateProduct: (productid, productDetails) => {
        productDetails.price = parseInt(productDetails.price)
        productDetails.stock = parseInt(productDetails.stock)
        productDetails.poffer = parseInt(productDetails.poffer)
        productDetails.category = objectid(productDetails.category)

        return new Promise((res, rej) => {



            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectid(productid) },

                {
                    $set:
                    {
                        productname: productDetails.productname,
                        discription: productDetails.discription,
                        price: productDetails.price,
                        stock: productDetails.stock,
                        category: productDetails.category,
                        poffer: productDetails.poffer,
                        img: productDetails.img


                    }

                })
                .then((data) => {
                    console.log(data, 'dataaa');
                    res(data)
                })
        })
    },
    deleteProduct: (productId) => {
        return new Promise((res, rej) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: ObjectId(productId) }).then((response) => {
                res(response)
            })
        })
    },
    editProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let data = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectid(productId) })
            let findResult = await db.get().collection('category').find().toArray()
            response.data = data
            response.findResult = findResult
            resolve(response)
        })

    },
    getCategory: async () => {
        console.log("haiii");
        return new Promise(async (resolve, reject) => {
            let cat = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray().then((cat) => {
                resolve(cat)
                console.log("--------getcategory-------");
                console.log(cat);
                console.log("--------getcategory-------");
            })

        })
    },
    getProductDetails: (productId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let product = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([{
                    $match: { _id: objectid(productId) }
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
                        // discountOffer : {$cond : [ {$gt : [{$toInt: "$productOffer"}, {$toInt:"$categoryDetails.discount"}]}, {$toInt: "$productOffer"}, {$toInt:"$categoryDetails.discount"}] },
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


                resolve(product[0])
                // console.log("------------product detail--------------");
                // console.log(product[0]);
                // console.log("------------product detail--------------");

            } catch (error) {
                console.log(error);
            }
        })
    },
    getProductDetailsForAdmin: (productId) => {
        let response = {}
        // console.log(productId);
        return new Promise(async (resolve, reject) => {
            let productid = objectid(productId)
            // console.log(productid);
            let categoryData = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            response.categoryData = categoryData
            let productData = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $match: {
                        _id: productid
                    }
                },
                {
                    $lookup: {
                        from: CATEGORY_COLLECTION,
                        localField: 'category',
                        foreignField: '_id',
                        as: 'categorydata'
                    }
                },
                {
                    $unwind: "$categorydata"
                },
            ]).toArray()
            response.productData = productData
            console.log('-------productdata----------');
            console.log(productData);
            resolve(response)
        }
        )
    },
    getProductDetailsForCart: (productId) => {
        return new Promise(async (res, rej) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectid(productId) })

            res(product)
        })
    },
    addToWishlist1: (productId, userId) => {
        let proObj = {
            item: objectid(productId)
        }
        return new Promise(async (res, rej) => {

            let userWishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectid(userId) })

            if (userWishlist) {

                let proExist = userWishlist.products.findIndex(products => products.item == productId)

                if (proExist != -1) {

                    db.get().collection(collection.WISHLIST_COLLECTION)

                        .updateOne({ user: objectid(userId), 'products.item': objectid(productId) }

                        ).then((data) => {
                            res()

                        })
                }
                else {
                    db.get().collection(collection.WISHLIST_COLLECTION)
                        .updateOne({ user: objectid(userId) },
                            {

                                $push: { products: proObj }

                            }
                        ).then((response) => {
                            res()
                        })
                }
            } else {

                let wishObj = {
                    user: objectid(userId),
                    products: [proObj]

                }

                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishObj).then((response) => {
                    res()
                })
            }


        })
    },
    getUserWishlist: (userId) => {
        return new Promise(async (res, rej) => {

            let wishItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match: { user: objectid(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',

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
                        item: 1, product: ({ $arrayElemAt: ['$product', 0] })
                    }
                },
            ]).toArray()
            res(wishItems)

        })
    },

    removeWishProduct: (userId, productId) => {
        let productid = productId.productId


        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: objectid(userId) },
                {

                    $pull: { products: { item: objectid(productid) } }
                }).then((data) => {
                    console.log(data);
                    resolve(data)
                })
        })
    },
    // --------------------------------product count for pagination-----------------------------
    getProductsCount: () => {
        return new Promise(async (resolve, reject) => {
            let count = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments();
            console.log("count" + count);
            resolve(count)
        })
    },
    getPaginatedResult: (limit, startIndex) => {
        return new Promise(async (resolve, reject) => {
            // let result= await db.get().collection(collection.PRODUCT_COLLECTION).find().limit({toInt:limit}).skip(startIndex).toArray()
            let result = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
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
                        // discountOffer : {$cond : [ {$gt : [{$toInt: "$productOffer"}, {$toInt:"$categoryDetails.discount"}]}, {$toInt: "$productOffer"}, {$toInt:"$categoryDetails.discount"}] },
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
                },
                {
                    $skip: startIndex
                },
                {
                    $limit: limit

                }
            ]).toArray()
            // console.log("--------------------------------------");
            // console.log(result);
            // console.log("--------------------------------------");
            resolve(result)
        })
    },
    //---------------------------------return payment---------------------------------------------
    returnPayment: (orderId, userId) => {
        let d = new Date();
        let date=new Date();
console.log("orderId");     
console.log(orderId);
console.log(userId);
console.log("orderId");

        return new Promise(async (resolve, reject) => {
            let orderDetails = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: (objectid(orderId)) })
            refundAmount = parseInt(orderDetails.totalAmount)
            console.log(">>>>>>>>>>>>>>>>>>>...refundAmount-------------------------");
            console.log(orderDetails);
            console.log(refundAmount);
            console.log(">>>>>>>>>>>>>>>>>>>...refundAmount--------------------------");
            let refund = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectid(orderId), refund: 'complete' })
            console.log("------------refund-----------------");
            console.log(refund)
            console.log(d)
            console.log("------------refund-----------------");

            let month = '' + (d.getMonth() + 1)
            let day = '' + d.getDate()
            let year = d.getFullYear()

            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;

            let time = [day, month, year].join('-');
            if (refund) {
                let retunPayment = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectid(userId) }, {
                    $inc: { wallet: refundAmount }
                }
                )
                let refundedDate = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ userId: objectid(userId) }, {
                    $set: { refundCompletedAt: time,
                        refundCompletedAtFullDate: date }
                }
                    )
                console.log("haiiiiiiiiiiiiiiiiii----------------------------");
                console.log(retunPayment);
                console.log(refundedDate);
                console.log("haiiiiiiiiiiiiiiiiii------------------------------");




            }else{
                console.log("---------------------------error-----------------------");
            }
            resolve()
        })




    },

    refundOrderStatusUpdate: (orderId, userId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectid(orderId), userId: objectid(userId) },
                {
                    $set: {
                        refund: 'complete'
                    }
                },
                { upsert: true }
            ).then((data) => {

                resolve(data)
            }).catch((e) => {
                console.log(e);
            })
        })
    }



    //---------------------------------------return payment end--------------------------------------------------








 



}