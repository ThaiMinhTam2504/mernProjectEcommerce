const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
// const dotenv = require("dotenv");
const path = require("path");

const errorMiddleware = require("./middleware/error");
// const cors = require("cors");

//config
// dotenv.config({ path: "backend/config/config.env" });
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({ path: "backend/config/config.env" });
}




app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
// app.use(bodyParser.urlencoded({ extended: true }));


app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }));
// app.use(cors());


//Route Imports
const product = require("./routes/productRoute");
const { model } = require("mongoose");
const user = require("./routes/userRoutes");
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute");



app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);


app.use(express.static(path.join(__dirname, "../fontend2/build")));

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../fontend2/build/index.html"))
});

//Middleware for Errors
app.use(errorMiddleware);

module.exports = app;
