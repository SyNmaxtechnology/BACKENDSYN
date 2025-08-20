const express = require("express");
const router = express.Router();
const recepcionController = require("../controllers/RecepcionController");
const middleware = require("../middleware/Auth");
module.exports = () => {

    router.post('/recepcion', middleware,recepcionController.subirXML, recepcionController.generarRecepcion);
    router.get('/descargar-respuesta/',recepcionController.descargarXml);
    router.get('/visualizar/:id',middleware,recepcionController.visualizarRespuesta);
    router.get('/recepciones/no-procesadas',middleware,recepcionController.cargarFacturas);
    router.post('/recepciones/procesar-recepciones',middleware,recepcionController.procesarRecepciones);
    router.get('/recepcion/visualizar-factura/:idfactura',recepcionController.visualizarRecepcion);

    return router;
}