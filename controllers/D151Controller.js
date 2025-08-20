const d151 = require("../models/D151");
const jwt = require("jsonwebtoken");
const Factura = require("../models/Factura");
const Entrada = require("../models/Entrada");
const EntradaController = require("./EntradaController");

const obtenerInformacionReported151Ventas = async (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {fechaInicio, fechaFin,montoVenta} = req.body;
    
    d151.obtenerEncabezadosFacturasClientes({
        fechaInicio, fechaFin,montoVenta,idemisor
    }).then(facturas => {
        d151.obtenerTotalesComprobantesClientes({
            fechaInicio, fechaFin,montoVenta,idemisor
        }).then(totales =>{
            res.status(200).json({
                totales,
                facturas
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Ocurrió un error al obtener la información del reporte'
            })
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Ocurrió un error al obtener la información del reporte'
        })
    }) 
}
 
const obtenerInformacionReported151VentasResumido = async (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {fechaInicio, fechaFin,montoVenta} = req.body;

    Factura.obtenerFacturasAgrupadasPorCliente({idemisor,fechaInicio, fechaFin,montoVenta})
        .then(facturas => {

            d151.obtenerTotalesComprobantesClientes({
                fechaInicio, fechaFin,montoVenta,idemisor
            }).then(totales =>{
                res.status(200).json({
                    totales,
                    facturas
                });
            }).catch(err => {
                res.status(500).json({
                    message: 'No se pudo cargar la información para obtener el reporte'
                });
            })
        })
    .catch(err => {
        res.status(500).json({
            message: 'No se pudo cargar la información para obtener el reporte'
        });
    })
}

const obtenerInformacionReported151Compras = (req,res) => {


    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const {fechaInicio, fechaFin, montoCompra} = req.body;

    d151.obtenerEncabezadosFacturasProveedores({
        fechaInicio, fechaFin, montoCompra,idemisor
    }).then(entradas => {

        res.status(200).json({
            entradas
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Ocurrió un error al obtener la información del reporte'
        })
    })
}


const obtenerInformacionReported151comprasresumido = async (req,res) => {

    try {
    
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const {fechaInicio, fechaFin, montoCompra} = req.body;

        const entradas = await Entrada.obtenerEntradasAgrupadasPorProveedor({fechaInicio, fechaFin, montoCompra,idemisor});
        const notasCredito = await Entrada.obtenerEntradasAgrupadasNotaCreditoPorProveedor({fechaInicio, fechaFin, montoCompra,idemisor});
        //onst totales = await EntradaController.obtenerTotalesComprobantesProveedores({fechaInicio, fechaFin, montoCompra,idemisor});
        res.status(200).json({
            entradas,
            notasCredito
           // totales
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            messsage: 'Error al cargar la información del'
        })
    }
}

module.exports = {
    obtenerInformacionReported151Ventas,
    obtenerInformacionReported151Compras,
    obtenerInformacionReported151VentasResumido,
    obtenerInformacionReported151comprasresumido
}