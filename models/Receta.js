const pool = require("../db/config");
const Producto = require("./Producto");
let Receta = {};


Receta.guardarReceta = (obj) => {
    return new Promise((resolve,reject) => {
        const {idemisor, idarticulo, idproducto, costo, cantidad} = obj;

        pool.query('INSERT INTO Receta(idproducto, idarticulo, idemisor, cantidad, costo) VALUES(?,?,?,?,?)',
            [idproducto,idarticulo,idemisor,cantidad,costo], (err, rows,fields) => {
                if(err){
                    return reject(err);
                }

            resolve(rows);
        })
    })
}

Receta.obtenerRcecetaPorProducto = (obj) => {
    return new Promise((resolve,reject) => {

        const {idemisor, query} = obj;
        let objReceta = {};

        Producto.obtenerProductosReceta({idemisor, query})
        .then(response => {
           if(response.length === 0 ){
            reject({
                length : 0
            })
           } else {
            console.log(response);
            const {idproducto } = response[0];
            
            pool.query(`
                SELECT r.idproducto, r.idarticulo, r.idemisor, r.cantidad, r.costo, a.codigobarra_producto as codigo, a.descripcion,
                (SELECT  1+ 1) as indice 
                FROM Receta r, Emisor e, Articulo a 
                WHERE r.idemisor = ${idemisor}
                AND r.idproducto = ${idproducto}
                AND r.idemisor = e.id
                AND r.idarticulo = a.id
            `,(err,rows,fields) => {
                if(err){
                    return reject(err);
                }

                if(rows.length === 0){

                    objReceta.producto = response;
                    objReceta.receta = [];

                    return resolve(objReceta);

                } else {

                    objReceta.producto = response;
                    objReceta.receta = rows;

                    return resolve(objReceta);
                }
            })
           }
        })
        .catch(err => {
            reject(err);
        })
    })
}

Receta.eliminarReceta = (obj) => {

    return new Promise((resolve,reject) => {
        const {idemisor, idproducto} = obj;

        pool.query(`
            DELETE FROM Receta WHERE idproducto = ${idproducto}
            AND idemisor = ${idemisor}
        `, [],(err,rows, fields) => {
            if(err){
                return reject(err)
            }

            resolve(rows);
        })
    })
}

Receta.obtenerDatosReceta = (obj) => {
    return new Promise((resolve,reject) => {

        const {idemisor, idproducto} = obj;
        console.log("datos receta ",idemisor, idproducto)
        pool.query(`
            SELECT r.idproducto, r.idarticulo, r.cantidad, a.unidad_medida FROM Receta r,  Articulo a, Emisor e
                WHERE e.id = ${idemisor}
                AND r.idemisor = e.id
                AND r.idproducto = ${idproducto}
                AND r.idarticulo = a.id`
            , [],(err, rows, fields) => {
                if(err){
                    return reject(err)
                }
    
            resolve(rows);
        })
    })
}


Receta.obtenerCantidadPorProducto = (obj) => {
    return new Promise((resolve,reject) => {

        const {idemisor, idproducto} = obj;
        console.log("datos receta ",idemisor, idproducto)
        pool.query(`
            SELECT r.cantidad FROM Receta r, Articulo a
                WHERE r.idemisor = ${idemisor}
                AND r.idproducto = ${idproducto}
                AND r.idarticulo = a.id`
            , [],(err, rows, fields) => {
                if(err){
                    return reject(err)
                }
    
            resolve(rows);
        })
    })
}



module.exports = Receta;