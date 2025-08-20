const pool = require("../db/config");

let RazonNoVenta = {};

RazonNoVenta.agregarRazon = (obj)  => { 

    return new Promise((resolve,reject) => {
        const {idemisor,razon} = obj;

        pool.query('INSERT INTO razones_no_venta(idemisor,razon) VALUES(?,?)',
        [idemisor,razon],(err,rows,fields) => {
            if(err){
                return reject(err)
            }

            resolve(rows);
        })
    })
}

RazonNoVenta.actualizarRazon = (obj)  => { 

    return new Promise((resolve,reject) => {
        const {idemisor,razon,id} = obj;

        pool.query('UPDATE razones_no_venta SET razon =? WHERE idemisor =? AND id =?',
        [razon,idemisor,id],(err,rows,fields) => {
            if(err){
                return reject(err)
            }

            resolve(rows);
        })
    })
}

RazonNoVenta.cargarRazonesPorIdEmisor = (idemisor)  => { 

    return new Promise((resolve,reject) => {
        pool.query(`
            SELECT r.id, r.razon,e.emisor_nombre as auditoria
            FROM razones_no_venta r, Emisor e
            WHERE e.id = ${idemisor}
            AND r.idemisor = e.id
        `,[],(err,rows,fields) => {
            if(err){
                return reject(err)
            }

            resolve(rows);
        })
    })
}

RazonNoVenta.cargarRazonPorId = (obj)  => { 

    return new Promise((resolve,reject) => {
        const {id,idemisor} = obj;
        pool.query(`
            SELECT id, razon FROM razones_no_venta WHERE idemisor = ${idemisor} AND id = ${id}
        `,[],(err,rows,fields) => {
            if(err){
                return reject(err)
            }

            resolve(rows);
        })
    })
}

RazonNoVenta.eliminarRazon = (obj) => {

    return new Promise((resolve,reject) => {

        const {idemisor,id} = obj;

        pool.query(`
            DELETE FROM razones_no_venta WHERE idemisor = ${idemisor} AND id = ${id}
        `,[],(err,rows,fields) => {
            if(err){
                return reject(err)
            }

            resolve(rows);
        })
    })
}

module.exports = RazonNoVenta;