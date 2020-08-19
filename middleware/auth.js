const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  console.log(req);
  //Get token from header
  const token = req.header("x-auth-token");

  //check if token exists
  if (!token) {
    return res
      .status(401)
      .json({ errors: [{ msg: "No token, authorization denied" }] });
  }
  try {
    //decode token
    const decoded = jwt.verify(token, config.get("jwtSecret"));

    //Set user on request to keep the decoded user
    req.user = decoded.user;
    next();
  } catch (err) {
    //Send authorisation denied if token is invalid
    res
      .status(401)
      .json({ errors: [{ msg: "Token Invalid, authorization denied" }] });
  }
};
