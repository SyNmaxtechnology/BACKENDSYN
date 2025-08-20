const express = require("express");
const router = express.Router();
const ubicacionController = require("../controllers/UbicacionesController");
const middleware = require("../middleware/Auth");
module.exports = () => {

    router.get("/provincias", middleware, ubicacionController.obtenerProvincias);
    router.get("/cantones/:idprovincia", middleware, ubicacionController.obtenerCantones);
    router.get("/distritos/:idcanton&:idprovincia", middleware, ubicacionController.obtenerDistritos);
    router.get("/barrios/:idcanton&:idprovincia&:iddistrito", middleware, ubicacionController.obtenerBarrios);

    return router;
}