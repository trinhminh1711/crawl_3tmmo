const sql = require("../model/db");
exports.getIncome = async (req, res) => {
  await sql.query(
    `SELECT SUM(pub_commission) , SUM(reality_commission) FROM orders WHERE utm_source = "${req.query.idUser}" and sales_time > "${req.query.since}"`,
    function (error, results, fields) {
      if (error) res.send(error);
      else {
        res.send(results);
      }
    }
  );
};

exports.getIncomeTime = async (req, res) => {

    await sql.query(
      `SELECT SUM(pub_commission) , SUM(reality_commission) FROM orders WHERE utm_source = "${req.query.userId}" and sales_time > "${req.query.since}" and sales_time < "${req.query.until}"`,
      function (error, results, fields) {
        if (error) res.send(error);
        else {
          res.send(results);
        }
      }
    );
  };

exports.getRankIncome = async (req, res) => {
  await sql.query(
    `SELECT utm_source, SUM(pub_commission) , SUM(reality_commission) FROM orders WHERE sales_time > "${req.query.since}" GROUP BY utm_source ORDER BY SUM(pub_commission) DESC`,
    function (error, results, fields) {
      if (error) res.send(error);
      else {
        res.send(results);
      }
    }
  );
};

exports.getRankIncomeTime = async (req, res) => {
  await sql.query(
    `SELECT utm_source, SUM(pub_commission) , SUM(reality_commission) FROM orders WHERE sales_time > "${req.query.since}" AND sales_time < "${req.query.until}" GROUP BY utm_source ORDER BY SUM(reality_commission) DESC`,
    function (error, results, fields) {
      if (error) res.send(error);
      else {
        res.send(results);
      }
    }
  );
};