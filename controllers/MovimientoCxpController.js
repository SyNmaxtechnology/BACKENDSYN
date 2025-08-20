const MovimientosCxp = require("../models/MovimientoCxp");
const jwt = require("jsonwebtoken");
const fecha = require("../db/fecha");
const MovimientosBancos = require("../models/MovimientosBancos");
const { actualizarSaldos } = require("./CuentasController");

const actualizarTotalesFacturasCredito = async (req,res) => {

    try {
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const { facturas,montopagado,idcuenta } = req.body;

        const fecha_factura = fecha();
        const tipomovimiento = 'Transferencia';
        let descripcion = 'PAGO DOCUMENTOS AFECTADOS # ';

        for (const elemento of facturas){
            
            const {idproveedor,identrada,factura, idmovimiento,saldoRestante,saldoactual,montototal,numfactura} = elemento;
            descripcion = descripcion.concat(numfactura+' ,');
            const actualizada = await MovimientosCxp.actualizarTotalesFacturas({
                idemisor,idproveedor,identrada,fecha_factura,factura, 
                idmovimiento, saldoRestante,factura:0, montototal,saldoactual
            });
            if(actualizada.affectedRows === 0){
                throw new Error('error_save_buy');
            }
        }

        const responseMovimiento = await MovimientosBancos.agregarMovimiento({
            idcuenta,idemisor,tipomovimiento,monto:montopagado,
            descripcion,fecha: fecha_factura.substr(0,10)
        });

        if(responseMovimiento.affectedRows === 0){
            return res.status(400).json({
                message: 'No se pudo agregar el movimiento'
            })
        }

        const saldosResponse = await actualizarSaldos({idemisor,idcuenta,tipomovimiento,monto: montopagado})
        if(saldosResponse.affectedRows === 0){
            return res.status(400).json({
                message: 'No se pudo actualizar el saldo de la cuenta'
            })
        }

        res.status(201).json({
            message: 'Los totales de recibos han sido actualizados'
        });

    } catch (error) {
        
        if(err.message == 'error_save_buy' || err.message == 'error_update_pay'){
            res.status(500).json({
                message: 'Error al agregar las facturas a crédito'
            });
        } else if(err.message == 'error_add_mov'){
            res.status(500).json({
                message: 'Error al actualizar los saldos de la cuenta'
            });
        } else {
            res.status(500).json({
                message: 'Hubo un error en el servidor'
            });
        }
    }
}

const listarProveedoresFacturasCredito = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    
    MovimientosCxp.listarProveedoresFacturasCredito(idemisor)
        .then(proveedores => {
            res.status(200).json(proveedores);
        })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Hubo un error al cargar los proveedores'
        })
    })
}

const listarFacturasCreditoNoCanceladas = (req,res) => {
   
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {idproveedor} = req.params;

    MovimientosCxp.obtenerFacturasPorQuery({idemisor,idproveedor})
        .then(facturas =>{
            res.status(200).json(facturas);
        })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Hubo un error al cargar los recibos'
        })
    })

}
const reporteFacturasCreditoCanceladas = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {fechaInicio,fechaFin,idproveedor} = req.body;

    console.log(req.body);

    MovimientosCxp.obtenerFacturasCreditoCanceladas({idemisor,idproveedor,fechaInicio,fechaFin})
        .then(compras => {
            res.status(200).json(compras);  
        })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Hubo un error al cargar los recibos'
        })
    })
}

module.exports = {
    actualizarTotalesFacturasCredito,
    listarProveedoresFacturasCredito,
    reporteFacturasCreditoCanceladas,
    listarFacturasCreditoNoCanceladas
}