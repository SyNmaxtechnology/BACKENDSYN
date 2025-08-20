const router = require("express").Router();
const middleware = require("../middleware/Auth");
const D151Controller = require("../controllers/D151Controller");

module.exports = () => {

    router.post('/d151-ventas', middleware,D151Controller.obtenerInformacionReported151Ventas);
    router.post('/d151-ventas-resumido', middleware,D151Controller.obtenerInformacionReported151VentasResumido);
    router.post('/d151-compras', middleware,D151Controller.obtenerInformacionReported151Compras);
    router.post('/d151-compras-resumido', middleware,D151Controller.obtenerInformacionReported151comprasresumido);
       //comentario
    return router;
}