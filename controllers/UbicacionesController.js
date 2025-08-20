const Ubicacion = require("../functions/Ubicacion");

exports.obtenerProvincias = (req, res) => {

    Ubicacion.obtenerProvincias()
        .then(provincias => {
            if (provincias.length > 0) {
                res.status(200).json({ provincias });
            }
        }).catch(err => console.log(err));
}

exports.obtenerCantones = (req, res) => {
    const { idprovincia } = req.params;

    Ubicacion.obtenerCantones(idprovincia)
        .then(cantones => {
            if (cantones.length > 0) {
                res.status(200).json({ cantones });
            }
        }).catch(err => console.log(err));
}

exports.obtenerDistritos = (req, res) => {

    const { idcanton, idprovincia } = req.params;
    console.log("controlador", req.params);
    const obj = {
        idcanton,
        idprovincia
    };

    Ubicacion.obtenerDistritos(obj)
        .then(distritos => {
            if (distritos.length > 0) {
                res.status(200).json({ distritos });
            }
        }).catch(err => console.log(err));
}

exports.obtenerBarrios = (req, res) => {
    const { idcanton, idprovincia, iddistrito } = req.params;
    const obj = {
        idcanton,
        idprovincia,
        iddistrito
    };

    Ubicacion.obtenerBarrios(obj)
        .then(barrios => {
            console.log(barrios);
            if (barrios.length > 0) {
                res.status(200).json({ barrios });
            }
        }).catch(err => console.log(err)); // comentario de prueba
}