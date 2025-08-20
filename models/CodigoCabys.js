const pool = require("../db/config");
const axios = require("axios");
const agregarCodigo = (obj) => {//com1
    
    return new Promise((resolve,reject) => {

        const {idemisor,codigo,descripcion} = obj;

        pool.query('INSERT INTO CodigoCabys(idemisor,codigoCabys,descripcion) VALUES(?,?,?)',
        [idemisor,codigo,descripcion],(err,rows,fields) => {
            if(err){
                return reject(err);
            }
            resolve(rows);
        })

    })
}

const editarCodigoCabys = (obj) => {

    return new Promise((resolve,rejec) => {
        const {idemisor,codigo,descripcion,id} = obj;

        pool.query(`
            UPDATE CodigoCabys SET codigoCabys = ?, descripcion=? WHERE idemisor = ? 
            AND id = ?
        `,[codigo,descripcion,idemisor,id],(err,rows,fields) => {
            if(err){
                return reject(err)
            }

            resolve(rows);
        })
    })
}


const obtenerCodigosPorId = (obj) => {
    return new Promise((resolve,reject) => {

        const { idemisor,id} = obj;
        pool.query(`
            SELECT id, codigoCabys,descripcion FROM CodigoCabys WHERE idemisor = ? 
            AND id = ?
        `,[idemisor,id],(err,rows,fields) => {
            if(err){
                return reject(err)
            }

            resolve(rows);
        })
    })
}


const obtenerCodigosPorQuery = (obj) => {
    return new Promise((resolve,reject) => {
        // '%"+query+"%'
        const { idemisor,codigo} = obj;
        pool.query("SELECT c.id, c.codigoCabys, e.emisor_nombre FROM CodigoCabys c, Emisor e WHERE e.id = ? AND c.idemisor = e.id AND c.codigoCabys = ?",[idemisor,codigo],(err,rows,fields) => {
            if(err){
                return reject(err)
            }

            resolve(rows);
        })
    })
} 


const obtenerCodigosPorEmisor = (idemisor) => {
    return new Promise((resolve,reject) => {

        pool.query(`
            SELECT c.id, c.codigoCabys, e.emisor_nombre FROM CodigoCabys c, Emisor e
            WHERE e.id = ?
            AND c.idemisor = e.id
        `,[idemisor],(err,rows,fields) => {
            if(err){
                return reject(err)
            }

            resolve(rows);
        })
    })
}

const obtenerCodigosParaCategorias = (idemisor) => {
    
    return new Promise((resolve,reject) => {

        pool.query(`SELECT id, codigoCabys FROM CodigoCabys WHERE idemisor = ?`, [idemisor],
        (err,rows,fields) => {
            if(err){
                return reject(err)
            }

            resolve(rows);
        })
    })

}

const servicioWebBusquedaCodigoCabysPorDescripcion = (descripcion) => {

    const urlCodigosCabys  = 'https://api.hacienda.go.cr/fe/cabys?q=';

    const url = `${urlCodigosCabys}${descripcion}`;
    console.log(url);
    const options = {
        method: "GET",
        url
    }

    return axios(options)
}


module.exports = {
    agregarCodigo,
    editarCodigoCabys,
    obtenerCodigosPorId,
    obtenerCodigosPorQuery,
    obtenerCodigosPorEmisor,
    obtenerCodigosParaCategorias,
    servicioWebBusquedaCodigoCabysPorDescripcion
}
