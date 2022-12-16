var db = require('../config/connection')
const collection = require('../config/collections')
const { get } = require('../routes')

const objectId = require('mongodb').ObjectId

module.exports = {
    getTotalSalesGraph: () => {
        return new Promise(async (resolve, reject) => {
            let ordercollection=await db.get().collection(collection.ORDER_COLLECTION)
            if (ordercollection) {
                
                let dailySale = await db.get().collection(collection.ORDER_COLLECTION).aggregate([{
                    $match: {
                        status: { $nin: ['cancelled', 'pending','return accepted'] }
                    }
                }, {
                    $group: {
                        _id: '$date',
                        totalAmount: { $sum: '$totalAmount' }
                    }
                },
                {
                    $sort: {
                        _id: -1,
    
                    }
                },
                {
                    $limit: 5
                },
                ]).toArray()
                let monthSales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                        {
                            $match: {
                                status: { $nin: ['cancelled', 'pending'] },
                            },
                        },
                        {
                            $group: {
                                _id: "$month",
                                totalAmount: { $sum: "$totalAmount" },
                            },
                        },
                        {
                            $sort: {
                                _id: -1,
                            },
                        },
                        {
                            $limit: 12,
                        },
                        {
                            $sort: {
                                _id: 1,
                            },
                        },
                    ])
                    .toArray();
                let yearlySale = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                        {
                            $match: {
                                status: { $nin: ['cancelled', 'pending'] },
                            },
                        },
                        {
                            $group: {
                                _id: "$year",
                                totalAmount: { $sum: "$totalAmount" },
                            },
                        },
                        {
                            $sort: {
                                _id: -1,
                            },
                        },
                        {
                            $limit: 1
                        },
                    ])
                    .toArray();
                resolve({ yearlySale, monthSales, dailySale })
            }else{
                resolve()
            }
        })
    },
    getTotalsaleCount: () => {
let date = new Date().toISOString().slice(0, 10)
        return new Promise(async (resolve, reject) => {
            console.log(date);
            let check = await db.get().collection(collection.ORDER_COLLECTION).findOne()
            if (check) {

                let dailySaleCount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([{
                    $match: {
                        status: { $nin: ['order canceled', 'pending'] }
                    }
                },
                {
                    $count: "count"

                }
                ]).toArray();

                resolve(dailySaleCount[0].count)

            } else {
                resolve(0)
                console.log("haiiiii");
            }
        })

    },
    getMonthlyTotalSale: () => {
       
        let date = new Date().toISOString().slice(5, 7)
        console.log(date, '----------------------------');
        return new Promise(async (resolve, reject) => {
            let checkcollection = await db.get().collection(collection.ORDER_COLLECTION).findOne()
            console.log(checkcollection);
            if (checkcollection) {
                
                let check = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match:{status:{$nin:['return accepted','order canceled']}}
                    },
                    
                    {
                        $group: {
                            _id: '$month',
                            total: { '$sum': '$totalAmount' }
                        }
                    },
                    {
                        $sort: {
                            _id: -1,
                        }
                    },{
                        $limit:1
                    }
                    
                ]).toArray()

                 if(check==""){
                resolve()
                    }else{
                     resolve(check[0].total)
                 }

                // console.log(check[0].total);
                resolve()
                // console.log(check[0].total);
            }else{ 
                console.log("------yyyyyyyyyyyyyyyyyyyyyyy-------");

                resolve()
            }
    
        
    })
 

},
}