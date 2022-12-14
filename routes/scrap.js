

let productlist=await userHelpers.getOrderProductlist(req.params._id)

getOrderProductlist: (orderId) => {
    console.log(orderId)
    return new Promise(async (res, rej) => {

        let orderedItemList = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match: { userId: objectId(orderId) }
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

        res(orderedItemList)
console.log(orderedItemList,'------------------------');
    })
}