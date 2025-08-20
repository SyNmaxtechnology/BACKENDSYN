const express = require("express");

const router = express.Router();
const controladorPOST = require("../controllers/pruebaController");

module.exports = () => {
    router.post('/servicio', controladorPOST.probarPOST);

    return router;
}