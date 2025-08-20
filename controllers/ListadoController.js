const open = require('open')

exports.cargarVistaComprobantes = (req, res) => {

    const host = 'http://' + req.headers.host;
    const url = host + '/comprobantes';
    const facturas = []

    res.render('ListadoComprobantes', {
        numeroRegistros: facturas.length,
        filtros: '',
        tipoFiltro: '',
        facturas
    });
}