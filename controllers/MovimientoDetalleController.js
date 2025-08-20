const MovimientoDetalle = require("../models/Movimiento_Detalle");


const agregarAJuste = (obj) => {

    return MovimientoDetalle.agregarAjuste(obj);
}


module.exports = {
    agregarAJuste
}


/*

    else  { // actualiza la existencia 
                            
                            //insertar la linea de ajuste
                            MovimientoDetalle.agregarAJuste({
                                idajuste, idarticulo,idbodorigen,idboddestino,cantidad,costoarticulo,costolinea
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    message: 'Ha ocurrido un error en el servidor'
                                });
                            })
    
                            //-----------------------------------------  actualizar el stock
         
                            Existencia.actualizarStock({
                                cantidad, idarticulo,idemisor, idbodega
                            }).then(responseExistencia => {
                                if(responseExistencia[0][0].mensaje != 'OK'){
                                    res.status(400).json({
                                        message: ' No se pudo guardar el movimiento'
                                    })
                                }
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    message: 'Ha ocurrido un error en el servidor'
                                });
                            })
                        }

*/