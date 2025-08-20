const EntradaDetalle = require("../models/EntradaDetalle");


const insertarDetalle = (obj) => {
    return EntradaDetalle.insertarDetalle(obj);
}

const obtenerLineasEntrada = (id) => {
    return EntradaDetalle.obtenerLineasEntrada(id);
}

const eliminarLineasEntrada = (identrada) => EntradaDetalle.eliminarLineasEntrada(identrada);
const obtenerLineasEntradaAactualizar = (id)=> EntradaDetalle.obtenerLineasEntradaAactualizar(id); 
module.exports = {
    insertarDetalle,
    obtenerLineasEntrada,
    obtenerLineasEntradaAactualizar,
    eliminarLineasEntrada
}