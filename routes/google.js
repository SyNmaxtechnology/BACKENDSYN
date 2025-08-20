const fs =require("fs");
const express = require("express");
const router = express.Router();
const middleware = require("../middleware/Auth");


module.exports = () => {


    router.get('/google/callback',middleware,(req,res) => {

        console.log("response ",res);

    })

    return router;
}