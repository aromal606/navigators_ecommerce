var db = require('../config/connection')
const collection = require('../config/collections')
const { ObjectID } = require('bson')
const { response } = require('../app')
const { CART_COLLECTON } = require('../config/collections')
const objectid = require('mongodb').ObjectId
// var express = require('express');
require('dotenv').config()
// var router = express.Router();
let adminData = {
  email: process.env.ADMINEMAIL,
  pwd: process.env.ADMINPASSWORD,
}


module.exports = {

  adminLogin: (data) => {
    console.log(data);
    let response = {}
    return new Promise(async (resolve, rejet) => {
      if (data.email === adminData.email && data.password === adminData.pwd) {
        response.status = true
        resolve(response)
        // console.log('tryuie');
      } else {
        response.status = false

        response.msg = "incorrect username or password"
        resolve(response)
        // console.log(data,"dfffffffff")
      }
    })

  },

  getAllUsers: () => {
    return new Promise(async (res, rej) => {
      let user = await db.get().collection(collection.USER_COLLECTION).find().toArray()
      res(user)

    })
  },

  blockUser: (userId) => {
    return new Promise(async (res, rej) => {
      console.log(userId, 'userId');
      let user = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectID(userId) },
        {
          $set: { status: false }
        })
      res(user)

    })
  },
  unBlockUser: (userId) => {
    return new Promise(async (res, rej) => {
      let unblock = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectID(userId) },
        {
          $set: { status: true }
        })
      res(unblock)

    })
  },

  addCategory: (category) => {
    category.coffer=parseInt(category.coffer)
    //console.log(categoryname);
    return new Promise(async (res, rej) => {
      await db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category)
      res()
    })

  },
  //------------------------------------add banner------------------------------------------
  addBanner:(data)=>{
    console.log('--------vvvvvvvvvvvvvvvv-------------');
console.log(data);
console.log(data.img);
console.log('--------vvvvvvvvvvvvvvvv-------------');
return new Promise((resolve,reject)=>{
  db.get().collection(collection.BANNER_COLLECTION).insertOne(data)
resolve()
})
  },
  //------------------------------------add banner------------------------------------------
  //--------------------------------------category------------------------------------------
  getCategory: () => {
    return new Promise(async (res, rej) => {
      let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
      res(category)
      //console.log(category);

    })

  },
  updateCategory: (categoryId, category) => {
    coffer=parseInt(category.coffer)
    // console.log("categoryId");
    // console.log(categoryname.ecategoryname);
    // console.log("categoryId");
    return new Promise((res, rej) => {
      console.log("---------------------------------");
      
      db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: objectid(categoryId) },
        {
          $set: {
            categoryname: category.categoryname,
            coffer:coffer
          }
        }
      ).then((data) => {

        // console.log(data);

        res(data)
      })
    })
  },
  deleteCategory:(id)=>{
    
    console.log("----------22222222");
    console.log(id);
    console.log("222222222---------");
    obj={}
    return new Promise(async(resolve,reject)=>{
      let check=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({category:objectid(id)})
      if(check){
        obj.msg='category used delete product then delete category'
resolve(obj)
      }else{
        await db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectid(id)})
        resolve()
      }
    })
  },
  // ----------------------------- order details----------------------------------
  getOrderDetails: () => {

    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).aggregate([{
        $match: { userId: { $exists: true } }
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
      },
      // {
      //   $addFields: {details: "$orderDetails.products"}
      // },
       
       {
        $sort: { _id: -1 }
      }
      ]).toArray().then((orders) => {
      //  console.log("---------------------order details--------------------");
      //  console.log(orders);
      //  console.log("---------------------order details--------------------");

        resolve(orders)
      })
    })

  },
  getAllOrders:()=>{
    console.log()
    return new Promise(async(resolve, reject) => {
       let orders=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
            $match:{userId:{$exists:true}}
        },{
            $project:{products:1}
        },
        {
            $unwind:'$products'
        },{
            $project:{productId:'$products.item',quantity:'$products.quantity'}
        },
       {
        $lookup:{
                from:collection.PRODUCT_COLLECTION,
                localField:'productId',
                foreignField:'_id',
                as:'products'
            }
        },
        {
            $unwind:'$products'
        },
      {
            $group:{_id:"$_id",productList:{$push:{product:'$products',quantity:"$quantity"}}}
        },
        {
          $unwind : "$productList"
        },
        {
            $lookup:{
                from:collection.ORDER_COLLECTION,
                localField:'_id',
                foreignField:'_id',
                as:'orderDetails'
            }
        },{
            $unwind:'$orderDetails'
        },

        {
            $sort:{_id:-1}
        }
    ]).toArray().then((orders)=>{
      // console.log("orders------------------");
          // console.log(orders);
         
      // console.log("orders-----------------");
  
            resolve(orders)
        })
    })

    },

  // --------------------------------------------------------------------------------------
  deliveryStatusUpdation: (data) => {
    orderId = (data.orderId)
    statuscode = data.status
    console.log('------------66666---------------');
    console.log(orderId, statuscode);
    console.log('------------66666---------------');
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectid(orderId) },
        {
          $set: {
            status: statuscode
          }
        }
      ).then((data) => {
        db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {$match:{
         _id:objectid(orderId)
      }},
  {
      $unwind:"$products"
  
      
  },{
     $project:{
      proId:'$products.item',
      qty:'$products.quantity'
     } 
  }
  ]).toArray().then((details)=>{
    
    resolve(details)
    console.log(details);
  })
  }).catch((error) => {
        resolve(error)
        console.log(error);
      })
    })
  },

  deliveryStatusUpdationForReturn: (data) => {
    orderId = (data.orderId)
    statuscode = (data.status)
    // console.log("---------------------------qqqqqqqqqqqqq------------------------");
    // console.log(orderId, statuscode);
    // console.log("---------------------------qqqqqqqqqqqqq------------------------");
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectid(orderId) },
        {
          $set: {
            status: statuscode
          }


        }
      ).then((data) => {
        resolve(data)
      }).catch((err) => {
        console.log(err);
      })
    }
    )
  },
  // -------------------------------------coupon collection----------------------------------------------------
  addCoupons: (data) => {
    console.log("-------1-------");
    console.log(data);
    console.log("------1------");
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.COUPON_COLLECTION).insertOne(data).then((response) => {
        resolve(response)
        console.log("-------2-------");
        console.log(response);
        console.log("-------2-------");

      }).catch((e) => {
        console.log(e);
      })
    })
  },
  getCoupons: () => {

    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.COUPON_COLLECTION).find().toArray().then((response) => {
        console.log();
        resolve(response)

      })
    })
  },
  deleteCoupon: (couponId) => {
    console.log(couponId, "....................1111............");
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.COUPON_COLLECTION).deleteOne({ _id: ObjectID(couponId) })
      resolve(response)
      console.log("--------6--------");
      console.log(response);
      console.log("--------6---------");
    })
  },
  // --------------------------------sales report-----------------------------
  getSalesReport: () => {
    let month = new Date().getMonth() + 1
    let year = new Date().getFullYear()
    return new Promise(async (resolve, reject) => {
      let weeklyReport = await db.get().collection(collection.ORDER_COLLECTION).find({
        createdAt: {
          $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000)
        }
      }).toArray()

      let monthlyReport = await db.get().collection(collection.ORDER_COLLECTION).find({
        "$expr": { "$eq": [{ "$month": "$createdAt" }, month] }
      }).toArray()

      let yearlyReport = await db.get().collection(collection.ORDER_COLLECTION).find({
        "$expr": { "$eq": [{ "$year": "$createdAt" }, year] }
      }).toArray()
      resolve({ weeklyReport, monthlyReport, yearlyReport })
    })
  },
}
