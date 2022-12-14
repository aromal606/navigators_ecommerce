const productHelpers=require('../../helpers/product_helpers')
const userHelpers=require('../../helpers/user_helper')
module.exports={

    userProductListPageination: async (req, res, next) => {
        console.log("---------query");
        console.log(req.query);
        console.log("---------query");
    
        const page = parseInt(req.query.page)
        console.log(page,'.................................');
        // const limit = parseInt(req.query.limit)
        const limit = 8
        console.log(page);
        const startIndex = (page - 1) * limit
        const endIndex = page * limit
    
        const results = {}
        let productsCount = await productHelpers.getProductsCount()
    
        if (endIndex < productsCount) {
          results.next = {
            page: page + 1,
            limit: limit
          }
        }
    
        if (startIndex > 0) {
          results.previous = {
            page: page - 1,
            limit: limit
          }
        }
        try {
         // results.products = await productHelpers.getAllProducts(limit, startIndex)
          results.products = await productHelpers.getPaginatedResult(limit, startIndex)
          results.pageCount = Math.ceil(parseInt(productsCount) / parseInt(limit)).toString()
          results.pages = Array.from({ length: results.pageCount }, (_, i) => i + 1)
          results.currentPage = page.toString()
          results.limit = limit
          results.startIndex = startIndex
          res.paginatedResults = results
          next()
        } catch (e) {
          res.status(500).json({ message: e.message })
    }
    
  },
  userOrderSummaryPagination: async (req, res, next) => {
    // console.log("---------query");
    // console.log(req.query);
    // console.log("---------query");

    const page = parseInt(req.query.page)
    // const limit = parseInt(req.query.limit)
    const limit = 2
    console.log(page);
    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const results = {}
    let ordercount = await userHelpers.getOrderCount()

    if (endIndex < ordercount) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }
    try {
     // results.products = await productHelpers.getAllProducts(limit, startIndex)
      results.products = await productHelpers.getPaginatedResult(limit, startIndex)
      results.pageCount = Math.ceil(parseInt(productsCount) / parseInt(limit)).toString()
      results.pages = Array.from({ length: results.pageCount }, (_, i) => i + 1)
      results.currentPage = page.toString()
      results.limit = limit
      results.startIndex = startIndex
      res.paginatedResults = results
      next()
    } catch (e) {
      res.status(500).json({ message: e.message })
}




},
adminProductListPageination: async (req, res, next) => {
  console.log("---------query");
  console.log(req.query);
  console.log("---------query");

  const page = parseInt(req.query.page)
  // const limit = parseInt(req.query.limit)
  const limit = 8
  console.log(page);
  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  const results = {}
  let productsCount = await productHelpers.getProductsCount()

  if (endIndex < productsCount) {
    results.next = {
      page: page + 1,
      limit: limit
    }
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit
    }
  }
  try {
   // results.products = await productHelpers.getAllProducts(limit, startIndex)
   console.log(limit);
   console.log(startIndex);
    results.products = await productHelpers.getPaginatedResultForAdmin(limit, startIndex)
    results.pageCount = Math.ceil(parseInt(productsCount) / parseInt(limit)).toString()
    results.pages = Array.from({ length: results.pageCount }, (_, i) => i + 1)
    results.currentPage = page.toString()
    results.limit = limit
    results.startIndex = startIndex
    console.log("results")
    console.log(results)
    console.log("results")
    res.getPaginatedResultForAdmin = results
    next()
  } catch (e) {
    res.status(500).json({ message: e.message })
}

},

}


