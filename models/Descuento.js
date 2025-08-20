const pool = require('../db/config');
let Descuento = {};

Descuento.nuevoDescuento = (obj) => {

    return new Promise((resolve, reject) => {
        const { idemisor,descripcion, porcentaje } = obj;
        console.log(obj);
        pool.query("INSERT INTO Descuento(idemisor,descripcion,porcentaje) VALUES(?,?,?)", [idemisor,descripcion, porcentaje],
            function(err, rows, fields) {
                if (err) {
                    console.log(err);
                    return reject(err);
                } //affectedRows

                return resolve(rows)
            })
    })
}

Descuento.actualizarDescuento = (obj) => {
    return new Promise((resolve, reject) => {
        const { idemisor,descripcion, porcentaje, id } = obj;
        pool.query("UPDATE Descuento SET idemisor= ?, descripcion=?, porcentaje=? WHERE id=?", [idemisor,descripcion, porcentaje, id],
            function(err, rows, fields) {
                if (err) {
                    console.log(err);
                    return reject(err);
                }

                return resolve(rows)
            })
    })
}

Descuento.obtenerDescuento = (obj) => {

    return new Promise((resolve, reject) => {
        const {query,idemisor, idusuario} = obj;
        pool.query("SELECT d.id, d.descripcion,d.porcentaje,d.estado_descuento, e.emisor_nombre as usuario FROM Descuento d, Emisor e  WHERE d.descripcion = ? AND d.idemisor =? AND d.idemisor = e.id", [query,idemisor],
            function(err, rows, fields) { 
                if (err) {
                    console.log(err);
                    return reject(err);
                }

                return resolve(rows)
            })
    })

}

Descuento.obtenerDescuentoPorId = (obj) => {
    return new Promise((resolve,reject) => {
        const {idemisor, iddescuento} = obj;
        pool.query("SELECT id, descripcion, porcentaje FROM Descuento WHERE idemisor=? AND id = ?", 
            [idemisor,iddescuento],
                function(err, rows, fields) {
                    if (err) {
                        console.log(err);
                        return reject(err);
                    }

                    return resolve(rows)
            })
    })
}

Descuento.obtenerDescuentos = ({idemisor, idusuario}) => {
    return new Promise((resolve, reject) => {
        pool.query(`
        SELECT DISTINCT d.id, d.descripcion,d.porcentaje,d.estado_descuento, e.emisor_nombre as usuario
            FROM Descuento d, Emisor e 
                WHERE d.idemisor !='41' and d.idemisor =?   
                AND d.idemisor = e.id       
        `, [idemisor],
            function(err, rows, fields) {
                if (err) {
                    console.log(err);
                    return reject(err);
                }

                return resolve(rows)
            })
    })
}


Descuento.actualizarEstado = (obj) => {
    return new Promise((resolve,reject) => {
        const {estado, idemisor, iddescuento} = obj;
        pool.query(`
            UPDATE Descuento SET estado_descuento = ${estado} WHERE idemisor = ${idemisor} 
            AND id = ${iddescuento}
        `,[],(err,rows,fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            return resolve(rows)
        })
    })
} 

Descuento.obtenerDescuentosPos = (idemisor) => {
    return new Promise((resolve,reject) => {
        pool.query(`
            SELECT d.id, d.descripcion, d.porcentaje 
                FROM Descuento d, Emisor e
                WHERE e.id = ${idemisor}
                AND d.idemisor = e.id

        `,[],(err,rows,fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            return resolve(rows)
        })
    }) 
}


module.exports = Descuento;

//poner idusuario en la tabla de factura, nota y entrada comentario