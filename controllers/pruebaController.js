exports.probarPOST = (req, res) => {
    const { nombre, apellido, id } = req.body;

    if (typeof nombre !== 'undefined' && typeof apellido !== 'undefined' && typeof id !== 'undefined') {
        res.json({ mensaje: 'Funciona' })
    } else {
        res.status(500).json({ mensaje: 'no Funciona' })
    }

}