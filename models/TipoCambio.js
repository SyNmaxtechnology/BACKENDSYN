const pool = require("../db/config");
const axios = require("axios");

const agregarTipoCambio = (obj) => {

    return new Promise((resolve,reject) => {
        const {fecha,tipocambio} = obj;

        existeTipoCambio(fecha).then(existe => {
            if(existe.length === 0){
                pool.query('INSERT INTO TipoCambio(tipocambio) VALUES(?)',[tipocambio],
                (err,rows,fields) => {
                    if(err){
                        return reject(err);
                    }

                    resolve(rows);
                })
            } else {
                resolve(null);
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}

const obtenerTipoCambio = (fecha) => {

    return new Promise((resolve,reject) => {

        existeTipoCambio(fecha).then(response => {
            if(response.length){
                if(Number(response[0].tipocambio) > 1){
                    resolve(response);
                } else {
                    pool.query('SELECT tipocambio FROM TipoCambio WHERE tipocambio > 1 ORDER BY fecha DESC LIMIT 1;',
                    [],(err,rows,fields) => {
                        if(err){
                            return reject(err);
                        }
                        resolve(rows);
                    })
                }
            } else {
                pool.query('SELECT tipocambio FROM TipoCambio WHERE tipocambio > 1 ORDER BY fecha DESC LIMIT 1;',
                [],(err,rows,fields) => {
                    if(err){
                        return reject(err);
                    }
                    resolve(rows);
                })
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}

const existeTipoCambio = (fecha) => {

    return new Promise((resolve,reject) => {

        pool.query('SELECT tipocambio FROM TipoCambio WHERE DATE(fecha) = ?',[fecha],
        (err,rows,fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}


const obtenerTipoCambioPorFecha =  (fecha) => {

    return new Promise ((resolve,reject) => {

        const url = `https://api.hacienda.go.cr/indicadores/tc/dolar/historico?d=${fecha}&h=${fecha}`;
        const options = {
            method: "GET",
            url
        }

        axios(options).then(response => {
            console.log(response.data[0]);
            resolve(response.data[0]);
        })
        .catch(err => {
            console.log(err);
            reject(err)
        });       
    })
}

const obtenerTipoCambioActual = () => {

    return new Promise((resolve,reject) => {
        pool.query('SELECT tipocambio FROM TipoCambio WHERE tipocambio > 1 ORDER BY fecha DESC LIMIT 1;',
        [],(err,rows,fields) => {
            if(err){
                return reject(err);
            }
            resolve(rows);
        })
    })
}//comentario

module.exports = {
    agregarTipoCambio,
    existeTipoCambio,
    obtenerTipoCambio,
    obtenerTipoCambioPorFecha,
    obtenerTipoCambioActual
};