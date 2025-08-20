const express = require('express');//comentario de prueba123567890.
const timeout = require("connect-timeout");
const app = express();
const http = require('http');
const bodyParser = require('body-parser');
const cors = require("cors");
const path = require("path");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require("./Passport/passport");
//const morgan = require("morgan");
//Rutas del sistema
const productosRoutes = require("./routes/productos");
const descuentosRoutes = require("./routes/Descuentos");
const categoriasRoutes = require('./routes/Categorias');
const clientesRoutes = require("./routes/Clientes");
const parametrosRoutes = require("./routes/Parametros");
const emisorRoutes = require("./routes/Emisor");
const ubicacionRoutes = require("./routes/Ubicacion");
const facturasRoutes = require("./routes/Facturas");
const TiposImpestoRoutes = require("./routes/TiposImpuesto");// comentario
const listadoRoutes = require("./routes/Listado");
const UsuariosRoutes = require("./routes/Usuario");
const AuthRoutes = require("./routes/Auth");
const RecepcionRoutes = require("./routes/Recepcion");
const EntradaRoutes = require("./routes/Entradas");
const proveedorRoutes = require("./routes/Proveedor");
const articuloRoutes = require("./routes/Articulo");
const FacturaCompraRouest = require("./routes/FacturaCompra");
const ExcelRoutes = require("./routes/Excel");
const RecetaRoutes = require("./routes/Receta");
const BodegaRoutes = require("./routes/Bodega");
const ExistenciaRoutes = require("./routes/Existencia");
const MovimientoRouest = require("./routes/Movimiento");
const noEncontrado = require("./routes/404");
const googelRouest = require("./routes/google");
const PosRoutes = require("./routes/pos");
const codigoCabysRoutes = require("./routes/CodigoCabys");
const accesosRoutes = require("./routes/Accesos");
const visitasRoutes = require("./routes/Visitas");
const FacturasNoEnviadas = require("./controllers/FacturasNoEnvidasController");
const d151Routes = require("./routes/d151");
const HomeRoutes = require("./routes/Home");
const entradasCredito = require("./routes/MovimientosCxp");
const cuentasRoutes = require("./routes/Cuentas");
const movimientosBancosRoutes = require("./routes/MovimientosBancos");
const RazonNoVenta = require('./routes/RazonNoVenta');//com
const EncuestaServicioRoutes = require('./routes/EncuestaServicio');
const ResultadoEncuestaServicioRoutes = require('./routes/ResultadoEncuestaServicio');
const EncuestaRequerimientoRoutes = require('./routes/EncuestaRequerimiento');
const ResultadoEncuestaRequerimientoRoutes = require('./routes/ResultadoEncuestaRequerimiento');
const cantidad = 5;

//require("./subprocesos"); ///DESHABILITA LOS JOBS SYN

//------------------------- API INTREGADA------------------------------------------------------------------------
const apiFacturaRoutes = require('./api_registro_facturas/routes/facturaRoute');
// token para subir csmbios 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
const listaBlanca = ['http://localhost:4200', 'https://www.facturewebcr.com'];
const corsOptions = {
    origin: (origin, callback) => { // el parametro origin es la ip que trata de hacer 
        //un request al servidor
        console.log(origin)
        const existe = listaBlanca.some(dominio => dominio === origin); // si la ip entrante existe 
        //la funcion some devuelv true o false si el elemento en comparacion existe en un array
        //en la lista blanca, some indica si existe

        if (existe) {
            callback(null, true); // el primer parametro es un error, en este caso es null 
            //porque la ip es permitida, el segundo parametro es si el valor es permitido y 
            //en este caso va el true
        } else { //error generado por cors al no dar acceso a la API
            // callback(new Error('No permitido por CORS'));
            const data = {
                ok: false,
                error: 'La url no tiene permisos de acceso'
            };
            const respuesta = JSON.stringify(data);
            callback(respuesta, false);
        }
    }
}

//habilitar cors para dar acceso remoto a clientes que van a consumir la api
app.use(timeout(120000))
app.use(cors());//configurar el cors
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
//app.use(morgan('tiny'));
app.use(express.static('public/imagenes')); // hacer publica la carpeta public
app.use(express.static('public/p12_files')); // hacer publica la carpeta public 
app.use(express.static('public/img_productos/recortadas'));
app.use(express.static('pdf'));
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

//configurar PUG 
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'pug');
//
app.disable('x-powered-by');
//---------------------------------------------------------------------------------------------------------------
/*

    app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit:50000
}));
*/


//rutas del sistema
app.use("/", productosRoutes());
app.use("/", descuentosRoutes());
app.use("/", categoriasRoutes());
app.use("/", clientesRoutes());
app.use("/", parametrosRoutes());
app.use("/", emisorRoutes());
app.use("/", ubicacionRoutes());
app.use("/", facturasRoutes());
app.use("/", TiposImpestoRoutes());
app.use("/", listadoRoutes());
app.use("/", UsuariosRoutes());
app.use("/", AuthRoutes());
app.use("/", RecepcionRoutes());
app.use("/", EntradaRoutes());
app.use('/', proveedorRoutes());
app.use('/', articuloRoutes());
app.use('/', FacturaCompraRouest());
app.use('/', RecetaRoutes());
app.use('/', BodegaRoutes());
app.use('/', ExistenciaRoutes());
app.use('/', MovimientoRouest());
app.use('/', googelRouest());
app.use('/', PosRoutes());
app.use('/', codigoCabysRoutes());
app.use('/', accesosRoutes());
app.use('/', visitasRoutes());
app.use('/', d151Routes());
app.use('/', HomeRoutes());
app.use('/', entradasCredito());
app.use('/', cuentasRoutes());
app.use('/', movimientosBancosRoutes());
app.use('/', RazonNoVenta());
app.use('/', EncuestaServicioRoutes());
app.use('/', EncuestaRequerimientoRoutes());
app.use('/', ResultadoEncuestaServicioRoutes());
app.use('/', ResultadoEncuestaRequerimientoRoutes());
app.use('/', apiFacturaRoutes());

app.use((req, res) => { // agregar ruta cuando la busqueda no encuentre un recurso
    return noEncontrado(req, res);
});

const Server = http.createServer(app);
const PORT = process.env.PORT || 5000;

Server.listen(PORT, () => {
    console.log('Servidor escuchando en puerto ' + PORT);
});
//Server.setTimeout(120000); // 2 minutos de espera
