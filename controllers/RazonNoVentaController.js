const jwt = require("jsonwebtoken");
const RazonNoVenta = require("../models/RazonNoVenta");

const agregarRazon = (req,res) => {
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {razon} = req.body;

    RazonNoVenta.agregarRazon({razon,idemisor})
        .then(({affectedRows}) => {
           if(affectedRows > 0){
            return res.status(201).json({
                message: 'Razon agregada'
            })
           } else {
            return res.status(400).json({
                message: 'No se pudo agregar la razon'
            })
           } //com
        })
    .catch( err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al agregar la razon'
        })    
    })

}

const actualizarRazon = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {razon,id} = req.body;

    RazonNoVenta.actualizarRazon({razon,idemisor,id})
        .then(({affectedRows}) => {
           if(affectedRows > 0){
            return res.status(201).json({
                message: 'Razon actualizada'
            })
           } else {
            return res.status(400).json({
                message: 'No se pudo actualizar la razon'
            })
           }
        })
    .catch( err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al actualizar la razon'
        })    
    })
}

const obtenerRazonesPorEmisor = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    RazonNoVenta.cargarRazonesPorIdEmisor(idemisor).then(response => res.status(200).json(response))
    .catch(err => {
        console.log(err);
        res.status(500).json({
            mesaage: 'Error al obtener las razones'
        })
    })
}

const obtenerRazonPorId = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {params:{id}} = req;

    RazonNoVenta.cargarRazonPorId({id,idemisor}).then(response => res.status(200).json(response))
    .catch(err => {
        console.log(err);
        res.status(500).json({
            mesaage: 'Error al obtener la razon'
        })
    })
}

const eliminarRazon = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {params:{id}} = req;

    RazonNoVenta.eliminarRazon({id,idemisor}).then(({affectedRows}) => {
        if(affectedRows > 0){
            res.status(204).json()
        } else {
            res.status(400).json({
                message: 'No se pudo eliminar la razón'
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al eliminar la razón'
        })
    })
}

module.exports = {
    agregarRazon,
    actualizarRazon,
    obtenerRazonesPorEmisor,
    obtenerRazonPorId,
    eliminarRazon
}