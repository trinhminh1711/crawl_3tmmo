const axios = require("axios");
const checkExit = require("./checkExit.js");
//SELECT COUNT(order_id) FROM orders;
async function crawlData() {
  var date = new Date();
  date.setHours(7, 0, 0, 0);
  var isodate = date.toISOString().split(".")[0];
  const res = await axios.get("https://api.accesstrade.vn/v1/orders", {
    headers: {
      Authorization: "Token DxZxkflwgRUEFgZITNSp_048ust4yP0b",
    },
    params: {
      since: isodate,
    },
  });
  return res.data;
}
async function getOrdersOnePage(page) {
  var date = new Date();
  date.setHours(7, 0, 0, 0);
  var isodate = date.toISOString().split(".")[0];
  const res = await axios.get("https://api.accesstrade.vn/v1/orders", {
    headers: {
      Authorization: "Token DxZxkflwgRUEFgZITNSp_048ust4yP0b",
    },
    params: {
      since: isodate,
      page: page,
    },
  });
  return res.data.data;
}
function filterData(arr) {
  let currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 7);
  currentDate.setMinutes(currentDate.getMinutes() - 30);
  let isodate = currentDate.toISOString().split(".")[0];
  console.log(isodate);
  let currentDate2 = new Date();
  currentDate2.setHours(currentDate2.getHours() + 7);
  let isodate2 = currentDate2.toISOString().split(".")[0];
  console.log(isodate2);
  let dataFilter = [];
  arr.forEach((order) => {
    if (order.confirmed_time > isodate && order.confirmed_time < isodate2) {
      const value = {};
      value.order_id = order.order_id;
      value.merchant = order.merchant;
      value.utm_source = order.utm_source;
      value.is_confirmed = order.is_confirmed;
      value.sales_time = order.sales_time;
      value.pub_commission = order.pub_commission;
      value.order_status = order.products[0].status;
      value.confirmed_time = order.confirmed_time;
      value.click_time = order.click_time;
      value.device = order.client_platform;
      dataFilter.push(value);
    }
  });
  filterDataByTime(dataFilter);
}
async function filterDataByTime(dataOrders) {
  dataOrders.forEach(async function (element) {
    checkExit.check(element);
  });
}
(async () => {
  const dataRes = await crawlData();
  var total_page = dataRes.total_page;
  if (total_page > 1) {
    var getAll = [];
    for (let i = 1; i <= total_page; i = i + 2) {
      let j = i + 1;
      const page = await getOrdersOnePage(i);
      const page_next = await getOrdersOnePage(j);
      getAll = getAll.concat(page.concat(page_next));
    }
    filterData(getAll);
  } else {
    filterData(dataRes.data);
  }
})();
