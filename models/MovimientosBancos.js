const { reject } = require("async");
const pool = require("../db/config");
let MovimientosBancos = {};

MovimientosBancos.agregarMovimiento = (obj) => {
    return new Promise((resolve,reject) => {

        const {idemisor,idcuenta,tipomovimiento,monto,descripcion,fecha} = obj;

        pool.query("INSERT INTO mov_bancos(idemisor,idcuenta,tipomovimiento,monto,descripcion,fecha) VALUES(?,?,?,?,?,?)",
        [idemisor,idcuenta,tipomovimiento,monto,descripcion,fecha],(err,rows,fields) => {
            if(err){
                console.log(err);
                throw new Error('error_add_mov');
            }

            resolve(rows);
        })
    }) 
}

MovimientosBancos.obtenerInformacionDepositos = (obj) => {
    return new Promise((resolve,reject) => {
        const {fechaInicio,fechaFin,idemisor} = obj;

        const sql = `
            SELECT mb.id,c.numctabanco, mb.tipomovimiento,mb.descripcion, mb.monto,mb.fecha
            FROM Emisor e, Cuentas c, mov_bancos mb
            WHERE e.id = ${idemisor}
            AND mb.idemisor = e.id
            AND c.idemisor = e.id 
            AND c.id = mb.idcuenta
            AND mb.tipomovimiento = 'Depósito'
            
            ${fechaInicio && fechaFin && fechaInicio !== '' && fechaFin !== ''? 
            " AND  mb.fecha >= '" + fechaInicio.toString() + "' AND mb.fecha <= '" + fechaFin.toString() + "'": ''
            }

            ORDER BY c.numctabanco
        `;
        console.log(sql);
        pool.query(sql,[],(err,rows,fields) => {
            if(err){
                reject(err);
            }

            resolve(rows);
        })
    })
}

MovimientosBancos.obtenerInformacionTransferencias = (obj) => {
    return new Promise((resolve,reject) => {
        const {fechaInicio,fechaFin,idemisor} = obj;

        const sql = `
            SELECT mb.id,c.numctabanco, mb.tipomovimiento,mb.descripcion, mb.monto,mb.fecha
            FROM Emisor e, Cuentas c, mov_bancos mb
            WHERE e.id = ${idemisor}
            AND mb.idemisor = e.id
            AND c.idemisor = e.id 
            AND c.id = mb.idcuenta
            AND mb.tipomovimiento = 'Transferencia'
            
            ${fechaInicio && fechaFin && fechaInicio !== '' && fechaFin !== ''? 
            " AND  mb.fecha >= '" + fechaInicio.toString() + "' AND mb.fecha <= '" + fechaFin.toString() + "'": ''
            }

            ORDER BY c.numctabanco
        `;
        console.log(sql);
        pool.query(sql,[],(err,rows,fields) => {
            if(err){
                reject(err);
            }

            resolve(rows);
        })
    })
}



MovimientosBancos.obtenerInformacionMovimientosPorCuenta = (obj) => {

    return new Promise((resolve,reject) => {
        const {idemisor,idcuenta,fechaInicio,fechaFin} = obj;
        console.log(idcuenta);
        console.log(typeof idcuenta)
        const sql = `
            SELECT mb.id,c.numctabanco, mb.tipomovimiento,mb.descripcion, mb.monto,mb.fecha
            FROM Emisor e, Cuentas c, mov_bancos mb
            WHERE e.id = ${idemisor}
            AND mb.idemisor = e.id
            AND c.idemisor = e.id 
            AND c.id = mb.idcuenta
            ${idcuenta ? " AND  mb.idcuenta ="+idcuenta: ''}
            ${fechaInicio && fechaFin && fechaInicio !== '' && fechaFin !== ''? 
            " AND  mb.fecha >= '" + fechaInicio.toString() + "' AND mb.fecha <= '" + fechaFin.toString() + "'": ''
            }

            ORDER BY c.numctabanco
        `

        console.log(sql);

        pool.query(sql,[],(err,rows,fields) => {
            if(err){
                reject(err);
            }

            resolve(rows);
        })
    })
}

module.exports = MovimientosBancos;