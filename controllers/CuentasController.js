const Cuentas = require("../models/Cuentas");
const jwt = require("jsonwebtoken");

const agregarCuenta = (req,res) => {
    
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    let {numctabanco,decripcion} = req.body;

    numctabanco = numctabanco.trim();
    Cuentas.agregarCuenta({
        numctabanco,decripcion,idemisor
    }).then(response => {
        const {affectedRows} = response;
        if(affectedRows === 0){
            res.status(400).json({
                message: 'No se pudo agregar la cuenta'
            });
        } else {
            res.status(201).json({
                message: 'Cuenta agregada'
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al agregar la cuenta'
        })
    })
}


const actualizarCuenta = (req,res) => {


    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {numctabanco,decripcion,saldoant,saldoact,id} = req.body;

    Cuentas.actualizarCuenta({numctabanco,decripcion,saldoant,saldoact,id,idemisor})
        .then(actualizado => {
            const {affectedRows} = actualizado;
            if(affectedRows === 0){
                res.status(400).json({
                    message: 'No se pudo actualizar la cuenta'
                });
            } else {
                res.status(200).json({
                    message: 'Cuenta actualizada'
                });
            }
        })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            message: 'Error al actualizar la cuenta'
        })
    })
}


const buscarCuenta = (req,res) => {
   
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {id} = req.params;
    
    Cuentas.buscarCuentaPorId({id,idemisor}).then(cuenta => {
        res.status(200).json(cuenta)
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al obtener la cuenta'
        })
    })
}


const actualizarEstadoCuenta = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {id,estado} = req.body;

    Cuentas.actualizarEstadoCuenta({
        idemisor,id,estado
    }).then(estadoCuenta =>{
        const {affectedRows} = estadoCuenta;
        if(affectedRows === 0){
            res.status(400).json({
                message: 'No se pudo actualizar el estado de la cuenta'
            });
        } else {
            res.status(200).json({
                actualizado: true
            });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al actualizar el estado de la cuenta'
        })
    })
}

const listarCuentas = (req,res) => {


    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;


    Cuentas.obtenerCuentasPorIdEmisor(idemisor).then(cuentas => {
       res.status(200).json(cuentas);
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al obtener las cuentas'
        })
    })

}

const listarCuentasMovimientos = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    
    Cuentas.obtenerCuentasMovimientos(idemisor).then(cuentas => {
        res.status(200).json(cuentas);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Error al obtener las cuentas'
        })
    })
}

const actualizarSaldos = (obj) => {

    return Cuentas.actualizarSaldos(obj);
}

module.exports = {
    agregarCuenta,
    actualizarCuenta,
    buscarCuenta,
    actualizarEstadoCuenta,
    listarCuentas,
    listarCuentasMovimientos,
    actualizarSaldos
}