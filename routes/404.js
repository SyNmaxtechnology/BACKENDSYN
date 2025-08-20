module.exports = (req,res) => { //comentario01
    res.status(404).json({
        message: 'Recurso no encontrado'
    })
}
