const express = require("express");
const router = express.Router();
const RecetaController = require("../controllers/RecetaController");
const middleware = require("../middleware/Auth");

module.exports = () => {
    
    router.post('/receta', middleware, RecetaController.rutaGuardarReceta);
    router.post('/receta/obtener-receta/', RecetaController.rutaObtenerReceta);
    router.put('/receta/actualizar-receta/articulos', RecetaController.rutaActualizarReceta);

    return router;
}

