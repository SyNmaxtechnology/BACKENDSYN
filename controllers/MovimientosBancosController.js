const MovimientosBancos = require("../models/MovimientosBancos");
const TipoTransaccion = require("../ServiciosWeb/tipoTransanccion");
const jwt = require("jsonwebtoken");
const { actualizarSaldos } = require("./CuentasController");
const { obtenerNombreEmisor } = require("./EmisorController");

//const fecha = require("../db/fecha");

const agregarMovimiento = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const { tipomovimiento,monto,descripcion,idcuenta,fecha } = req.body;
    
    MovimientosBancos.agregarMovimiento({idcuenta,idemisor,tipomovimiento,monto,descripcion,fecha})
        .then(response => {
            const {affectedRows} = response;
            if(affectedRows === 0){
                res.status(400).json({
                    message: 'No se pudo agregar el movimiento'
                }) //comentario
            } else {
                
                actualizarSaldos({idcuenta,idemisor,tipomovimiento,monto})
                .then(saldo => {    
                    const {affectedRows} = saldo;
                    if(affectedRows === 0){
                        res.status(400).json({
                            message: 'No se pudo actualizar el saldo de la cuenta'
                        })
                    } else {
                        res.status(201).json({
                            message: 'Movimiento agregado'
                        })
                    }
                }) 
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        message: 'Error al actualizar el saldo de la cuenta'
                    })
                })
            }
        })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al agregar el movimiento'
        })
    })
}


const listarTiposTransaccion = (req,res) => {

    try {
        res.status(200).json(TipoTransaccion());
    } catch (error) {
        res.status(500).json({
            message: 'Error al cargar los tipos de movimiento'
        })
    }
}

const obtenerInformacionDepositos = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
   
    const {body:{fechaInicio,fechaFin}} = req;

    MovimientosBancos.obtenerInformacionDepositos({
        idemisor,
        fechaInicio,
        fechaFin
    }).then(response => {
        obtenerNombreEmisor(idemisor).then(emisor => {
            res.status(200).json({
                depositos: response,
                emisor: emisor[0].emisor_nombre
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Error al cargar la información de los depósitos'
            })
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al cargar la información de los depósitos'
        })
    })
}

const obtenerInformacionTransferencias = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {body:{fechaInicio,fechaFin}} = req;

    MovimientosBancos.obtenerInformacionTransferencias({fechaInicio,fechaFin,idemisor})
        .then(transferencias => {
            obtenerNombreEmisor(idemisor).then(emisor => {
                res.status(200).json({
                    transferencias,
                    emisor: emisor[0].emisor_nombre
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    message: 'Error al cargar la información de los depósitos'
                })
            })
        })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al cargar la información de las transferencias'
        })
    })
}

const obtenerInformacionMovimientosPorCuenta = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {body:{fechaInicio,fechaFin,idcuenta}} = req;

    MovimientosBancos.obtenerInformacionMovimientosPorCuenta({
        idemisor,idcuenta,fechaInicio,fechaFin 
    }).then(movimientos => {
        obtenerNombreEmisor(idemisor).then(emisor =>{
            res.status(200).json({
                movimientos,
                emisor: emisor[0].emisor_nombre
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Error al cargar la información de los movimientos'
            })
        })
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al cargar la información de los movimientos'
        })
    })
}

module.exports = {
    agregarMovimiento,
    listarTiposTransaccion,
    obtenerInformacionDepositos,
    obtenerInformacionTransferencias,
    obtenerInformacionMovimientosPorCuenta
}