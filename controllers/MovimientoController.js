const Existencia = require("../models/Existencia");
const Movimiento = require("../models/Movimiento");
const MovimientoDetalle = require("./MovimientoDetalleController");
const jwt = require("jsonwebtoken");
const { response } = require("express");
const tipoAJuste = require("../ServiciosWeb/TipoMovimiento");
global.errorEntrada = false;
global.errorSalida = false;
global.errorTraslado = false;

const rutaNuevoMovimiento = async (req, res) => {

    const authHeader = req.get('Authorization'); //com
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    const {tipomovimiento, descripcionmovimiento, costoajuste, ajustes} = req.body;
    

    console.log(tipomovimiento);
    console.log(descripcionmovimiento);
    console.log(costoajuste);
  
    if(tipomovimiento == '01'){ //ENTRADA
        nuevoMovimiento({
            idusuario, idemisor, tipomovimiento, descripcionmovimiento, costoajuste
        }).then(responseMovimiento => {
    
            const {affectedRows, insertId} = responseMovimiento;
            const idajuste = insertId;
    
            if(affectedRows >  0) {

                for(let ajuste of ajustes){
    
                    const { idbodega, idarticulo, cantidad, idbodorigen,idboddestino,costoarticulo,costolinea}  = ajuste;
                    console.log("idbodega",idbodega);
                    Existencia.obtenerExistenciaPorArticuloYbodega({
                        idbodega, idarticulo,idemisor
                    }).then(responseExistencia => {
                
                            if(responseExistencia.length === 0){ // no existe agregar el artiuculo en la existencia con la bodega
    
                            //insertar la linea de ajuste
    
                            MovimientoDetalle.agregarAJuste({
                                idajuste, idarticulo,idbodorigen: idbodega,idboddestino: idbodega,cantidad,costoarticulo,costolinea
                            })
                            .catch(err => {
                                console.log(err);
                                console.log("Error en el servidor agregar ajuste")
                                console.log("No sepudo agregar el detalle del ajuste")
                                global.errorEntrada = true;
                            })
                            //-----------------------------------------
                            //actualizar el stock
                            Existencia.nuevaExistencia({
                                idarticulo,idemisor,idbodega,cantidad
                            }).then(responseNuevaExistencia => {
                                const {affectedRows} = responseNuevaExistencia;
    
                                if(affectedRows === 0) {
    
                                    console.log("No se pudo agregar la linea a existencia")
                                    global.errorEntrada = true;
                                    
                                }
                            })
                            .catch(err => {
                                console.log("Error en el servidor nueva existencia")
                                console.log("error ", err);
                                global.errorEntrada = true;

                            })
                            
                        } else  { // actualiza la existencia 
                            
                            //insertar la linea de ajuste
                            MovimientoDetalle.agregarAJuste({
                                idajuste, idarticulo,idbodorigen: idbodega,idboddestino: idbodega,cantidad,costoarticulo,costolinea
                            })
                            .catch(err => {
                                console.log(err);
                                console.log("Error en el servidor ajuste detalle")
                                global.errorEntrada = true;
                                
                            })
    
                            //-----------------------------------------  actualizar el stock
                            //cantidad,idarticulo,idbodega,idemisor,tipo
                            Existencia.actualizarStockMovimiento({
                                cantidad,idarticulo,idbodega,idemisor, tipo: 'SUMA'
                            }).then(responseExistencia => {
                                console.log(responseExistencia);
                                if(responseExistencia[0][0].OK != 'OK'){
                                    console.log("no se pudo actualizar la existencia")
                                    
                                    global.errorEntrada = true;
                                    
                                }
                            })
                            .catch(err => {
                                console.log("Error en el servidor actualizar stock")
                                console.log(err);
                                global.errorEntrada = true;
                                        
                            })
                        }
                    })
                }

                console.log("ERROR ENTRADA",global.errorEntrada)
                if(global.errorEntrada == true){
                    global.errorEntrada = false;
                    res.status(400).json({
                        message: 'Ha ocurrido un error que no permitió el movimiento de stock'
                    });
                } else {
                    res.status(201).json({
                        message: 'Movimiento generado'
                    });
                }
    
            } else {
                
                res.status(400).json({
                    message: 'No se pudo guardar el movimiento'
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Ha ocurrido un error en el servidor'
            });
        })
    } else  if(tipomovimiento == '02'){ //SALIDA

        try {
            
            let mensaje = '';
            for(let ajuste of ajustes){

                const { idbodega, idarticulo, cantidad, idbodorigen,idboddestino,costoarticulo,costolinea, descripcion, bodega}  = ajuste;

                    const existencia = await Existencia.obtenerExistenciaPorArticuloYbodega({
                        idbodega, idarticulo,idemisor
                    });


                    if(existencia.length === 0){ // no existe agregar el artiuculo en la existencia con la bodega

                        mensaje += 'El artículo <b>'+descripcion+'</b> no existe en la bodega <b>'+bodega+'</b> \n';
                        console.log("error ", errorSalida);
                        global.errorSalida = true;
                        //throw new Error(mensaje)  
                    } else {
                        //verficar que la existencia de la bodega origen sea igual a la cantidad de la salida por cada articulo
                        const cantidadExistencia = await Existencia.obtenerExistencia({
                            idemisor,
                            idbodega,
                            idarticulo
                        });


                        if(Number(cantidad) > Number(cantidadExistencia[0].existencia_actual) ){
                            mensaje+= 'La cantidad del artículo <b>'+descripcion+'</b> es insuficiente en la bodega <b>'+bodega+'.</b>';

                            console.log("error ", errorSalida);
                            global.errorSalida = true;
                        }

                    }
            }

            if(global.errorSalida == true){
                //const error =new  Error(mensaje);
                global.errorSalida = false;
                return res.status(400).json({
                    message:mensaje
                })
            } else {

                const agregarMovimiento= await  nuevoMovimiento({
                    idusuario, idemisor, tipomovimiento, descripcionmovimiento, costoajuste
                })
        
                const {affectedRows, insertId} = agregarMovimiento;
                const idajuste = insertId;

                if(affectedRows  === 0){
                    global.errorSalida = false;
                    return res.status(400).json({
                        message: 'No se pudo agregar el ajuste'
                    })
                } else {

                    for(let ajuste of ajustes){
                        const { idbodega, idarticulo, cantidad,costoarticulo,costolinea}  = ajuste;

                        const agregarAjuste = await  MovimientoDetalle.agregarAJuste({
                            idajuste, idarticulo,idbodorigen: idbodega,idboddestino: idbodega,cantidad,costoarticulo,costolinea
                        });
                        const { affectedRows } = agregarAjuste;
                        if(affectedRows == 0){
                            global.errorSalida = true;
                            throw new Error('No se pudo agregar el movimiento');
                        } else {
            
                            const restarExistencia = await Existencia.actualizarStockMovimiento({
                                cantidad,idarticulo,idbodega,idemisor, tipo: 'RESTA'
                            })
            
                            if(restarExistencia[0][0].OK != 'OK'){
                                console.log("No se pudo actualizar la existencia")
                                global.errorSalida = true;
                                throw new Error('No se pudo actualizar la existencia')
                            }
                        }
                    }

                    if(global.errorSalida == false){
                       return res.status(201).json({
                            message: 'Movimiento Generado'
                        })
                    }
                }
            }        
        }catch(err){
            console.log(err);
            res.status(400).json({
                message: err
            });
        }
               
    } else { //TRASLADO

        try {
            let mensaje = '';
            for(let ajuste of ajustes){ // todos los articulos deben existir en la bodega de origen

                const { idarticulo, idbodorigen, bodega, descripcion,cantidad}  = ajuste;
                const existencia = await Existencia.obtenerExistenciaPorArticuloYbodega({
                    idbodega: idbodorigen, idarticulo,idemisor
                });

                if(existencia.length === 0){
                    mensaje += 'El artículo <b>'+descripcion+'</b> no existe en la bodega <b>'+bodega+'</b> \n';
                    console.log("error ", global.errorTraslado);
                    global.errorTraslado = true;
                } else  { // validar que la cantidad sea suficiente para hacer el traslado

                    const cantidadExistencia = await Existencia.obtenerExistencia({
                        idemisor,
                        idbodega: idbodorigen,
                        idarticulo
                    });


                    if(Number(cantidad) > Number(cantidadExistencia[0].existencia_actual) ){
                        mensaje+= 'La cantidad del artículo <b>'+descripcion+'</b> es insuficiente en la bodega <b>'+bodega+'.</b>';

                        console.log("error ", errorTraslado);
                        global.errorTraslado = true;
                    }
                }   
            }
            // const { idbodega, idarticulo, cantidad, idbodorigen,idboddestino,costoarticulo,costolinea, descripcion, bodega}  = ajuste;

            if(global.errorTraslado == true){
                global.errorTraslado = false;
                res.status(400).json({
                    message: mensaje
                })
            } else  {

                const agregarMovimiento= await  nuevoMovimiento({
                    idusuario, idemisor, tipomovimiento, descripcionmovimiento, costoajuste
                })

                const {affectedRows, insertId} = agregarMovimiento;

                if(affectedRows > 0){
                    const idajuste = insertId;
                    for(let ajuste of ajustes ){
                    
                        const { idarticulo, cantidad, idbodorigen,idboddestino,costoarticulo,costolinea}  = ajuste;
                    
                        //restar en bodega origen
                        const existenciaBodegaDestino = await Existencia.obtenerExistenciaPorArticuloYbodega({
                            idbodega: idboddestino, idarticulo,idemisor
                        });
                        
                        if(existenciaBodegaDestino.length === 0){
                            
                            //sumar a bodega destino
                            const nuevaExistenciaDestino = await  Existencia.nuevaExistencia({
                                idarticulo,idemisor,idbodega: idboddestino,cantidad
                            })
                                const {affectedRows} = nuevaExistenciaDestino;
    
                            if(affectedRows === 0) {
                                console.log("No se pudo agregar la nueva existencia")
                                global.errorTraslado = true;
                                throw new Error('No se pudo actualizar la existencia')
                            }

                            //restar en bodega origen
                            const restarExistencia = await Existencia.actualizarStockMovimiento({
                                cantidad,idarticulo,idbodega:idbodorigen,idemisor, tipo: 'RESTA'
                            })
        
                            if(restarExistencia[0][0].OK != 'OK'){
                                console.log("No se pudo restar la existencia")
                                global.errorTraslado = true;
                                throw new Error('No se pudo actualizar la existencia')
                            }
                            
                            const agregarAjuste = await  MovimientoDetalle.agregarAJuste({
                                idajuste, idarticulo,idbodorigen,idboddestino,cantidad,costoarticulo,costolinea
                            });
                            if(agregarAjuste.affectedRows == 0){
                                global.errorTraslado = true;
                                throw new Error('No se pudo agregar la linea del ajuste');
                            } 

                        } else {
    
                            const restarExistencia = await Existencia.actualizarStockMovimiento({
                                cantidad,idarticulo,idbodega:idbodorigen,idemisor, tipo: 'RESTA'
                            })
        
                            if(restarExistencia[0][0].OK != 'OK'){
                                console.log("No se pudo restar la existencia")
                                global.errorTraslado = true;
                                throw new Error('No se pudo actualizar la existencia')
                            }
        
                            //sumar en bodega destino
        
                            const sumarExistencia = await Existencia.actualizarStockMovimiento({
                                cantidad,idarticulo,idbodega:idboddestino,idemisor, tipo: 'SUMA'
                            })
        
                            if(sumarExistencia[0][0].OK != 'OK'){
                                console.log("No se pudo sumar la existencia")
                                global.errorTraslado = true;
                                throw new Error('No se pudo actualizar la existencia')
                            }
    
                            const agregarAjuste = await  MovimientoDetalle.agregarAJuste({
                                idajuste, idarticulo,idbodorigen,idboddestino,cantidad,costoarticulo,costolinea
                            });
                            if(agregarAjuste.affectedRows == 0){
                                global.errorTraslado = true;
                                throw new Error('No se pudo agregar la linea del ajuste');
                            } 
                        }
                    }

                    if(global.errorTraslado == false){
                        res.status(201).json({
                            message: 'El traslado de stock ha sido generado'
                        })
                    }

                } else {
                   global.errorTraslado = false;
                   return res.status(400).json({
                        message: 'No se pudo agregar el movimiento'
                    })
                }
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Ha ocurrido un error en el servidor'
            })
        }
    }
}

const rutaObtenerAJustes = (req, res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const { tipomovimiento,idcategoria,idbodega,fechaInicio,fechaFin,articulo } =req.body;
    console.log(req.body);

    Movimiento.obtenerAJustes({
        tipomovimiento,idcategoria,idbodega,fechaInicio,fechaFin,articulo,idemisor
    }).then(response => {
        if(response.length === 0){
            res.status(404).json({
                message: 'No hay resultados'
            });
        } else {
            res.status(200).json({
                ajustes: response
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Hubo un error en el servidor'
        })
    })

}


const rutaTipoAjuste = (req,res) => {

    try {
        res.status(200).json({
            tipoAJuste: tipoAJuste()
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Ha ocurrido un error en el servidor'
        })
    }
}

const nuevoMovimiento = (obj) => {

    return Movimiento.nuevoMovimiento(obj);
}


module.exports = {
    nuevoMovimiento,
    rutaNuevoMovimiento,
    rutaTipoAjuste,
    rutaObtenerAJustes
}