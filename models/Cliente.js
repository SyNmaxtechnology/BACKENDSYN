const pool = require("../db/config");
const Usuario = require("./Usuario");
let Cliente = {};

/**
 * 
 * usuarios de prueba 
 * ALEROGIO12345 / ALEROGIO12345 emisor 94
 * SALEX123456 / SALEX123456 emisor 93
 */

Cliente.nuevoCliente = (obj) => {

    return new Promise((resolve, reject) => {
        const { idemisor, cliente_nombre, cliente_nombre_comercial, cliente_tipo_identificacion, cedula_cliente, numero_cliente, identificacion_extranjero, cliente_barrio, otras_senas, otras_senas_extranjero, cliente_telefono_codigopais, cliente_telefono_numtelefono, cliente_fax_codigopais, cliente_fax_numtelefono, exentoIVA, tipoExoneracion, porcentajeExoneracion, NombreInstitucion, documentoExoneracion, fechaEmision, idusuario, descuento, plazo_credito, cliente_correo, ubicacion, contado,codactividad } = obj; // destructuring de objetos
        //CAMBIO SYN 4.4 AGREGA CODACTIVIDAD CLIENTE
        pool.query('INSERT INTO Cliente(idemisor,cliente_nombre, cliente_nombre_comercial, cliente_tipo_identificacion, cedula_cliente, numero_cliente, identificacion_extranjero, cliente_barrio, otras_senas, otras_senas_extranjero, cliente_telefono_codigopais, cliente_telefono_numtelefono, cliente_fax_codigopais, cliente_fax_numtelefono, exentoIVA, tipoExoneracion, porcentajeExoneracion, NombreInstitucion, documentoExoneracion, fechaEmision,agente,descuento,plazo_credito,cliente_correo,ubicacion,contando,CodActRec ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [idemisor, cliente_nombre, cliente_nombre_comercial, cliente_tipo_identificacion, cedula_cliente, numero_cliente, identificacion_extranjero, cliente_barrio, otras_senas, otras_senas_extranjero, cliente_telefono_codigopais, cliente_telefono_numtelefono, cliente_fax_codigopais, cliente_fax_numtelefono, exentoIVA, tipoExoneracion, porcentajeExoneracion, NombreInstitucion, documentoExoneracion, fechaEmision, idusuario, descuento, plazo_credito, cliente_correo, ubicacion, contado,codactividad], function (err, rows, fields) {
            if (err) {
                console.log("error cliente ",err);
                return reject(err);
            }

            return resolve(rows)
        })
    })
}
//comentario
Cliente.actualizarCliente = (obj) => {
    return new Promise((resolve, reject) => {
        const { idemisor, cliente_nombre, cliente_nombre_comercial, cliente_tipo_identificacion, cedula_cliente, numero_cliente, identificacion_extranjero, cliente_barrio, otras_senas, otras_senas_extranjero, cliente_telefono_codigopais, cliente_telefono_numtelefono, cliente_fax_codigopais, cliente_fax_numtelefono, cliente_correo, exentoIVA, tipoExoneracion, porcentajeExoneracion, NombreInstitucion, documentoExoneracion, descuento, plazo_credito, ubicacion, id } = obj;

        pool.query('UPDATE Cliente SET idemisor=?, cliente_nombre=?,cliente_nombre_comercial=?,cliente_tipo_identificacion=?,cedula_cliente=?,numero_cliente=?,identificacion_extranjero=?,cliente_barrio=?,otras_senas=?,otras_senas_extranjero=?,cliente_telefono_codigopais=?,cliente_telefono_numtelefono=?,cliente_fax_codigopais=?,cliente_fax_numtelefono=?,cliente_correo=?,exentoIVA=?,tipoExoneracion=?,porcentajeExoneracion=?,NombreInstitucion=?,documentoExoneracion=?,Descuento=?,plazo_credito=?,ubicacion=? WHERE id=?', [idemisor, cliente_nombre, cliente_nombre_comercial, cliente_tipo_identificacion, cedula_cliente, numero_cliente, identificacion_extranjero, cliente_barrio, otras_senas, otras_senas_extranjero, cliente_telefono_codigopais, cliente_telefono_numtelefono, cliente_fax_codigopais, cliente_fax_numtelefono, cliente_correo, exentoIVA, tipoExoneracion, porcentajeExoneracion, NombreInstitucion, documentoExoneracion, descuento, plazo_credito, ubicacion, id], function (err, rows, fields) {
            if (err) {
                console.log(err);
                return reject(err);
            }

            return resolve(rows)
        })
    })
}

Cliente.obtenerClientePorId = (idcliente) => {
    return new Promise((resolve, reject) => {

        const sql = `SELECT c.id, c.cliente_nombre, c.cliente_nombre_comercial,c.cliente_tipo_identificacion,
        c.cedula_cliente, c.numero_cliente, c.otras_senas, c.otras_senas_extranjero, c.identificacion_extranjero, 
        c.cliente_barrio,c.cliente_telefono_codigopais, c.cliente_telefono_numtelefono, c.cliente_fax_codigopais,
        c.cliente_fax_numtelefono, c.cliente_correo,c.exentoIVA,c.tipoExoneracion,c.porcentajeExoneracion,c.NombreInstitucion,
        c.documentoExoneracion,c.descuento,c.plazo_credito,c.ubicacion , b.provincia,  b.canton,b.distrito,b.CodNew 
        FROM Cliente c, Barrios b, Emisor e  
        WHERE c.idemisor = e.id
        AND c.cliente_barrio = b.CodNew
        AND c.id=${idcliente}`;

        console.log(sql)

        pool.query(sql, [], function (err, rows, fields) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(rows)
        })
    })
}

Cliente.obtenerClientePorQuery = (obj) => { // cuando se busca el cliente en el modulo de clientes
    return new Promise((resolve, reject) => {
        console.log("Aqui")
        const { query, idemisor, idusuario } = obj;
        const sql = "SELECT c.id,c.cliente_nombre,c.plazo_credito, c.cliente_nombre_comercial,c.cliente_tipo_identificacion,c.cedula_cliente, c.cliente_correo, c.estado_cliente,DATE(c.fechaEmision) AS fechaCreacion, c.porcentajeExoneracion, e.emisor_nombre as usuario FROM Cliente c, Emisor e WHERE (c.cliente_nombre= '" + query + "' OR c.cedula_cliente= '" + query + "' OR c.cliente_nombre_comercial = '" + query + "') AND c.idemisor=" + idemisor + " AND e.id = c.idemisor";
        console.log(sql);
        pool.query(sql, [], (err, rows, fiedls) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    });
}

Cliente.obtenerClientesPorIdEmisor = ({ idemisor, idusuario }) => {
    return new Promise((resolve, reject) => {
        pool.query(`
        SELECT c.id, c.cliente_nombre, c.cliente_nombre_comercial,c.cliente_tipo_identificacion,
        c.cedula_cliente, c.cliente_correo, c.estado_cliente,DATE(c.fechaEmision) AS fechaCreacion, e.emisor_nombre as usuario
        FROM Cliente c, Emisor e 
        where e.id = c.idemisor and 
         e.id = ${idemisor} AND c.id > 1;
        `, [], (err, rows, fiedls) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Cliente.actualizarEstado = (obj) => {
    return new Promise((resolve, reject) => {

        const { idemisor, idcliente, estado } = obj;

        pool.query(`
            UPDATE Cliente SET estado_cliente =${estado} WHERE idemisor = ${idemisor} AND id = ${idcliente}
            `, [], (err, rows, fiedls) => {
            if (err) {
                return reject(err);
            }

            resolve(rows)
        })
    })
}

//CAMBIO SYN
Cliente.actualizarcorreo = (obj) => {
    return new Promise((resolve, reject) => {

        const { idemisor, idcliente, correo } = obj;

        pool.query(`
            UPDATE Cliente SET cliente_correo =? WHERE idemisor = ? AND id = ?
            `, [correo,idemisor,idcliente], (err, rows, fiedls) => {
            if (err) {
                return reject(err);
            }

            resolve(rows)
        })
    })

}
//FIN CAMBIO SYN

Cliente.obtenerClientePorCoincidencia = (obj) => { // cuandose busca el cliente al crear una factura 
    return new Promise(async (resolve, reject) => {

        try {
            const { query, idemisor, idusuario } = obj;
            const permiso = await Usuario.esSuperUsuario({ idemisor, idusuario });
            console.log(permiso[0].descripcion === 'ruteo1');
            let sql = '';

            if (permiso[0].descripcion === 'superusuario') {
                sql = "SELECT c.id,c.cliente_nombre, c.cliente_nombre_comercial,c.cliente_tipo_identificacion,c.cedula_cliente, c.cliente_correo, c.estado_cliente,DATE(c.fechaEmision) AS fechaCreacion, c.porcentajeExoneracion,c.descuento,c.plazo_credito , c.saldo, c.limi_credi, c.vence1, c.vence2, c.vence3,c.vence4,c.vence5, e.emisor_nombre as usuario FROM Cliente c, Emisor e WHERE (c.cliente_nombre LIKE '%" + query + "%' OR c.cedula_cliente LIKE '%" + query + "%' OR c.cliente_nombre_comercial LIKE '%" + query + "%') AND c.idemisor=" + idemisor + " AND e.id = c.idemisor";

            } else {
                sql = "SELECT c.id,c.cliente_nombre, c.cliente_nombre_comercial,c.cliente_tipo_identificacion,c.cedula_cliente, c.cliente_correo, c.estado_cliente,DATE(c.fechaEmision) AS fechaCreacion, c.porcentajeExoneracion,c.descuento,c.plazo_credito , c.saldo, c.limi_credi, c.vence1, c.vence2, c.vence3,c.vence4,c.vence5, e.emisor_nombre as usuario FROM Cliente c, Emisor e WHERE (c.cliente_nombre LIKE '%" + query + "%' OR c.cedula_cliente LIKE '%" + query + "%' OR c.cliente_nombre_comercial LIKE '%" + query + "%') AND c.idemisor=" + idemisor + " AND e.id = c.idemisor AND c.Agente = " + idusuario;
            }


            console.log("Buscar cliente desde la pantalla de generar facturas")
            console.log(sql);
            pool.query(sql, [], (err, rows, fiedls) => {
                if (err) {
                    return reject(err);
                }
                console.log("clientes ", rows)
                resolve(rows);
            })
        } catch (err) {
            reject(err);
        }
    });
}

Cliente.obtenerFacturasPorQuery = (obj) => {

    return new Promise((resolve, reject) => {
        const { idemisor, idcliente } = obj;
        pool.query(`
        
            SELECT f.numero_interno as numfactura, f.tipocambio, SUBSTRING(f.fecha_factura,1,10) as fecha,f.codigomoneda,m.id as idmovimiento,m.idfactura, m.idcliente,m.montototal, m.saldoactual FROM Factura f, Movimientoscxc m, Cliente c
            WHERE f.idemisor = ?
            AND f.idcliente = ?
            AND f.idcliente = c.id
            AND f.id = m.idfactura
            AND m.idcliente = c.id
            AND m.saldoactual > 0
            AND m.factura = 1
            AND f.status_factura = 'aceptado'
            AND f.anulada = 0
            AND f.plazo_credito > 1
        `, [idemisor, idcliente], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Cliente.actualizarPagosFacturasCredito = (obj) => {

    return new Promise((resolve, reject) => {

        const { idemisor, idcliente, idfactura, fecha_factura, factura, idmovimiento, saldoRestante } = obj;
        pool.query(`
            INSERT INTO MovimientosCxc(idemisor,idcliente,idfactura,fecha_factura,montototal,saldoactual,factura)
            VALUES(?,?,?,?,?,?,?)
        `, [idemisor, idcliente, idfactura, fecha_factura, saldoRestante, 0, factura], (err, rows, fields) => {
            if (err) {
                return reject(err);
            } else {

                pool.query(`
                    UPDATE MovimientosCxc SET saldoactual = saldoactual - ? WHERE idemisor = ? AND idfactura = ? AND id = ?
                `, [saldoRestante, idemisor, idfactura, idmovimiento], (err, rows, fields) => {

                    if (err) {
                        throw new Error("error_insert_pay");
                    }

                    resolve(rows);
                })
            }
        })
    })
}

Cliente.listarClientesFacturaCredito = (idemisor) => {
    return new Promise((resolve, reject) => {
        pool.query(`
        SELECT id, cliente_nombre, cedula_cliente FROM Cliente WHERE idemisor = ?
        `, [idemisor], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Cliente.obtenerFacturasCreditoCanceladas = (obj) => {
    return new Promise((resolve, reject) => {

        const { idcliente, fechaInicio, fechaFin, idemisor } = obj;

        let sql = 'SELECT m.id as idrecibo,m.fecha_factura,f.id as idfactura,SUBSTRING(m.fecha_factura,1,10) as fecha,m.factura as tipo, m.montototal, m.saldoactual, c.cliente_nombre ,f.numero_interno, f.codigomoneda FROM  MovimientosCxc m, Cliente c, Factura f,  Emisor e WHERE f.id = m.idfactura AND e.id= ' + idemisor + ' AND e.id = m.idemisor AND c.id = m.idcliente';

        if (idcliente != '' && (fechaInicio != '' && fechaFin != '')) {
            sql += ' AND SUBSTRING(f.fecha_factura,1,10) >= "' + fechaInicio + '" AND SUBSTRING(f.fecha_factura,1,10) <= "' + fechaFin + '" AND c.id = ' + idcliente;
        }

        if (idcliente == '' && (fechaInicio != '' && fechaFin != '')) {
            sql += ' AND SUBSTRING(f.fecha_factura,1,10) >= "' + fechaInicio + '" AND SUBSTRING(f.fecha_factura,1,10) <= "' + fechaFin + '"';
        }

        sql += ' ORDER BY f.numero_interno ASC';

        pool.query(sql, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Cliente.obtenerClientesVisita = (idemisor) => {

    return new Promise((resolve, reject) => {
        //SELECT id, cliente_nombre, cliente_nombre_comercial FROM CLiente WHERE idemisor =2 order by cliente_nombre ASC;
        //SELECT id, cliente_nombre FROM Cliente WHERE idemisor = ? ORDER BY cliente_nombre ASC, cliente_nombre_comercial
        pool.query('SELECT id, cliente_nombre, cliente_nombre_comercial FROM CLiente WHERE idemisor = ? order by cliente_nombre ASC;',
            [idemisor], (err, rows, fields) => {

                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

Cliente.obtenerClientesPorAgente = (obj) => {
    return new Promise(async (resolve, reject) => {

        try {

            const { idusuario, idemisor } = obj;
            const permiso = await Usuario.esSuperUsuario({ idemisor, idusuario });
            let sql = '';

            if (permiso[0].descripcion === 'superusuario' || permiso[0].descripcion === 'facturador') {
                sql = 'SELECT id, cliente_nombre FROM Cliente WHERE idemisor=' + idemisor + ' AND estado_cliente = 1 ORDER BY cliente_nombre ASC';
            } else {
                sql = 'SELECT id, cliente_nombre FROM Cliente WHERE idemisor=' + idemisor + ' AND Agente = ' + idusuario + ' AND estado_cliente = 1 ORDER BY cliente_nombre ASC';
            }

            console.log(sql);

            pool.query(sql, [], (err, rows, fields) => {

                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
        } catch (err) {
            reject(err);
        }
    })
}

Cliente.obtenerEstadoAutorizado = (idcliente) => {

    return new Promise((resolve, reject) => {
        pool.query('SELECT autorizado FROM Cliente WHERE id = ?',
            [idcliente], (err, rows, fields) => {

                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

Cliente.activarClienteProforma = (idcliente, idemisor) => {

    return new Promise(async (resolve, reject) => {

        try {

            const estado = await Cliente.obtenerEstadoAutorizado(idcliente, idemisor)
            if (estado[0].autorizado === 1) {
                resolve(1);
            } else {
                pool.query('UPDATE Cliente SET autorizado = 1 WHERE id = ? AND idemisor = ? ', [idcliente, idemisor],
                    (err, rows, fields) => {
                        if (err) {
                            return reject(err)
                        }
                        const { affectedRows } = rows;
                        if (affectedRows > 0) {
                            resolve(1);
                        } else {
                            reject('No se pudo actualizar el estado autorizado');
                        }
                    })
            }
        } catch (err) {

            reject(err);
        }
    })
}

Cliente.actualizarIdAutoriza = (obj) => {

    return new Promise((resolve, reject) => {
        const { idemisor, idcliente, idusuario } = obj;
        pool.query(`UPDATE Cliente SET idautoriza = ${parseInt(idusuario)} WHERE idemisor= ${parseInt(idemisor)} AND id = ${parseInt(idcliente)}`,
            [], (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

Cliente.innhabilitarEstadoAutorizado = (obj) => {

    return new Promise((resolve, reject) => {

        const { idemisor, idcliente } = obj;

        pool.query(`
            UPDATE Cliente SET autorizado = 0, idautoriza = NULL WHERE idemisor = ${idemisor} AND id = ${idcliente}
        `, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        });
    })
}

Cliente.obtenerIdAutoriza = (idcliente) => {

    return new Promise((resolve, reject) => {

        pool.query(`SELECT idautoriza FROM Cliente WHERE id = ${idcliente}`
            , [], (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
    })
    //idautoriza
}

Cliente.cargarClientesFacturar = (obj) => { // cuandose busca el cliente al crear una factura 
    return new Promise(async (resolve, reject) => {

        try {
            const { idemisor, idusuario } = obj;
            console.log({ idusuario });
            console.log({ idemisor });
            const permiso = await Usuario.esSuperUsuario({ idemisor, idusuario });
            console.log(permiso);
            let sql = '';

            if (Number(idemisor) !== 41) {
                sql = "SELECT c.id,c.cliente_nombre, c.cliente_nombre_comercial,c.cliente_tipo_identificacion,c.cedula_cliente, c.cliente_correo, c.estado_cliente,DATE(c.fechaEmision) AS fechaCreacion, c.porcentajeExoneracion,c.descuento,c.plazo_credito , c.saldo, c.limi_credi, c.vence1, c.vence2, c.vence3,c.vence4,c.vence5,c.numero_cliente, e.emisor_nombre as usuario FROM Cliente c, Emisor e WHERE c.idemisor=" + idemisor + " AND e.id = c.idemisor AND c.estado_cliente = 1";
            } else {
                if (permiso[0].descripcion === 'superusuario') {
                    sql = "SELECT c.id,c.cliente_nombre, c.cliente_nombre_comercial,c.cliente_tipo_identificacion,c.cedula_cliente, c.cliente_correo, c.estado_cliente,DATE(c.fechaEmision) AS fechaCreacion, c.porcentajeExoneracion,c.descuento,c.plazo_credito , c.saldo, c.limi_credi, c.vence1, c.vence2, c.vence3,c.vence4,c.vence5,c.numero_cliente, e.emisor_nombre as usuario FROM Cliente c, Emisor e WHERE c.idemisor=" + idemisor + " AND e.id = c.idemisor AND c.estado_cliente = 1";

                } else {
                    sql = "SELECT c.id,c.cliente_nombre, c.cliente_nombre_comercial,c.cliente_tipo_identificacion,c.cedula_cliente, c.cliente_correo, c.estado_cliente,DATE(c.fechaEmision) AS fechaCreacion, c.porcentajeExoneracion,c.descuento,c.plazo_credito , c.saldo, c.limi_credi, c.vence1, c.vence2, c.vence3,c.vence4,c.vence5,c.numero_cliente, e.emisor_nombre as usuario FROM Cliente c, Emisor e WHERE c.idemisor=" + idemisor + " AND e.id = c.idemisor AND c.estado_cliente = 1 AND c.Agente = " + idusuario;
                }
            }

            console.log("Buscar cliente desde la pantalla de generar facturas")
            console.log(sql);
            pool.query(sql, [], (err, rows, fiedls) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            })
        } catch (err) {
            reject(err);
        }
    });
}

Cliente.obtenerClientes = (idemisor) => { // cuando se busca el cliente en el modulo de clientes

    return new Promise((resolve, reject) => {

        const sql = "SELECT c.id,c.cliente_nombre,c.plazo_credito, c.cliente_nombre_comercial,c.cliente_tipo_identificacion,c.cedula_cliente, c.cliente_correo, c.estado_cliente,DATE(c.fechaEmision) AS fechaCreacion, c.porcentajeExoneracion, e.emisor_nombre as usuario FROM Cliente c, Emisor e WHERE  c.idemisor=" + idemisor + " AND e.id = c.idemisor";
        console.log(sql);
        pool.query(sql, [], (err, rows, fiedls) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    });
}

Cliente.buscarClientePorCedula = (obj) => {

    return new Promise((resolve, reject) => {
        const { idemisor } = obj;

        pool.query(`
            SELECT c.id,c.cliente_nombre, c.cliente_nombre_comercial,c.cedula_cliente, 
                c.cliente_correo, c.porcentajeExoneracion,c.plazo_credito
                FROM Cliente c
                WHERE c.idemisor = ${idemisor}
        `, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Cliente.obtenerUbicacionCliente = (obj) => {
    return new Promise((resolve, reject) => {
        const { idemisor, idcliente } = obj;
        console.log(idemisor);
        console.log(idcliente);
        pool.query(`
            SELECT ubicacion FROM Cliente WHERE idemisor = ${idemisor} 
            AND id = ${idcliente}
        `, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}


Cliente.actualizarUbicacion = (obj) => {

    return new Promise((resolve, reject) => {

        const { ubicacion, idemisor, id } = obj;

        pool.query('UPDATE Cliente SET ubicacion = ? WHERE idemisor =? AND id =?',
            [ubicacion, idemisor, id], (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

Cliente.cargarZonasPorEmisor = (idemisor) => {

    return new Promise((resolve, reject) => {

        pool.query(`SELECT c_zona, d_zona FROM Zonas WHERE idemisor = ${idemisor}`,
            [], (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

Cliente.obtenerDatosEstadoCuenta = (obj) => {

    return new Promise((resolve, reject) => {

        const { idemisor, idusuario, idcliente } = obj;

        const sql = "SELECT e.emisor_nombre,e.emisor_nombrecomercial,e.logo,e.emisor_correo,e.emisor_telefono_numtelefono,e.emisor_otras_senas,c.cliente_nombre, c.saldo, c.limi_credi, c.vence1, c.vence2, c.vence3,c.vence4,c.vence5,c.cliente_nombre,c.cedula_cliente FROM Cliente c, Emisor e WHERE c.idemisor=" + idemisor + " AND e.id = c.idemisor AND c.id=" + idcliente;

        pool.query(sql, [], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Cliente.obtenerUsuarioPorIdCliente = (obj) => {

    return new Promise((resolve, reject) => {

        const { idemisor, idcliente } = obj;

        pool.query(`
            SELECT agente FROM Cliente WHERE idemisor = ${idemisor} AND id = ${idcliente}
        `, [], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Cliente.obtenerIdClientePorCedula = (idemisor, cedula_cliente) => {

    return new Promise((resolve, reject) => {
        //agrega cliente correo SYN
        pool.query(`SELECT id,cliente_correo FROM Cliente WHERE idemisor = ? AND TRIM(cedula_cliente) = ?`,
            [idemisor, cedula_cliente], (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
    })
}
module.exports = Cliente;