const pool = require('../db/config');
const unidadesMedida = require("../ServiciosWeb/UnidadesMedida");
const Emisor = require("./Emisor");
let Producto = {};

Producto.nuevoProducto = (obj) => {

    return new Promise((resolve, reject) => {

        const { idemisor,descripcion, precio_producto, costo_unitario, unidad_medida, unidad_medida_comercial, tipo_servicio, codigo_servicio, tipo_impuesto, idcategoria, codigoBarra, precio_final,imagen, public_id,imagen_local } = obj;

        pool.query('INSERT INTO Producto (idemisor,descripcion,precio_producto,costo_unitario,unidad_medida,unidad_medida_comercial,tipo_servicio,codigo_servicio,tipo_impuesto,idcategoria,codigobarra_producto, precio_final,imagen,public_id,imagen_local) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [idemisor,descripcion, precio_producto, costo_unitario, unidad_medida, unidad_medida_comercial, tipo_servicio, codigo_servicio, tipo_impuesto, idcategoria,codigoBarra, precio_final,imagen,public_id,imagen_local],
            function(err, rows, fields) {
                if (err) {
                    console.log(err);
                    return reject(err);
                } //affectedRows

                return resolve(rows)
            })
    })
}


Producto.actualizarProducto = (obj) => {
    return new Promise((resolve, reject) => {

        const { idemisor,descripcion, precio_producto, costo_unitario, unidad_medida, unidad_medida_comercial, tipo_servicio, codigo_servicio, tipo_impuesto, idcategoria, codigoBarra, precio_final,imagen, public_id,imagen_local,id } = obj;
        
        pool.query('UPDATE Producto SET idemisor=?, descripcion=?,precio_producto=?,costo_unitario=?,unidad_medida=?,unidad_medida_comercial=?,tipo_servicio=?,codigo_servicio=?,tipo_impuesto=?,idcategoria=?,codigobarra_producto=?, precio_final=?, imagen=?, public_id=?,imagen_local=? WHERE id=?', [idemisor,descripcion, precio_producto, costo_unitario, unidad_medida, unidad_medida_comercial, tipo_servicio, codigo_servicio, tipo_impuesto, idcategoria, codigoBarra, precio_final,imagen, public_id,imagen_local,id],
            function(err, rows, fields) {
                if (err) {
                    console.log(err);
                    return reject(err);
                } //affectedRows

                return resolve(rows)
            })
    })
}

Producto.obtenerProducto = (obj) => {
    return new Promise((resolve, reject) => {

        const {
            idemisor,
            query, 
            type,
            idusuario
        } = obj;

        let consulta = '';
        console.log({type})
        if (type === 'like')

            consulta = `
            SELECT DISTINCT p.id as idproducto, p.descripcion,p.precio_producto,p.costo_unitario,p.unidad_medida,
            p.unidad_medida_comercial,p.tipo_servicio,p.codigo_servicio, p.tipo_impuesto,p.idcategoria,p.codigobarra_producto,
            p.precio_final, p.DescuArt,p.SinDescu,ti.porcentaje_impuesto, ti.codigo_impuesto FROM Producto p, Tipo_Impuesto ti, Categoria c, Descuento d 
            WHERE p.idemisor= ${idemisor} 
                AND p.tipo_impuesto = ti.id 
                AND p.idcategoria = c.id LIMIT 0,500;`;
        else if (type === 'equal') {

            consulta = "SELECT p.id as idproducto, p.codigobarra_producto, p.descripcion,p.precio_producto, c.descripcion as categoria, p.estado_producto, p.DescuArt,p.SinDescu,e.emisor_nombre as usuario FROM Producto p, Categoria c, Emisor e WHERE (p.descripcion='"+query.trim()+"' OR p.codigobarra_producto='"+query.trim()+"') AND p.idemisor = "+idemisor+" AND p.idemisor = e.id AND p.idcategoria = c.id";
        }

        console.log(consulta);
        pool.query(consulta, [], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows);
        })

    })
}


Producto.obtenerProductoPorId = (obj) => {
    return new Promise((resolve,reject) => {
        const {idemisor, idproducto} = obj;
        Emisor.obtenerEstadoCodigosCabys(idemisor).then(estadoResponse => {

            
            const {activaCabys} = estadoResponse[0];

            let sql = '';
            sql = `SELECT p.id as idproducto, p.descripcion,p.precio_producto,p.costo_unitario,p.unidad_medida, 
                p.unidad_medida_comercial,p.tipo_servicio,p.codigo_servicio,p.tipo_impuesto,p.idcategoria, p.imagen, 
                p.codigobarra_producto, p.precio_final,p.DescuArt,p.SinDescu, ti.porcentaje_impuesto, ti.codigo_impuesto 
                FROM Producto p, Tipo_Impuesto ti,Categoria c
                WHERE p.id = ${idproducto}
                AND p.idemisor= ${idemisor} 
                AND p.tipo_impuesto = ti.id
                AND p.idcategoria = c.id`;
            

            pool.query(sql, [], (err,rows, fields) => {
                if (err) {
                    console.log(err);
                    return reject(err);
                }
    
                resolve(rows);
            })
        })
        .catch(err => {
            return reject(err);
        })
    })
}

Producto.obtenerProductosPos = (obj) => {
    return new Promise((resolve,reject) => {
        const { idemisor, idcategoria} = obj;
       
        let sql ='';

        if(Number(idcategoria) === 0){
            sql = `SELECT DISTINCT p.id as idproducto, p.descripcion,p.precio_producto,p.costo_unitario,p.unidad_medida,
            p.unidad_medida_comercial,p.tipo_servicio,p.codigo_servicio, p.tipo_impuesto,p.idcategoria,p.codigobarra_producto,
            p.precio_final, p.imagen,ti.porcentaje_impuesto, ti.codigo_impuesto FROM Producto p, Tipo_Impuesto ti, Categoria c, Descuento d 
            WHERE p.idemisor= ${idemisor} 
            AND p.tipo_impuesto = ti.id 
            AND p.idcategoria = c.id;`
        } else {
            sql = `SELECT DISTINCT p.id as idproducto, p.descripcion,p.precio_producto,p.costo_unitario,p.unidad_medida,
            p.unidad_medida_comercial,p.tipo_servicio,p.codigo_servicio, p.tipo_impuesto,p.idcategoria,p.codigobarra_producto,
            p.precio_final,p.imagen, ti.porcentaje_impuesto, ti.codigo_impuesto FROM Producto p, Tipo_Impuesto ti, Categoria c, Descuento d 
            WHERE p.idcategoria = ${idcategoria}
            AND p.idemisor= ${idemisor} 
            AND p.idcategoria = c.id
            AND p.tipo_impuesto = ti.id;`    
        }

        pool.query(sql,[],(err,rows,fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows);
        })
    })   
}

Producto.obtenerUnidadesMedida = () => {
    {
        return new Promise((resolve, reject) => {
            resolve(unidadesMedida());
        })
    }
}

Producto.obtenerProductosPorIdEmisor = ({idemisor,idusuario}) => {
    return new Promise((resolve,reject) => {
        pool.query(`
        SELECT p.id as idproducto, p.codigobarra_producto, p.descripcion,p.precio_producto, c.descripcion as categoria, p.estado_producto, e.emisor_nombre as usuario
            FROM Producto p, Categoria c, Emisor e
            WHERE p.idemisor = ${idemisor}
            AND p.idemisor = e.id
            AND p.idcategoria = c.id
            `, [], (err,rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Producto.actualizarEstado = (obj) => {
    
    return new Promise((resolve,reject) => {
        console.log("llego")
        const {estado, idproducto, idemisor} = obj;

        pool.query(`
            UPDATE Producto SET estado_producto = ${estado} WHERE idemisor = ${idemisor} AND id = ${idproducto}
        `, [], (err,rows,fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows);
        })
    })
}


Producto.obtenerProductosPorIdCategoria = (obj) => {
    return new Promise((resolve,reject) => {
        const {idcategoria, idemisor } = obj;

        pool.query(`
            SELECT p.id as idproducto, p.codigobarra_producto, p.descripcion,p.precio_producto, c.descripcion as categoria, p.estado_producto, e.emisor_nombre as usuario
            FROM Producto p, Categoria c, Emisor e
            WHERE c.id= ${idcategoria}
            AND p.idemisor = ${idemisor}
            AND p.idemisor = e.id
            AND p.idcategoria = c.id`,[], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Producto.obtenerProductosListadosPorCategorias = (obj) => {
    return new Promise((resolve,reject) => {

        const {idcategoria, idemisor } = obj;

        Producto.obtenerProductosPos({idcategoria, idemisor })
        .then(response => {
            console.log(response);
            resolve(response);
        })
        .catch(err => {
            reject(err);
        })
    })
}

Producto.obtenerProductosReceta = (obj) => {
    
    return new Promise((resolve,reject) => {
        const {idemisor, query} = obj;

        let sql = "SELECT p.id as idproducto, p.codigobarra_producto, p.descripcion as nombre  FROM Producto p, Emisor e WHERE (p.codigobarra_producto = '"+query+"' OR p.descripcion = '"+query+"' )  AND e.id = "+idemisor+" AND p.idemisor = e.id";
        console.log(sql);
        pool.query(sql, [], (err, rows, fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Producto.obtenerImagen = (idproducto) => {
    return new Promise((resolve,reject) => {
        pool.query(`
            SELECT imagen,public_id,imagen_local FROM Producto WHERE id = ${idproducto}
        `,[],(err, rows, fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Producto.obtenerUnidadMedida = (obj) => {
    return new Promise((resolve,reject) => {

        const {idproducto, idemisor} = obj;

        pool.query(`
            SELECT p.unidad_medida FROM Producto p, Emisor e
            WHERE e.id = ${idemisor}
            AND p.idemisor = e.id
            AND p.id = ${idproducto}
        `,[],(err, rows, fields) => {
            if(err){
                return reject(err)
            } 
            
            resolve(rows);
        })
    })
}


Producto.obtenerIdProducto = (obj) => {
    return new Promise((resolve,reject) => {
        const {descripcion, idemisor} = obj;

        pool.query("SELECT id FROM Producto WHERE descripcion = ? AND idemisor = ?", 
            [descripcion,idemisor], (err, rows, fields) => {
                if(err){
                    return reject(err);
                }
            
            resolve(rows);
        })
    })
}
Producto.obtenerDescripcion = (obj) => {

    return new Promise((resolve,reject) => {
        const {idemisor, idproducto} =obj;

        pool.query('SELECT descripcion FROM Producto WHERE idemisor=? AND id =?',
        [idemisor, idproducto],(err, rows, fields) => {
            if(err){
                return reject(err);
            }
        
            resolve(rows);
        })
    })
}


Producto.obtenerProductosPorIdBodegaAsociados = obj => {

    return new Promise((resolve,reject) => {

        /*
        
        
        select * from sistemas_sisfac.producto where idemisor=41 and id in (select distinct(p.id)
        from sistemas_sisfac.Producto p, sistemas_sisfac.Bodega b, sistemas_sisfac.Receta r 
        where  p.idemisor = 41 
        and r.idproducto = p.id 
        and b.id  = 29 and r.idarticulo in (select  a.id
        from sistemas_sisfac.Existencia ex, sistemas_sisfac.Articulo a 
        where  ex.idemisor = 41 
        and ex.idarticulo = a.id 
        and ex.idbodega  = 29 and ex.existencia_ACTUAL>0))
        
        */
        const {idbodega,idemisor,existencia} = obj;
        const sql = `
            select  p.id as idproducto, p.descripcion,p.precio_producto,p.costo_unitario,p.unidad_medida,
            p.unidad_medida_comercial,p.tipo_servicio,p.codigo_servicio, p.tipo_impuesto,p.idcategoria,p.codigobarra_producto,
            p.precio_final, p.DescuArt,p.SinDescu,ti.porcentaje_impuesto, ti.codigo_impuesto
                from producto p, tipo_impuesto ti 
                where p.idemisor=${idemisor} and p.tipo_impuesto  = ti.id and p.id in (select distinct(p.id)
            from Producto p, Bodega b, Receta r 
            where  p.idemisor = ${idemisor} 
            and r.idproducto = p.id 
            and b.id  = ${idbodega} and r.idarticulo in (select  a.id
            from Existencia ex, Articulo a 
            where  ex.idemisor = ${idemisor} 
            and ex.idarticulo = a.id 
            and ex.idbodega  = ${idbodega}
            ${existencia && Number(existencia) > 0? ` and ex.existencia_actual > 0`: ''}
            ))
        `;
        console.log(sql)
        console.log('PASE POR ACA')
        pool.query(sql,(err,rows,fields) => {
            if(err){
                return reject(err);
            }
            console.log(rows.length)
            resolve(rows);
        })
    })
}

Producto.obtenerIdPorCodigoBarra = (idemisor,codigo_barra) => {

    return new Promise((resolve,reject) => {
        pool.query(`SELECT id FROM Producto WHERE idemisor = ? AND TRIM(codigobarra_producto)=?`,
            [idemisor,codigo_barra],(err,rows,fields) => {
            if(err){
                return reject(err);
            }
            console.log(rows.length)
            resolve(rows);
        })
    })
}

module.exports = Producto;