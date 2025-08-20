const EncuestaServicio = require("../models/EncuestaServicio");
const jwt = require("jsonwebtoken");
const Calificacion = require("../ServiciosWeb/Calificacion");

const agregarPregunta= (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {pregunta,valor} = req.body;
    EncuestaServicio.agregarPregunta({
        pregunta,
        idemisor,
        valor
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
    const {pregunta,id,valor} = req.body;
    
    EncuestaServicio.actualizarPregunta({
        pregunta,
        idemisor,
        id,
        valor
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

    EncuestaServicio.obtenerPreguntasPorEmisor(idemisor)
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

    EncuestaServicio.obtenerPreguntaPorId({idemisor,id})
    .then(response => res.status(200).json(response))
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al obtener la pregunta'
        })
    })
}

const Calificaciones = (req,res) => {

    try {
        const response = Calificacion();
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Error al cargar la informacion de las calificaciones'
        })
    }
}

const obtenerPreguntasParaEncuesta = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;

    EncuestaServicio.cargarPreguntasParaEncuesta(idemisor)
    .then(response => res.status(200).json(response))
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al obtener la pregunta'
        })
    })
}


const eliminarPregunta = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {id} = req.params;

    EncuestaServicio.eliminarPregunta({idemisor,id})
        .then(({affectedRows}) => {
            if(affectedRows > 0) {
                res.status(204).json();
            } else {
                res.status(400).json({
                    message: 'No se pudo eliminar la pregunta'
                })
            }
        })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al eliminar la pregunta'
        })
    })
}


module.exports = {
    agregarPregunta,
    actualizarPregunta,
    obtenerPreguntasPorId,
    obtenerPreguntasPorEmisor,
    Calificaciones,
    obtenerPreguntasParaEncuesta,
    eliminarPregunta
}