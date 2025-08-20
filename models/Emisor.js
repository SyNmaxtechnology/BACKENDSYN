const pool = require("../db/config");
const request = require("request");
const Usuario = require("./Usuario");
const Cliente = require("./Cliente");
const Bodega = require("./Bodega");
const Consecutivos = require('../functions/Consecutivos');
const TipoImpuestoController = require("../controllers/TipoImpuestoController");
const { reject } = require("bcrypt/promises");
const Emisor = {};
require("dotenv").config({ path: '../varibles.env' });
// https://drive.google.com/drive/folders/1j-PfFqYF-YlolqA1v_Qs6zEIRVcPE709?usp=sharing
Emisor.guardarEmisor = (obj) => {
    return new Promise((resolve, reject) => {
        const { emisor_nombre, emisor_nombrecomercial, emisor_tipo_identificacion, cedula_emisor, numero_emisor, emisor_barrio, emisor_otras_senas, emisor_telefono_codigopais, emisor_telefono_numtelefono, emisor_fax_codigopais, emisor_fax_numtelefono, emisor_correo, file_p12, pin_p12, key_username_hacienda, key_password_hacienda, casaMatriz, puntoVenta, codigo_actividad, tipo_codigo_servicio, codigo_servicio, Client_ID, API, TOKEN_API, numeroresolucion, fecharesolucion, logo, public_id, pos, autorizaSaldo, activaCabys, cerca_perimetral, correo_administrativo, multi_sucursal, grupoencomun, notas_emisor, token_emisor } = obj;


        pool.query('INSERT INTO Emisor(emisor_nombre, emisor_nombrecomercial, emisor_tipo_identificacion, cedula_emisor, numero_emisor, emisor_barrio, emisor_otras_senas, emisor_telefono_codigopais, emisor_telefono_numtelefono, emisor_fax_codigopais, emisor_fax_numtelefono, emisor_correo, file_p12, pin_p12, key_username_hacienda, key_password_hacienda, casaMatriz, puntoVenta, codigo_actividad, tipo_codigo_servicio, codigo_servicio, Client_ID, API, TOKEN_API, numeroresolucion, fecharesolucion, logo,public_id, pos,autorizaSaldo,activaCabys,cerca_perimetral,correo_administrativo,multi_sucursal,GrupoEnComun,notas_emisor,token_emisor) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [emisor_nombre, emisor_nombrecomercial, emisor_tipo_identificacion, cedula_emisor, numero_emisor, emisor_barrio, emisor_otras_senas, emisor_telefono_codigopais, emisor_telefono_numtelefono, emisor_fax_codigopais, emisor_fax_numtelefono, emisor_correo, file_p12, pin_p12, key_username_hacienda, key_password_hacienda, casaMatriz, puntoVenta, codigo_actividad, tipo_codigo_servicio, codigo_servicio, Client_ID, API, TOKEN_API, numeroresolucion, fecharesolucion, logo, public_id, pos, autorizaSaldo, activaCabys, cerca_perimetral, correo_administrativo, multi_sucursal, grupoencomun, notas_emisor, token_emisor.trim()], function (err, rows, fields) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            const { insertId, affectedRows } = rows;

            if (affectedRows > 0) { // se creo el emisor 
                console.log("emisor creado", affectedRows);
                //crear primeramente la bodega
                const objBodega = {
                    idemisor: insertId,
                    descripcion: 'Principal',
                    Principal: 1
                }
                Bodega.nuevaBodega(objBodega)
                    .then(responseBodega => {

                        if (responseBodega.affectedRows > 0) { // se creo la nueva bodega
                            Usuario.registrarUsuario({
                                idpermiso: 1,
                                idemisor: insertId,
                                idbodega: responseBodega.insertId,
                                usuario: cedula_emisor,
                                contrasena: process.env.PASS_ADMIN,
                                imagen: null
                            })
                                .then((respuesta) => {
                                    console.log("usuario creado", respuesta);
                                    if (respuesta.affectedRows > 0) { // se creo el usuario
                                        //
                                        Cliente.nuevoCliente({
                                            idemisor: insertId, cliente_nombre: 'cliente 1000', cliente_nombre_comercial: 'cliente 1000', cliente_tipo_identificacion: '00', cedula_cliente: '1000', numero_cliente: '1000', identificacion_extranjero: '1000', cliente_barrio: '01', otras_senas: '', otras_senas_extranjero: '', cliente_telefono_codigopais: '000', cliente_telefono_numtelefono: '00000000', cliente_fax_codigopais: '000', cliente_fax_numtelefono: '00000000', cliente_correo: 'correo1000@correo1000.com', exentoIVA: 0, tipoExoneracion: '', porcentajeExoneracion: 0, NombreInstitucion: '', documentoExoneracion: '', fechaEmision: new Date().toISOString(), contado: 1
                                        }).then(response => {

                                            if (response.affectedRows > 0) {
                                                // correr funcion para agregar los consecutivos del emisor creado
                                                Consecutivos.agregarConsecutivosEmisor(objBodega.idemisor)
                                                    .then(responseConsecutivos => {
                                                        console.log("consecutivos", responseConsecutivos);
                                                        if (responseConsecutivos.affectedRows > 0) {
                                                            // resolve(responseConsecutivos);
                                                            console.log("creo consecutivos")
                                                            //crear los impuestos por emisor 
                                                            resolve(rows);
                                                        } else {
                                                            reject('No se pudieron crear los consecutivos asociados al emisor');
                                                        }
                                                    })
                                                    .catch(err => {
                                                        reject(err);
                                                    })
                                            } else {
                                                return reject('No se pudo crear el usuario 1000');
                                            }
                                        }).catch(err => {
                                            console.log(err);
                                            return reject('Ha ocurrido un error al crear el usuario 1000');
                                        })
                                    } else {
                                        return reject('No creó el usuario administrador');
                                    }
                                })
                                .catch(err => {
                                    console.log(err);
                                    return reject(err);
                                })
                        } else {
                            return reject(new Error('No se pudo crear la bodega'))
                        }

                    })
                    .catch(err => {
                        return reject(err);
                    })
            } else {
                return reject(new Error('NO se pudo crear el emisor'));
            }
        })
    })
}

Emisor.actualizarEmisor = (obj) => {
    return new Promise((resolve, reject) => {

        const {
            emisor_nombre,
            emisor_nombrecomercial,
            emisor_tipo_identificacion,
            cedula_emisor,
            numero_emisor,
            emisor_barrio,
            emisor_otras_senas,
            emisor_telefono_codigopais,
            emisor_telefono_numtelefono,
            emisor_fax_codigopais,
            emisor_fax_numtelefono,
            emisor_correo,
            file_p12,
            pin_p12,
            key_username_hacienda,
            key_password_hacienda,
            casaMatriz,
            puntoVenta,
            codigo_actividad,
            tipo_codigo_servicio,
            codigo_servicio,
            Client_ID,
            API,
            TOKEN_API,
            numeroresolucion,
            fecharesolucion,
            logo,
            public_id,
            pos,
            activaCabys,
            autorizaSaldo,
            cerca_perimetral,
            correo_administrativo,
            multi_sucursal,
            grupoencomun,
            notas_emisor,
            token_emisor,
            id
        } = obj;

        pool.query("UPDATE Emisor SET emisor_nombre=?,emisor_nombrecomercial=?,emisor_tipo_identificacion=?,cedula_emisor=?, numero_emisor=?,emisor_barrio=?,emisor_otras_senas=?,emisor_telefono_codigopais=?,emisor_telefono_numtelefono=?, emisor_fax_codigopais=?,emisor_fax_numtelefono=?,emisor_correo=?,file_p12=?,pin_p12=?,key_username_hacienda=?, key_password_hacienda=?,casaMatriz=?,puntoVenta=?,codigo_actividad=?,tipo_codigo_servicio=?,codigo_servicio=?,Client_ID=?,API=?,TOKEN_API=?,numeroresolucion=?,fecharesolucion=?,logo=?,public_id =?, pos=?, activaCabys=?, autorizaSaldo =?,cerca_perimetral=?, correo_administrativo=?, multi_sucursal=?,GrupoEnComun=?, notas_emisor=?, token_emisor=?  WHERE id=?", [emisor_nombre, emisor_nombrecomercial, emisor_tipo_identificacion, cedula_emisor, numero_emisor, emisor_barrio, emisor_otras_senas, emisor_telefono_codigopais, emisor_telefono_numtelefono, emisor_fax_codigopais, emisor_fax_numtelefono, emisor_correo, file_p12, pin_p12, key_username_hacienda, key_password_hacienda, casaMatriz, puntoVenta, codigo_actividad, tipo_codigo_servicio, codigo_servicio, Client_ID, API, TOKEN_API, numeroresolucion, fecharesolucion, logo, public_id, pos, activaCabys, autorizaSaldo, cerca_perimetral, correo_administrativo, multi_sucursal, grupoencomun, notas_emisor, token_emisor.trim(), id], function (err, rows, fields) {
            if (err) {
                console.log(err);
                return reject(err);
            }

            return resolve(rows);
        })
    })
}

Emisor.obtenerEmisor = (obj) => {
    return new Promise((resolve, reject) => {
        const { query } = obj;
        console.log("datos", obj.query);

        const sql = `
        SELECT e.id, e.activaCabys,e.emisor_nombre,e.emisor_nombrecomercial,e.emisor_tipo_identificacion,e.cedula_emisor,e.numero_emisor, 
        e.logo,e.emisor_barrio,e.emisor_otras_senas,e.emisor_telefono_codigopais,e.emisor_telefono_numtelefono,e.emisor_fax_codigopais, e.pos,
        e.emisor_fax_numtelefono,e.emisor_correo,e.file_p12,e.pin_p12,e.key_username_hacienda,e.key_password_hacienda,e.casaMatriz ,e.puntoVenta,e.codigo_actividad,e.tipo_codigo_servicio,e.codigo_servicio,e.Client_ID,e.API,e.TOKEN_API,e.numeroresolucion 
        ,e.fecharesolucion,e.logo,e.id,e.autorizaSaldo,b.provincia, b.canton, b.distrito, b.CodNew, e.cerca_perimetral,e.correo_administrativo,e.multi_sucursal,
        e.GrupoEnComun as grupoencomun,e.notas_emisor,e.token_emisor,e.prioridad 
        FROM Emisor e, Barrios b 
        WHERE e.emisor_barrio = b.CodNew
        AND (
                TRIM(e.emisor_nombre) LIKE '%${query.trim()}%'
                OR TRIM(e.emisor_nombrecomercial) LIKE '%${query.trim()}%' 
                OR TRIM(e.cedula_emisor) LIKE '%${query.trim()}%' 
            )
        `;
        //LIKE '%"+query+"%'
        pool.query(sql, [query, query], function (err, rows, fields) {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows);
        })
    });
}

Emisor.obtenerEmisores = () => {
    return new Promise((resolve, reject) => {
        pool.query(`
        SELECT e.emisor_nombre,e.estado_emisor,e.emisor_nombrecomercial, e.id as idemisor,u.usuario, u.id as idusuario FROM Emisor e, Usuario u, Permiso p WHERE e.id = u.idemisor AND e.estado_emisor='1' and p.id = u.idpermiso AND p.descripcion = 'superusuario' ORDER BY e.id ASC`, [], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve(rows);
        })
    })
}


Emisor.cargarEmisor = (idemisor) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT e.id,e.pos, e.activaCabys,e.emisor_nombre,e.emisor_nombrecomercial,e.emisor_tipo_identificacion,e.cedula_emisor,
        e.numero_emisor, e.emisor_barrio,e.emisor_otras_senas,e.emisor_telefono_codigopais,e.emisor_telefono_numtelefono,
        e.emisor_fax_codigopais, e.emisor_fax_numtelefono,e.emisor_correo,e.file_p12,e.pin_p12,e.key_username_hacienda,
        e.key_password_hacienda,e.casaMatriz,e.puntoVenta,e.codigo_actividad,e.tipo_codigo_servicio,e.codigo_servicio,
        e.Client_ID,e.API,e.TOKEN_API,e.numeroresolucion,e.fecharesolucion, e.autorizaSaldo, e.multi_sucursal,
        e.GrupoEnComun as grupoencomun ,e.logo,e.id,b.provincia, b.canton, b.distrito, b.CodNew 
        FROM Emisor e, Barrios b
        WHERE e.emisor_barrio = b.CodNew 
        AND e.id=${idemisor}`, [], (err, rows, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            console.log(rows);
            resolve(rows);
        })
    })
}

Emisor.obtenerCredencialesLlaveCriptografica = (idemisor, identrada, tipo) => {
    return new Promise((resolve, reject) => {
        let sql = '';
        if (tipo == '01') {
            sql = ` SELECT e.file_p12, e.pin_p12, e.key_username_hacienda, e.key_password_hacienda, 
            e.Client_ID, e.TOKEN_API, e.API,e.numero_emisor, e.emisor_tipo_identificacion,
            em.clavenumerica, em.fecha_factura, p.numero_proveedor,p.proveedor_tipo_identificacion 
            FROM Emisor e, Entrada em , Proveedor p
            WHERE em.id = ${identrada}
            AND em.idemisor = e.id 
            AND e.id = ${idemisor}
            AND em.idproveedor = p.id`;
        } else {

            sql = `SELECT file_p12, pin_p12, key_username_hacienda, key_password_hacienda, Client_ID, TOKEN_API, API FROM Emisor WHERE id=${idemisor}`;
        }
        pool.query(sql, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Emisor.obtenerCredencialesHaciendaParaRecepcion = (idfactura) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT em.key_username_hacienda, em.key_password_hacienda, em.TOKEN_API, em.API, em.Client_ID FROM Emisor em INNER JOIN Entrada e ON e.idemisor = em.id AND e.id = ?', [idfactura], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Emisor.existeEmisor = (id) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT cedula_emisor FROM Emisor WHERE id = ?', [id]
            , (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
    })
}


Emisor.obtenerIdEmisor = (emisor) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id FROM Emisor WHERE emisor_nombre =?", [emisor], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Emisor.listarEmisores = () => {
    return new Promise((resolve, reject) => {
        pool.query(`
            SELECT e.id, e.emisor_nombre FROM Emisor e where e.estado_emisor='1'
        `, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        });
    })
}


Emisor.actualizarEstado = (obj) => {

    return new Promise((resolve, reject) => {

        const { idemisor, estado } = obj;
        pool.query(`
            UPDATE Emisor SET estado_emisor = ${estado} WHERE id = ${idemisor}
        `, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}


Emisor.obtenerDatosHacienda = (idemisor) => {
    return new Promise((resolve, reject) => {

        pool.query(`
        
            SELECT e.casaMatriz, e.puntoVenta, e.file_p12 as llave, e.pin_p12 as clave 
            FROM Emisor e
            WHERE e.id = ${idemisor}
        `, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Emisor.obtenerArchivoP12 = (idemisor) => {
    return new Promise((resolve, reject) => {

        pool.query(`
            SELECT file_p12 FROM Emisor WHERE id = ${idemisor}
        `, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Emisor.obtenerPublicId = (idemisor) => {
    return new Promise((resolve, reject) => {

        pool.query(`
            SELECT public_id FROM Emisor WHERE id = ${idemisor}
        `, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Emisor.obtenerLogo = (idemisor) => {

    return new Promise((resolve, reject) => {
        pool.query(`
            SELECT logo FROM Emisor WHERE id = ${idemisor}
        `, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}


Emisor.obtenerTipoReporte = (idemisor) => {
    return new Promise((resolve, reject) => {

        pool.query(`
            SELECT pos FROM Emisor WHERE id=${idemisor}
        `, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}


Emisor.actualizarEstadoCodigosCabys = (obj) => {
    return new Promise((resolve, reject) => {
        const { estado, idemisor } = obj;
        pool.query('UPDATE Emisor SET activaCabys=? WHERE id = ? ', [estado, idemisor], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Emisor.obtenerEstadoCodigosCabys = (idemisor) => {

    return new Promise((resolve, reject) => {
        pool.query('SELECT activaCabys FROM Emisor WHERE id = ?', [idemisor], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Emisor.obtenerIdEmisorPorCedula = (cedula) => {

    return new Promise((resolve, reject) => {
        pool.query(`SELECT id FROM Emisor WHERE cedula_emisor = ?`, [cedula],
            (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
    })
}


Emisor.obtenerEmisoresVisitas = () => {

    return new Promise((resolve, reject) => {

        pool.query('SELECT id, emisor_nombre FROM Emisor WHERE estado_emisor = 1;',
            [], (err, rows, fields) => {

                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

Emisor.validarClaveActivacionProforma = (obj) => {

    return new Promise((resolve, reject) => {
        const { idemisor, clave } = obj;

        pool.query(`SELECT id FROM Emisor WHERE id = ? AND AutorizaSaldo =?`,
            [idemisor, clave], (err, rows, fields) => {

                if (err) {
                    return reject(err);
                }

                resolve(rows)
            })
    })
}

Emisor.obetnerNombreEmisor = (idemisor) => {
    return new Promise((resolve, reject) => {

        pool.query(`
            SELECT emisor_nombre FROM Emisor WHERE id = ${idemisor}
        `, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows)
        })
    })
}

Emisor.obtenerCercaPerimetral = (idemisor) => {

    return new Promise((resolve, reject) => {

        pool.query(`
            SELECT cerca_perimetral FROM Emisor WHERE id = ${idemisor}
        `, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows)
        })
    })
}

Emisor.obtenerCredencialesLlaveCriptograficaParaValidacion = (idemisor) => {

    return new Promise((resolve, reject) => {

        pool.query(`
        
            SELECT file_p12,pin_p12 FROM Emisor WHERE id = ${idemisor}
        `, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows)
        })
    })
}


Emisor.obtenerCorreoAdministrativo = (idemisor) => {

    return new Promise((resolve, reject) => {

        pool.query(`
            SELECT correo_administrativo FROM Emisor WHERE id=${idemisor}
        `, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Emisor.cargarDatosGlobales = () => {

    return new Promise((resolve, reject) => {

        pool.query(`

            SELECT client_id,TOKEN_API, API,tipo_codigo_servicio FROM Emisor Where id = 65
        `, [], (err, rows, fields) => {

            if (err) {
                return resolve(err);
            }

            resolve(rows);
        })
    })
}

Emisor.estadoMultisucursal = (idemisor) => {

    return new Promise((resolve, reject) => {

        pool.query(`SELECT multi_sucursal FROM Emisor WHERE id = ${idemisor}`, [],
            (err, rows, fields) => {

                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

Emisor.obtenerIdEmisorPorNombreComercial = (nombreComercial) => {

    return new Promise((resolve, reject) => {

        pool.query(`
            SELECT id FROM Emisor WHERE TRIM(emisor_nombrecomercial) = ${nombreComercial.trim()}
        `, [], (err, rows, fields) => {

            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Emisor.obtenerCedulaPorId = (idemisor) => {

    return new Promise((resolve, reject) => {

        pool.query('SELECT cedula_emisor from Emisor WHERE id =?', [idemisor], (err, rows, fields) => {

            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Emisor.obtenerSurcursalesPorGrupoEnComun = (texto) => {

    return new Promise((resolve, reject) => {

        pool.query('SELECT id,emisor_nombre,logo,emisor_nombrecomercial FROM Emisor WHERE grupoencomun =?',
            [texto], (err, rows, fields) => {

                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
    })
}


Emisor.obtenerNombreComercialPorId = (idemisor) => {

    return new Promise((resolve, reject) => {

        pool.query('SELECT emisor_nombre,emisor_nombrecomercial FROM Emisor WHERE id =?',
            [idemisor], (err, rows, fields) => {

                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

Emisor.obtenerDatosDeToken = (idemisor) => {

    return new Promise((resolve, reject) => {

        pool.query(`
        SELECT em.key_username_hacienda as userHacienda, em.key_password_hacienda as passHacienda, em.TOKEN_API, em.Client_ID
            FROM Emisor em 
        WHERE em.id = ${idemisor}
        `, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}
//SELECT cliente_nombre, idemisor,id FROM Cliente WHERE cliente_nombre LIKE '%cliente 1000%' OR cliente_nombre LIKE '%contado%';

Emisor.obtenerCliente1000 = (idemisor) => {

    return new Promise((resolve, reject) => {
        pool.query(`
            SELECT id FROM cliente WHERE contando = 1 AND idemisor= ${idemisor}
        `, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}


Emisor.obtenerBodegas = (idemisor) => {

    return new Promise((resolve, reject) => {

        pool.query(`
           SELECT id as idbodega, descripcion FROM Bodega WHERE idemisor = ${idemisor}
        `, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Emisor.obtenerTokenEmisor = token_emisor => {
    console.log(token_emisor);
    return new Promise((resolve, reject) => {

        pool.query(`SELECT id FROM Emisor WHERE TRIM(token_emisor) = ?`, [token_emisor],
            (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

Emisor.actualizarPrioridad = obj => {

    return new Promise((resolve, reject) => {
        console.log(obj);
        const { idemisor, prioridad } = obj;

        pool.query('UPDATE Emisor SET prioridad = ? WHERE id = ?',
            [prioridad, idemisor], (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

Emisor.obtenerIdEmisorPorPrioridadActivada = () => {
    return new Promise((resolve, reject) => {

       // pool.query(`SELECT count(id) as prioridadEmisores FROM Emisor WHERE prioridad = 1`, CAMBIO SYN
       pool.query(`SELECT count(id) as prioridadEmisores FROM factura WHERE tipo_factura = '01' AND status_factura IS NULL AND proforma is NULL and idemisor in (select id from emisor where estado_emisor=1) and (clavenumerica is not null or clavenumerica <> '')`,
            [], (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

Emisor.obtenerIdEmisorPorCantidad = () => {
    return new Promise((resolve, reject) => {

       // pool.query(`SELECT count(id) as prioridadEmisores FROM Emisor WHERE prioridad = 1`, CAMBIO SYN
       pool.query(`select idemisor,count(*) as contar from factura where  idemisor in (select id from emisor where estado_emisor=1) and proforma is null and status_factura is null and tipo_factura='04' and fecha_factura < '2023-12-30 00:00:00' group by idemisor order by count(*) desc`,
            [], (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
    })
}

Emisor.obtenerEstadoPrioridadPorId = idemisor => {

    return new Promise((resolve, reject) => {
        pool.query(`SELECT prioridad FROM Emisor WHERE id = ${idemisor}`,
            [], (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }

                resolve(rows);
            })
    })
}
module.exports = Emisor;