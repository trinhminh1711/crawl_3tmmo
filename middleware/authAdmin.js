require("dotenv").config();
var jwt = require("jsonwebtoken");
function authenToken(req, res, next) {
  if (req.headers["authorization"] == undefined) res.sendStatus(404);
  else {
    const token = req.headers["authorization"].split(" ")[1];
    if (!token) res.send('permission denied');
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err != null) {
        res.send('permission denied')
        return;
      } else {
        if(parseJwt(token).role == '0') { next(); }
        else { res.send('permission denied') }
      }
    });
  }
}
function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
};
module.exports = authenToken;
