const express = require("express");
const router = express.Router();
const parametrosController = require("../controllers/ParametrosController");
const middleware = require("../middleware/Auth");
module.exports = () => {

    router.post("/parametros", middleware, parametrosController.guardarParametros);
    router.get("/parametros", middleware, parametrosController.obtenerParametros);
    router.put("/parametros", middleware, parametrosController.actualizarParametros); //gfd

    return router;
}