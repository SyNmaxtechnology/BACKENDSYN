const { reject } = require("async");
const pool = require("../db/config");
let ResultadoEncuestaRequerimiento = {};

ResultadoEncuestaRequerimiento.agregarRespuesta = (obj) => {
    console.log(obj);
    return new Promise((resolve,reject) => {

        const {idcliente,idusuario,idemisor,idpregunta,requerimiento,cantidad,observacion} = obj;

        pool.query(`
            INSERT INTO resultado_encuesta_requerimiento(idcliente,idusuario,idemisor,idpregunta,requerimiento,cantidad,observaciones)
                VALUES(?,?,?,?,?,?,?)
        `,[idcliente,idusuario,idemisor,idpregunta,requerimiento.toUpperCase(),cantidad,observacion],(err,rows,fields) => {
            console.log(err);
            if(err) throw new Error('err_saved_answer');
            resolve(true);
        })
    })
} 
ResultadoEncuestaRequerimiento.obtenerDatosReporteRequerimientos = (obj) => {

    return new Promise((resolve,reject) => {

        const {idcliente,idemisor,idusuario,fechaInicio,fechaFin,tipoReporte,idpregunta} = obj;
        let sql = '';
        
        if(tipoReporte == 'requerimiento'){ // reporte de requerimiento pcoincidenciaor requerimiento
            sql =`
                SELECT req.requerimiento as pregunta, COUNT(er.pregunta) as cantidadSeleccionado,SUM(req.cantidad) as cantidadPotencial
                FROM Encuesta_Requerimiento er, Resultado_encuesta_requerimiento req, Emisor e
                WHERE e.id = ${idemisor}
                AND e.id = req.idemisor 
                AND er.id = req.idpregunta
                ${idpregunta? `
                    AND er.id = ${idpregunta}
                `:''}

                ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== '' ? " AND SUBSTRING(req.fecha,1,10) >= '" +fechaInicio.toString() + "' AND SUBSTRING(req.fecha,1,10) <= '" + fechaFin.toString() + "'"
                :''}
                
                GROUP BY req.requerimiento
            `;

            console.log(sql);
            
        } else { // repoorte de requerimiento por cliente
            sql =`
                
                SELECT res.requerimiento, es.pregunta, res.cantidad,res.observaciones,c.cliente_nombre as cliente 
                    FROM Emisor e, Resultado_encuesta_requerimiento res, Encuesta_requerimiento es, Cliente c
                WHERE e.id = ${idemisor}
                AND res.idemisor = e.id 
                AND res.idpregunta = es.id
                
                ${idcliente?`
                    AND c.id = ${idcliente}
                `: ''}

                AND res.idcliente = c.id
                
                ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== '' ? " AND SUBSTRING(res.fecha,1,10) >= '" +fechaInicio.toString() + "' AND SUBSTRING(res.fecha,1,10) <= '" + fechaFin.toString() + "'"
                :''}
            `;
        }

        console.log(sql);
        
        pool.query(sql,[],(err,rows,fields) => {
            if(err) return reject(err);
            resolve(rows);
        })
    })
}

ResultadoEncuestaRequerimiento.obtenerTotalEncuestas = (obj) => {

    return new Promise((resolve,reject) => {
        const {idemisor,fechaInicio,fechaFin,idpregunta} = obj;

        const sql =`
                
        SELECT COUNT(req.id) as total 
            FROM Emisor e, Resultado_encuesta_requerimiento req, Encuesta_Requerimiento er
        WHERE e.id = ${idemisor}
        AND req.idemisor = e.id 
        AND er.id = req.idpregunta

        ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== '' ? " AND SUBSTRING(req.fecha,1,10) >= '" +fechaInicio.toString() + "' AND SUBSTRING(req.fecha,1,10) <= '" + fechaFin.toString() + "'"
                :''}
        `;

        pool.query(sql,[],(err,rows,fields) => {
            if(err) return reject(err);
            resolve(rows);
        })
    })
}

ResultadoEncuestaRequerimiento.obtenerPreguntas = (obj) => {

    return new Promise((resolve,reject) => {

        const {idemisor,fechaInicio,fechaFin,idpregunta} = obj;
        const sql =`
            SELECT DISTINCT er.pregunta, req.idpregunta, req.requerimiento 
            FROM Encuesta_Requerimiento er, Resultado_encuesta_requerimiento req, Emisor e
            WHERE e.id = ${idemisor}
            AND e.id = req.idemisor 
            AND er.id = req.idpregunta
            ${idpregunta? `
                AND er.id = ${idpregunta}
            `:''}

            ${fechaInicio && fechaInicio.toString() !== '' && fechaFin && fechaFin.toString() !== '' ? " AND SUBSTRING(req.fecha,1,10) >= '" +fechaInicio.toString() + "' AND SUBSTRING(req.fecha,1,10) <= '" + fechaFin.toString() + "'"
            :''}`;
        pool.query(sql,[],(err,rows,fields) => {
            if(err) return reject(err);
            resolve(rows);
        })
    })
}

module.exports = ResultadoEncuestaRequerimiento