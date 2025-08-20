const Encuesta_Requerimiento = require("../models/EncuestaRequerimiento");
const jwt = require("jsonwebtoken");

const agregarPregunta= (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {pregunta} = req.body;
    Encuesta_Requerimiento.agregarPregunta({
        pregunta,
        idemisor
    }).then(({affectedRows}) => {
        if(affectedRows > 0){
            return res.status(201).json({
                message: 'Pregunta agregada'
            })
        } else {
            return res.status(400).json({
                message: 'No se pudo agregar la pregunta'
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al agregar la pregunta'
        })
    })  
}

const actualizarPregunta= (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {pregunta,id} = req.body;

    Encuesta_Requerimiento.actualizarPregunta({
        pregunta,
        idemisor,
        id
    }).then(({affectedRows}) => {
        if(affectedRows > 0){
            return res.status(200).json({
                message: 'Pregunta actualizada'
            })
        } else {
            return res.status(400).json({
                message: 'No se pudo actualizar la pregunta'
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al actualizar la pregunta'
        })
    })  
}

const obtenerPreguntasPorEmisor = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    Encuesta_Requerimiento.obtenerPreguntasPorEmisor(idemisor)
    .then(response => res.status(200).json(response))
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al obtener las preguntas'
        })
    })
}

const obtenerPreguntasPorId = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {id} = req.params;

    Encuesta_Requerimiento.obtenerPreguntaPorId({idemisor,id})
    .then(response => res.status(200).json(response))
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al obtener la pregunta'
        })
    })
}

const obtenerPreguntasParaEncuesta = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    Encuesta_Requerimiento.cargarPreguntasParaEncuesta(idemisor)
    .then(response => res.status(200).json(response))
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al obtener la pregunta'
        })
    })
}

const eliminarLinea = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {id} = req.params;

    Encuesta_Requerimiento.eliminarLinea({idemisor,id})
        .then(({affectedRows}) => {
            if(affectedRows > 0){
                res.status(204).json();
            } else {
                res.status(400).json({
                    message: 'No se pudo eliminar la línea'
                });
            }
        })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al eliminar la línea'
        });
    })
}


module.exports = {
    agregarPregunta,
    actualizarPregunta,
    obtenerPreguntasPorId,
    obtenerPreguntasPorEmisor,
    obtenerPreguntasParaEncuesta,
    eliminarLinea
}