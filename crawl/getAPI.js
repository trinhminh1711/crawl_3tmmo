const sql = require("../model/db");
const axios = require("axios");
var fs = require("fs");
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
async function insertDataBase(order) {
  await sql.query(
    `INSERT INTO orders ( merchant, utm_source,  is_confirmed, pub_commission , reality_commission ,sales_time,order_status ,confirmed_time ,click_time  ,device) VALUES ("${
      order.merchant
    }", "${order.utm_source}","${order.is_confirmed}","${
      order.pub_commission
    }", "${order.pub_commission + 200}","${order.sales_time}","${
      order.order_status
    }","${order.confirmed_time}","${order.click_time}","${order.device}");`,
    function (error, results, fields) {
      if (error) {
        fs.appendFileSync(
          "/home/rb005/Desktop/3tmmo/3tmmo-backend-v2/crawl/out.txt",
          error + "\n"
        );
      } else {
        console.log("add row recods");
      }
    }
  );
}
async function filterDataByTime(dataOrders) {
  dataOrders.forEach(async function (element) {
    await insertDataBase(element);
  });
}
function filterData(arr) {
  let dataFilter = [];
  arr.forEach((order) => {
    const value = {};
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
  });
  console.log(dataFilter);
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
