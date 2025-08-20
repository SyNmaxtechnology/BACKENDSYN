const ResultadoEncuestaRequerimiento = require("../models/ResultadoEncuestaRequerimiento");
const jwt = require("jsonwebtoken");

const agregarRespuesta = async (req,res) => {

    try {
        
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const idusuario = decodedToken.uid;
        const { resultados} = req.body;


        for(const {idcliente,idpregunta,requerimiento,cantidad,observacion} of resultados){
           const {affectedRows} = await ResultadoEncuestaRequerimiento.agregarRespuesta(
               {idcliente,idusuario,idemisor,idpregunta,requerimiento,cantidad,observacion}
            );
           if(affectedRows === 0){
               throw new Error('dont_saved_answer');
           }
        }

        res.status(201).json({
            message: 'Preguntas agregadas'
        });

    } catch (error) {
        if(err.message.toString() === 'err_saved_answer') {
            return res.status(500).json({
                message: 'Error al guardar las respuestas'
            })
        } else if(err.message.toString() === 'dont_saved_answer'){
            return res.status(400).json({
                message: 'No se pudieron guardar las respuestas'
            })
        } else {
            return res.status(500).json({
                message: 'Ocurrio un error'
            })
        }
    }
}

const obtenerDatosReporteRequerimientos = (req,res) => {

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.KEY);
    const idemisor = decodedToken.id;
    const idusuario = decodedToken.uid;
    const { idcliente, fechaInicio,fechaFin,tipoReporte,idpregunta} = req.body;
    console.log(req.body);
    if(tipoReporte == 'requerimiento'){
        ResultadoEncuestaRequerimiento.obtenerDatosReporteRequerimientos({ idcliente, fechaInicio,fechaFin,tipoReporte,idemisor,idpregunta})
        .then(response => {

            console.log(response);

            //res.status(200).json({requerimientos: response})
            ResultadoEncuestaRequerimiento.obtenerTotalEncuestas({ idcliente, fechaInicio,fechaFin,tipoReporte,idemisor,idpregunta})
                .then((totales) => {
//obtenerPreguntas
                    ResultadoEncuestaRequerimiento.obtenerPreguntas({fechaInicio,fechaFin,idemisor,idpregunta}).then(preguntas => {

                        const totalSeleccionados = totales[0].total;

                        for(const req1 of response){

                            req1.coincidencia = Number((req1.cantidadSeleccionado * 100 ) / totalSeleccionados).toFixed(2);
                                
                            if(!req1.cantidadPotencial || req1.cantidadPotencial === 0){
                                req1.cantidadPotencial = 0;
                            }
                        }   


                        res.status(200).json({
                            requerimientos: {
                                total: totales[0].total,
                                requerimientos: response,
                            },
                            preguntas
                        });

                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            message: 'Error al cargar los datos del reporte'
                        })
                    })
                })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    message: 'Error al cargar los datos del reporte'
                })
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Error al cargar los datos del reporte'
            })
        })
    } else {
        ResultadoEncuestaRequerimiento.obtenerDatosReporteRequerimientos({ idcliente, fechaInicio,fechaFin,tipoReporte,idemisor})
        .then(response => res.status(200).json({
            clientes: response
        }))
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Error al cargar los datos del reporte'
            })
        })
    }

}

module.exports = {
    agregarRespuesta,
    obtenerDatosReporteRequerimientos
}