
const pool = require("../db/config");

let Articulo = {};//

Articulo.nuevoArticulo = (obj) => {
    return new Promise((resolve,reject) => {
        const {
            idemisor,
            tipo_impuesto,
            idcategoria,
            descripcion,
            codigobarra_producto,
            precio_articulo,
            precio_final,
            costo_unitario,
            unidad_medida,
            unidad_medida_comercial,
            tipo_servicio,
            codigo_servicio
        } = obj;
    
    
        pool.query('INSERT INTO Articulo(idemisor,tipo_impuesto,idcategoria,descripcion,codigobarra_producto,precio_articulo,precio_final,costo_unitario,unidad_medida,unidad_medida_comercial,tipo_servicio,codigo_servicio) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)', [idemisor,tipo_impuesto,idcategoria,descripcion,codigobarra_producto,precio_articulo,precio_final,costo_unitario,unidad_medida,unidad_medida_comercial,tipo_servicio,codigo_servicio],(err, rows, fields) => {
            if(err){
                return reject(err);
            } 

            resolve(rows);
        })
    })
}

Articulo.actualizarArticulo = (obj) => {
    return new Promise((resolve,reject) => {
        const {
            id,
            idemisor,
            tipo_impuesto,
            idcategoria,
            descripcion,
            codigobarra_producto,
            precio_articulo,
            precio_final,
            costo_unitario,
            unidad_medida,
            unidad_medida_comercial,
            tipo_servicio,
            codigo_servicio
        } = obj;
    
    
        pool.query('UPDATE Articulo SET idemisor=?,tipo_impuesto=?,idcategoria=?,descripcion=?,codigobarra_producto=?,precio_articulo=?,precio_final=?,costo_unitario=?,unidad_medida=?,unidad_medida_comercial=?,tipo_servicio=?,codigo_servicio=? WHERE id=?', [idemisor,tipo_impuesto,idcategoria,descripcion,codigobarra_producto,precio_articulo,precio_final,costo_unitario,unidad_medida,unidad_medida_comercial,tipo_servicio,codigo_servicio, id],(err, rows, fields) => {
            if(err){
                return reject(err);
            } 

            resolve(rows);
        })
    })
}

Articulo.buscarArticulo = (obj) => {
    return new Promise((resolve,reject) => {
        const {query, idemisor} = obj;
       
        const sqlQuery = `
        SELECT a.id as idarticulo, a.descripcion,a.precio_articulo,a.costo_unitario,a.unidad_medida, 
        a.unidad_medida_comercial,a.tipo_servicio,a.codigo_servicio, a.tipo_impuesto,a.idcategoria,a.codigobarra_producto,
        a.precio_final, ti.porcentaje_impuesto, ti.codigo_impuesto 
        FROM Articulo a,Tipo_Impuesto ti, Categoria c 
        WHERE a.idemisor= ${idemisor} 
        AND a.tipo_impuesto = ti.id 
        AND a.idcategoria = c.id`;
    
        pool.query(sqlQuery,[idemisor], (err,rows,fiedls) => {
            if(err){
                return reject(err);
            } 

            resolve(rows);
        })
    })
}

Articulo.obtenerArticuloPorId = (obj) => {
    return new Promise((resolve,reject ) => {
        const { idarticulo, idemisor} = obj;
        pool.query(`SELECT a.id as idarticulo, a.descripcion,a.precio_articulo,a.costo_unitario,a.unidad_medida, 
        a.unidad_medida_comercial,a.tipo_servicio,a.codigo_servicio, a.tipo_impuesto,a.idcategoria,a.codigobarra_producto,
        a.precio_final, ti.porcentaje_impuesto, ti.codigo_impuesto,c.codigoCabys 
        FROM Articulo a,Tipo_Impuesto ti, Categoria c 
            WHERE a.id = ${idarticulo} AND a.idemisor= ${idemisor}
            AND a.tipo_impuesto = ti.id 
            AND a.idcategoria = c.id;`, [],(err, rows, fiedls) => {
            if(err){
                return reject(err);
            } 

            resolve(rows);
        })
    })
}

Articulo.obtenerArticulosPorIdEmisor = ({idemisor, idusuario}) => {
    return new Promise((resolve,reject) => {
        pool.query(`
            SELECT a.id as idarticulo, a.codigobarra_producto ,a.descripcion, c.descripcion as categoria, a.precio_articulo, a.estado_articulo, e.emisor_nombre as usuario FROM Articulo a, Categoria c, Emisor e
            WHERE a.idemisor = ${idemisor}
            AND a.idemisor = e.id
            AND a.idcategoria = c.id
        `, [],(err,rows,fields) => {
            if(err){
                return reject(err);
            } 

            resolve(rows);
        })
    })
}


Articulo.obtenerArticuloPorQuery = (obj) => {
    return new Promise((resolve,reject) => {
        const {idemisor, query, idusuario} = obj;
        pool.query("SELECT a.id as idarticulo, a.codigobarra_producto ,a.descripcion, c.descripcion as categoria, a.precio_articulo, a.estado_articulo, e.emisor_nombre as usuario FROM Articulo a, Categoria c,Emisor e  WHERE a.idemisor = "+idemisor+" AND (a.codigobarra_producto = '"+query+"' OR a.descripcion = '"+query+"') AND a.idemisor = e.id  AND a.idcategoria = c.id", [],(err,rows,fields) => {
            if(err){
                return reject(err);
            }
            resolve(rows);
        })
    })
}


Articulo.actualizarEstado = (obj) => {
    return new Promise((resolve,reject) => {
        const {estado,idemisor, idarticulo} = obj
        pool.query(`
            UPDATE Articulo SET estado_articulo = ${estado} WHERE idemisor = ${idemisor} AND id = ${idarticulo}
        `, [],(err, rows, fields) => {
            if(err){
                return reject(err);
            }
            resolve(rows);
        })
    })
}


Articulo.obtenerArticulosReceta = (obj) => {
    return new Promise((resolve,reject) => {
        const {texto,idemisor} = obj;
        pool.query(`
            SELECT a.id as idarticulo, a.precio_articulo, a.descripcion as nombre, a.codigobarra_producto 
            FROM Articulo a, Emisor e
            WHERE (a.descripcion LIKE '%${texto}%' OR a.codigobarra_producto LIKE '%${texto}%')
            AND a.codigo_servicio <> '01'
            AND e.id = ${idemisor}
            AND a.idemisor = e.id
        `, [], (err, rows, fields) => {
            if(err){
                return reject(err);
            }
            resolve(rows);
        })
    })
}

Articulo.obtenerUNidadMedida = (obj) => {
    return new Promise((resolve,reject) => {

        const {idarticulo, idemisor} = obj;

        pool.query(`
                SELECT a.unidad_medida FROM Articulo a, Emisor e
                WHERE e.id = ${idemisor}
                AND a.idemisor = e.id
                AND a.id = ${idarticulo}
            `,[], (err, rows, fields) => {
            if(err){
                return reject(err);
            }
            resolve(rows);
        })
    })
}

Articulo.obtenerIdArticulo = (obj) => {
    return new Promise((resolve,reject) => {

        const { descripcion, idemisor} = obj;

        pool.query("SELECT id FROM Articulo WHERE TRIM(descripcion) = ? AND idemisor = ?",
            [descripcion, idemisor],(err, rows, fields) => {
            if(err){
                return reject(err);
            }
            resolve(rows);
        })
    })
}

Articulo.obtenerArticuloMovimiento = (obj) => {
    return new Promise((resolve,reject) => {

        const {idemisor, descripcion} = obj;

        pool.query(`
            SELECT a.id as idarticulo, a.precio_articulo, a.codigobarra_producto as codigo, a.descripcion
            FROM Articulo a, Emisor e
            WHERE (a.descripcion LIKE '%${descripcion}%' OR  a.codigobarra_producto LIKE '%${descripcion}%')
            AND e.id = ${idemisor}
            AND a.idemisor = e.id
        `, [],(err, rows, fields) => {
            if(err){
                return reject(err);
            }
            resolve(rows);
        })
    })
}



module.exports = Articulo;
