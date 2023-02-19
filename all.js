const productWrap = document.querySelector(".productWrap")

//init
const init = ()=>{
    getProductList()
    getCartList()
}

//renderHTML
const renderProducts = (item)=>{
    return `<li class="productCard">
                <h4 class="productType">新品</h4>
                <img src="${item.images}"
                    alt="">
                <a href="#" class="addCardBtn" data-addId="${item.id}">加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${item.origin_price}</del>
                <p class="nowPrice">NT$${item.price}</p>
            </li>`
}

//api getProductData
const getProductList= (data)=>{
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then((res=>{
        let str =''
        data = res.data.products
        localStorage.setItem("products",JSON.stringify(data))
        data.forEach((item=>{
            str += renderProducts(item)
        }))
        productWrap.innerHTML = str
    })).catch((error => {
        console.log(error);
    }))
}

//selectCategory
const productSelect = document.querySelector(".productSelect")
productSelect.addEventListener("change",e=>{
    let str = ''
    if (e.target.value == "全部") {
        getProductList()
        return
    }
    let list = JSON.parse(localStorage.getItem("products"))
    list.forEach((item=>{
        if (e.target.value == item.category) {
            str += renderProducts(item)
        }
    }))
    productWrap.innerHTML = str
})

//api getCartList
const shopping_cartList = document.querySelector(".shopping_cartList")
const getCartList = (cartData)=>{
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then((res=>{
        const finalTotal = document.querySelector(".finalTotal")
        let str =''
        let totalPrice = "NT$" + res.data.finalTotal;
        finalTotal.textContent = totalPrice;
        cartData = res.data.carts
        localStorage.setItem("cartList",JSON.stringify(cartData))
        cartData.forEach((item=>{
            str += ` <tr>
                        <td>
                            <div class="cardItem-title">
                                <img src="${item.product.images}" alt="">
                                <p>${item.product.title}</p>
                            </div>
                        </td>
                        <td>NT$${item.product.price}</td>
                        <td>${item.quantity}</td>
                        <td>NT$${item.product.price * item.quantity}</td>
                        <td class="discardBtn">
                            <a href="#" class="material-icons" data-deleteId="${item.id}">
                                clear
                            </a>
                        </td>
                    </tr>`
        }))
        shopping_cartList.innerHTML = str
    }))
}

//addPostCart
productWrap.addEventListener("click",e=>{
    e.preventDefault()
    if (e.target.getAttribute("class") !== "addCardBtn") {
        return
    }
    let addId = e.target.getAttribute("data-addId")
    let num = 1;
    let cartLocalData = JSON.parse(localStorage.getItem("cartList"))
    cartLocalData.forEach((item=>{
        if (addId === item.product.id) {
            num = item.quantity+=1
        }
    }))
    cartPost(addId, num)
})
const cartPost = (addId,num)=>{
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
        "data": {
            "productId": addId,
            "quantity": num
        }
    }).then((res=>{
        console.log(res);
        alert("加入購物車!!")
        getCartList()
    })).catch((error=>{
        console.log(error);
    }))
}

//deleteCartItem
shopping_cartList.addEventListener("click",e=>{
    e.preventDefault()
    if (e.target.getAttribute("class") !== "material-icons") {
        return
    }
    let deleteId = e.target.getAttribute("data-deleteId")
    console.log(deleteId);
    deleteCartItem(deleteId)
})
const deleteCartItem = (deleteId)=>{
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${deleteId}`)
    .then((res=>{
       getCartList()
    })).catch((error=>{
        console.log(error);
    }))
}

//discardAllBtn
const discardAllBtn = document.querySelector(".discardAllBtn")
discardAllBtn.addEventListener("click",e=>{
    e.preventDefault()
    if (e.target.getAttribute("class") == "discardAllBtn") {
        deleteAllCartItem()
    }
})
const deleteAllCartItem =()=>{
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then((res=>getCartList())).catch((error=>alert("購物車無資料")))
}

//createOrder
const orderInfoBtn = document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click",e=>{
    e.preventDefault()
    let getCartLocal = JSON.parse(localStorage.getItem("cartList"));
    if (getCartLocal.length == 0) {
        alert("購物車空的喔");
        return
    };
    let customerName = document.querySelector("#customerName").value;
    let customerPhone = document.querySelector("#customerPhone").value;
    let customerEmail = document.querySelector("#customerEmail").value;
    let customerAddress = document.querySelector("#customerAddress").value;
    let customertradeWay = document.querySelector("#tradeWay").value;
    if (customerName == "" || customerPhone == "" || customerEmail == ""
        || customerAddress == "" || customertradeWay=="") {
        alert("請填入完整資料")
        return
    };
    creatOrder(customerName, customerPhone, customerEmail, customerAddress, customertradeWay)
     customerName = document.querySelector("#customerName").value="";
     customerPhone = document.querySelector("#customerPhone").value="";
     customerEmail = document.querySelector("#customerEmail").value="";
     customerAddress = document.querySelector("#customerAddress").value="";
     customertradeWay = document.querySelector("#tradeWay").value="ATM";
     getCartList()
})
const creatOrder = (customerName, customerPhone, customerEmail, customerAddress, customertradeWay)=>{
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
        "data": {
            "user": {
                "name": customerName,
                "tel": customerPhone,
                "email": customerEmail,
                "address": customerAddress,
                "payment": customertradeWay
            }
        }
    }).then((res=>{
        console.log(res);
        alert("送出訂單")
    })).catch((error=>{
        console.log(error);
    }))
}

//validateEmail
const customerEmail = document.querySelector("#customerEmail")
customerEmail.addEventListener("blur",e=>{
    if (validateEmail(customerEmail.value) == false) {
        document.querySelector(`[data-message="Email"]`).textContent = "填錯囉!"
    }
})

init()

function validateEmail(mail) {
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail)) {
        return true
    }
    return false;
}

function validatePhone(phone) {
    if (/^[09]{2}\d{8}$/.test(phone)) {
        return true
    }
    return false;
}


