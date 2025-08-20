const pool = require("../db/config");

const agregarFacturaRecepcion = (obj) => {
    return new Promise((resolve,reject) => {
        const {idemisor,xml} = obj;
        pool.query(`
            INSERT INTO recepciones(idemisor,xml) VALUES(?,?)
        `,[idemisor,xml],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

const obtenerFacturaRecepcion = (obj) => {
    return new Promise((resolve,reject) => {
        const {idemisor,id} = obj;
        pool.query(`
            SELECT xml FROM recepciones WHERE idemisor = ? AND id = ?
        `,[idemisor,id],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

const actualizarEstadoFacturaRecepcion = (obj) => {
    return new Promise((resolve,reject) => {
        const {idemisor, id} = obj;

        console.log("objeto actualizar estado recepcion", obj);
        pool.query(`
            UPDATE recepciones SET procesada = 1 WHERE idemisor = ? AND id = ?
        `,[idemisor,id],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}


const cargarFacturasProveedorPorIdEmisor = (idemisor) => {

    return new Promise((resolve,reject) => {
        pool.query(`
            SELECT id, xml FROM Recepciones WHERE idemisor = ? AND procesada = 0 AND enviada = 0
        `,[idemisor],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

const cargarFacturasProveedorPorIdCedulaJuridica = (cedula,idemisor) => {

    return new Promise((resolve,reject)  => {
        
       
        const sql = 'select r.id,r.xml from Recepciones r, Emisor e where e.cedula_emisor  = "'+cedula+'" and e.id = r.idemisor AND r.procesada = 0 and clave not in (select clavenumerica from entrada where idemisor  = "'+idemisor+' order by id") LIMIT 130';
        //const sql = 'select r.id,r.xml from Recepciones r where r.idemisor= "'+idemisor+'" AND r.procesada = 0 and clave not in ( select clavenumerica from entrada where idemisor  = "'+idemisor+'"  ) limit 50';
        console.log(sql)
        pool.query(sql,
        [],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
} 

const actualizarIdEmisorPorIdComprobante = obj => {

    return new Promise((resolve,reject) => {
        const {idemisor,idfactura} = obj;


        pool.query(`UPDATE Recepciones SET idemisor = ${idemisor} WHERE id = ${idfactura}`,
            [],(err,rows,fields) => {
                if(err){
                    return reject(err);
                }
    
                resolve(rows);
            })
    })
}

const actualizarEstadoEnviado =(obj) => {
    return new Promise((resolve,reject) => {

        const {idemisor,idfactura,estado} = obj;

        pool.query(`
            UPDATE Recepciones SET enviada = ${estado} WHERE idemisor = ${idemisor} AND id = ${idfactura}
        `,(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

module.exports = {
    agregarFacturaRecepcion,
    obtenerFacturaRecepcion,
    actualizarEstadoFacturaRecepcion,
    cargarFacturasProveedorPorIdEmisor,
    cargarFacturasProveedorPorIdCedulaJuridica,
    actualizarIdEmisorPorIdComprobante,
    actualizarEstadoEnviado
}