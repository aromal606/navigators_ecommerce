


function changeQuantity(cartId, proId, userId,stockCount, count, e) {

console.log('--------------------stockcount--------------');
console.log(stockCount);
console.log("--------------------stockcount--------------");


    // let quantity = parseInt(document.getE)
    //e.preventDefault()

    price = parseInt(document.getElementById('proprice' + proId).innerHTML)

    let quantity = parseInt(document.getElementById('quantity' + proId).innerHTML)

    

    $.ajax({
        url: '/change-product-quantity',
        data: {
            cart: cartId,
            product: proId,
            userId: userId,
            count: count,
            quantity: quantity,
            stockCount:stockCount
        },
        method: 'post',
        success: (response) => {
            console.log("-------88--------");
            console.log(response);
            // console.log(response.disable);
            console.log("-------88---------");
            if (response.disable) {

                document.getElementById("quantity" + proId).innerHTML = quantity;
                //$(".minusButton").prop('disabled',true);
            }else if(response.stock){
                // alert('haiiiii')
                document.getElementById('stockname' + proId).innerHTML = "out of stock"

            } else {
                document.getElementById('stockname' + proId).innerHTML = null

                let qty = document.getElementById('quantity' + proId).innerHTML = quantity + count
                document.getElementById('productTotal' + proId).innerHTML = qty * price
                console.log(response);

                let grand = document.getElementById('grandTotal').innerHTML = response.total
                console.log(grand);
            }


        }
    })
}





function removewishitem(proId, e) {
    e.preventDefault()

    $.ajax({
        url: '/remove_wish_product',
        method: 'post',
        data: {
            productId: proId,


        },
        success: (response) => {
            alert(response.removed)
            location.reload()
        }

    })

}

function removeCartItem(cartid, productid) {
    console.log("----------------");
    console.log(cartid);
    console.log(productid);

    console.log("-----------------");
    $.ajax({
        url: '/removeCartItem',
        data: {
            cartid: cartid,
            proid: productid

        },
        method: 'post',
        success: (response) => {
            alert('success')
            location.reload()

        }

    })

}

function removeAddress(addressId) {
    swal({
        title: "Are you sure?",
        text: "you will not be able to recover this address after remove!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((willDelete) => {
            if (willDelete) {
                $.ajax({
                    url: '/remove_address_from_collection',
                    method: 'post',
                    data: {
                        addressId: addressId
                    },
                    success: (response) => {
                        if (response) {
                            location.reload()


                        }

                    }

                })
            } else {
                swal("address is safe..");
            }

        });
    }

