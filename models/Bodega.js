const pool = require("../db/config");
let Bodega = {}; //com1


Bodega.nuevaBodega = (obj) => {
    return new Promise((resolve,reject) => {
        // idemisor | descripcion | Principal
        const {idemisor , descripcion , Principal} = obj;
        console.log(obj);
        pool.query("INSERT INTO Bodega(idemisor,descripcion,Principal) VALUES(?,?,?)",
            [idemisor , descripcion , Principal],(err, rows,fields) => {

            if(err){
                console.log(err);
                return reject(err);
            } else {
                console.log(rows)
                resolve(rows);
            }
        })
    })
}

Bodega.obtenerBodegasPorEmisor = (obj) => {
    return new Promise((resolve,reject) => {
        const {idemisor} = obj;
        pool.query(`
        SELECT b.id, b.descripcion FROM Bodega b, Emisor e
        WHERE e.id = ${idemisor}
        AND b.idemisor = e.id 
        `,(err, rows, fields) => {
            if(err){
                return reject(err);
            }
            return resolve(rows);
        })
    })
}


Bodega.obtenerIdBodegaPrincipal = (idemisor) => {
    return new Promise((resolve,reject) => {
        pool.query(`SELECT id FROM Bodega WHERE idemisor = ? AND Principal = 1`,
        [idemisor],(err, rows, fields) => {
            if(err){
               return reject(err)
            }
            resolve(rows)
        })
    })
}


Bodega.obtenerBodegaPorIdUsuario = (idusuario) => {

    return new Promise((resolve,reject) => {

        pool.query(`
            SELECT idbodega FROM Usuario WHERE id = ${idusuario}
        `,[],(err,rows,fields) => {
            if(err){
                return reject(err)
             }
             resolve(rows)
        })
    })
}

module.exports = Bodega;
