const express = require('express');
const router = express.Router();
const middleware = require("../middleware/Auth");
const PosController = require("../controllers/PosController");


module.exports = () => {


    router.get('/pos',middleware,PosController.generarReporte);

    return router;
}