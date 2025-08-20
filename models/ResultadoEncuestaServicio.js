const pool = require('../db/config');
let ResultadoEncuestaServicio = {};
ResultadoEncuestaServicio.agregarResultado = (obj) => {

    return new Promise((resolve,reject) => {

        const {idusuario,idemisor,idcliente,calificacion,observacion,idpregunta} = obj;

        pool.query(`
            INSERT INTO Resultado_Encuesta_Servicio(idusuario,idemisor,idcliente,calificacion,observaciones,idpregunta)
                VALUES(?,?,?,?,?,?)
        `,[idusuario,idemisor,idcliente,calificacion,observacion,idpregunta],
        (err,rows,fields) => {
            if(err){
                console.log(err)
               return reject('failed_save_result');
            }

            const {affectedRows} = rows;
            
            if(affectedRows > 0){
                return resolve(true);
            } else {
               return reject('dont_saved_result');
            }
        })
    })
}

ResultadoEncuestaServicio.obtenerResultadosEncuestaServicio = (obj) => {

    return new Promise((resolve,reject) => {

        const {idemisor,idusuario,idpregunta,fechaInicio, fechaFin} = obj;
        const sql = `           
                SELECT c.id as idcliente, u.id as idusuario,c.cliente_nombre as cliente,u.usuario,es.pregunta, 
                res.calificacion,res.observaciones, es.valor
                FROM encuesta_servicio es, resultado_encuesta_servicio res,usuario u, cliente c
                WHERE res.idemisor = ${idemisor}
                ${idusuario ? `AND res.idusuario = ${idusuario}`: ''}
                AND res.idpregunta = es.id
                AND res.idusuario = u.id
                AND c.id = res.idcliente
            ${idpregunta ? `
                AND res.idpregunta = ${idpregunta}
            `: ''}

            ${fechaInicio && fechaFin && fechaInicio != '' && fechaFin != ''? " AND SUBSTRING(res.fecha,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(res.fecha,1,10) <= '" + fechaFin.toString() + "'": ''}
        `;

        console.log(sql);
        pool.query(sql,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows)
        })
    })
}

ResultadoEncuestaServicio.obtenerResultadosConPromedio = (obj) => {

    return new Promise((resolve,reject) => {

        const {idemisor,idusuario,idpregunta,fechaInicio,fechaFin} = obj;
        const sql = `
                SELECT DISTINCT u.id as idusuario,c.id as idcliente,u.usuario
                FROM encuesta_servicio es, resultado_encuesta_servicio res,usuario u, cliente c
                WHERE res.idemisor = ${idemisor}
                ${idusuario ? ` AND res.idusuario = ${idusuario}`: ''}
                AND res.idpregunta = es.id
                AND res.idusuario = u.id
                AND c.id = res.idcliente
                ${idpregunta?` AND res.idpregunta = ${idpregunta}`:''}
                
                ${fechaInicio && fechaFin && fechaInicio != '' && fechaFin != ''? " AND SUBSTRING(res.fecha,1,10) >= '" + fechaInicio.toString() + "' AND SUBSTRING(res.fecha,1,10) <= '" + fechaFin.toString() + "'": ''}
                `;

                
        
        console.log(sql);
        pool.query(sql,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows)
        })
    })

    /*        


        SELECT c.cliente_nombre as cliente ,res.idpregunta,res.calificacion
        FROM resultado_encuesta_servicio res, encuesta_servicio es, usuario u,cliente c
        WHERE res.idemisor = 2
        AND res.idusuario = u.id
        AND res.idusuario = 8
        AND res.idpregunta = es.id
        AND res.idcliente = c.id

        SELECT u.usuario,res.idpregunta,AVG(res.calificacion) as promedio
        FROM resultado_encuesta_servicio res, encuesta_servicio es, usuario u
        WHERE res.idemisor = 2
        AND u.id = 8
        AND res.idusuario = u.id
        AND res.idpregunta = es.id
        GROUP BY res.idpregunta, res.idpregunta
    */
}

module.exports = ResultadoEncuestaServicio;

