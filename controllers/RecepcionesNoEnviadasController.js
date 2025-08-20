const recepciones = require("../models/RecepcionesNoProcesadas");

const agregarFacturaRecepcion = (obj) => {

    return recepciones.agregarFacturaRecepcion(obj);
}

const obtenerFacturaRecepcion = (obj) => {
    return recepciones.obtenerFacturaRecepcion(obj);
}

const actualizarEstadoFacturaRecepcion = (obj) => {
    return recepciones.actualizarEstadoFacturaRecepcion(obj);
}

const cargarFacturasProveedorPorIdEmisor = (idemisor) => {
    return recepciones.cargarFacturasProveedorPorIdEmisor(idemisor);
}

const cargarFacturasProveedorPorIdCedulaJuridica = (cedula,idemisor) => {
    return recepciones.cargarFacturasProveedorPorIdCedulaJuridica(cedula,idemisor);
}

const actualizarIdEmisorPorIdComprobante = (obj) => recepciones.actualizarIdEmisorPorIdComprobante(obj);
const actualizarEstadoEnviado = (obj) => recepciones.actualizarEstadoEnviado(obj);

module.exports = {
    agregarFacturaRecepcion,
    obtenerFacturaRecepcion,
    actualizarEstadoFacturaRecepcion,
    cargarFacturasProveedorPorIdEmisor,
    cargarFacturasProveedorPorIdCedulaJuridica,
    actualizarIdEmisorPorIdComprobante,
    actualizarEstadoEnviado
}