const productWrap = document.querySelector(".productWrap")
const shopping_cartList = document.querySelector(".shopping_cartList")
const productSelect = document.querySelector(".productSelect")
const discardAllBtn = document.querySelector(".discardAllBtn")
const finalTotal = document.querySelector(".finalTotal")

const api_path = "david18";
const token = "F3TyjVVLpwhRzLCuG4iXExmdCH93";

let productList = []
let cartList = []

const init = () => {
    getProductList()
    getCartList()
}

//renderProductHTML
const renderProductHTML = (item) => {
    return `<li class="productCard" >
                <h4 class="productType">新品</h4>
                <img src="${item.images}"
                    alt="">
                <a href="#" class="addCardBtn"data-addCartId="${item.id}">加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${item.origin_price}</del>
                <p class="nowPrice">NT$${item.price}</p>
            </li>`
}

//getProductList
const getProductList = () => {
   axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
        .then((res) => {
            let str = ''
            productList = res.data.products
            productList.forEach((item) => {
                str += renderProductHTML(item)
            })
            productWrap.innerHTML = str
        })
}

//renderCartListHTML
const renderCartListHTML = (item) => {
    return `<tr>
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
                            <a href="#" class="material-icons" data-deleteCartId="${item.id}">
                                clear
                            </a>
                        </td>
                    </tr>`
}

//getCartList
const getCartList=()=>{
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then((res)=>{
        let str = ''
        cartList = res.data.carts
        let totalPrice = "NT$" + res.data.finalTotal
        finalTotal.textContent = totalPrice
        cartList.forEach((item)=>{
            str += renderCartListHTML(item)
        })
        shopping_cartList.innerHTML = str
    })
}
 
//productChangeEvent
productSelect.addEventListener("change",e=>{
    let str = ''
    if (e.target.value =="全部") {
        getProductList()
        return
    }
    productList.forEach((item)=>{
        if (e.target.value == item.category) {
            str += renderProductHTML(item)
        }
        productWrap.innerHTML = str
    })
})

//addCart
productWrap.addEventListener("click",e=>{
    e.preventDefault()
    if (e.target.getAttribute("class") !== "addCardBtn") {
        return
    }
    let addCartId = e.target.getAttribute("data-addCartId")
    let cartNum = 1;
    cartList.forEach((item=>{
        if (item.product.id === addCartId) {
            cartNum = item.quantity+=1
            console.log(cartNum);
        }
    }))
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
        "data": {
            "productId": addCartId,
            "quantity": cartNum
        }
    }).then((res=>{
        alert("加入購物車")
        getCartList()
    }))
})

//deleteCartItem
shopping_cartList.addEventListener("click",e=>{
    e.preventDefault()
    if (e.target.getAttribute("class") !== "material-icons") {
        return
    }
    let deleteCartId = e.target.getAttribute("data-deleteCartId")
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${deleteCartId}`)
    .then((res=>getCartList()))
})

//deleteCartAll
discardAllBtn.addEventListener("click",e=>{
    e.preventDefault()
    if (e.target.getAttribute("class") == "discardAllBtn") {
        axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
        .then((res=>{
            alert("購物車已清空")
            getCartList()
        })).catch((error=>{
            alert("購物車無資料")
        }))
    }
})

//createOrder
const orderInfoBtn = document.querySelector(".orderInfo-btn")
orderInfoBtn.addEventListener("click",e=>{
    e.preventDefault()
    if (cartList.length ==0) {
        alert("購物車無資料")
        return
    }
    let customerName = document.querySelector("#customerName").value
    let customerPhone = document.querySelector("#customerPhone").value
    let customerEmail = document.querySelector("#customerEmail").value
    let customerAddress = document.querySelector("#customerAddress").value
    let customertradeWay = document.querySelector("#tradeWay").value
    if (customerName == "" || customerPhone == "" || customerEmail==""||
        customerAddress == "" || customertradeWay=="") {
        alert("請填入資料")
        return
    }
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
        alert("訂單送出")
         customerName = document.querySelector("#customerName").value=""
         customerPhone = document.querySelector("#customerPhone").value=""
         customerEmail = document.querySelector("#customerEmail").value=""
         customerAddress = document.querySelector("#customerAddress").value=""
         customertradeWay = document.querySelector("#tradeWay").value="ATM"
         getCartList()
    }))
})

//validateEmail
const customerEmail = document.querySelector("#customerEmail")
customerEmail.addEventListener("blur",e=>{
    if (validateEmail(customerEmail.value) == false) {
        document.querySelector(`[data-message="Email"]`).textContent = "請填入正確格式"
    }
})

init()

//validateEmail
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


