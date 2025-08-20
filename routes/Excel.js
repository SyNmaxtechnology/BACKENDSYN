const express = require('express');
const router = express.Router();
const excelController  = require("../controllers/ExcelController");
const middleware = require("../middleware/Auth");
module.exports = () => {

    router.get('/excel', middleware,excelController.descargarReporte);

    return router;
}
