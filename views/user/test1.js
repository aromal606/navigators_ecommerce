function Addressfill (Customer,Housename){
  
    $.ajax({
        url:'/filladdress',
        data:{
             Customer:Customer,
             Housename:Housename
        },
        method:'post', 
        success:(address)=>{
             document.getElementById('name').value = address[0]._id.CustomerName;
             document.getElementById('housename').value = address[0]._id.Address.Housename;
             document.getElementById('streetName').value = address[0]._id.Address.Street;
             document.getElementById('landMark').value = address[0]._id.Address.LandMark;
             document.getElementById('City').value = address[0]._id.Address.City;
             document.getElementById('state').value = address[0]._id.Address.State;
             document.getElementById('PinCode').value = address[0]._id.Address.Pincode;
             document.getElementById('Phone').value = address[0]._id.CustomerPhone;
             document.getElementById('email').value = address[0]._id.CustomerEmail;
    }
})
}