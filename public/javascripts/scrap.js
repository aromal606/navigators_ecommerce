function changeQuantity(cartId,productId,userId,count){
    let quantity = parseInt(document.getElementById('quantity-count' + productId).innerHTML)
    console.log('===========count===========')
    
   console.log(count)
    $.ajax({
        url:'/change-product-quantity',
        data:{
            userId:userId,
            cartId:cartId,
            productId:productId,
            count:count,
            quantity:quantity
        },
        method:'post',
        success:(response)=>{
            console.log("response")
            console.log(response)

            console.log("response")

           
            if(response.disable){
                document.getElementById('minus-button' + productId).disable=true
            }else{

                let proTotal = parseInt(document.getElementById('proTotal' + productId).innerHTML)
                let price = parseInt(document.getElementById('price' + productId).innerHTML)
                document.getElementById('minus-button' + productId).disable = false

                if(quantity >= response.stock && count == 1){
                // if(response.outOfStock){

                    document.getElementById('plus-button' + productId).disabled = true
                    document.getElementById('outofstock' + productId).innerHTML = 'Out of stock'

                    setTimeout(() => {
                        document.getElementById('outofstock' + productId).innerHTML = ''
                        document.getElementById('plus-button' + productId).disabled = false
                    }, 3000);   

                }else{

                    let qty= document.getElementById('quantity-count' + productId).innerHTML = quantity + count
                    document.getElementById('proTotal' + productId).innerHTML = qty * price
                    document.getElementById('subtotal').innerHTML = response.total
                    document.getElementById('grandTotal').innerHTML = response.total        

                }

                
                
                // console.log(productId)
                // console.log('===========quantity===========')
                // console.log(quantity+count)
            }
        }
    })
}