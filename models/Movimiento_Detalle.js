const pool = require("../db/config");
let MovimientoDetalle = {};


MovimientoDetalle.agregarAjuste = (obj) => {
    return new Promise((resolve,reject) => {

        const {idajuste, idarticulo,idbodorigen,idboddestino,cantidad,costoarticulo,costolinea} = obj;
        pool.query(`
            INSERT INTO Ajuste_Detalle(
                idajuste, idarticulo,idbodorigen,idboddestino,cantidad,costoarticulo,costolinea
            )
            VALUES(${idajuste}, ${idarticulo},${idbodorigen},${idboddestino},${cantidad},${costoarticulo},${costolinea})
        `,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}


module.exports = MovimientoDetalle;


