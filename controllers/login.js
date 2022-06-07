const sql = require("../model/db");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
var md5 = require("md5");
require("dotenv").config();
exports.create = async (req, res) => {
  const passwodHash = md5(req.body.password);
  const userName = req.body.username;
  {
    await sql.query(`SELECT user_id , username , role FROM users WHERE username= BINARY "${userName}" AND password= "${passwodHash}" `, function (error, results, fields) {
      if (error) res.send(error);
      else {
        if (results.length === 0) {
          return res.send({
            success: false,
            message: "Tên đăng nhập hoặc mật khẩu không đúng",
          });
        } else {
          const payloadData = { username: results[0].username, user_id: results[0].user_id, role: results[0].role };

          const accessToken = jwt.sign(payloadData, process.env.ACCESS_TOKEN_SECRET, {
            header : {typ: "JWT" , alg: "HS256"},
            expiresIn: "10s",
          });
          const refreshToken = jwt.sign(payloadData, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "10d",
          });
          generateRefreshToken(refreshToken);
          return res.send({ login: true, idUser: results[0].user_id, token: accessToken, tokenRefresh: refreshToken, payload: payloadData });
        }
      }
    });
  }
};

async function generateRefreshToken(tokenRf) {
  var timeNow = new Date().toISOString();
  await sql.query(`INSERT INTO refreshtoken ( Refresh_Token, Time_Generate) VALUES ("${tokenRf}" ,  "${timeNow}");`);
}
