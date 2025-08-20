const pool = require("../db/config");
let Cuentas = {};

Cuentas.agregarCuenta = (obj) => {
    return new Promise((resolve,reject) => {

        const {numctabanco,decripcion,saldoant,saldoact,idemisor} = obj;

        pool.query("INSERT INTO Cuentas(idemisor,numctabanco,decripcion) VALUES(?,?,?)",
        [idemisor,numctabanco,decripcion],(err,rows,fields) => {
            if(err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Cuentas.buscarCuentaPorId = (obj) => {

    return new Promise((resolve,reject) => {
        const {id,idemisor} = obj;
        pool.query("SELECT id,decripcion, saldoant,saldoact,numctabanco FROM Cuentas WHERE id = ? AND idemisor = ?",
        [id,idemisor],(err,rows,fields) => {
            if(err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
} 


Cuentas.actualizarCuenta = (obj) => {

    return new Promise((resolve,reject) => {

        const {numctabanco,decripcion,saldoant,saldoact,id,idemisor} = obj;

        pool.query("UPDATE Cuentas SET numctabanco =?,decripcion =?,saldoant =?,saldoact =? WHERE id =? AND idemisor =?",
        [numctabanco,decripcion,saldoant,saldoact,id,idemisor],(err,rows,fields) => {
            if(err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
} 

Cuentas.actualizarEstadoCuenta = (obj) => {
    return new Promise((resolve,reject) => {
        const {id,estado,idemisor} = obj;
        pool.query("UPDATE Cuentas SET activo =? WHERE id =? AND idemisor =?",
        [estado,id,idemisor],(err,rows,fields) => {
            if(err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Cuentas.obtenerCuentasPorIdEmisor = (idemisor) => {
     return new Promise((resolve,reject) => {

        pool.query(`
            SELECT c.id,c.decripcion, c.saldoant,c.saldoact,c.numctabanco, (CASE WHEN c.activo = 1 THEN 'SI' ELSE 'NO' END ) as estado 
            ,e.emisor_nombre as usuario 
            FROM Cuentas c, Emisor e
            WHERE e.id = ${idemisor}
            AND c.idemisor = e.id;
        `,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
     })
}

Cuentas.obtenerCuentasMovimientos = (idemisor) => {
    return new Promise((resolve,reject) => {

        pool.query('SELECT id, numctabanco FROM Cuentas WHERE idemisor =?',
        [idemisor],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Cuentas.actualizarSaldos = (obj) => {
    return new Promise((resolve,reject) => {
        const {idemisor,idcuenta,tipomovimiento,monto} = obj;
        let sql = '';
        if(tipomovimiento == 'Depósito'){
            sql = 'UPDATE Cuentas SET saldoant = saldoact, saldoact = saldoact + ? WHERE idemisor=? AND id = ?';
        } else {
            sql = 'UPDATE Cuentas SET saldoant = saldoact, saldoact = saldoact - ? WHERE idemisor=? AND id = ?';
        }

        pool.query(sql,[monto,idemisor,idcuenta],(err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

module.exports = Cuentas;