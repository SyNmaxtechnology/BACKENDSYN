USE SisFac;
-- LA BASE DE DATOS SE LLAMA SisFac
CREATE TABLE IF NOT EXISTS `Tipo_Impuesto` (
  `id` integer NOT NULL AUTO_INCREMENT,
  `idemisor` INTEGER NOT NULL,
  `codigo_impuesto` VARCHAR(2) NOT NULL,
  `descripcion` varchar(60) NOT NULL ,
  `porcentaje_impuesto`decimal(4,2) NOT NULL,
  `estado_impuesto` INTEGER(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  foreign key(`idemisor`) REFERENCES `Emisor`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET= utf8;

CREATE TABLE IF NOT EXISTS `Descuento`(
	`id` INTEGER NOT NULL auto_increment,
  `idemisor` INTEGER NOT NULL,
  `descripcion` VARCHAR(60) NOT NULL,
  `porcentaje` DECIMAL(5,2) NOT NULL,
  `estado_descuento` boolean default true,
  PRIMARY KEY(`id`),
  foreign key(`idemisor`) REFERENCES `Emisor`(`id`)
)ENGINE=InnoDB DEFAULT CHARSET= utf8;


-- -----------------------------------------

CREATE TABLE IF NOT EXISTS `CodigoCabys`(
	`id` INTEGER NOT NULL AUTO_INCREMENT,
  `idemisor` INTEGER NOT NULL,
  `descripcion` VARCHAR(50) NULL,
  `codigoCabys` VARCHAR(15) NOT NULL,
  PRIMARY KEY(`id`), 
  foreign key(`idemisor`) REFERENCES `Emisor`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET= utf8;


-- ----------------------------------------

CREATE TABLE IF NOT EXISTS `TipoCambio`(
	`id` INTEGER NOT NULL AUTO_INCREMENT,
  `tipocambio` DECIMAL(6,2) NOT NULL,
  `fecha` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET= utf8;

-- -------------------------------------

CREATE TABLE IF NOT EXISTS `Categoria` (
  `id` integer NOT NULL AUTO_INCREMENT,
  `idemisor` INTEGER NOT NULL,
  `codigo` VARCHAR(30) NULL,
  `descripcion` varchar(60) NOT NULL ,
  `codigoCabys` varchar(15) NULL,
  `descripcionCodigoCabys` varchar(200) NULL,
	`estado_categoria` boolean default true,
  PRIMARY KEY (`id`),
  UNIQUE KEY `descripcion` (`descripcion`),
  foreign key(`idemisor`) REFERENCES `Emisor`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET= utf8;

CREATE TABLE IF NOT EXISTS `Producto` (
  `id` integer NOT NULL AUTO_INCREMENT,
  `idemisor` INTEGER NOT NULL,
  `tipo_impuesto`INTEGER(2) NOT NULL,
	`idcategoria` INTEGER(2) NOT NULL,
  `descripcion` varchar(60) NOT NULL ,
  `logo` VARCHAR(150) NULL,
  `codigobarra_producto` varchar(18) DEFAULT NULL,
  `precio_producto` decimal(18,5) NOT NULL,
  `precio_final` decimal(18,5) NOT NULL,
  `costo_unitario` decimal(10) NOT NULL,
  `unidad_medida` varchar(10) NOT NULL ,
  `unidad_medida_comercial` VARCHAR(20) NOT NULL,
  `tipo_servicio` varchar(2) NOT NULL,
  `codigo_servicio` VARCHAR(30) NOT NULL,
  `imagen` VARCHAR(120) NULL,
  `public_id` VARCHAR(50) NULL,
  `codigoCabys` VARCHAR(13) NULL,
  `estado_producto` boolean default true,
  PRIMARY KEY (`id`),
  foreign key(`idemisor`) REFERENCES `Emisor`(`id`),
  UNIQUE KEY `uniq_codigobarra` (`codigobarra_producto`),
  UNIQUE KEY `uniq_descripcion` (`descripcion`),
  foreign key(`tipo_impuesto`) REFERENCES `Tipo_Impuesto`(`id`),
  foreign key(`idcategoria`) REFERENCES `Categoria`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET= utf8;


-- ----------------------------------------------------
CREATE TABLE `articulo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idemisor` int(11) NOT NULL,
  `tipo_impuesto` int(2) NOT NULL,
  `idcategoria` int(2) NOT NULL,
  `descripcion` varchar(60) NOT NULL,
  `codigobarra_producto` varchar(18) NULL,
  `precio_articulo` decimal(18,5) NOT NULL,
  `precio_final` decimal(18,5) NOT NULL,
  `costo_unitario` decimal(10,0) NOT NULL,
  `unidad_medida` varchar(10) NOT NULL,
  `unidad_medida_comercial` varchar(20) NOT NULL,
  `tipo_servicio` varchar(2) NOT NULL,
  `codigo_servicio` varchar(30) NOT NULL,
  `estado_articulo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `tipo_impuesto` (`tipo_impuesto`),
  KEY `idcategoria` (`idcategoria`),
  KEY `idemisor` (`idemisor`),
  FOREIGN KEY (`tipo_impuesto`) REFERENCES `tipo_impuesto` (`id`),
  FOREIGN KEY (`idcategoria`) REFERENCES `categoria` (`id`),
  FOREIGN KEY (`idemisor`) REFERENCES `emisor` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=432 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Emisor` (
    `id` integer NOT NULL AUTO_INCREMENT,
    -- `idusuario` INTEGER NOT NULL,
    `emisor_nombre` varchar(80) NOT NULL ,
    `emisor_nombrecomercial` varchar(80) NOT NULL ,
    `emisor_tipo_identificacion` varchar(2) NOT NULL,
    `cedula_emisor` varchar(12) NOT NULL,
    `numero_emisor` varchar(12) NOT NULL,
    `emisor_barrio` VARCHAR(29) NOT NULL,
    `emisor_otras_senas` VARCHAR(300) NULL,
    `emisor_telefono_codigopais` varchar(3) NULL,
    `emisor_telefono_numtelefono` varchar(20) NULL,
    `emisor_fax_codigopais` varchar(3)  null,
    `emisor_fax_numtelefono` varchar(20) null,
    `emisor_correo` varchar(160) not null,
    `file_p12` VARCHAR(16) NOT NULL,
    `pin_p12` VARCHAR(4) NOT NULL,
    `key_username_hacienda` VARCHAR(52),
    `key_password_hacienda` VARCHAR(20),
    `secure_url` VARCHAR(120),
    `public_id` VARCHAR(50),
    `casaMatriz` VARCHAR(3) NOT NULL,
    `puntoVenta` VARCHAR(5) NOT NULL,
    `codigo_actividad` VARCHAR(6),
    `tipo_codigo_servicio` VARCHAR(2) NOT NULL, -- Nota 12 de anexos y estructuras, documentacion hacienda
    `codigo_servicio` VARCHAR(40) NOT NULL, -- Nota 12 de anexos y estructuras, documentacion hacienda
    `Client_ID` VARCHAR(10) NOT NULL, -- Es en el entorno de envio de las facturas, ya sea prod o stage
    `API` VARCHAR(200) NOT NULL, -- API donde se van a enviar los comprobantes electronicos
    `TOKEN_API` VARCHAR(200) NOT NULL, -- API donde se va generar el token 
    `numeroresolucion` VARCHAR(50) NOT NULL,
    `fecharesolucion` VARCHAR(50) NOT NULL,
    `logo` VARCHAR(120) NULL,
    `public_id` varchar(50) DEFAULT NULL,
    `activacabys` tinyint(1) NOT NULL DEFAULT '0',
    `cerca_perimetral` DECIMAL default NULL,
    `correo_administrativo` VARCHAR(160) DEFAULT NULL,
    `token_emisor` VARCHAR(10) DEFAULT NULL,
    `notas_emisor` VARCHAR(500) DEFAULT NULL,
    `prioridad` tinyint(1) NOT NULL DEFAULT '0',
    `estado_emisor` tinyint(1) DEFAULT '1',
	PRIMARY KEY (`id`),
  FOREIGN KEY(`idusuario`) REFERENCES Usuario(`id`),
  UNIQUE KEY `emisor_correo` (`emisor_correo`)
) ENGINE=InnoDB DEFAULT CHARSET= utf8;

CREATE TABLE IF NOT EXISTS `Cliente` (
    `id` integer NOT NULL AUTO_INCREMENT,
    `idemisor` INTEGER NOT NULL,
    `cliente_nombre` varchar(80) NOT NULL ,
    `cliente_nombre_comercial` varchar(80) NULL ,
    `cliente_tipo_identificacion` varchar(2) NOT NULL,
    `cedula_cliente` varchar(12) NOT NULL,
    `numero_cliente` varchar(12) NOT NULL,
    `identificacion_extranjero` varchar(20) DEFAULT NULL,
    `cliente_barrio` VARCHAR(29) NOT NULL,
    `otras_senas` VARCHAR(250) NOT NULL,
    `otras_senas_extranjero` VARCHAR(250) NULL,
    `cliente_telefono_codigopais` varchar(3) null,
    `cliente_telefono_numtelefono` varchar(20) null,
    `cliente_fax_codigopais` varchar(3) null,
    `cliente_fax_numtelefono` varchar(20) null,
    `cliente_correo` varchar(60) not null,
    `exentoIVA` BOOLEAN NULL, -- NO SE LE COBRA IMPUESTO 
    `tipoExoneracion` VARCHAR(2) NULL,
    `porcentajeExoneracion` DECIMAL(7,3) NULL, -- este es el porcentaje que se exonera por orden
    `NombreInstitucion` VARCHAR(80) NULL,
    `documentoExoneracion` CHAR(40) NULL,
    `fechaEmision` VARCHAR(30) NULL,
    `Agente` INTEGER NOT NULL,
    `Descuento` DECIMAL(5,2) DEFAULT 0,
    `plazo_credito` INTEGER(5) DEFAULT 0,    
    `saldo` DECIMAL(18,2), 
    `Limi_Credi` DECIMAL(18,2), 
    `vence1` DECIMAL(18,2), 
    `vence2` DECIMAL(18,2), 
    `vence3` DECIMAL(18,2), 
    `vence4` DECIMAL(18,2), 
    `vence5` DECIMAL(18,2), 
    `autorizado` TINYINT(1) ,
    `ubicacion` VARCHAR(500),
    `estado_cliente` BOOLEAN DEFAULT TRUE,
    `idautoriza` INTEGER NULL,
    `c_zona` varchar(5) DEFAULT NULL,
    --`Solicita_estado` TINYINT(1) DEFAULT NULL,
	  PRIMARY KEY (`id`),
    foreign key(`idemisor`) REFERENCES `Emisor`(`id`),
    foreign key(`Agente`) REFERENCES `Usuario`(`id`),
    UNIQUE KEY `cliente_correo` (`cliente_correo`),
    UNIQUE KEY `cedula_cliente` (`cedula_cliente`),
    foreign key(`idautoriza`) REFERENCES `Usuario`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET= utf8;
-- PROVEEDORES

  CREATE TABLE IF NOT EXISTS `Proveedor` (
    `id` integer NOT NULL AUTO_INCREMENT,
    `idemisor` INTEGER NOT NULL,
    `proveedor_nombre` varchar(80) NOT NULL ,
    `proveedor_nombre_comercial` varchar(80) NULL ,
    `proveedor_tipo_identificacion` varchar(2) NOT NULL,
    `cedula_proveedor` varchar(12) NOT NULL,
    `numero_proveedor` varchar(12) NOT NULL,
    `codigo_actividad` codigo_actividad CHAR(6) NULL,
    `identificacion_extranjero` varchar(20) DEFAULT NULL,
    `proveedor_barrio` VARCHAR(29) NOT NULL,
    `otras_senas` VARCHAR(250) NOT NULL,
    `otras_senas_extranjero` VARCHAR(250) NULL,
    `proveedor_telefono_codigopais` varchar(3) null,
    `proveedor_telefono_numtelefono` varchar(20) null,
    `proveedor_fax_codigopais` varchar(3) null,
    `proveedor_fax_numtelefono` varchar(20) null,
    `proveedor_correo` varchar(60) not null,
    `exentoIVA` BOOLEAN NULL, -- NO SE LE COBRA IMPUESTO 
    `tipoExoneracion` VARCHAR(2) NULL,
    `porcentajeExoneracion` DECIMAL(7,3) NULL, -- este es el porcentaje que se exonera por orden
    `NombreInstitucion` VARCHAR(80) NULL,
    `documentoExoneracion` CHAR(40) NULL,
    `fechaEmision` VARCHAR(30) NULL,
    `estado_proveedor` BOOLEAN DEFAULT TRUE,
	  PRIMARY KEY (`id`),
    foreign key(`idemisor`) REFERENCES `Emisor`(`id`)
    -- UNIQUE KEY `proveedor_correo` (`proveedor_correo`),
    -- UNIQUE KEY `cedula_proveedor` (`cedula_proveedor`),
) ENGINE=InnoDB DEFAULT CHARSET= utf8;

CREATE TABLE `Factura` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idcliente` int(11) DEFAULT NULL,
  `idemisor` int(11) NOT NULL,
  `idusuario` int(11) NOT NULL,
  `idautoriza` INTEGER NULL,
  `idbodega` TINYINT(4) DEFAULT NULL,
  `clavenumerica` varchar(50) DEFAULT NULL,
  `consecutivo` varchar(20) DEFAULT NULL,
  `numero_interno` varchar(10) DEFAULT NULL,
  `num_documento` int(11) DEFAULT NULL,
  `fecha_factura` varchar(30) NOT NULL,
  `condicion_venta` varchar(2) NOT NULL,
  `medio_pago` varchar(2) NOT NULL,
  `plazo_credito` varchar(50) DEFAULT NULL,
  `porcentaje_descuento_total` decimal(10,0) DEFAULT NULL,
  `monto_descuento_total` decimal(10,0) DEFAULT NULL,
  `subtotal` decimal(10,0) NOT NULL,
  `totalservgravados` decimal(18,5) NOT NULL,
  `totalservexentos` decimal(18,5) NOT NULL,
  `totalservexonerado` decimal(18,5) NOT NULL,
  `totalmercanciasgravadas` decimal(18,5) NOT NULL,
  `totalmercanciasexentas` decimal(18,5) NOT NULL,
  `totalmercanciaexonerada` decimal(18,5) DEFAULT NULL,
  `totalgravado` decimal(18,5) NOT NULL,
  `totalexento` decimal(18,5) NOT NULL,
  `totalexonerado` decimal(18,5) DEFAULT NULL,
  `totalventa` decimal(18,5) NOT NULL,
  `totaldescuentos` decimal(18,5) NOT NULL,
  `totalventaneta` decimal(18,5) NOT NULL,
  `totalimpuesto` decimal(18,5) NOT NULL,
  `totalcomprobante` decimal(18,5) NOT NULL,
  `totalIVADevuelto` decimal(18,5) DEFAULT '0.00000',
  `TotalOtrosCargos` decimal(18,5) DEFAULT '0.00000',
  `codigomoneda` varchar(3) NOT NULL,
  `tipocambio` decimal(7,3) NOT NULL,
  `tipo_factura` varchar(2) NOT NULL,
  `status_factura` varchar(25) DEFAULT NULL,
  `proforma` varchar(2) DEFAULT NULL,
  `codigo_estado` char(3) DEFAULT NULL,
  `correo` tinyint(1) DEFAULT '0',
  `anulada` tinyint(1) DEFAULT '0',
  `notas` varchar(500) DEFAULT NULL,
  `intentoEnvio` tinyint(1) unsigned DEFAULT '0',
  `modificada` tinyint(1) DEFAULT '0',
  `importada` tinyint(1) DEFAULT NULL,
  `errorEnvio` varchar(250) DEFAULT NULL,
  `errorEmail` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idcliente` (`idcliente`),
  KEY `idemisor` (`idemisor`),
  KEY `fecha_factura` (`fecha_factura`,`clavenumerica`),
  KEY `idusuario` (`idusuario`),
  CONSTRAINT `factura_ibfk_1` FOREIGN KEY (`idcliente`) REFERENCES `cliente` (`id`),
  CONSTRAINT `factura_ibfk_2` FOREIGN KEY (`idemisor`) REFERENCES `emisor` (`id`),
  CONSTRAINT `factura_ibfk_3` FOREIGN KEY (`idusuario`) REFERENCES `usuario` (`id`),
  CONSTRAINT `factura_ibfk_4` FOREIGN KEY (`idautoriza`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=132846 DEFAULT CHARSET=utf8;

-- -------------------------------------------------

CREATE TABLE `Entrada`(
	  `id` INTEGER NOT NULL auto_increment,
    `idproveedor` INTEGER NULL, -- insertado primeramente
    `idemisor` INTEGER NOT NULL,-- insertado primeramente
    `idusuario` INTEGER NOT NULL,
    `clavenumerica` VARCHAR(50)  NULL, -- generad0 
    `consecutivo` VARCHAR(20)  NULL, -- generado
    `numero_interno` VARCHAR(12) NOT NULL,
    `num_documento` integer  NULL, -- se va generar despues de que se instar la factura
    `consecutivo_receptor` CHAR(20) NULL,
    `fecha_factura` VARCHAR(30) NOT NULL, -- default
    `tipo_factura` CHAR(2) NOT NULL,
    `condicion_venta` VARCHAR(2) NOT NULL, -- insertado primeramen
    `medio_pago` VARCHAR(2) NOT NULL, -- insertado primeramente
    `plazo_credito` DECIMAL DEFAULT 0, -- inicalmente se queda en 0
    `codicion_impuesto` VARCHAR(2) NULL,
    `porcentaje_descuento_total` DECIMAL DEFAULT NULL, -- sumatorias de todos los descuentos de las ordenes
    `monto_descuento_total` DECIMAL DEFAULT NULL, -- monto de sumatorias de todos los descuentos de las ordenes
    `subtotal` DECIMAL NOT NULL, -- subtotal de la sumatoria de todas las ordenes
	  `totalservgravados` DECIMAL(18,5) NOT NULL, -- totales hacienda
    `totalservexentos` DECIMAL(18,5) NOT NULL,
    `totalservexonerado` DECIMAL(18,5) NOT NULL,
    `totalmercanciasgravadas` DECIMAL(18,5) NOT NULL,
    `totalmercanciasexentas` DECIMAL(18,5) NOT NULL,
    `totalmercanciaexonerada` DECIMAL(18,5),
    `totalgravado` DECIMAL(18,5) NOT NULL,
    `totalexento` DECIMAL(18,5) NOT NULL,
    `totalexonerado` DECIMAL(18,5),
    `totalventa` DECIMAL(18,5) NOT NULL,
    `totaldescuentos` DECIMAL(18,5) NOT NULL,
    `totalventaneta` DECIMAL(18,5) NOT NULL,
    `totalimpuesto` DECIMAL(18,5) NOT NULL, -- Todos los totales son generados en el front end
    `totalcomprobante` DECIMAL(18,5) NOT NULL,-- fin totales hacienda 
    `totalIVADevuelto` DECIMAL(18,5) DEFAULT 0,
    `TotalOtrosCargos` DECIMAL(18,5)  NULL DEFAULT 0,
    `codigomoneda` varchar(3) NOT NULL, -- por default seria CRC pero se podria meter un select para meter los codigos de moneda
    `tipocambio` decimal(7,3) NOT NULL, -- este campo va ser consumido por la API de indicadores economicos del BCCR
    `status_factura` VARCHAR(1) NOT NULL, -- el estado que se va generar si es rechazada o aceptada 
    `codigo_estado` CHAR(3) NULL,
    `estadoHacienda` VARCHAR(9) NULL,
    `claveReferencia` VARCHAR(50) NULL,
    `fechaReferencia` VARCHAR(30) NULL,
    `anulada` TINYINT(1) DEFAULT 0,
    `errorEnvio` VARCHAR(500) NULL,  
    `correo` BOOLEAN DEFAULT 0,
    `notas` VARCHAR(500) NULL,
	  primary key(`id`),
    foreign key(`idproveedor`) REFERENCES Proveedor(`id`),
    foreign key(`idemisor`) REFERENCES Emisor(`id`),
    foreign key(`idusuario`) REFERENCES Usuario(`id`),
    index(`fecha_factura`,`clavenumerica`) -- comentario
) ENGINE=InnoDB DEFAULT CHARSET= utf8;

-- --------------------------------------------------
CREATE TABLE `Nota_Credito`(
	  `id` INTEGER NOT NULL auto_increment,
  
    `idcliente` INTEGER NULL, -- insertado primeramente
    `idemisor` INTEGER NOT NULL,-- insertado primeramente
    `idusuario` INTEGER NOT NULL,
    `tipo_factura` VARCHAR(2) NOT NULL, -- este valor va ser enviado desde el front end
    `clavenumerica` VARCHAR(50)  NULL, -- generad0 
    `consecutivo` VARCHAR(20)  NULL, -- generado
    `numero_interno` VARCHAR(10) NULL,
    `num_documento` integer  NULL, -- se va generar despues de que se instar la factura
    `fecha_factura` VARCHAR(30) NOT NULL, -- default
    `condicion_venta` VARCHAR(2) NOT NULL, -- insertado primeramen
    `medio_pago` VARCHAR(2) NOT NULL, -- insertado primeramente
    `plazo_credito` DECIMAL DEFAULT 0, -- inicalmente se queda en 0
    `porcentaje_descuento_total` DECIMAL DEFAULT NULL, -- sumatorias de todos los descuentos de las ordenes
    `monto_descuento_total` DECIMAL DEFAULT NULL, -- monto de sumatorias de todos los descuentos de las ordenes
    `subtotal` DECIMAL NOT NULL, -- subtotal de la sumatoria de todas las ordenes
	  `totalservgravados` DECIMAL(18,5) NOT NULL, -- totales hacienda
    `totalservexentos` DECIMAL(18,5) NOT NULL,
    `totalservexonerado` DECIMAL(18,5) NOT NULL,
    `totalmercanciasgravadas` DECIMAL(18,5) NOT NULL,
    `totalmercanciasexentas` DECIMAL(18,5) NOT NULL,
    `totalmercanciaexonerada` DECIMAL(18,5),
    `totalgravado` DECIMAL(18,5) NOT NULL,
    `totalexento` DECIMAL(18,5) NOT NULL,
    `totalexonerado` DECIMAL(18,5),
    `totalventa` DECIMAL(18,5) NOT NULL,
    `totaldescuentos` DECIMAL(18,5) NOT NULL,
    `totalventaneta` DECIMAL(18,5) NOT NULL,
    `totalimpuesto` DECIMAL(18,5) NOT NULL, -- Todos los totales son generados en el front end
    `totalcomprobante` DECIMAL(18,5) NOT NULL,-- fin totales hacienda 
    `totalIVADevuelto` DECIMAL(18,5) DEFAULT 0,
    `TotalOtrosCargos` DECIMAL(18,5)  NULL DEFAULT 0,
    `codigomoneda` varchar(3) NOT NULL, -- por default seria CRC pero se podria meter un select para meter los codigos de moneda
    `tipocambio` decimal(7,3) NOT NULL, -- este campo va ser consumido por la API de indicadores economicos del BCCR 
    `status_factura` VARCHAR(25) NULL, -- el estado que se va generar si es rechazada o aceptada 
    `codigo_estado` CHAR(3) NULL,
    -- DATOS DE NOTA DE CREDITO PARA ANULAR TODA O PARTE DE LA FACTURA
    `correo` BOOLEAN DEFAULT 0,
    `fecha_emision` VARCHAR(30) NULL,
    `tipoDocReferencia` VARCHAR(2) NOT NULL, -- TIPO DE FACTURA DE REFERENCIA
    `numeroReferencia` VARCHAR(50) NOT NULL,
    `codigo` varchar(2) NOT NULL ,-- tipo de codigo de nota de credito
    `razon` VARCHAR(500) NOT NULL ,-- campo de razon para generar la nota, sea credito o debito
    `intentoEnvio` TINYINT(1) UNSIGNED DEFAULT 0, -- CAMPO PARA CONTAR LOS ENVIOS DE LAS FACTURAS
    
	  primary key(`id`),
    foreign key(`idcliente`) REFERENCES Cliente(`id`),
    foreign key(`idemisor`) REFERENCES Emisor(`id`),
    foreign key(`idusuario`) REFERENCES Usuario(`id`),
    index(`fecha_factura`,`clavenumerica`)
) ENGINE=InnoDB DEFAULT CHARSET= utf8;


-- --------------------------------------------------

CREATE TABLE IF NOT EXISTS `Factura_Detalle`(
  `id` INTEGER NOT NULL auto_increment,
  `idfactura` INTEGER NULL,
  `idnotacredito` INTEGER NULL,
  `idproducto` INTEGER NOT NULL,
  `precio_linea`  DECIMAL(18,5) NOT NULL,
  `cantidad`  INTEGER NOT NULL,
  `descripcioDetalle` VARCHAR(160) NOT NULL,
  `fecharegistrolinea`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `porcentajedescuento` INTEGER DEFAULT 0,
  `montodescuento` DECIMAL(18,5) NOT NULL,
  `naturalezadescuento` VARCHAR(50) DEFAULT NULL,
  `numerolineadetalle` INTEGER NOT NULL,
  `subtotal`  DECIMAL(18,5) NOT NULL,
  `montototal`  DECIMAL(18,5) NOT NULL,
  `codigo` VARCHAR(2) NOT NULL, -- SI EL IMPUESTO ES O7 SE APLICA BASE IMPONIBLE, SI SE UTILIZA EL 08 SE DEBE APLICAR EL FACTOR IVA
  `codigo_tarifa` VARCHAR(2) NULL, -- OBLIGATORIO PARA IMPUESTOS 01 Y 07. Aqui se aplica la tarifa 
	`tarifa` DECIMAL(8,2)  NOT NULL,
  `monto` DECIMAL(18,5) NOT NULL,
  `impuesto_neto` DECIMAL(18,5) NOT NULL, -- el total del impuesto de la orden menos el impuesto exonerado
  `numerodocumento` INTEGER NOT NULL,
  `montoitotallinea` DECIMAL(18,5) NOT NULL,
  `baseimponible` DECIMAL(18,5) NULL,
  `MontoExoneracion` DECIMAL(18,5) NULL,
  `factorIVA` DECIMAL(18,5) DEFAULT 0,
  `otroscargos` decimal(18,5) DEFAULT 0,
  primary key(`id`),
  foreign key(`idfactura`) references `Factura`(`id`),
  foreign key(`idnotacredito`) references `Nota_Credito`(`id`),
  foreign key(`idproducto`) references `Producto`(`id`)
)ENGINE=InnoDB DEFAULT CHARSET= utf8;

CREATE TABLE `NC_Detalle` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idfactura` int(11) DEFAULT NULL,
  `idnotacredito` int(11) DEFAULT NULL,
  `idproducto` int(11) NOT NULL,
  `idemisor` int(11) NOT NULL,
  `precio_linea` decimal(18,5) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `descripcioDetalle` varchar(160) NOT NULL,
  `fecharegistrolinea` timestamp NOT NULL DEFAULT current_timestamp(),
  `porcentajedescuento` int(11) DEFAULT 0,
  `montodescuento` decimal(18,5) NOT NULL,
  `naturalezadescuento` varchar(50) DEFAULT NULL,
  `numerolineadetalle` int(11) NOT NULL,
  `subtotal` decimal(18,5) NOT NULL,
  `montototal` decimal(18,5) NOT NULL,
  `codigo` varchar(2) NOT NULL,
  `codigo_tarifa` varchar(2) DEFAULT NULL,
  `tarifa` decimal(8,2) NOT NULL,
  `monto` decimal(18,5) NOT NULL,
  `impuesto_neto` decimal(18,5) NOT NULL,
  `numerodocumento` int(11) NOT NULL,
  `montoitotallinea` decimal(18,5) NOT NULL,
  `baseimponible` decimal(18,5) DEFAULT NULL,
  `MontoExoneracion` decimal(18,5) DEFAULT NULL,
  `factorIVA` decimal(18,5) DEFAULT 0.00000,
  PRIMARY KEY (`id`),
  KEY `idfactura` (`idfactura`),
  KEY `idnotacredito` (`idnotacredito`),
  KEY `idproducto` (`idproducto`),
  KEY `idemisor` (`idemisor`),
  CONSTRAINT `nc_detalle_ibfk_1` FOREIGN KEY (`idfactura`) REFERENCES `factura` (`id`),
  CONSTRAINT `nc_detalle_ibfk_2` FOREIGN KEY (`idnotacredito`) REFERENCES `nota_credito` (`id`),
  CONSTRAINT `nc_detalle_ibfk_3` FOREIGN KEY (`idproducto`) REFERENCES `producto` (`id`),
  CONSTRAINT `nc_detalle_ibfk_4` FOREIGN KEY (`idemisor`) REFERENCES `emisor` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2039 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `Entrada_Detalle`(
  `id` INTEGER NOT NULL auto_increment,
  `identrada` INTEGER NULL,
  `idarticulo` INTEGER NOT NULL,
  `precio_linea`  DECIMAL(18,5) NOT NULL,
  `cantidad`  INTEGER NOT NULL,
  `descripcioDetalle` VARCHAR(160) NOT NULL,
  `fecharegistrolinea`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `porcentajedescuento` INTEGER DEFAULT 0,
  `montodescuento` DECIMAL(18,5) NOT NULL,
  `naturalezadescuento` VARCHAR(50) DEFAULT NULL,
  `numerolineadetalle` INTEGER NOT NULL,
  `subtotal`  DECIMAL(18,5) NOT NULL,
  `montototal`  DECIMAL(18,5) NOT NULL,
  `codigo` VARCHAR(2) NOT NULL, -- SI EL IMPUESTO ES O7 SE APLICA BASE IMPONIBLE, SI SE UTILIZA EL 08 SE DEBE APLICAR EL FACTOR IVA
  `codigo_tarifa` VARCHAR(2) NULL, -- OBLIGATORIO PARA IMPUESTOS 01 Y 07. Aqui se aplica la tarifa 
	`tarifa` DECIMAL(8,2)  NOT NULL,
  `monto` DECIMAL(18,5) NOT NULL,
  `impuesto_neto` DECIMAL(18,5) NOT NULL, -- el total del impuesto de la orden menos el impuesto exonerado
  `numerodocumento` INTEGER NOT NULL,
  `montoitotallinea` DECIMAL(18,5) NOT NULL,
  `baseimponible` DECIMAL(18,5) NULL,
  `MontoExoneracion` DECIMAL(18,5) NULL,
  `factorIVA` DECIMAL(18,5) DEFAULT 0,
  primary key(`id`),
  foreign key(`identrada`) references `Entrada`(`id`),
  FOREIGN KEY (`idarticulo`) REFERENCES `articulo` (`id`)
)ENGINE=InnoDB DEFAULT CHARSET= utf8;
-- id, idemisor,idcliente,idfactura,fechafactura, montototal, saldoactual
CREATE TABLE IF NOT EXISTS `MovimientosCxc`(
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `idemisor` INTEGER NOT NULL,
  `idcliente` INTEGER NOT NULL,
  `idfactura` INTEGER NOT NULL,
  `fecha_factura` VARCHAR(30) NOT NULL, -- default,
  `montototal` DECIMAL(18,5) NOT NULL, -- default,
  `saldoactual` DECIMAL(18,5) NOT NULL, -- default,
  `factura` CHAR(1) NOT NULL,
  primary key(`id`),
  foreign key(`idemisor`) REFERENCES `Emisor`(`id`),
  foreign key(`idcliente`) REFERENCES `Cliente`(`id`),
  foreign key(`idfactura`) REFERENCES `Factura`(`id`)
)ENGINE=InnoDB DEFAULT CHARSET= utf8;

-- ----------------------------------------------------------------------
CREATE TABLE `Otros_Cargos`(
  `id` INTEGER AUTO_INCREMENT NOT NULL,
  `idfactura_detalle` INTEGER NOT NULL,
  `TipoDocumento` VARCHAR(2) NOT NULL,
  `NumeroIdentidadTercero` VARCHAR(12) NOT NULL,
  `NombreTercero` VARCHAR(100) NOT NULL,
  `Detalle` VARCHAR(160) NOT NULL,
  `Porcentaje` DECIMAL(7,3) DEFAULT 0,
  `MontoCargo` DECIMAL(18,5) NOT NULL,
  primary key(`id`),
  foreign key(`idfactura_detalle`) REFERENCES `Factura_Detalle`(`id`)
)ENGINE=InnoDB DEFAULT CHARSET= utf8;

CREATE TABLE `xml` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idfactura` int(11) DEFAULT NULL,
  `idnotacredito` int(11) DEFAULT NULL,
  `identrada` int(11) DEFAULT NULL,
  `xml` MEDIUMTEXT NOT NULL,
  `acuseXml` text DEFAULT NULL,
  `mensajeAceptacion` text DEFAULT NULL,
  `respuestaMensajeAceptacion` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idfactura` (`idfactura`),
  KEY `identrada` (`identrada`),
  FOREIGN KEY (`idfactura`) REFERENCES `factura` (`id`),
  FOREIGN KEY (`identrada`) REFERENCES `entrada` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1709 DEFAULT CHARSET=utf8;

CREATE TABLE `Objeto_Detalles_Factura`(
	  `id` INTEGER auto_increment NOT NULL,
    `idfactura` INTEGER NULL,
    `idnotacredito` INTEGER NULL,
    `detalles_factura` TEXT NOT NULL,
    primary key(`id`),
    foreign key(`idfactura`) references Factura(`id`)
) ENGINE=InnoDB DEFAULT CHARSET= utf8;

CREATE TABLE `Consecutivos` ( 
  `id` INTEGER NOT NULL AUTO_INCREMENT, 
  `idemisor` INTEGER NOT NULL, 
  `tipoconse` VARCHAR(2) NOT NULL, 
  `consecutivo` VARCHAR(10) NOT NULL, 
  PRIMARY KEY(id),
  FOREIGN KEY(`idemisor`) REFERENCES Emisor(`id`)
);

CREATE TABLE `Forma_Pago` ( 
  `id` INTEGER NOT NULL AUTO_INCREMENT, 
  `idemisor` INTEGER NOT NULL, 
  `descripcion` VARCHAR(15) NOT NULL, 
  PRIMARY KEY(id),
  FOREIGN KEY(`idemisor`) REFERENCES Emisor(`id`)
);

CREATE TABLE `Permiso`(
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `descripcion` VARCHAR(15) NOT NULL,
  PRIMARY KEY(`id`)
)ENGINE=InnoDB DEFAULT CHARSET= utf8;

CREATE TABLE `Usuario`(
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `idbodega` INTEGER NOT NULL,
  `idpermiso` INTEGER NOT NULL, 
  `idemisor` INTEGER NOT NULL,
  `usuario` VARCHAR(25) NOT NULL NOT NULL,
  `contrasena` VARCHAR(80) NOT NULL,
  `imagen` VARCHAR(20) NULL,
  PRIMARY KEY(`id`),
  foreign key(`idemisor`) REFERENCES Emisor(`id`),
  foreign key(`idbodega`) REFERENCES Bodega(`id`),
  UNIQUE (`usuario`)
)ENGINE=InnoDB DEFAULT CHARSET= utf8;

CREATE TABLE `Parametros`(
  `id` INTEGER AUTO_INCREMENT NOT NULL,
  `servidorcorreo` VARCHAR(50) NOT NULL,
  `usuariocorreo` VARCHAR(50) NOT NULL,
  `clavecorreo` VARCHAR(50) NOT NULL,
  PRIMARY KEY(`id`)
)ENGINE=InnoDB DEFAULT CHARSET= utf8;

CREATE TABLE `Barrios` (
    `Expr1` INTEGER NULL,
    `codigo` VARCHAR(29),
    `provincia` VARCHAR(9),
    `nPro` VARCHAR(16),
    `canton` VARCHAR(6),
    `nCan` VARCHAR(19),
    `distrito` VARCHAR(8),
    `nDis` VARCHAR(28),
    `hacienda` VARCHAR(6),
    `nHac` VARCHAR(43),
    `CodNew` VARCHAR(50)
)ENGINE=InnoDB DEFAULT CHARSET= utf8;

CREATE TABLE `Moneda` (
  `monedaISO` varchar(3) DEFAULT NULL,
  `Lenguaje` varchar(3) DEFAULT NULL,
  `nombreMoneda` varchar(35) DEFAULT NULL,
  `Money` varchar(30) DEFAULT NULL,
  `Simbolo` varchar(3) DEFAULT NULL,
  KEY `nombreISO_Lenguaje` (`monedaISO`,`Lenguaje`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `Bodega`(
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `idemisor` INTEGER NOT NULL,
  `descripcion` VARCHAR(50) NOT NULL,
  PRIMARY KEY(id),
   FOREIGN KEY(`idemisor`) REFERENCES Emisor(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE Existencia(
  
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `idarticulo` INTEGER NOT NULL,
  `idemisor` INTEGER NOT NULL,
  `existencia_anterior` INTEGER NOT NULL DEFAULT 0,
  `existencia_actual` INTEGER NOT NULL DEFAULT 0,

  primary key(id),
  FOREIGN KEY(`idemisor`) REFERENCES Emisor(`id`),
  FOREIGN KEY(`idarticulo`) REFERENCES Articulo(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE Receta(

  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `idproducto`  INTEGER NOT NULL,
  `idarticulo` INTEGER NOT NULL,
  `idemisor` INTEGER NOT NULL,
  `cantidad` INTEGER NOT NULL DEFAULT 0,
  `costo` DECIMAL(18,5) NOT NULL,

  primary key(id),
  FOREIGN KEY(`idproducto`) REFERENCES Producto(`id`),
  FOREIGN KEY(`idarticulo`) REFERENCES Articulo(`id`),
  FOREIGN KEY(`idemisor`) REFERENCES Emisor(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE Ajuste (

  id integer not null auto_increment,
  idusuario INTEGER NOT NULL,
  idemisor INTEGER NOT NULL,
  fechadocumento DATETIME DEFAULT CURRENT_TIMESTAMP,
  tipomovimiento CHAR(2) NOT NULL,
  descripcionmovimiento VARCHAR(80) NULL,
  costoajuste DECIMAL(18,5) NOT NULL,

  PRIMARY KEY(id),
  FOREIGN KEY(idusuario) REFERENCES Usuario(id),
  FOREIGN KEY(idemisor) REFERENCES Emisor(id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE Ajuste_Detalle (

  id INTEGER NOT NULL AUTO_INCREMENT,
  idajuste INTEGER NOT NULL,
  idarticulo INTEGER NOT NULL,
  idbodorigen INTEGER NULL, -- Bodega origen
  idboddestino INTEGER NULL, -- Bodega destino
  cantidad DECIMAL(5,1) NOT NULL,
  costoarticulo DECIMAL(18,5) NOT NULL,
  costolinea DECIMAL(18,5) NOT NULL,

  PRIMARY KEY(id),
  FOREIGN KEY(idajuste) REFERENCES Ajuste(id),
  FOREIGN KEY(idarticulo) REFERENCES Articulo(id),
  FOREIGN KEY(idbodorigen) REFERENCES Bodega(id),
  FOREIGN KEY(idboddestino) REFERENCES Bodega(id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE Accesos (

  id INTEGER NOT NULL AUTO_INCREMENT,
  idusuario INTEGER NULL,
  modulo VARCHAR(20) NOT NULL,
  submenu VARCHAR(40) NOT NULL,
  activo TINYINT(1) DEFAULT 0,
  PRIMARY KEY(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE Recepciones(

  id INTEGER NOT NULL AUTO_INCREMENT,
  idemisor INTEGER NOT NULL,
  xml MEDIUMTEXT NOT NULL,
  procesada TINYINT(1) DEFAULT 0,

  PRIMARY KEY(id),
  FOREIGN KEY(idemisor) REFERENCES Emisor(id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;



CREATE TABLE Menu(
  id INTEGER NOT NULL AUTO_INCREMENT,
  menu varchar(20) NOT NULL,
  icono VARCHAR(50) NOT NULL,
  estado TINYYINT(1) DEFAULT 1,
  PRIMARY KEY(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE Opcion(
  id INTEGER NOT NULL AUTO_INCREMENT,
  idmenu INTEGER NOT NULL,
  opcion VARCHAR(20) NOT NULL,
  ruta VARCHAR(15) NOT NULL,
  condicion VARCHAR(50) NULL,
  PRIMARY KEY(id),
  FOREIGN KEY(idmenu) REFERENCES Menu(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `visitas` (

  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idusuario` int(11) NOT NULL,
  `idcliente` int(11) NOT NULL,
  `idemisor` int(11) NOT NULL,
  `tipo_movimiento` varchar(8) NOT NULL,
  `fecha` varchar(30) NOT NULL,
  `localizacion` geometry NOT NULL,
  `visita` tinyint(1) DEFAULT NULL,
  `razon` varchar(250) DEFAULT NULL,
  `venta` tinyint(1) DEFAULT NULL,
  `idlinea` VARCHAR(30) DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  KEY `idusuario` (`idusuario`),
  KEY `idcliente` (`idcliente`),
  KEY `idemisor` (`idemisor`),
  CONSTRAINT `visitas_ibfk_1` FOREIGN KEY (`idusuario`) REFERENCES `usuario` (`id`),
  CONSTRAINT `visitas_ibfk_2` FOREIGN KEY (`idcliente`) REFERENCES `cliente` (`id`),
  CONSTRAINT `visitas_ibfk_3` FOREIGN KEY (`idemisor`) REFERENCES `emisor` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 


CREATE TABLE IF NOT EXISTS `movcxp`(
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `idemisor` INTEGER NOT NULL,
  `idproveedor` INTEGER NOT NULL,
  `identrada` INTEGER NOT NULL,
  `fecha_factura` VARCHAR(30) NOT NULL, -- default,
  `montototal` DECIMAL(18,5) NOT NULL, -- default,
  `saldoactual` DECIMAL(18,5) NOT NULL, -- default,
  `factura` CHAR(1) NOT NULL,
  primary key(`id`),
  foreign key(`idemisor`) REFERENCES `Emisor`(`id`),
  foreign key(`idproveedor`) REFERENCES `Proveedor`(`id`),
  foreign key(`identrada`) REFERENCES `Entrada`(`id`)
)ENGINE=InnoDB DEFAULT CHARSET= utf8;





CREATE TABLE `cuentas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idemisor` int(11) NOT NULL,
  `numctabanco` varchar(100) NOT NULL,
  `decripcion` varchar(250) NOT NULL,
  `saldoant` decimal(18,5) DEFAULT '0.00000',
  `saldoact` decimal(18,5) DEFAULT '0.00000',
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fbk_emisor` (`idemisor`),
  CONSTRAINT `fbk_emisor` FOREIGN KEY (`idemisor`) REFERENCES `emisor` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `mov_bancos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idemisor` int(11) NOT NULL,
  `idcuenta` int(11) NOT NULL,
  `tipomovimiento` varchar(15) NOT NULL,
  `monto` decimal(18,5) NOT NULL,
  `descripcion` varchar(250) NOT NULL,
  `fecha` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_cuenta` (`idcuenta`),
  KEY `i_fecha` (`fecha`),
  KEY `i_idemisor` (`idemisor`),
  CONSTRAINT `fk_cuenta` FOREIGN KEY (`idcuenta`) REFERENCES `cuentas` (`id`),
  CONSTRAINT `mov_bancos_ibfk_1` FOREIGN KEY (`idemisor`) REFERENCES `emisor` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `razones_no_venta` (
  id int(11) NOT NULL AUTO_INCREMENT,
  idemisor INTEGER NOT NULL,
  razon VARCHAR(250) NOT NULL,
  KEY `i_idemisor` (`idemisor`),-- indice de busquedas
  PRIMARY KEY(id),
  FOREIGN KEY(idemisor) REFERENCES Emisor(id)

)ENGINE=InnoDB DEFAULT CHARSET= utf8;

CREATE TABLE `encuesta_servicio` (
  id INTEGER NOT NULL AUTO_INCREMENT,
  idemisor INTEGER NOT NULL,
  pregunta VARCHAR(250) NOT NULL,
  valor DECIMAL(4,2) NOT NULL,
  KEY `i_idemisor` (`idemisor`),-- indice de busquedas
  PRIMARY KEY(id),
  FOREIGN KEY(idemisor) REFERENCES Emisor(id)
)ENGINE=InnoDB DEFAULT CHARSET= utf8;

CREATE TABLE `resultado_encuesta_servicio` (
  id INTEGER NOT NULL AUTO_INCREMENT,
  idcliente INTEGER NOT NULL,
  idusuario INTEGER NOT NULL,
  idemisor INTEGER NOT NULL,
  idpregunta INTEGER NOT NULL,
  calificacion DECIMAL(4,2) NOT NULL,
  observaciones VARCHAR(250) NULL,
  fecha DATETIME DEFAULT now(),
  KEY `i_idemisor` (`idemisor`),-- indice de busquedas
  KEY `i_usuario` (`idusuario`),-- indice de busquedas
  KEY `i_cliente` (`idcliente`),-- indice de busquedas
  
  PRIMARY KEY(id),
  FOREIGN KEY(idemisor) REFERENCES Emisor(id),
  FOREIGN KEY(idpregunta) REFERENCES Encuesta_Servicio(id),
  FOREIGN KEY(idcliente) REFERENCES Cliente(id),
  FOREIGN KEY(idusuario) REFERENCES Usuario(id)

)ENGINE=InnoDB DEFAULT CHARSET= utf8;
-- ----------------------------------------------------------------


CREATE TABLE `encuesta_requerimiento` (
  id INTEGER NOT NULL AUTO_INCREMENT,
  idemisor INTEGER NOT NULL,
  pregunta VARCHAR(250) NOT NULL,
  KEY `i_idemisor` (`idemisor`),-- indice de busquedas
  PRIMARY KEY(id),
  FOREIGN KEY(idemisor) REFERENCES Emisor(id)
)ENGINE=InnoDB DEFAULT CHARSET= utf8;

CREATE TABLE `resultado_encuesta_requerimiento` (
  id INTEGER NOT NULL AUTO_INCREMENT,
  idcliente INTEGER NOT NULL,
  idusuario INTEGER NOT NULL,
  idemisor INTEGER NOT NULL,
  idpregunta INTEGER NOT NULL,
  requerimiento VARCHAR(100) NOT NULL,
  observaciones VARCHAR(250) NULL,
  cantidad DECIMAL(5,1) NOT NULL,
  fecha datetime DEFAULT now(),
  KEY `i_idemisor` (`idemisor`),-- indice de busquedas
  KEY `i_usuario` (`idusuario`),-- indice de busquedas
  KEY `i_cliente` (`idcliente`),-- indice de busquedas
  PRIMARY KEY(id),
  FOREIGN KEY(idemisor) REFERENCES Emisor(id),
  FOREIGN KEY(idpregunta) REFERENCES Encuesta_Requerimiento(id),
  FOREIGN KEY(idcliente) REFERENCES Cliente(id),
  FOREIGN KEY(idusuario) REFERENCES Usuario(id)

)ENGINE=InnoDB DEFAULT CHARSET= utf8;

CREATE TABLE Zonas (
  idemisor INTEGER NOT NULL,
  c_zona VARCHAR(5) NOT NULL,
  d_zona VARCHAR(150) NOT NULL,
  primary key (idemisor,c_zona)
) ENGINE=InnoDB DEFAULT CHARSET= utf8;



CREATE TABLE `linea_detalle_temporal` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idproducto` int(11) NOT NULL,
  `idemisor` int(11) NOT NULL,
  `idusuario` int(11) NOT NULL,
  `idcliente` int(11) DEFAULT NULL,
  `precio_linea` decimal(18,5) NOT NULL,
  `cantidad` decimal(8,3) NOT NULL,
  `descripcioDetalle` varchar(160) NOT NULL,
  `fecharegistrolinea` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `porcentajedescuento` int(11) DEFAULT '0',
  `montodescuento` decimal(18,5) NOT NULL,
  `naturalezadescuento` varchar(50) DEFAULT NULL,
  `numerolineadetalle` int(11) NOT NULL,
  `subtotal` decimal(18,5) NOT NULL,
  `montototal` decimal(18,5) NOT NULL,
  `codigo` varchar(2) NOT NULL,
  `codigo_tarifa` varchar(2) DEFAULT NULL,
  `tarifa` decimal(8,2) NOT NULL,
  `monto` decimal(18,5) NOT NULL,
  `impuesto_neto` decimal(18,5) NOT NULL,
  `numerodocumento` int(11) NOT NULL,
  `montoitotallinea` decimal(18,5) NOT NULL,
  `baseimponible` decimal(18,5) DEFAULT NULL,
  `MontoExoneracion` decimal(18,5) DEFAULT NULL,
  `PorcentajeExonerado` decimal(5,2) DEFAULT NULL,
  `factorIVA` decimal(18,5) DEFAULT '0.00000',
  `otroscargos` decimal(18,5) DEFAULT '0.00000',
  `idlinea` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idproducto` (`idproducto`),
  KEY `idemisor` (`idemisor`),
  KEY `idusuario` (`idusuario`),
  KEY `fk_cliente` (`idcliente`),
  CONSTRAINT `fk_cliente` FOREIGN KEY (`idcliente`) REFERENCES `cliente` (`id`),
  CONSTRAINT `linea_detalle_temporal_ibfk_1` FOREIGN KEY (`idproducto`) REFERENCES `producto` (`id`),
  CONSTRAINT `linea_detalle_temporal_ibfk_2` FOREIGN KEY (`idemisor`) REFERENCES `emisor` (`id`),
  CONSTRAINT `linea_detalle_temporal_ibfk_3` FOREIGN KEY (`idusuario`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
  /*
    INSERT INTO Cliente(
    idemisor,
    cliente_nombre,
    cliente_nombre_comercial,
    cliente_tipo_identificacion,
    cedula_cliente,numero_cliente,
    identificacion_extranjero,
    cliente_barrio,
    otras_senas,
    otras_senas_extranjero,
    cliente_telefono_codigopais,
    cliente_telefono_numtelefono,
    cliente_fax_codigopais,
    cliente_fax_numtelefono,
    cliente_correo)
    VALUES(1,'cliente 1000', 'cliente 1000', '00', '1000', '1000',
    '1000', '01', '', '', '000', 
    '00000000', '000', '00000000', 'correo1000@correo1000.com');
  */

  -- ALTER TABLE Tipo_Impuesto ADD COLUMN idemisor INTEGER NOT NULL AFTER id;
  -- ALTER TABLE Tipo_Impuesto ADD FOREIGN KEY(idemisor) REFERENCES Emisor(id);
  -- UPDATE Tipo_Impuesto SET idemisor=1;
  -- ALTER TABLE Descuento ADD COLUMN idemisor INTEGER NOT NULL AFTER id;
  -- ALTER TABLE Descuento ADD FOREIGN KEY(idemisor) REFERENCES Emisor(id);
  -- UPDATE Descuento  SET idemisor=1;
  -- ALTER TABLE Categoria ADD COLUMN idemisor INTEGER NOT NULL AFTER id;
  -- ALTER TABLE Categoria ADD FOREIGN KEY(idemisor) REFERENCES Emisor(id);
  -- UPDATE Categoria SET idemisor=1;
  -- ALTER TABLE Producto ADD COLUMN idemisor INTEGER NOT NULL AFTER id;
  -- ALTER TABLE Producto ADD FOREIGN KEY(idemisor) REFERENCES Emisor(id);
  -- UPDATE Producto SET idemisor=1;
  -- ALTER TABLE Cliente ADD COLUMN idemisor INTEGER NOT NULL AFTER id;
  -- ALTER TABLE Cliente ADD FOREIGN KEY(idemisor) REFERENCES Emisor(id);e
  -- UPDATE Cliente SET idemisor=1;
  -- ALTER TABLE Usuario ADD COLUMN idemisor INTEGER NOT NULL AFTER id;
  -- ALTER TABLE Usuario ADD FOREIGN KEY(idemisor) REFERENCES Emisor(id);
  -- ALTER TABLE Consecutivos ADD FOREIGN KEY(`idemisor`) REFERENCES Emisor(`id`)
  -- ALTER TABLE Usuario DROP FOREIGN KEY Usuario_ibfk_2;
  -- ALTER TABLE Usuario DROP COLUMN idemisor;
  -- ALTER TABLE Emisor ADD COLUMN idusuario INTEGER NOT NULL AFTER id;
  -- ALTER TABLE Emisor ADD FOREIGN KEY(idusuario) REFERENCES Usuario(id);
  -- si falla al agregar el la llave foreanea correr este comando   SET FOREIGN_KEY_CHECKS=0;



  /*
  
    CREATE TABLE Accesos (

      id INTEGER NOT NULL AUTO_INCREMENT,
      idusuario INTEGER NOT NULL,
      modulo VARCHAR(20) NOT NULL,
      submenu VARCHAR(40) NOT NULL,
      activo TINYINT(1) DEFAULT 0,
      PRIMARY KEY(id),
      FOREIGN KEY(idusuario) REFERENCES Usuario(id)
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;



    INSERT INTO Accesos(idusuario,modulo,submenu,activo)
      VALUES (37,'documentos','facturar',1),
      (37,'documentos','consultar',1),
      (37,'documentos','recepcion',1),
      (37,'documentos','recepciones',1),
      (37,'documentos','compra',1), 
      (37,'documentos','credito',1), 
      

      (37,'reportes','ventas/facturacion',1),
      (37,'reportes','ventas/detallado',1),
      (37,'reportes','ventas/productos',1),
      (37,'reportes','ventas/cliente',1), 
      (37,'reportes','ventas/formaPago',1), 

      (37,'reportes','compras/compras',1),
      (37,'reportes','compras/articulo',1),
      (37,'reportes','compras/proveedor',1),

      (37,'reportes','inventario/existencia',1),
      (37,'reportes','inventario/ajuste',1),

      (37,'reportes','credito/estadoCuenta',1),

      (37,'reportes','visita/visitaCliente',1),

      (37,'pos','venta',1),

      (37,'cliente','listado',1),

      (37,'proveedor','listado',1),

      (37,'producto','listado',1),
      (37,'producto','receta',1),

      (37,'ariculo','listado',1),
      (37,'ariculo','existencia',1),
      (37,'ariculo','movimiento',1),

      (37,'impuesto','listado',1),

      (37,'categoria','listado',1),

      (37,'descuento','listado',1),

      (37,'emisor','configuracion',1),

      (37,'visita','registro',1),

      (37,'usuario','listado',1),
      (37,'usuario','bodegas',1);

  SELECT
  TABLE_NAME AS `Tabla`,
  ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024) AS `Tamaño (MB)`
FROM
  information_schema.TABLES
WHERE
    TABLE_SCHEMA = "sistemas_sisfac"
  AND
    TABLE_NAME = "Factura"
ORDER BY
  (DATA_LENGTH + INDEX_LENGTH)
DESC;


SELECT
  TABLE_NAME AS `Tabla`,
  ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024) AS `Tamaño (MB)`
FROM
  information_schema.TABLES
WHERE
  TABLE_SCHEMA = "sistemas_sisfac"
ORDER BY
  (DATA_LENGTH + INDEX_LENGTH)
DESC;

  +-----+----------+-----------+-------------+
  | id  | idemisor | tipoconse | consecutivo |
  +-----+----------+-----------+-------------+
  |   6 |        2 | NC        | 0000000383  |
  |  33 |        2 | FA        | 0000000788  |
  |  36 |        2 | TK        | 0000000470  |
  | 116 |        2 | FC        | 0000000055  |
  | 117 |        2 | RE        | 0000000151  |
  +-----+----------+-----------+-------------+

  INSERT INTO Consecutivos(idemisor,tipoconse,consecutivo) VALUES (61 ,'NC', '0000000001');
  INSERT INTO Consecutivos(idemisor,tipoconse,consecutivo) VALUES (61 ,'FA', '0000000001');
  INSERT INTO Consecutivos(idemisor,tipoconse,consecutivo) VALUES (61 ,'TK', '0000000001');
  INSERT INTO Consecutivos(idemisor,tipoconse,consecutivo) VALUES (61 ,'FC', '0000000001');
  INSERT INTO Consecutivos(idemisor,tipoconse,consecutivo) VALUES (61 ,'RE', '0000000001');


  // delete con un join
 // boton para borrar facturas malas
 // obtener el idemisor del emisor logueado
  DELETE fd.*,x.*
  FROM Factura f, factura_detalle fd, Xml x
  WHERE f.idemisor = 61
  AND f.status_factura <> 'aceptado'
  AND f.id = fd.idfactura
  AND f.id = x.idfactura;
  
  DELETE FROM Factura  WHERE idemisor = 61 AND status_factura <> 'aceptado';*/
SELECT t.porcentaje_impuesto,0 as subtotal, 0 as subtotalMercancia
	,0 as subtotalServicio, 0 as impMercancia,
    0 as impServicio,
	(CASE
		WHEN t.porcentaje_impuesto = 0 THEN 'IVA 0%'
		WHEN t.porcentaje_impuesto = 1 THEN 'IVA 1%'
		WHEN t.porcentaje_impuesto = 2 THEN 'IVA 2%'
		WHEN t.porcentaje_impuesto = 4 THEN 'IVA 4%'
		WHEN t.porcentaje_impuesto = 8 THEN 'IVA 8%'
		WHEN t.porcentaje_impuesto = 13 THEN 'IVA 13%'
	END) AS descripcion
	FROM Tipo_Impuesto t
	WHERE t.idemisor = 2
	AND t.porcentaje_impuesto not in
	(SELECT DISTINCT fd.tarifa
	FROM Factura f, Factura_Detalle fd
	WHERE f.idemisor = 2
	AND f.id = fd.idfactura
	
	) UNION (SELECT fd.tarifa,(
		SELECT SUM(fd.subtotal) 
        FROM Factura_Detalle fd, Factura f, Producto p
		WHERE f.idemisor = 2
		AND f.id = fd.idfactura
		AND fd.idproducto = p.id
        AND p.codigo_servicio = 'Mercancía'
        GROUP BY p.codigo_servicio
    ) as subtotalMercancia, 
    (
		SELECT SUM(fd.subtotal) 
        FROM Factura_Detalle fd, Factura f, Producto p
		WHERE f.idemisor = 2
		AND f.id = fd.idfactura
		AND fd.idproducto = p.id
        AND p.codigo_servicio = 'Mercancía'
        GROUP BY p.codigo_servicio
    ) as subtotalServicio, 
    (
		SELECT SUM(fd.impuesto_neto) 
        FROM Factura_Detalle fd, Factura f, Producto p
		WHERE f.idemisor = 2
		AND f.id = fd.idfactura
		AND fd.idproducto = p.id
        AND p.codigo_servicio = 'Mercancía'
        GROUP BY p.codigo_servicio
    ) as impMercancia,
    (
		SELECT SUM(fd.impuesto_neto) 
        FROM Factura_Detalle fd, Factura f, Producto p
		WHERE f.idemisor = 2
		AND f.id = fd.idfactura
		AND fd.idproducto = p.id
        AND p.codigo_servicio = 'Servicio'
        GROUP BY p.codigo_servicio
    ) as impServicio,
    SUM(fd.impuesto_neto) as impuesto_neto ,
	(CASE
		WHEN fd.tarifa = 0 THEN 'IVA 0%'
		WHEN fd.tarifa = 1 THEN 'IVA 1%'
		WHEN fd.tarifa = 2 THEN 'IVA 2%'
		WHEN fd.tarifa = 4 THEN 'IVA 4%'
		WHEN fd.tarifa = 8 THEN 'IVA 8%'
		WHEN fd.tarifa = 13 THEN 'IVA 13%'
	END) AS descripcion
    FROM Factura_Detalle fd, Factura f, Producto p
    WHERE f.idemisor = 2
    AND f.id = fd.idfactura
    AND fd.idproducto = p.id
    
    GROUP BY p.codigo_servicio,fd.tarifa ORDER BY fd.tarifa ASC);
    

    
    
    
    
    
    
    
    
    
    
    






































    
    



