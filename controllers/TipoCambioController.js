const tipoCambio = require("../models/TipoCambio");

const agregarTipoCambio = (obj) => {

    return tipoCambio.agregarTipoCambio(obj);
}

const existeTipoCambio = (fecha) => {

    return tipoCambio.existeTipoCambio(fecha);
}

const obtenerTipoCambio = (fecha) => {
    return tipoCambio.obtenerTipoCambio(fecha);
}

const obtenerTipoCambioPorFecha = (fecha) => tipoCambio.obtenerTipoCambioPorFecha(fecha);

module.exports = {
    agregarTipoCambio,
    existeTipoCambio,
    obtenerTipoCambio,
    obtenerTipoCambioPorFecha
}