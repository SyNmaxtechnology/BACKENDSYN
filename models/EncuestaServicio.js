const { reject } = require("async");
const pool = require("../db/config");
let EncuestaServicio = {};


EncuestaServicio.agregarPregunta = (obj) => {

    return new Promise((resolve,reject) => {

        const {idemisor,pregunta,valor} = obj;
        pool.query('INSERT INTO Encuesta_Servicio(idemisor,pregunta,valor) VALUES(?,?,?)',
        [idemisor,pregunta,valor],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

EncuestaServicio.actualizarPregunta = (obj) => {

    return new Promise((resolve,reject) => {

        const {idemisor,pregunta,id,valor} = obj;
        pool.query('UPDATE Encuesta_Servicio SET pregunta = ?, valor=? WHERE idemisor = ? AND id = ?',
        [pregunta,valor,idemisor,id],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

EncuestaServicio.obtenerPreguntasPorEmisor = (idemisor) => {

    return new Promise((resolve,reject) => {
        pool.query(`
            SELECT es.id, es.pregunta,es.valor,e.emisor_nombre as auditoria
            FROM Encuesta_Servicio es, Emisor e
            WHERE e.id =${idemisor}
            AND e.id = es.idemisor
            ORDER BY es.id DESC
        `,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

EncuestaServicio.obtenerPreguntaPorId = (obj) => {

    return new Promise((resolve,reject) => {
        const {idemisor, id} = obj;

        pool.query(`
            SELECT id, pregunta,valor FROM Encuesta_Servicio WHERE idemisor = ${idemisor} AND id = ${id}
        `,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

EncuestaServicio.cargarPreguntasParaEncuesta = (idemisor) => {
    return new Promise((resolve,reject) => {
        pool.query(`
            SELECT es.id, es.pregunta, es.valor 
            FROM Encuesta_Servicio es
            WHERE es.idemisor = ${idemisor}
            ORDER BY es.id ASC
        `,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

EncuestaServicio.eliminarPregunta = (obj) => {

    return new Promise((resolve,reject) => {
        
        const {idemisor,id} = obj;

        pool.query(`
            DELETE FROM encuesta_servicio WHERE idemisor = ${idemisor} AND id = ${id}
        `,[],(err,rows,fields) => {
            if(err){
                return  reject(err);
            }

            resolve(rows);
        })
    })
}

module.exports = EncuestaServicio;
