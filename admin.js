const orderListDom = document.querySelector(".orderList");

//init
const init = ()=>{
    getOrderList();
    // renderC3();
};

//getOrderList
const getOrderList = (orderList)=>{
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers : {
            "authorization" : token
        }
    }).then((res=>{
        let str ='';
        orderList =res.data.orders;
        localStorage.setItem("orderData",JSON.stringify(orderList))

        orderList.forEach((item=>{
  
            //orderStatus
            let orderStatusStr = item.paid == true ? "已處理" : "未處理";
            
            //orderTime
            const timeStamp = new Date(item.createdAt*1000);
            let getTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;

            //orderItemStr 
            let orderItemStr = '';
            item.products.forEach((orderItem=>{
                orderItemStr += `<p>${orderItem.title}x${orderItem.quantity}</p>`
            }))
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
                        <td>${getTime}</td>
                        <td class="orderStatus">
                            <a href="#" class="orderStatus" data-orderId="${item.id}" data-orderPaid="${item.paid}">${orderStatusStr}</a>
                        </td>
                        <td>
                            <input type="button" class="delSingleOrder-Btn" value="刪除"  data-orderId="${item.id}">
                        </td>
                    </tr> `
        }));
        orderListDom.innerHTML = str
        renderC3()
    }))
}

//orderStatus
orderListDom.addEventListener("click",e=>{
    e.preventDefault()
    let orderId = e.target.getAttribute("data-orderId")
    let orderPaid = e.target.getAttribute("data-orderPaid")
    let orderStatusTarget = e.target.getAttribute("class") == "orderStatus" ? orderStatusUpdate(orderId,orderPaid) : "";
    let orderDeleteTarget = e.target.getAttribute("class") == "delSingleOrder-Btn" ? orderStatusDelete(orderId) : "";
})

//orderStatusUpdate
const orderStatusUpdate =(orderId,orderPaid)=>{
    let orderPaidStr = orderPaid == "true" ? false : true;
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        "data": {
            "id": orderId,
            "paid": orderPaidStr
        }
    },{
        headers: {
            "authorization": token
        }
    }).then((res=>{
        console.log(res);
        getOrderList()
    })).catch((error=>{
        console.log(error);
    }))
}

//orderStatusDelete
const orderStatusDelete =(orderId)=>{
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${orderId}`,{
        headers: {
            "authorization": token
        }
    }).then((res=>getOrderList())).catch((error=>console.log(error)))
}

//renderC3
const renderC3 =()=>{
  let totalObj = {};
    let getOrderLocal = JSON.parse(localStorage.getItem("orderData"));
    getOrderLocal.forEach((item=>{
        item.products.forEach((orderList)=>{
            if (totalObj[orderList.title] == undefined) {
                totalObj[orderList.title] = orderList.price * orderList.quantity;
            }else{
                totalObj[orderList.title] += orderList.price * orderList.quantity;
            }
        })
    }));
    let newOrderList = [];
    let newOrderAry = Object.keys(totalObj);
    newOrderAry.forEach((item=>{
        let ary = [];
        ary.push(item);
        ary.push(totalObj[item]);
        newOrderList.push(ary);
    }));

     newOrderList.sort((a,b)=>b[1]-a[1])

    if (newOrderList.length>3) {
        let otherTotal = 0;
        newOrderList.forEach((item,i)=>{
            // if (i >2) {
            //     // otherTotal = newOrderList[i][1];
            // }
           otherTotal = i > 2 ? newOrderList[i][1] : "";
        })
        newOrderList.splice(3,newOrderList.length-1);
        newOrderList.push(["其他",otherTotal]);
    }   
    chartC3(newOrderList)
}

//C3Data
const chartC3 = (newOrderList)=>{
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: newOrderList,
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

