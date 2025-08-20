const jwt = require('jsonwebtoken');
require("dotenv").config({ path: '../variables.env' });

module.exports = (req, res, next) => {
    //autorizacion por medio del Header1
    const authHeader = req.get('Authorization');

    if (!authHeader) { // sino se envia el token0
        return res.status(403).json({ message: 'No autenticado' });
    }

    const token = authHeader.split(' ')[1]; //comentario de prueba1
    let verificarToken;
    try {
        verificarToken = jwt.verify(token, process.env.KEY)
    } catch (error) { // cae en el catch si el token no es valido
        error.statusCode = 500;
        return res.status(500).json({
            error: 'Token inválido'
        })
    }

    if (!verificarToken) { // si el token es valido pero tiene algun error
        const error = new Error('Sesion invalida');
        return res.status(401).json({
            error: 'La sesión ha expirado'
        })
    }

    // si el token pasa toda la verificacion entonces pasa al siguiente middleware
    next();
}
