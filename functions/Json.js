const pool = require("../db/config");
let OdF = {}; //com1

OdF.guardarJSON = (obj) => {
    return new Promise((resolve, reject) => {
        const detalles = JSON.parse(obj);
        const { id, json, tipo_factura } = detalles;
        let query = '';
        if (tipo_factura !== '03') {
            query = 'INSERT INTO Objeto_Detalles_Factura(idfactura,detalles_factura) VALUES(?,?)';
        } else {
            query = 'INSERT INTO Objeto_Detalles_Factura(idnotacredito,detalles_factura) VALUES(?,?)';
        }
        pool.query(query, [id, json],
            function(err, rows, fields) {
                if (err) {
                    console.log(err)
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

OdF.obtenerJSON = (idfactura) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT idfactura, detalles_factura FROM Objeto_Detalles_Factura WHERE idfactura=?', [idfactura],
            function(err, rows, fields) {
                if (err) {
                    console.log(err)
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

module.exports = OdF;
//DateTime, lo separo y agrego el -06:00 a mano
