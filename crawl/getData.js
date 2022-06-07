const axios = require("axios");
const checkExit = require("./checkExit.js");
const sql = require("../model/db");
async function crawlData(ApiKey) {
  var date = new Date();
  date.setHours(7, 0, 0, 0);
  var isodate = date.toISOString().split(".")[0];
  const res = await axios.get("https://api.accesstrade.vn/v1/orders", {
    headers: {
      Authorization: "Token " + ApiKey,
    },
    params: {
      since: "2022-03-01T00:00:00",
      until: "2022-04-01T00:00:00",
    }
  });
  return res.data;
}
async function getOrdersOnePage(page, ApiKey) {
  var date = new Date();
  date.setHours(7, 0, 0, 0);
  var isodate = date.toISOString().split(".")[0];
  const res = await axios.get("https://api.accesstrade.vn/v1/orders", {
    headers: {
      Authorization: "Token " + ApiKey,
    },
    params: {
      since: "2022-04-01T00:00:00",
      until: "2022-05-01T00:00:00",
      page: page,
    },
  });
  return res.data.data;
}
async function calculateCommission(name, commission) {
  return new Promise((resolve) => {
    sql.query(
      `SELECT percentage , unit_price  FROM partners WHERE name = "${name}"`,
      async function (error, results, fields) {
        if (error) {
          console.log(error);
        } else {
          if (results.length > 0) {
            if (results[0].percentage == 0) {
              resolve(results[0].unit_price);
            } else {
              resolve((commission * results[0].percentage) / 100);
            }
          } else {
            resolve((commission * 40) / 100);
          }
        }
      }
    );
  });
}

function filterData(arr) {
  arr.forEach(async (order) => {
    const value = {};
    value.order_id = order.order_id;
    value.merchant = order.merchant;
    value.utm_source = order.utm_source;
    value.is_confirmed = order.is_confirmed;
    value.sales_time = order.sales_time;
    value.pub_commission = order.pub_commission;
    value.reality_commission = await calculateCommission(
      order.merchant,
      order.pub_commission
    );
    value.order_status = order.products[0].status;
    value.confirmed_time = order.confirmed_time;
    value.click_time = order.click_time;
    value.device = order.client_platform;
    filterDataByTime(value);
  });
}

async function filterDataByTime(dataOrders) {
  await checkExit.check(dataOrders);
}
async function getStart(ApiKey) {
  const dataRes = await crawlData(ApiKey);
  var total_page = dataRes.total_page;
  if (total_page > 1) {
    var getAll = [];
    for (let i = 1; i <= total_page; i = i + 2) {
      let j = i + 1;
      const page = await getOrdersOnePage(i, ApiKey);
      const page_next = await getOrdersOnePage(j, ApiKey);
      getAll = getAll.concat(page.concat(page_next));
    }
    await filterData(getAll);
    console.log(getAll.length);
    console.log("done  " + ApiKey);
  } else {
    await filterData(dataRes.data);
    console.log(dataRes.data.length);
    console.log("done  " + ApiKey);
  }
}

async function getKey() {
  await sql.query(
    `SELECT API_key FROM accounts `,
    async function (error, results, fields) {
      if (error) {
        console.log(error);
      } else {
        results.forEach(async (account) => {
          await getStart(account.API_key);
        });
      }
    }
  );
}

(async () => {
  await getKey();
})();
