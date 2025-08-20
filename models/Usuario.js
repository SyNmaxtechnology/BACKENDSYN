const pool = require("../db/config");
const bcrypt = require("bcrypt");
const { reject } = require("bcrypt/promises");
const salt = 10;
let Usuario = {};

Usuario.registrarUsuario = (obj) => {
    return new Promise(async(resolve, reject) => {
        const { idpermiso,idemisor,idbodega, usuario, contrasena, imagen } = obj;
        const contrasenaCifrada = await cifrarContrasena(contrasena);
        pool.query('INSERT INTO Usuario(idpermiso,idemisor,idbodega,usuario,contrasena,imagen) VALUES(?,?,?,?,?,?)', [idpermiso, idemisor,idbodega,usuario,contrasenaCifrada,imagen], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        })
    })
}

Usuario.actualizarUsuario = (obj) => {
    return new Promise(async(resolve, reject) => {
        const { idpermiso,idemisor, usuario, contrasena, imagen, id,idbodega } = obj;
        console.log(obj); 
        let query = '';

        if (typeof contrasena !== 'undefined' && contrasena != '' && contrasena != null) { // viene una nueva contrasena
            const nuevaContrasena = await cifrarContrasena(contrasena);
            query = 'UPDATE Usuario SET idpermiso=' + idpermiso + ',usuario="' + usuario + '", contrasena="' + nuevaContrasena + '", imagen="'+imagen+'", idbodega='+idbodega+' WHERE id=' + id;
        } else {
            query = 'UPDATE Usuario SET idpermiso=' + idpermiso + ',usuario="' + usuario + '", imagen="'+imagen+'", idbodega ='+idbodega+' WHERE id='+id;
        }

        console.log(query); 
        pool.query(query, [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        })
    })
}

Usuario.obtenerPermisoYUsuario = (usuario) => {
    return new Promise((resolve,reject) => {
        pool.query(`
            SELECT u.id,p.descripcion as permiso,e.logo, 
                u.usuario, u.contrasena 
                FROM Permiso p, Usuario u, Emisor e 
            WHERE u.usuario = ? 
            AND e.id = u.idemisor 
            AND u.idpermiso = p.id 
        `,
        [usuario], (err, rows, fields) => {
            if(err){
                return reject(err);
            }

            resolve(rows);
        })
    })
}

Usuario.obtenerUsuario = (obj) => {
    return new Promise((resolve, reject) => {
        const {usuario,idemisor}=obj;
        pool.query("SELECT u.id,u.idemisor,u.idpermiso, u.usuario, u.imagen, u.idbodega FROM Usuario u WHERE u.usuario=? AND u.idemisor =?", [usuario,idemisor],
            (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }
                //obtener el  objeto accesos
                if(rows.length === 0){ 
                    return reject('No hay resultados')
                } else {
                    const {id} = rows[0]
                    Usuario.obtenerAccesosPorIdUsuario(id).then(accesos => {
                
                        if(accesos.permisos.length === 0){
                            Usuario.obtenerPermisosNull().then(response => {
                                //console.log(response);
                                resolve({
                                    usuario: rows,
                                    accesos:  {
                                        permisos: response,
                                        objPermisos: {}
                                    }
                                });
                            })
                            .catch(err => {
                                reject(err);
                            }) 
                            
                        } else {
                            resolve({
                                usuario: rows,
                                accesos
                            });
                        }
                    }).catch(err => {
                        reject(err);
                    })  
                    
                }
            })
    })
}
Usuario.obtenerImagen = (usuario) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT imagen FROM Usuario WHERE usuario=?", [usuario],
            (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            })
    })
}
Usuario.obtenerPermisos = () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT id, descripcion FROM Permiso', [],
            (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            })
    })
}

Usuario.autenticarUsuario = (usuario) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT u.id, u.usuario, u.contrasena, u.imagen, p.descripcion as permiso, e.id as idemisor, e.emisor_nombrecomercial, e.estado_emisor FROM Usuario u, Permiso p, Emisor e  WHERE usuario=? AND u.idpermiso = p.id AND u.idemisor = e.id", [usuario],
            (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            })
    })
}
const cifrarContrasena = (contrasena) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(contrasena, salt, function(err, hash) {
            if (err) {
                return reject(err);
            }
            resolve(hash);
        })
    })
}

Usuario.compararContrasena = (pwd, hash) => {

    return bcrypt.compare(pwd, hash);
}


Usuario.obtenerUsuarios = () => {
    return new Promise((resolve,reject) => {
        pool.query('SELECT id, usuario FROM Usuario', [], (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        })
    })
}


Usuario.obtenerPermisoPorId = (idusuario) => {
    return new Promise((resolve,reject) => {
        pool.query(`
            SELECT p.descripcion FROM Permiso p, Usuario u
            WHERE u.id = ${idusuario}
            AND p.id = u.idpermiso`,[],(err,rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        })
    })
}

Usuario.obtenerId = (usuario) => {
    return new Promise((resolve,reject) => {
        pool.query("SELECT id FROM Usuario WHERE usuario =?",[usuario],(err,rows, fields) => {
            if (err) {
                return reject(err);
            }
            console.log(rows)
            resolve(rows);
        })
    })
}


Usuario.obtenerNombreUsuario = (id) => {
    return new Promise((resolve,reject) => {
        pool.query(`
        SELECT u.usuario, e.emisor_nombrecomercial,e.logo 
            FROM Usuario u, Emisor e WHERE u.id = ${id}
            AND u.idemisor = e.id;
        `,[],(err,rows,fields) => {
            if (err) {
                return reject(err);
            }
            console.log(rows)
            resolve(rows);
        })
    })
}

Usuario.obtenerUsuariosPorIdEmisor = (idemisor) => {

    return new Promise((resolve,reject) => {

        pool.query(`
            SELECT u.id, u.usuario FROM Usuario u, Permiso p WHERE u.idemisor = ?
            AND p.id = u.idpermiso
            AND p.descripcion <> 'superusuario' AND p.descripcion <> 'ruteo1'
        `,[idemisor],(err,rows,fields) => {
            if (err) {
                return reject(err);
            }
            console.log(rows)
            resolve(rows);
        })
    })

}


Usuario.obtenerUsuariosVisitasPorIdEmisor = (idemisor) => {

    return new Promise((resolve,reject) => {

        pool.query(`
            SELECT u.id, u.usuario FROM Usuario u, Emisor e 
            WHERE u.idemisor = e.id
            AND e.id = ${idemisor} 
        `,[],(err,rows,fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        })
    })
}


Usuario.obtenerAccesosPorIdUsuario = (idusuario) => {

    return new Promise ((resolve,reject) => {
        console.log(idusuario);
        pool.query(`
            SELECT id, idusuario,modulo,submenu, activo 
            FROM Accesos WHERE idusuario = ${idusuario}  
        `,[],(err,permisos,fields) => {
            if (err) {
                return reject(err);
            }

            let objPermisos = {
                documentos: {
                    activo: 0
                },
                reportes: {
                    ventas: {
                        activo: 0
                    },
                    compras: {
                        activo: 0
                    }, 
                    inventario: {
                        activo: 0
                    },
                    credito: {
                        activo: 0
                    },
                    visita: {
                        activo: 0
                    }
                },
                pos: {
                    activo: 0
                },
                cliente: {
                    activo: 0
                },
                proveedor: {
                    activo:0
                },
                producto: {
                    activo:0
                },
                articulo: {
                    activo:0
                },
                impuesto: {
                    activo:0
                },
                categoria: {
                    activo:0
                },
                descuento: {
                    activo:0
                },
                emisor: {
                    activo:0
                },
                visita: {
                    activo:0
                },
                usuario: {
                    activo:0
                }
            };
            //documentos
        

            for(const documento of permisos){
                if(documento.modulo === 'documentos'){
                    if(documento.activo == 1){
                        objPermisos.documentos.activo = 1;
                    } 
                    objPermisos.documentos[documento.submenu] = documento.activo;
                }

                if(documento.modulo === 'reportes'){
                    if(documento.submenu.split('/')[0] === 'ventas'){
                        console.log("1")
                        objPermisos.reportes.ventas[documento.submenu.split('/')[1]] = documento.activo;
                        if(documento.activo == 1){
                            objPermisos.reportes.ventas.activo = 1;
                            objPermisos.reportes.activo = 1;
                        }
                    }

                    if(documento.submenu.split('/')[0] === 'compras'){
                        console.log("2")

                        objPermisos.reportes.compras[documento.submenu.split('/')[1]] = documento.activo;
                        if(documento.activo == 1){
                            objPermisos.reportes.compras.activo = 1;
                            objPermisos.reportes.activo = 1;
                        }
                    }

                    if(documento.submenu.split('/')[0] === 'inventario'){
                        console.log("3")
                        objPermisos.reportes.inventario[documento.submenu.split('/')[1]] = documento.activo;
                        if(documento.activo == 1){    
                            objPermisos.reportes.inventario.activo = 1;
                            objPermisos.reportes.activo = 1;
                        }
                    }

                    if(documento.submenu.split('/')[0] === 'credito'){
                        console.log("4")
                        objPermisos.reportes.credito[documento.submenu.split('/')[1]] = documento.activo;
                        if(documento.activo == 1){
                            objPermisos.reportes.credito.activo = 1;
                            objPermisos.reportes.activo = 1;
                        }
                    }

                    if(documento.submenu.split('/')[0] === 'visita'){
                        console.log("5")
                        objPermisos.reportes.visita[documento.submenu.split('/')[1]] = documento.activo;
                        if(documento.activo == 1){
                            objPermisos.reportes.visita.activo = 1;
                            objPermisos.reportes.activo = 1;
                        }
                    }
                }

                if(documento.modulo === 'pos'){
                    if(documento.activo == 1){
                        objPermisos.pos.activo = 1;
                    } 
                    objPermisos.pos[documento.submenu] = documento.activo;
                }
                if(documento.modulo === 'cliente'){
                    if(documento.activo == 1){
                        objPermisos.cliente.activo = 1;
                    } 
                    objPermisos.cliente[documento.submenu] = documento.activo;
                }

                if(documento.modulo === 'proveedor'){
                    if(documento.activo == 1){
                        objPermisos.proveedor.activo = 1;
                    } 
                    objPermisos.proveedor[documento.submenu] = documento.activo;
                }

                if(documento.modulo === 'producto'){
                    if(documento.activo == 1){
                        objPermisos.producto.activo = 1;
                    } 
                    objPermisos.producto[documento.submenu] = documento.activo;
                }

                if(documento.modulo === 'ariculo'){ // categoria
                    if(documento.activo == 1){
                        objPermisos.articulo.activo = 1;
                    } 
                    objPermisos.articulo[documento.submenu] = documento.activo;
                }

                if(documento.modulo === 'categoria'){ // categoria
                    if(documento.activo == 1){
                        objPermisos.categoria.activo = 1;
                    } 
                    objPermisos.categoria[documento.submenu] = documento.activo;
                }

                if(documento.modulo === 'descuento'){ // categoria
                    if(documento.activo == 1){
                        objPermisos.descuento.activo = 1;
                    } 
                    objPermisos.descuento[documento.submenu] = documento.activo;
                }

                if(documento.modulo === 'emisor'){ // categoria
                    if(documento.activo == 1){
                        objPermisos.emisor.activo = 1;
                    } 
                    objPermisos.emisor[documento.submenu] = documento.activo;
                }

                if(documento.modulo === 'visita'){ // categoria
                    if(documento.activo == 1){
                        objPermisos.visita.activo = 1;
                    } 
                    objPermisos.visita[documento.submenu] = documento.activo;
                }

                if(documento.modulo === 'usuario'){ // categoria
                    if(documento.activo == 1){
                        objPermisos.usuario.activo = 1;
                    } 
                    objPermisos.usuario[documento.submenu] = documento.activo;
                }

                if(documento.modulo === 'impuesto'){ // categoria
                    if(documento.activo == 1){
                        objPermisos.impuesto.activo = 1;
                    } 
                    objPermisos.impuesto[documento.submenu] = documento.activo;
                }
            }
            
            //reportes 
            console.log(objPermisos);
            resolve({objPermisos, permisos});
        })
    })
}

Usuario.obtenerPermisosNull = () => {

    return new Promise((resolve,reject) => {
        pool.query('SELECT idusuario,modulo,submenu,activo FROM Accesos WHERE idusuario IS NULL;',
        [],(err,rows,fields) => {
            if(err){
                return reject(err);
            }
            console.log(rows);
            resolve(rows);
        })
    })
}

Usuario.esSuperUsuario = (obj) => {

    return new Promise((resolve,reject) => {
        const {idemisor, idusuario} = obj;
        const sql = `SELECT p.descripcion FROM Permiso p, Usuario u WHERE u.idemisor =${idemisor} AND p.id = u.idpermiso AND u.id = ${idusuario}`;
        console.log(sql)
        pool.query(sql,
            [idemisor,idusuario],(err,rows,fields) => {
            if(err){
                return reject(err);
            }
            console.log(rows);
            resolve(rows);
        })
    })
}


Usuario.obtenerUsuarioPorId = (obj) => {

    return new Promise((resolve,reject) => {

        const {idcliente,idemisor} = obj;
        const sql = `
            SELECT u.usuario 
                FROM Cliente c, Usuario u 
                WHERE c.idemisor = ${idemisor} 
                AND c.agente = u.id 
                AND c.id = ${idcliente}
        `;
        console.log(sql);
        pool.query(sql,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }
            resolve(rows);
        })

        /*
            SELECT u.usuario FROM Usuario u, Cliente c, Emisor e
            WHERE e.id = ${idemisor}
            AND c.idemisor = e.id 
            AND c.id = ${idcliente}
            AND u.idemisor = e.id
            AND c.agente = u.id 
        */
    })
}


Usuario.obtenerSuperUsuarioPorIdEmisor = (idemisor) => {

    return new Promise((resolve,reject) => {

        pool.query(`
            SELECT u.id,u.usuario FROM usuario u, permiso p
            WHERE u.idemisor = ${idemisor}
            AND u.idpermiso = p.id
            AND p.descripcion = 'superusuario'
        `,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }
            resolve(rows);
        })
    })
}

Usuario.obtenerGrupoEnComun = (idusuario) => {
    return new Promise((resolve,reject) => {

        pool.query(`
            SELECT e.GrupoEnComun  from Emisor e, Usuario u 
            where e.id = u.idemisor
            and u.id = ${idusuario}
        `,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }
            resolve(rows);
        })
    })
}

Usuario.obtenerIdemisorPorIdUsuario = (idusuario) => {

    return new Promise((resolve,reject) => {

        pool.query(`
            SELECT u.idemisor FROM Usuario u WHERE id = ${idusuario}
        `,[],(err,rows,fields) => {
            if(err){
                return reject(err);
            }
            resolve(rows);
        })
    })
}
module.exports = Usuario;