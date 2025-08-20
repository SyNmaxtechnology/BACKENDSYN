const pool = require("../db/config");

exports.obtenerProvincias = () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT DISTINCT provincia, nPro FROM Barrios ORDER BY provincia ASC;',[], 
        function(err, rows, fields){
            if(err) {
                console.log(err);
               return reject(err);
            }//affectedRows
            
            return resolve(rows)
        });
    })
}

exports.obtenerCantones = (idprovincia) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT DISTINCT nCan,canton FROM Barrios WHERE provincia=? ORDER BY canton ASC;',[idprovincia],
        function(err,rows,fields){
            if(err) {
                console.log(err);
               return reject(err);
            }//affectedRows
            
            return resolve(rows)
        });
    })
}

exports.obtenerDistritos = (obj) => {
    return new Promise((resolve,reject) => {
        console.log(obj);
        const {idcanton,idprovincia} = obj;
        pool.query(`SELECT DISTINCT distrito, nDis FROM Barrios WHERE provincia=${idprovincia} AND canton=${idcanton} ORDER BY distrito ASC;`,[],
        function(err,rows,fields){
            if(err) {
                console.log(err);
               return reject(err);
            }//affectedRows
            console.log(rows)
            return resolve(rows)
        })
    })
}

exports.obtenerBarrios = (obj) => {

    return new Promise((resolve,reject) => {

        const {idprovincia, idcanton, iddistrito} = obj;
        pool.query(`SELECT DISTINCT hacienda, nHac, CodNew FROM Barrios WHERE provincia=${idprovincia} AND canton=${idcanton} AND distrito=${iddistrito} ORDER BY hacienda, nHac ASC;`,[],function(err,rows,fields){
            if(err) {
                console.log(err);
            return reject(err);
            }//affectedRows
            console.log(rows)
            return resolve(rows)
    
        })
    })
}