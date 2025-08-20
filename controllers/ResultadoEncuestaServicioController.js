const ResultadoEncuestaServicio = require("../models/ResultadoEncuestaServicio");
const jwt = require('jsonwebtoken');
const { obtenerUsuarioPorIdCliente } = require("./ClienteController");

const agregarResultado = async (req,res) => {

    try {

        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const { resultados } = req.body;
        const [...agente] = await obtenerUsuarioPorIdCliente({idemisor,idcliente: resultados[0].idcliente})
        
        //[...agente] sacar una copia de un array
        //{...agente} sacar una copia de un objeto
        //const idusuario = resultados
        
        for (const resultado of resultados) {
            const {idcliente,calificacion,observacion,idpregunta} = resultado;
            ResultadoEncuestaServicio.agregarResultado({idusuario: agente[0].agente,idemisor,idcliente,calificacion,observacion,idpregunta});
        }

        res.status(201).json({
            message: 'Las respuestas se han guardado'
        });

    } catch (err) {
        const message = err.message ? err.message: err;
        if(message == 'failed_save_result' ) {
            return res.status(500).json({
                message: 'Error al insertar las respuestas'
            })
        } else if(message == 'dont_saved_result'){
            return res.status(500).json({
                message: 'No se pudo insertar las repsuestas'
            })
        } else {
            return res.status(500).json({
                message: 'Hubo un error en el servidor'
            })
        }
    }
}


const obtenerDatosReporteResultadosEncuestaServicio = async (req,res) => {

    try {
    
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.KEY);
        const idemisor = decodedToken.id;
        const { idpregunta,idusuario,fechaInicio,fechaFin } = req.body;

        const preguntas = await ResultadoEncuestaServicio.obtenerResultadosEncuestaServicio({idemisor,idusuario,idpregunta,fechaInicio,fechaFin})
        const promedios = await ResultadoEncuestaServicio.obtenerResultadosConPromedio({idemisor,idusuario,idpregunta,fechaInicio,fechaFin});
        console.log(preguntas);
        res.status(200).json({
            preguntas,
            promedios
        });

    } catch (error){
        console.log(error);
        res.status(500).json({
            message: 'Error al cargar la informacion del reporte'
        });
    }
}
module.exports = {
 agregarResultado,
 obtenerDatosReporteResultadosEncuestaServicio
}
