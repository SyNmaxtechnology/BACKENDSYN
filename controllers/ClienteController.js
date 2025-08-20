const Cliente = require("../models/Cliente");
const EmisorController = require("./EmisorController");
const moment = require("moment-timezone");
const jwt = require("jsonwebtoken");
const fecha = require("../db/fecha");
const Emisor = require("../models/Emisor");
const MovimientosBancos = require("../models/MovimientosBancos");
const { actualizarSaldos } = require("./CuentasController");
const { generarReporteEstadoCuenta, generarPDFDeComprobante } = require("../functions/consulta");
const { enviarEstadoCuenta } = require("../functions/Email");

exports.nuevoClienteRuta = async (req, res) => {

    try { //comentario

        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.KEY);
        const idemisor = decodedToken.id;
        const idusuario = decodedToken.uid;

        let ubicacion = [];
        let { cliente_nombre, cliente_nombre_comercial, cliente_tipo_identificacion, cedula_cliente, numero_cliente, identificacion_extranjero, cliente_barrio, otras_senas, otras_senas_extranjero, cliente_telefono_codigopais, cliente_telefono_numtelefono, cliente_fax_codigopais, cliente_fax_numtelefono, cliente_correo, exentoIVA, tipoExoneracion, porcentajeExoneracion, NombreInstitucion, documentoExoneracion, descuento, plazo_credito, longitud, latitud } = req.body;

        let datetimenow = Date.now();
        const fechaEmision = moment(datetimenow).toISOString(true);

        longitud = !longitud || longitud == '' ? '' : longitud;
        latitud = !latitud || latitud == '' ? '' : latitud;

        if (latitud.length > 0 && longitud.length > 0) {
            ubicacion.push(latitud, longitud);
        }

        const objCliente = { idemisor, cliente_nombre, cliente_nombre_comercial, cliente_tipo_identificacion, cedula_cliente, numero_cliente, identificacion_extranjero, cliente_barrio, otras_senas, otras_senas_extranjero, cliente_telefono_codigopais, cliente_telefono_numtelefono, plazo_credito, cliente_fax_codigopais, cliente_fax_numtelefono, cliente_correo, exentoIVA, tipoExoneracion, porcentajeExoneracion: !porcentajeExoneracion || porcentajeExoneracion == '' ? 0 : porcentajeExoneracion, NombreInstitucion, documentoExoneracion, fechaEmision, idusuario, descuento, ubicacion: ubicacion.length > 0 ? ubicacion.toString().replace(',', ' ') : '' };

        const respuesta = await Cliente.nuevoCliente(objCliente);
        const { affectedRows, insertId } = respuesta;

        if (affectedRows > 0) {
            return res.status(200).json({
                message: 'Cliente registrado correctamente',
                insertId
            })
        } else {
            return res.status(400).json({
                message: 'No se pudo agregar el cliente'
            })
        }
    } catch (error) {
        const { errno } = error;
        if (errno == 1062) {
            return res.status(500).json({
                message: 'El cliente ingresado ya existe, digite otro'
            });
        } else {
            return res.status(500).json({
                message: 'Hubo un error'
            });
        }
    }
}

exports.actualizarCliente = async (req, res) => {

    try {

        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.KEY);
        const idemisor = decodedToken.id;
        const idusuario = decodedToken.uid;
        let ubicacion = [];

        const { id } = req.params;
        let { cliente_nombre, cliente_nombre_comercial, cliente_tipo_identificacion, cedula_cliente, numero_cliente, identificacion_extranjero, cliente_barrio, otras_senas, otras_senas_extranjero, cliente_telefono_codigopais, cliente_telefono_numtelefono, cliente_fax_codigopais, cliente_fax_numtelefono, cliente_correo, exentoIVA, tipoExoneracion, porcentajeExoneracion, NombreInstitucion, documentoExoneracion, descuento, plazo_credito, longitud, latitud } = req.body;

        longitud = !longitud || longitud == '' ? '' : longitud;
        latitud = !latitud || latitud == '' ? '' : latitud;

        if (latitud.length > 0 && longitud.length > 0) {
            ubicacion.push(latitud, longitud);
        }

        const obj = { idemisor, cliente_nombre, cliente_nombre_comercial, cliente_tipo_identificacion, cedula_cliente, numero_cliente, identificacion_extranjero, cliente_barrio: !cliente_barrio || cliente_barrio.length === 0 || cliente_barrio == 'null' ? '1010101' : cliente_barrio, otras_senas, otras_senas_extranjero, cliente_telefono_codigopais, cliente_telefono_numtelefono, cliente_fax_codigopais, cliente_fax_numtelefono, cliente_correo, exentoIVA, tipoExoneracion, porcentajeExoneracion, NombreInstitucion, documentoExoneracion, idusuario, descuento, plazo_credito, ubicacion: ubicacion.length > 0 ? ubicacion.toString().replace(',', ' ') : '', id };


        const respuesta = await Cliente.actualizarCliente(obj);
        const { affectedRows } = respuesta;

        if (affectedRows > 0) {
            return res.status(200).json({
                message: 'Cliente actualizado correctamente'
            })
        } else {
            return res.status(400).json({
                message: 'No se pudo actualizar el cliente'
            })
        }

    } catch (error) {
        const { errno } = error;
        if (errno == 1062) {
            return res.status(500).json({
                message: 'La información ingresada ya existe, intentelo de nuevo'
            });
        } else {
            return res.status(500).json({
                message: 'Hubo un error'
            });
        }
    }
}

exports.obtenerClientePorQuery = (req, res) => {

    const { query } = req.params;
    console.log(query);

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;

    const obj = {
        query,
        idemisor,
        idusuario
    };

    Cliente.obtenerClientePorQuery(obj)
        .then(cliente => {
            console.log(cliente)
            if (cliente.length > 0) return res.status(200).json({ cliente });
            else {
                return res.status(404).json({ message: 'No hay resultados' });
            }
        }).catch(err => {
            console.log(err)
            res.status(500).json({
                message: 'Hubo un error en el servidor'
            })
        });
}

exports.obtenerClientePorIdEmisor = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    Cliente.obtenerClientesPorIdEmisor({ idemisor, idusuario }).then(response => {
        res.status(200).json({
            clientes: response
        })
    })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'No se pudo obtener los productos'
            });
        })
}


exports.obtenerClientePorId = (req, res) => {

    const { id } = req.params;
    console.log("id", id);
    Cliente.obtenerClientePorId(id).then(cliente => {
        return res.status(200).json({ cliente: cliente[0] });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'NO se pudo obtener el cliente'
        })
    });
}

exports.actualizarEstado = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idemisor = decodedToken.id;
    const { idcliente, estado } = req.body;

    Cliente.actualizarEstado({ idcliente, idemisor, estado }).then(response => {
        const { affectedRows } = response;

        if (affectedRows > 0) {
            return res.status(200).json({ ok: true, message: 'Estado actualizado' });
        } else {
            return res.status(404).json({ message: 'No se actualizó el estado del cliente' });
        }
    })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Error al actualizar el estado del cliente'
            })
        });
}


exports.obtenerClientePorCoincidencia = (req, res) => {

    const { query } = req.params;
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;

    const obj = {
        query,
        idemisor,
        idusuario
    };

    Cliente.obtenerClientePorCoincidencia(obj)
        .then(cliente => {
            if (cliente.length > 0) return res.status(200).json({ cliente });
            else {
                return res.status(404).json({ message: 'No hay resultados' });
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Ha ocurrido un error en el servidor'
            })
        });

}

exports.obtenerFacturasCredito = (req, res) => {

    const { idcliente } = req.params;
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idemisor = decodedToken.id;

    Cliente.obtenerFacturasPorQuery({ idemisor, idcliente })
        .then(facturas => {
            if (facturas.length === 0) {
                return res.status(404).json(facturas)
            }
            return res.status(200).json(facturas)
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Ha ocurrido un error en el servidor'
            })
        });

}

exports.actualizarPagosFacturasCredito = async (req, res) => {

    try {
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.KEY);
        const idemisor = decodedToken.id;
        const { lineas, montopagado, idcuenta } = req.body;

        const fecha_factura = fecha();
        const tipomovimiento = 'Depósito';
        let descripcion = 'RECIBO DOCUMENTOS AFECTADOS # ';
        for (let linea of lineas) {

            const { idcliente, idfactura, saldoRestante, idmovimiento, numfactura } = linea;
            descripcion = descripcion.concat(numfactura + ', ');

            const response = await Cliente.actualizarPagosFacturasCredito({
                idemisor, idcliente, idfactura, fecha_factura,
                saldoRestante, factura: 0, idmovimiento
            });

            if (response.affectedRows === 0) {
                throw new Error('error_update_pay');
            }
        }

        //idcuenta,idemisor,tipomovimiento,monto,descripcion,fecha

        const responseMovimiento = await MovimientosBancos.agregarMovimiento({
            idcuenta, idemisor, tipomovimiento, monto: montopagado,
            descripcion, fecha: fecha_factura.substr(0, 10)
        });

        if (responseMovimiento.affectedRows === 0) {
            return res.status(400).json({
                message: 'No se pudo agregar el movimiento'
            })
        }

        const saldosResponse = await actualizarSaldos({ idemisor, idcuenta, tipomovimiento, monto: montopagado })
        if (saldosResponse.affectedRows === 0) {
            return res.status(400).json({
                message: 'No se pudo actualizar el saldo de la cuenta'
            })
        }
        return res.status(200).json({
            message: 'Recibo guardado'
        });

    } catch (err) {
        if (err.message == 'error_insert_pay' || err.message == 'error_update_pay') {
            res.status(500).json({
                message: 'Error al agregar las facturas a crédito'
            });
        } else if (err.message == 'error_add_mov') {
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

exports.cargarClientesFacturaCredito = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idemisor = decodedToken.id;


    Cliente.listarClientesFacturaCredito(idemisor).then(clientes => {
        res.status(200).json({ clientes });
    })
        .catch(err => {
            res.status(500).json({
                message: 'No se pudieron cargar los clientes'
            })
        })
}

exports.obtenerFacturasCreditoPagadas = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idemisor = decodedToken.id;
    const { idcliente, fechaInicio, fechaFin } = req.body;

    Cliente.obtenerFacturasCreditoCanceladas({ idemisor, idcliente, fechaInicio, fechaFin })
        .then(facturasCreditoCanceladas => {
            return res.status(200).json(facturasCreditoCanceladas);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'No se pudieron obtener las facturas canceladas'
            })
        })
}

exports.obtenerEstadoAutorizado = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idemisor = decodedToken.id;
    const { idcliente } = req.params;

    Cliente.obtenerEstadoAutorizado(idcliente).then(estado => {

        res.status(200).json({
            estado: estado[0].autorizado
        })
    })
        .catch(err => res.status(500).json({ message: 'Ocurrió un error al obtener el estado autorizado del cliente' }));
}

exports.autorizarClienteProforma = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    const { clave, idcliente } = req.body;

    EmisorController.validarClaveActivacionProforma(idemisor, clave).then(response => {

        if (response.length > 0) {

            Cliente.activarClienteProforma(idcliente, idemisor).then(estado => {
                Cliente.actualizarIdAutoriza({ idemisor, idcliente, idusuario }).then(response => {
                    if (parseInt(response.affectedRows) === 0) {
                        res.status(400).json({

                            message: 'No se pudo actualizar la información del estado de autorización del cliente'
                        })
                    } else {
                        res.status(200).json({

                            message: 'El cliente ha sido autorizado'
                        })
                    }
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({ message: 'Ocurrió un error al actualizar el estado autorizado del cliente' })
                });
            }).catch(err => {
                console.log(err);
                res.status(500).json({ message: 'Ocurrió un error al actualizar el estado autorizado del cliente' })
            });

        } else {
            res.status(401).json({
                message: 'La clave insertada es incorrecta'
            })
        }
    })
}

exports.innhabilitarEstadoAutorizado = (obj) => {

    return Cliente.innhabilitarEstadoAutorizado(obj);
}

exports.rutainnhabilitarEstadoAutorizado = (req, res) => {


    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idemisor = decodedToken.id;
    const { idcliente } = req.params;

    Cliente.innhabilitarEstadoAutorizado({ idemisor, idcliente }).then(estado => {
        if (estado.affectedRows > 0) {
            res.status(200).json({
                message: 'El estado autorizado ha sido innhabilitado'
            })
        } else {
            res.status(400).json({
                message: 'No se pudo inhabilitar el estado autorizado'
            });
        }
    })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Ocurrió un error al deshabilitar el estado autorizado'
            });
        })
}


exports.obtenerIdAutoriza = (idcliente) => {

    return Cliente.obtenerIdAutoriza(idcliente);
}

exports.cargarClientesFacturar = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    Cliente.cargarClientesFacturar({ idemisor, idusuario }).then(clientes => {
        res.status(200).json(clientes);
    })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Ocurrió un error al cargar los clientes'
            });
        })
}

exports.obtenerClientes = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idemisor = decodedToken.id;

    Cliente.obtenerClientes(idemisor).then(clientes => {
        res.status(200).json(clientes);
    })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Ocurrió un error al cargar los clientes'
            });
        })
    //Cliente.obtenerClientes 
}

exports.obtenerClientePos = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idemisor = decodedToken.id;
    Cliente.buscarClientePorCedula({
        idemisor
    }).then(response => res.status(200).json({ cliente: response }))
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Error al obtener el cliente'
            });
        })
}

exports.obtenerUbicacionCliente = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idemisor = decodedToken.id;
    const { idcliente } = req.params;

    Cliente.obtenerUbicacionCliente({
        idemisor,
        idcliente
    })
        .then(response => res.status(200).json({ ubicacion: response[0].ubicacion }))
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: 'Error al obtener la ubicacion del cliente' });
        })
}

exports.actualizarUbicacion = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idemisor = decodedToken.id;
    const { ubicacion, id } = req.body;

    Cliente.actualizarUbicacion({ idemisor, ubicacion, id })
        .then(({ affectedRows }) => {
            if (affectedRows > 0) {
                return res.status(200).json({
                    message: 'Ubicación actualizada'
                })
            } else {
                return res.status(400).json({
                    message: 'No se pudo actualizar la ubicación'
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Error al actualizar la ubicación'
            })
        })
}

exports.cargarZonas = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idemisor = decodedToken.id;
    console.log("cargar zonas");
    Cliente.cargarZonasPorEmisor(idemisor)
        .then(response => res.status(200).json(response))
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Error al cargar las zonas'
            });
        })
}

exports.enviarEstadoCuentaPorCorreo = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    const { idcliente, correo } = req.params;

    Cliente.obtenerDatosEstadoCuenta({ idcliente, idemisor, idusuario })
        .then(response => { //EmisorController
            generarReporteEstadoCuenta(response[0]).then(html => {

                const datetimenow = Date.now();
                const fechaEmision = moment(datetimenow).toISOString(true).substr(0, 19);
                const pdf = 'EstadoCuenta_' + datetimenow + '.pdf';
                const ruta = __dirname + '/../pdf/' + pdf;

                generarPDFDeComprobante(html, ruta).then(() => {
                    //aqui se envia el correo

                    EmisorController.obtenerCorreoAdministrativo(idemisor).then(correoAdministrativo => {

                        let obj = {};

                        if (correoAdministrativo.length > 0
                            && correoAdministrativo[0].correo_administrativo
                            && correoAdministrativo[0].correo_administrativo.length > 0) {
                            const correoEmisor = correoAdministrativo[0].correo_administrativo;
                            let stringCorreos = `${correo};`;

                            for (const correo1 of correoEmisor) {
                                if (correo1.length > 0) {
                                    stringCorreos += `${correo1}`
                                }
                            }

                            obj = {
                                emisor_nombre: !response[0].emisor_nombrecomercial ? response[0].emisor_nombre : response[0].emisor_nombrecomercial,
                                correo: stringCorreos,
                                pdf,
                                rutaPDF: ruta,
                                cliente: response[0].cliente_nombre,
                                fechaEmision
                            }

                        } else {
                            obj = {
                                emisor_nombre: !response[0].emisor_nombrecomercial ? response[0].emisor_nombre : response[0].emisor_nombrecomercial,
                                correo,
                                pdf,
                                rutaPDF: ruta,
                                cliente: response[0].cliente_nombre,
                                fechaEmision
                            }
                        }

                        enviarEstadoCuenta(obj)
                            .then(() => res.status(200).json({ message: 'El estado de cuenta ha sido enviado' }))
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    message: 'Error al enviar el estado de cuenta'
                                });
                            })
                    })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                message: 'Error al obtener el correo administrativo'
                            })
                        })
                })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            message: 'Error al generar el reporte de estado cuenta 2'
                        });
                    })
            })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        message: 'Error al generar el reporte de estado cuenta 1'
                    });
                })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Error al generar el reporte de estado cuenta'
            });
        })
}


exports.obtenerUsuarioPorIdCliente = (obj) => Cliente.obtenerUsuarioPorIdCliente(obj);
exports.obtenerIdClientePorCedula = (idemisor, cedula_cliente) => Cliente.obtenerIdClientePorCedula(idemisor, cedula_cliente);
exports.nuevoCliente = obj => Cliente.nuevoCliente(obj);
 // obtenerIdAutoriza obtenerIdClientePorCedula
//EmisorController
/*

    EN LA PARTE DE EXONERACION SE OBTIENE EL PORCENTAJE SOBRE EL IMPUESTO APLICADO Y DE AHI SE RESTA EL PORCENTAJE DE IMPUESTO EXONERADO MENOS EL IMPUESTO TOTAL PARA SACAR LA PARTE EXONERADA
    Exonerar sobre el impuesto a pagar
*/