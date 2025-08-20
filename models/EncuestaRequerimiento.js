const pool = require("../db/config");
let Encuesta_Requerimiento = {};

Encuesta_Requerimiento.agregarPregunta = (obj) => {

    return new Promise((resolve,reject) => {

        const {idemisor,pregunta} = obj;
        pool.query('INSERT INTO Encuesta_Requerimiento(idemisor,pregunta) VALUES(?,?)',
        [idemisor,pregunta],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Encuesta_Requerimiento.actualizarPregunta = (obj) => {

    return new Promise((resolve,reject) => {

        const {idemisor,pregunta,id} = obj;
        pool.query('UPDATE Encuesta_Requerimiento SET pregunta = ? WHERE idemisor = ? AND id = ?',
        [pregunta,idemisor,id],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Encuesta_Requerimiento.obtenerPreguntasPorEmisor = (idemisor) => {

    return new Promise((resolve,reject) => {
        pool.query(`
            SELECT es.id, es.pregunta,e.emisor_nombre as auditoria
            FROM Encuesta_Requerimiento es, Emisor e
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

Encuesta_Requerimiento.obtenerPreguntaPorId = (obj) => {

    return new Promise((resolve,reject) => {
        const {idemisor, id} = obj;

        pool.query(`
            SELECT id, pregunta FROM Encuesta_Requerimiento WHERE idemisor = ${idemisor} AND id = ${id}
        `,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Encuesta_Requerimiento.cargarPreguntasParaEncuesta = (idemisor) => {
    return new Promise((resolve,reject) => {
        pool.query(`
            SELECT es.id, es.pregunta 
            FROM Encuesta_Requerimiento es
            WHERE es.idemisor = ${idemisor}
            ORDER BY es.id DESC
        `,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Encuesta_Requerimiento.eliminarLinea = (obj) => {

    return new Promise((resolve,reject) => {

        const {idemisor,id} = obj;

        pool.query(`
            DELETE FROM Encuesta_Requerimiento WHERE idemisor = ${idemisor} AND id = ${id}
        `,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

module.exports = Encuesta_Requerimiento;
