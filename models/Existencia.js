const pool = require("../db/config");
const { Pool } = require("mysql2");
let Existencia = {};

Existencia.actualizarStock = (obj) => {
    return new Promise((resolve,reject) => {
        const {cantidad, idarticulo,idemisor, idbodega} = obj;
        let respuesta = 'OK';
        console.log("entró a actualizar existencia");
        pool.query(`CALL actualizarStock(?, ?, ?,?);
        `,[cantidad,idarticulo,idbodega,idemisor],(err, rows, fields) => {
            if(err){
                return reject(err);
            }
            console.log("respuesta actualizar existencia ", rows)
            return resolve(rows);
        })
    })
}


Existencia.nuevaExistencia = (obj) => {

    return new Promise((resolve,reject) => {

        const { idarticulo,idemisor,idbodega,cantidad} = obj;

        pool.query(`
        INSERT INTO Existencia(idarticulo, idemisor,idbodega, existencia_anterior, existencia_actual) 
		VALUES(${idarticulo}, ${idemisor},${idbodega}, 0, ${cantidad})
        `,[], (err, rows, fields) => {
            if(err){
                return reject(err);
            }

            return resolve(rows);
        })
    })
}

Existencia.existeArticulo = (obj) => {
    return new Promise((resolve,reject) => {

        const {id, idemisor} = obj;
    
        pool.query("SELECT a.id FROM Articulo a, Emisor e WHERE a.id = ? AND e.id = ? AND a.idemisor = e.id",[id, idemisor], (err, rows, fields) => {
            if(err){
                return reject(err);
            }

            return resolve(rows);
        })
    })
}

Existencia.restarExistencia = (obj) => {
    return new Promise((resolve,reject) => {

    const {cantidad ,idarticulo ,idemisor ,idbodega } = obj;

        pool.query(`
        CALL restarCantidadStock(?, ?, ?,?);
        `,[cantidad ,idarticulo ,idemisor ,idbodega], (err, rows,fields ) => {
            if(err){
                return reject(err);
            }
            console.log("respuesta restar existencia ", rows)
            return resolve(rows);
        })
    })
}
//SELECT a.id FROM Articulo a, Emisor e WHERE a.descripcion = ? AND e.id = ? AND a.idemisor = e.id


Existencia.obtenerExistenciaPorArticulo = (obj) => {
    return new Promise((resolve,reject) => {

        const {idbodega, idemisor, descripcion} = obj;
        const sql= `
            SELECT a.descripcion,a.codigobarra_producto as codigo, ex.existencia_anterior, ex.existencia_actual, b.descripcion as bodega
            FROM Articulo a, Existencia ex, Bodega b, Emisor e 
            WHERE (TRIM(a.descripcion) LIKE '%${descripcion}%' OR TRIM(a.codigobarra_producto) LIKE '%${descripcion}%' )
            AND e.id = ${idemisor}
            AND ex.idemisor = e.id 
            AND ex.idarticulo = a.id  
            AND ex.idbodega = b.id 
            AND b.idemisor = e.id`;

            console.log(sql);

        pool.query(sql,[],(err, rows, fields) => {
            if(err){
                return reject(err);
            }

            return resolve(rows);
        })
    })
}

Existencia.obtenerExistenciaPorArticuloYbodega = (obj) => {
    return new Promise((resolve,reject) => {

        const {idemisor, idbodega, idarticulo} = obj;


        pool.query(`
            SELECT ex.id FROM Existencia ex, Emisor e, Articulo a, Bodega b
            WHERE e.id = ${idemisor}
            AND ex.idemisor = e.id
            AND a.id = ${idarticulo}
            AND ex.idarticulo = a.id
            AND b.id = ${idbodega}
            AND ex.idbodega = b.id
        
        `,[],(err,rows, fields) => {
            if(err){
                return reject(err);
            }

            return resolve(rows);
        })
    })
}


Existencia.restarExisenciaMovimiento = (obj) => {
    return new Promise((resolve,reject) => {

        const {cantidad,idemisor,idarticulo, idbodega}  = obj;

        pool.query(`
        
            UPDATE Existencia SET existencia_anterior = existencia_actual, existencia_actual =  existencia_actual - ${cantidad} 
            WHERE idemisor = ${idemisor}
            AND idarticulo = ${idarticulo}
            AND idbodega = ${idbodega}
        `,[],(err,rows, fields) => {
            if(err){
                return reject(err);
            }

            return resolve(rows);
        })
    })
}


Existencia.actualizarStockMovimiento = (obj) => {

    return new Promise((resolve,reject) => {
        const {cantidad,idarticulo,idbodega,idemisor,tipo} = obj;


        pool.query("CALL actualizarStockMovimiento(?,?,?,?,?)",
            [cantidad,idarticulo,idbodega,idemisor,tipo], (err, rows, fields) => {
            
            if(err){
                return reject(err);
            }

            return resolve(rows);
        })
    })
}

Existencia.obtenerExistencia = (obj) => {
    return new Promise((resolve,reject) => {

        const {idarticulo, idemisor, idbodega} = obj;

        pool.query(`
            SELECT ex.existencia_actual FROM Existencia ex 
            WHERE ex.idarticulo = ${idarticulo}
            AND ex.idbodega = ${idbodega}
            AND ex.idemisor = ${idemisor}
        `,[],(err, rows, fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}


Existencia.obtenerExistenciaPorBodegaYCategoria = (obj) => {
    return new Promise((resolve,reject) => {
        console.log(obj);
        const {idemisor, idcategoria,idbodega,articulo} = obj;
        let sql = `
                SELECT DISTINCt a.descripcion as nombre, c.descripcion as categoria, ex.existencia_actual,
                ex.existencia_anterior, b.descripcion
                FROM Articulo a, Categoria c, Existencia ex, Bodega b,  Emisor e
                
                WHERE e.id = ${idemisor}
                AND ex.idemisor = e.id
                AND ex.idarticulo = a.id
                AND a.idcategoria = c.id
                AND ex.idbodega = b.id`;

            if(articulo != ''){
                sql += ' AND a.descripcion = "'+articulo+'"';
            }

            if(idcategoria  != ''){
                sql += ' AND c.id = '+idcategoria;
            }

            if(idbodega != ''){
                sql += ' AND b.id = '+idbodega;
            }
    
        pool.query(sql,[],(err, rows, fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Existencia.obtenerExistenciaPorDescripcion = (obj) => {

    return new Promise((resolve,reject) => {

        const {idbodega, descripcion,idemisor} = obj;

        const sql = `
            SELECT ex.existencia_actual FROM Existencia ex, Articulo a, Emisor e, Bodega b
            WHERE ex.idemisor= e.id
            AND e.id = ?
            AND ex.idarticulo = a.id
            AND a.descripcion =?
            AND ex.idbodega = b.id
            AND b.id = ?
        `;
        console.log(sql);
        pool.query(sql,[idemisor, descripcion, idbodega],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

module.exports = Existencia;