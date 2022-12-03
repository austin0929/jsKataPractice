const orderListDom = document.querySelector(".orderList")
const discardAllBtn = document.querySelector(".discardAllBtn")

const api_path = "david18";
const token = "F3TyjVVLpwhRzLCuG4iXExmdCH93";


let orderList = []

const init = ()=>{
    getOrderList()
    renderC3()
}

//getOrderList
const getOrderList = ()=>{
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers: {
            "authorization" : token
        }
    }).then((res=>{
        orderList = res.data.orders
        let str =''
        orderList.forEach((item=>{

            //orderStatus
            let orderStatusStr = ''
            if (item.paid == true) {
                orderStatusStr = "已處理"
            }
            else{
                orderStatusStr = "未處理"
            }

            //orderItem
            let orderItemStr=''
            item.products.forEach((productItem=>{
                orderItemStr += `<p>${productItem.title}x${productItem.quantity}</p>`
            }))

            //timeStamp
            const timeStamp = new Date(item.createdAt*1000)
            let orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`

            //allStr
            str += `<tr>
                        <td>${item.id}</td>
                        <td>
                            <p>${item.user.name}</p>
                            <p>${item.user.tel}</p>
                        </td>
                        <td>${item.user.address}</td>
                        <td>${item.user.email}</td>
                        <td>
                            <p>${orderItemStr}</p>
                        </td>
                        <td>${orderTime}</td>
                        <td class="orderStatus">
                            <a href="#" class="orderStatus" data-orderID="${item.id}" data-orderPaid="${item.paid}">${orderStatusStr}</a>
                        </td>
                        <td>
                            <input type="button" class="delSingleOrder-Btn" value="刪除" data-orderID="${item.id}">
                        </td>
                    </tr>`
        }))
        orderListDom.innerHTML = str
        renderC3()
    }))
}

//deleteAllOrder
discardAllBtn.addEventListener("click",e=>{
    e.preventDefault()
    if (e.target.getAttribute("class") == "discardAllBtn") {
        axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
            headers: {
                "authorization": token
            }
        }).then((res=>{
            alert("訂單全部清除")
            getOrderList()
        })).catch((error=>{
            alert("無訂單可清除")
        }))
    }
})

//orderListCheckEvent
orderListDom.addEventListener("click",e=>{
    e.preventDefault()
    const orderId = e.target.getAttribute("data-orderId")
    const orderPaid = e.target.getAttribute("data-orderPaid")
    if (e.target.getAttribute("class") == "orderStatus") {
        orderStatusUpdate(orderId, orderPaid)
        return
    }
    if (e.target.getAttribute("class") == "delSingleOrder-Btn") {
        orderItemDelete(orderId)
        return
    }
})

//orderStatusUpdate
const orderStatusUpdate = (orderId,orderPaid)=>{
    let orderStatus = ''
    if (orderPaid == true) {
        orderStatus = false
    }
    else{
        orderStatus = true
    }
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        "data": {
            "id": orderId,
            "paid": orderStatus
        }
    },{
        headers: {
            "authorization": token
        }
    }).then((res=>getOrderList()))
}

//orderItemDelete
const orderItemDelete = (orderId)=>{
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${orderId}`,{
        headers: {
            "authorization": token
        }
    })
    .then((res=>getOrderList()))
}

//renderC3
const renderC3 =()=>{
    let totalObj = {}
    orderList.forEach((item=>{
        item.products.forEach((productItem=>{
            if (totalObj[productItem.title]== undefined) {
                totalObj[productItem.title] = productItem.price * productItem.quantity
                console.log(totalObj);
            }
        }))
    }))
    let C3Data = []
    let orderNewAry = Object.keys(totalObj)
    orderNewAry.forEach((item=>{
        let ary = []
        ary.push(item)
        ary.push(totalObj[item])
        C3Data.push(ary)
    }))
    
    C3Data.sort((a,b)=>b[1]-a[1])

    if (C3Data.length>3) {
        let otherTotal = 0
        C3Data.forEach((item,index)=>{
            if (index>2) {
                otherTotal = C3Data[index][1]
                console.log(otherTotal);
            }
        })
        C3Data.splice(3,3);
        C3Data.push(["其他",otherTotal])
    }

    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: C3Data,
            colors: {
                "Louvre 雙人床架": "#DACBFF",
                "Antony 雙人床架": "#9D7FEA",
                "Anty 雙人床架": "#5434A7",
                "其他": "#301E5F",
            }
        },
    });
}


init()

