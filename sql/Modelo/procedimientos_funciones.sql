DELIMITER $$

CREATE PROCEDURE actualizarStock( 
    IN pcantidad INTEGER,
    IN pidarticulo INTEGER,
    IN pidbodega INTEGER,
    IN pidemisor INTEGER)
BEGIN
	DECLARE v_existencia_anterior INTEGER DEFAULT 0;
    DECLARE v_existencia_actual INTEGER DEFAULT 0;
    declare v_idarticulo INTEGER;
    
    SELECT id, existencia_anterior, existencia_actual INTO v_idarticulo,v_existencia_anterior, v_existencia_actual 
		FROM Existencia WHERE idarticulo = pidarticulo AND idbodega = pidbodega AND idemisor = pidemisor;
        
	IF v_idarticulo IS NULL THEN 
		
        INSERT INTO Existencia(idarticulo, idemisor,idbodega, existencia_anterior, existencia_actual) 
		VALUES(pidarticulo,pidemisor,pidbodega,0,pcantidad);
        
        SELECT 'OK';
        
    ELSE     
		UPDATE Existencia SET existencia_anterior = v_existencia_actual, 
				existencia_actual = v_existencia_actual + pcantidad 
        WHERE idarticulo = pidarticulo
        AND idbodega = pidbodega
        AND idemisor = pidemisor;

		SELECT 'OK'; 
	
    END IF;
		
END$$

DELIMITER ;


-- ----------------------------------------------------------------------------------------------------------------------------
DELIMITER $$
CREATE PROCEDURE restarCantidadStock( 
    IN pcantidad INTEGER,
    IN pidarticulo INTEGER,
    IN pidemisor INTEGER,
    IN pidbodega INTEGER)
BEGIN

	 DECLARE mensaje VARCHAR(30) DEFAULT '';
     DECLARE v_existenciaActual INTEGER ;

	   SELECT  ex.existencia_actual  INTO  v_existenciaActual
	   FROM Existencia ex
	   WHERE ex.idemisor = pidemisor
	   	AND ex.idarticulo = pidarticulo
      AND ex.idbodega = pidbodega;

    IF v_existenciaActual IS NULL THEN 

      INSERT INTO Existencia(idarticulo, idemisor,idbodega, existencia_anterior, existencia_actual) 
		  VALUES(pidarticulo,pidemisor,pidbodega,0,-pcantidad);

      SET mensaje = 'OK';
      SELECT mensaje;

    ELSE 
      	
      UPDATE Existencia SET existencia_anterior = v_existenciaActual, existencia_actual =  v_existenciaActual - pcantidad 
      WHERE idemisor = pidemisor
      AND idarticulo = pidarticulo 
      AND idbodega = pidbodega;
      
      SET mensaje = 'OK';
      SELECT mensaje;

    END IF;
				
END$$

DELIMITER ;
----------------------------------------------------------------------------------------------------------------------


DELIMITER $$
CREATE PROCEDURE actualizarFacturasRecepcionSinCodigoEstado ( IN v_idemisor INTEGER
) BEGIN
-- Variables donde almacenar el id que de la SELECT
  DECLARE identrada INTEGER; -- AQUI GUARDA EL VALOR DEL ID DE LA ENTRADA
  DECLARE codigoEstado VARCHAR(3); -- GUARDA EL VALOR DEL CODIGO

-- Variable para controlar el fin del bucle
  DECLARE findelbucle INTEGER DEFAULT 0;
 
-- La SELECT que queremos
  DECLARE curFacturas CURSOR FOR 
    SELECT e.id,e.codigo_estado FROM Entrada e, Emisor em 
	 WHERE e.idemisor = v_idemisor 
		AND e.estadoHacienda IS NOT NULL 
		AND e.idemisor = em.id
		AND tipo_factura = '05';
 
-- Cuando no existan mas datos findelbucle se pondra a 1
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET findelbucle=1;
--  DECLARE CONTINUE HANDLER FOR NOT FOUND SET @hecho = TRUE;
 
  OPEN curFacturas;
  bucle: LOOP
    FETCH curFacturas INTO identrada,codigoEstado;
    IF findelbucle = 1 THEN -- SE DETIENE EL BUCLE
       LEAVE bucle;
    END IF;
	
    IF codigoEstado IS NULL THEN
		UPDATE Entrada SET  codigo_estado = '202' WHERE id = identrada;
    END IF;
  -- UPDATE oc_product SET image= v_imagen WHERE model=i_idimagen;
 
  END LOOP bucle;
 SELECT 'actualizado';
  CLOSE curFacturas;
END$$
DELIMITER ;


--CALL actualizarFacturasRecepcionSinCodigoEstado(12);

CREATE PROCEDURE actualizarStockMovimiento(
    IN pcantidad INTEGER,
    IN pidarticulo INTEGER,
    IN pidbodega INTEGER,
    IN pidemisor INTEGER,
    IN TIPO VARCHAR(5))
BEGIN 

  declare pexistencia_actual INTEGER DEFAULT 0;
  declare pexistencia_anterior INTEGER DEFAULT 0;
  
  SELECT DISTINCT ex.existencia_actual,  ex.existencia_anterior INTO pexistencia_actual, pexistencia_anterior
    FROM Existencia ex
    INNER JOIN Articulo a ON ex.idarticulo = a.id 
    INNER JOIN Bodega b ON ex.idbodega = b.id
    INNER JOIN Emisor e ON ex.idemisor = e.id
    WHERE ex.idemisor = pidemisor 
    AND ex.idbodega = pidbodega
    AND ex.idarticulo = pidarticulo;

  IF TIPO = 'SUMA' THEN 

    UPDATE Existencia SET existencia_anterior = pexistencia_actual, existencia_actual = existencia_actual + pcantidad
      WHERE idarticulo = pidarticulo
      AND idbodega = pidbodega
      AND idemisor = pidemisor;

      SELECT 'OK';
  ELSE 

    UPDATE Existencia SET existencia_anterior = pexistencia_actual, existencia_actual = existencia_actual - pcantidad
      WHERE idarticulo = pidarticulo
      AND idbodega = pidbodega
      AND idemisor = pidemisor;


      SELECT 'OK';

  END IF;

END$$
DELIMITER ;



--- VERSION ANTERIOR--------------------
DELIMITER $$
CREATE PROCEDURE actualizarStockMovimiento(
    IN pcantidad INTEGER,
    IN pidarticulo INTEGER,
    IN pidbodega INTEGER,
    IN pidemisor INTEGER,
    IN TIPO VARCHAR(5))
BEGIN 

  declare pexistencia_actual INTEGER DEFAULT 0;
  declare pexistencia_anterior INTEGER DEFAULT 0;
  
  SELECT DISTINCT ex.existencia_actual,  ex.existencia_anterior INTO pexistencia_actual, pexistencia_anterior
    FROM Existencia ex, Articulo a, Bodega b, Emisor e
    WHERE a.id = pidarticulo
    AND b.id = pidbodega
    AND e.id = pidemisor
    AND ex.idarticulo = a.id
    AND ex.idbodega = b.id
    AND ex.idemisor = e.id;

  IF TIPO = 'SUMA' THEN 

    UPDATE Existencia SET existencia_anterior = pexistencia_actual, existencia_actual = existencia_actual + pcantidad
      WHERE a.id = pidarticulo
      AND b.id = pidbodega
      AND e.id = pidemisor;

      SELECT 'OK';
  ELSE 

    UPDATE Existencia SET existencia_anterior = pexistencia_actual, existencia_actual = existencia_actual - pcantidad
      WHERE a.id = pidarticulo
      AND b.id = pidbodega
      AND e.id = pidemisor;

      SELECT 'OK';

  END IF;

END$$
DELIMITER ;

