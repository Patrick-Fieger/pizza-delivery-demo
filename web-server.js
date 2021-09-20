const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const { join } = require("path");
const authConfig = require("./auth_config.json");
const bodyParser = require("body-parser");
const axios = require("axios").default;
const port = process.env.PORT || 80;
const app = express();

require("dotenv").config();

if (!authConfig.domain || !authConfig.audience) {
  throw "Please make sure that auth_config.json is in place and populated";
}

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, "dist")));

app.listen(port, () => console.log(`Server listening on port ${port}`));

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"]
});

const checkPermission = (req,res,next) =>{
  const permisson = "update:current_user_metadata";

  if(req.user.permissions.indexOf(permisson) > -1){
    next();
  }else{
    res.status(403);
  }
};

app.post("/place/order", checkJwt, checkPermission, (req, res) => {

  let orders = {
    "order_history": req.body.orders
  };

  axios.patch(`https://${authConfig.domain}/api/v2/users/${req.user.sub}`,
    { 
      "user_metadata" : orders
    },{
      headers: {
        Authorization: `Bearer ${process.env.MANAGEMENT_TOKEN}`
    }
    });

  res.send("Order placed!");
});

if (process.env.NODE_ENV === "production") {
  app.use((_, res) => {
    res.sendFile(join(__dirname, "dist", "index.html"));
  });
}

module.exports = app;
