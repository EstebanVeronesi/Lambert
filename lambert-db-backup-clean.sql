-- Limpieza inicial (segura)
DROP TABLE IF EXISTS public.accesorio CASCADE;
DROP TABLE IF EXISTS public.calculos CASCADE;
DROP TABLE IF EXISTS public.calculos_modificado CASCADE;
DROP TABLE IF EXISTS public.camion CASCADE;
DROP TABLE IF EXISTS public.camion_configuracion CASCADE;
DROP TABLE IF EXISTS public.camion_modificado CASCADE;
DROP TABLE IF EXISTS public.carroceria CASCADE;
DROP TABLE IF EXISTS public.carroceria_modificada CASCADE;
DROP TABLE IF EXISTS public.cliente CASCADE;
DROP TABLE IF EXISTS public.configuracion_modificada CASCADE;
DROP TABLE IF EXISTS public.pedido CASCADE;
DROP TABLE IF EXISTS public.proyecto_modificado CASCADE;
DROP TABLE IF EXISTS public.tipo_accesorio CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Tablas
CREATE TABLE public.tipo_accesorio (id integer PRIMARY KEY, nombre character varying(100) NOT NULL UNIQUE);
CREATE TABLE public.users (dni character varying(20) PRIMARY KEY, nombre character varying(100) NOT NULL, email character varying(100) NOT NULL UNIQUE, password_hash character varying(255) NOT NULL, created_at timestamp DEFAULT now(), updated_at timestamp DEFAULT now(), rol character varying(50) DEFAULT 'vendedor');
CREATE TABLE public.cliente (cuit bigint PRIMARY KEY, razon_social character varying(255) NOT NULL);
CREATE TABLE public.camion (id integer PRIMARY KEY, marca_camion character varying(100) NOT NULL, modelo_camion character varying(100) NOT NULL, ano_camion character varying(10), estado_verificacion character varying(20) DEFAULT 'pendiente', tipo_camion character varying(20), CONSTRAINT uq_camion_marca_modelo_ano UNIQUE (marca_camion, modelo_camion, ano_camion));
CREATE TABLE public.camion_configuracion (id integer PRIMARY KEY, distancia_entre_ejes numeric NOT NULL, distancia_primer_eje_espalda_cabina numeric NOT NULL, voladizo_delantero numeric NOT NULL, voladizo_trasero numeric NOT NULL, peso_eje_delantero numeric NOT NULL, peso_eje_trasero numeric NOT NULL, pbt numeric NOT NULL, original boolean DEFAULT true, es_modificado boolean DEFAULT false, fk_id_camion integer REFERENCES public.camion(id), ancho_chasis_1 integer NOT NULL, ancho_chasis_2 integer);
CREATE TABLE public.pedido (id integer PRIMARY KEY, fk_id_camion integer NOT NULL REFERENCES public.camion(id), fk_cuit_cliente bigint NOT NULL REFERENCES public.cliente(cuit), estado character varying(50) DEFAULT 'borrador' NOT NULL, fecha_pedido date DEFAULT CURRENT_DATE NOT NULL, fecha_entrega date, observaciones text, fk_id_usuario character varying REFERENCES public.users(dni));
CREATE TABLE public.carroceria (id integer PRIMARY KEY, fk_id_pedido integer NOT NULL UNIQUE REFERENCES public.pedido(id) ON DELETE CASCADE, tipo_carroceria character varying(50) NOT NULL, largo_carroceria numeric NOT NULL, alto_carroceria numeric NOT NULL, ancho_carroceria numeric NOT NULL, equipo_frio_marca_modelo character varying(255), observaciones text, separacion_cabina_carroceria integer NOT NULL);
CREATE TABLE public.calculos (id integer PRIMARY KEY, fk_id_pedido integer NOT NULL UNIQUE REFERENCES public.pedido(id) ON DELETE CASCADE, resultado_peso_bruto_total_maximo numeric NOT NULL, resultado_carga_eje_delantero_calculada numeric NOT NULL, resultado_carga_eje_trasero_calculada numeric NOT NULL, resultado_porcentaje_carga_eje_delantero numeric(5,2) NOT NULL, resultado_modificacion_chasis character varying(255) NOT NULL, resultado_voladizo_trasero_calculado numeric NOT NULL, resultado_largo_final_camion numeric, verificacion_distribucion_carga_ok boolean NOT NULL, verificacion_voladizo_trasero_ok boolean NOT NULL, recomendaciones text[], resultado_desplazamiento_eje numeric, resultado_nueva_distancia_entre_ejes numeric, resultado_centro_carga_carroceria numeric, resultado_centro_carga_total numeric, resultado_carga_maxima_eje_delantero numeric, resultado_carga_maxima_eje_trasero numeric, resultado_carga_total_calculada numeric);
CREATE TABLE public.accesorio (id integer PRIMARY KEY, fk_id_carroceria integer NOT NULL REFERENCES public.carroceria(id) ON DELETE CASCADE, fk_id_tipo_accesorio integer NOT NULL REFERENCES public.tipo_accesorio(id), cantidad integer DEFAULT 1, marca character varying(100), modelo character varying(100));
CREATE TABLE public.proyecto_modificado (id integer PRIMARY KEY, fk_cuit_cliente numeric, cliente_razon_social character varying(255), estado_proyecto character varying(50) DEFAULT 'Guardado', created_at timestamp DEFAULT CURRENT_TIMESTAMP, fecha_entrega date, fk_id_usuario character varying REFERENCES public.users(dni));
CREATE TABLE public.camion_modificado (id integer PRIMARY KEY, fk_proyecto_modificado_id integer REFERENCES public.proyecto_modificado(id) ON DELETE CASCADE, marca_camion character varying(100), modelo_camion character varying(100), ano_camion character varying(10), tipo_camion character varying(10));
CREATE TABLE public.configuracion_modificada (id integer PRIMARY KEY, distancia_entre_ejes numeric, distancia_primer_eje_espalda_cabina numeric, voladizo_delantero numeric, voladizo_trasero numeric, peso_eje_delantero numeric, peso_eje_trasero numeric, pbt numeric, fk_id_camion_modificado integer REFERENCES public.camion_modificado(id), ancho_chasis_1 integer NOT NULL, ancho_chasis_2 integer);
CREATE TABLE public.carroceria_modificada (id integer PRIMARY KEY, fk_proyecto_modificado_id integer REFERENCES public.proyecto_modificado(id) ON DELETE CASCADE, tipo_carroceria character varying(50), largo_carroceria numeric, alto_carroceria numeric, ancho_carroceria numeric, separacion_cabina_carroceria numeric, equipo_frio_marca_modelo character varying(100));
CREATE TABLE public.calculos_modificado (id integer PRIMARY KEY, fk_proyecto_modificado_id integer REFERENCES public.proyecto_modificado(id) ON DELETE CASCADE, resultado_peso_bruto_total_maximo numeric, resultado_carga_maxima_eje_delantero numeric, resultado_carga_maxima_eje_trasero numeric, resultado_carga_total_calculada numeric, resultado_carga_eje_delantero_calculada numeric, resultado_carga_eje_trasero_calculada numeric, resultado_porcentaje_carga_eje_delantero numeric, resultado_modificacion_chasis character varying(100), resultado_voladizo_trasero_calculado numeric, resultado_largo_final_camion numeric, resultado_centro_carga_total numeric, resultado_centro_carga_carroceria numeric, resultado_nueva_distancia_entre_ejes numeric, resultado_desplazamiento_eje numeric, verificacion_distribucion_carga_ok boolean, verificacion_voladizo_trasero_ok boolean, recomendaciones text[]);

-- Secuencias
CREATE SEQUENCE public.tipo_accesorio_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE public.users_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE public.cliente_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE public.camion_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE public.camion_configuracion_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE public.pedido_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE public.carroceria_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE public.calculos_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE public.accesorio_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE public.proyecto_modificado_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE public.camion_modificado_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE public.configuracion_modificada_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE public.carroceria_modificada_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE public.calculos_modificado_id_seq START WITH 1 INCREMENT BY 1;

-- Datos: tipo_accesorio
INSERT INTO public.tipo_accesorio (id, nombre) VALUES (1,'cajon de herramientas adicional'),(2,'portaestacas'),(3,'cajon de herramientas tipo cocina'),(4,'malacates'),(5,'cajon portaestacas'),(6,'proteccion lateral'),(7,'bocas descarga'),(8,'ventiletes'),(9,'paragolpe'),(10,'alarque arcos pasamanos'),(11,'corte equipo frio'),(12,'enganche');
SELECT setval('public.tipo_accesorio_id_seq', 12);

-- Datos: users
INSERT INTO public.users (dni, nombre, email, password_hash, rol) VALUES 
('12345678','Juan Perez','juan@example.com','$2b$10$4o9i9jzXaYBDGFjNp.Jk0.2mML848luAnzwaxR3NkDbJU3e7mg5PO','vendedor'),
('12345611178','Usuario de Prueba','tester@lambert.com','$2b$10$z1a99v.Uc5P83y.NhRMbJeCvvRRIxgMqECOhu9ioPsb712YQGFWw2','admin'),
('40159203','Esteban','veronesiesteban@gmail.com','$2b$10$vlhgGBy2qv3PbmFZKsoSKO1UHI/U8MXDx8bi6OAGG3iHLwtjA9fqS','vendedor'),
('99999999','Test Admin','admin2@lambert.com','$2b$10$02LE6c0nn.VboRdsEMS.IOmjFhAP5BxNu4so7oywK3vvyvD0nFDsy','admin');

-- Datos: cliente
INSERT INTO public.cliente (cuit, razon_social) VALUES 
(20334455667,'Transportes El Audaz SA'),(20304050607,'Cliente Test'),(30998877665,'Transportes del Norte SRL'),(20123456789,'Cliente de Prueba'),(30555666777,'Transporte Verificado');

-- Datos: camion
INSERT INTO public.camion (id, marca_camion, modelo_camion, ano_camion, estado_verificacion, tipo_camion) VALUES 
(1,'Ford','Cargo 1722','2015','verificado','4x2'),(4,'Ford','Cargo 1723','2015','pendiente','4x2'),(5,'Mercedes','Acceto','2022','verificado','4x2'),(8,'Scania','Test','2024','pendiente','4x2'),(9,'Ford','Cargo','2023','pendiente','4x2');
SELECT setval('public.camion_id_seq', 9);

-- Datos: camion_configuracion
INSERT INTO public.camion_configuracion (id, distancia_entre_ejes, distancia_primer_eje_espalda_cabina, voladizo_delantero, voladizo_trasero, peso_eje_delantero, peso_eje_trasero, pbt, original, es_modificado, fk_id_camion, ancho_chasis_1, ancho_chasis_2) VALUES 
(1,4000,800,1400,1100,3600,2400,16000,true,false,1,850,NULL),(2,4000,800,1400,1100,3600,2400,16000,true,false,NULL,850,NULL),(3,4000,800,1400,1100,3600,2400,16000,true,false,NULL,850,NULL),(4,4000,800,1400,1100,3600,2400,16000,true,false,1,850,NULL),(5,4000,800,1400,1100,3600,2400,16000,true,false,1,850,NULL),(6,3000,800,1400,1100,3600,2400,16000,true,false,4,850,NULL),(7,3100,750,1300,1150,3200,5100,8300,true,false,5,854,70),(10,4350,858,1380,1100,4000,1727,16500,true,false,8,850,NULL),(11,4800,900,1400,1200,4500,1800,16500,true,false,9,850,NULL),(12,3100,750,1300,1150,3200,5100,8300,true,false,5,854,70),(13,3100,750,1300,1150,3200,5100,8300,true,false,5,854,70),(14,3100,750,1300,1150,3200,5100,8300,true,false,5,854,70),(15,3100,750,1300,1150,3200,5100,8300,true,false,5,854,70),(16,3100,750,1300,1150,3200,5100,8300,true,false,5,854,70);
SELECT setval('public.camion_configuracion_id_seq', 16);

-- Datos: pedido
INSERT INTO public.pedido (id, fk_id_camion, fk_cuit_cliente, estado, fecha_pedido, fecha_entrega, fk_id_usuario) VALUES 
(1,1,20334455667,'Pendiente','2025-12-03',NULL,'12345678'),(2,1,20334455667,'Pendiente','2025-12-03',NULL,'12345678'),(3,4,20334455667,'Entregado','2025-12-03','2024-12-20','12345678'),(4,8,20304050607,'Pendiente','2026-05-01',NULL,'99999999'),(5,9,20304050607,'Pendiente','2026-05-01',NULL,'99999999'),(6,5,30998877665,'Pendiente','2026-05-01',NULL,'12345611178'),(7,5,30998877665,'En Producción','2026-05-01','2026-05-29','12345611178'),(8,5,30555666777,'Pendiente','2026-05-03',NULL,'12345611178'),(9,5,20123456789,'Pendiente','2026-05-03',NULL,'12345611178'),(10,5,30555666777,'Pendiente','2026-05-03',NULL,'12345611178');
SELECT setval('public.pedido_id_seq', 10);

-- Datos: carroceria
INSERT INTO public.carroceria (id, fk_id_pedido, tipo_carroceria, largo_carroceria, alto_carroceria, ancho_carroceria, equipo_frio_marca_modelo, observaciones, separacion_cabina_carroceria) VALUES 
(1,1,'Cerealera',6500,2400,2600,NULL,NULL,150),(2,2,'Cerealera',6500,2400,2600,NULL,NULL,150),(3,3,'Cerealera',6500,2400,2600,NULL,NULL,150),(4,4,'Metálica',8000,2500,2500,NULL,NULL,200),(5,5,'Metálica',7000,2400,2500,NULL,NULL,200),(6,6,'Metálica',5000,2400,2200,NULL,NULL,80),(7,7,'Metálica',6000,2480,2200,NULL,NULL,80),(8,8,'Metálica',6000,2480,2200,NULL,NULL,80),(9,9,'Metálica',6000,2480,2200,NULL,NULL,80),(10,10,'Metálica',6000,2480,2200,NULL,NULL,80);
SELECT setval('public.carroceria_id_seq', 10);

-- Datos: calculos
INSERT INTO public.calculos (id, fk_id_pedido, resultado_peso_bruto_total_maximo, resultado_carga_eje_delantero_calculada, resultado_carga_eje_trasero_calculada, resultado_porcentaje_carga_eje_delantero, resultado_modificacion_chasis, resultado_voladizo_trasero_calculado, resultado_largo_final_camion, verificacion_distribucion_carga_ok, verificacion_voladizo_trasero_ok, recomendaciones, resultado_desplazamiento_eje, resultado_nueva_distancia_entre_ejes, resultado_centro_carga_carroceria, resultado_centro_carga_total, resultado_carga_maxima_eje_delantero, resultado_carga_maxima_eje_trasero, resultado_carga_total_calculada) VALUES 
(1,1,16000,2160,7840,36.00,'alargar 2350 mm el chasis',3450,8850,true,false,ARRAY['• Observaciones detectadas:','     - El voladizo trasero excede el máximo permitido en 1050 mm (actual: 3450 mm, máximo: 2400 mm).','-','• Posibles soluciones:','     Opción 1: Desplazar el eje trasero 1357 mm hacia atrás para corregir el voladizo.','     Opción 2: alargar 2350 mm el chasis para corregir la longitud del chasis.'],NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(2,2,16000,2160,7840,36.00,'alargar 2350 mm el chasis',3450,8850,true,false,ARRAY['• Observaciones detectadas:','     - El voladizo trasero excede el máximo permitido en 1050 mm (actual: 3450 mm, máximo: 2400 mm).','-','• Posibles soluciones:','     Opción 1: Desplazar el eje trasero 1357 mm hacia atrás para corregir el voladizo.','     Opción 2: alargar 2350 mm el chasis para corregir la longitud del chasis.'],NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(3,3,16000,2160,7840,36.00,'alargar 2350 mm el chasis',3450,8850,true,false,ARRAY['• Observaciones detectadas:','     - El voladizo trasero excede el máximo permitido en 1050 mm (actual: 3450 mm, máximo: 2400 mm).','-','• Posibles soluciones:','     Opción 1: Desplazar el eje trasero 1357 mm hacia atrás para corregir el voladizo.','     Opción 2: alargar 2350 mm el chasis para corregir la longitud del chasis.'],NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(4,4,16500,1280,8833,28.24,'Sin cambios',4708,10438,false,false,ARRAY['test'],NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(5,5,16500,1440,8200,30.50,'alargar 400 mm el chasis',4500,10700,true,true,ARRAY['El diseño cumple'],NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(6,6,8300,-212,212,38.55,'alargar 1580 mm el chasis',2730,7130,false,false,ARRAY['• Observaciones detectadas:','     - El voladizo trasero excede el máximo permitido en 870 mm (actual: 2730 mm, máximo: 1860 mm).','     - Distribución de carga fuera de norma: Distribución fuera de norma (38.6%). Debe estar entre 30% y 36%.','-','• Posibles soluciones:','     Opción 1: Desplazar el eje trasero 3100 mm hacia adelante para corregir el voladizo.','     Opción 2: alargar 1580 mm el chasis para corregir la longitud del chasis.'],NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(7,7,8300,-212,212,38.55,'alargar 2580 mm el chasis',3730,8130,false,false,ARRAY['• Observaciones detectadas:','     - El voladizo trasero excede el máximo permitido en 1870 mm (actual: 3730 mm, máximo: 1860 mm).','     - Distribución de carga fuera de norma: Distribución fuera de norma (38.6%). Debe estar entre 30% y 36%.','-','• Posibles soluciones:','     Opción 1: Desplazar el eje trasero 3100 mm hacia adelante para corregir el voladizo.','     Opción 2: alargar 2580 mm el chasis para corregir la longitud del chasis.'],-3100,0,3830,657200,NULL,NULL,NULL),
(8,8,8300,-1930.967741935484,1930.967741935484,15.29,'alargar 2580 mm el chasis',3730,8130,false,false,ARRAY['{"texto":"Reducir el largo de la carrocería en 1870 mm.","prioridad":1,"tipo":"reducir_largo_carroceria"}','{"texto":"Reducir la separación cabina-carrocería en 1870 mm.","prioridad":1,"tipo":"ajustar_separacion"}','{"texto":"alargar 2580 mm el chasis para corregir la longitud del chasis.","prioridad":2,"tipo":"modificar_chasis"}','{"texto":"Desplazar el eje trasero 2652 mm hacia atrás. Esto ajusta la distribución de carga al rango normativo sin exceder el voladizo máximo (18.7%).","prioridad":2,"tipo":"desplazar_eje"}','{"texto":"Reducir el PBT a 4230 kg. Con el PBT actual (8300 kg), la carga en el eje delantero representa solo 15.3% (mínimo 30%). Un PBT menor aumenta el porcentaje relativo del peso delantero.","prioridad":3,"tipo":"mayor_pbt"}','{"texto":"El eje delantero está sobrecargado en 1931 kg. El PBT es insuficiente para la configuración. Aumentar el PBT o seleccionar un camión con menor tara en el eje delantero.","prioridad":3,"tipo":"mayor_pbt"}','{"texto":"El camión seleccionado no tiene capacidad suficiente para esta configuración. Considerar un modelo con mayor PBT o diferentes taras de eje.","prioridad":3,"tipo":"mayor_pbt"}'],2652.014652014652,5752.014652014652,3830,3830,NULL,NULL,NULL),
(9,9,8300,-1930.967741935484,1930.967741935484,15.29,'alargar 2580 mm el chasis',3730,8130,false,false,ARRAY['{"texto":"Reducir el largo de la carrocería en 1870 mm.","prioridad":1,"tipo":"reducir_largo_carroceria"}','{"texto":"Reducir la separación cabina-carrocería en 1870 mm.","prioridad":1,"tipo":"ajustar_separacion"}','{"texto":"alargar 2580 mm el chasis para corregir la longitud del chasis.","prioridad":2,"tipo":"modificar_chasis"}','{"texto":"Desplazar el eje trasero 2652 mm hacia atrás. Esto ajusta la distribución de carga al rango normativo sin exceder el voladizo máximo (18.7%).","prioridad":2,"tipo":"desplazar_eje"}','{"texto":"Reducir el PBT a 4230 kg. Con el PBT actual (8300 kg), la carga en el eje delantero representa solo 15.3% (mínimo 30%). Un PBT menor aumenta el porcentaje relativo del peso delantero.","prioridad":3,"tipo":"mayor_pbt"}','{"texto":"El eje delantero está sobrecargado en 1931 kg. El PBT es insuficiente para la configuración. Aumentar el PBT o seleccionar un camión con menor tara en el eje delantero.","prioridad":3,"tipo":"mayor_pbt"}','{"texto":"El camión seleccionado no tiene capacidad suficiente para esta configuración. Considerar un modelo con mayor PBT o diferentes taras de eje.","prioridad":3,"tipo":"mayor_pbt"}'],2652.014652014652,5752.014652014652,3830,3830,NULL,NULL,NULL),
(10,10,8300,-1930.967741935484,1930.967741935484,15.29,'alargar 2580 mm el chasis',3730,8130,false,false,ARRAY['{"texto":"Reducir el largo de la carrocería en 1870 mm.","prioridad":1,"tipo":"reducir_largo_carroceria"}','{"texto":"Reducir la separación cabina-carrocería en 1870 mm.","prioridad":1,"tipo":"ajustar_separacion"}','{"texto":"alargar 2580 mm el chasis para corregir la longitud del chasis.","prioridad":2,"tipo":"modificar_chasis"}','{"texto":"Desplazar el eje trasero 2652 mm hacia atrás. Esto ajusta la distribución de carga al rango normativo sin exceder el voladizo máximo (18.7%).","prioridad":2,"tipo":"desplazar_eje"}','{"texto":"Reducir el PBT a 4230 kg. Con el PBT actual (8300 kg), la carga en el eje delantero representa solo 15.3% (mínimo 30%). Un PBT menor aumenta el porcentaje relativo del peso delantero.","prioridad":3,"tipo":"mayor_pbt"}','{"texto":"El eje delantero está sobrecargado en 1931 kg. El PBT es insuficiente para la configuración. Aumentar el PBT o seleccionar un camión con menor tara en el eje delantero.","prioridad":3,"tipo":"mayor_pbt"}','{"texto":"El camión seleccionado no tiene capacidad suficiente para esta configuración. Considerar un modelo con mayor PBT o diferentes taras de eje.","prioridad":3,"tipo":"mayor_pbt"}'],2652.014652014652,5752.014652014652,3830,3830,NULL,NULL,NULL);
SELECT setval('public.calculos_id_seq', 10);

-- Datos: proyecto_modificado
INSERT INTO public.proyecto_modificado (id, fk_cuit_cliente, cliente_razon_social, estado_proyecto, created_at, fecha_entrega, fk_id_usuario) VALUES 
(2,20334455667,'Transportes El Audaz SA','En Producción','2025-12-03 22:29:48.955105','2025-03-15','12345678'),
(1,20334455667,'Transportes El Audaz SA','Pendiente','2025-12-03 22:29:16.984132',NULL,'12345678'),
(4,30998877665,'Transportes del Norte SRL','Pendiente','2026-05-03 21:02:51.319606',NULL,'12345611178'),
(5,20334455667,'Transportes El Audaz SA','Pendiente','2026-05-03 21:26:00.395346',NULL,'12345611178');
SELECT setval('public.proyecto_modificado_id_seq', 5);

-- Datos: camion_modificado
INSERT INTO public.camion_modificado (id, fk_proyecto_modificado_id, marca_camion, modelo_camion, ano_camion, tipo_camion) VALUES 
(2,2,'Ford','Cargo 1723','2015','4x2'),(1,1,'Ford','Cargo 1722','2015','4x2'),(3,4,'Mercedes','Acceto','2022','4x2'),(4,5,'Mercedes','Acceto','2022','4x2');
SELECT setval('public.camion_modificado_id_seq', 4);

-- Datos: configuracion_modificada
INSERT INTO public.configuracion_modificada (id, distancia_entre_ejes, distancia_primer_eje_espalda_cabina, voladizo_delantero, voladizo_trasero, peso_eje_delantero, peso_eje_trasero, pbt, fk_id_camion_modificado, ancho_chasis_1, ancho_chasis_2) VALUES 
(2,3000,800,1400,1100,3600,2400,16000,2,850,NULL),(1,4000,800,1400,1100,3600,2400,16000,1,850,NULL),(3,5497,750,1400,1150,3500,2800,16500,3,854,NULL),(4,4800,750,1400,1150,3500,2800,16500,4,854,NULL);
SELECT setval('public.configuracion_modificada_id_seq', 4);

-- Datos: carroceria_modificada
INSERT INTO public.carroceria_modificada (id, fk_proyecto_modificado_id, tipo_carroceria, largo_carroceria, alto_carroceria, ancho_carroceria, separacion_cabina_carroceria, equipo_frio_marca_modelo) VALUES 
(1,1,'Cerealera',6500,2400,2600,150,''),(2,2,'Cerealera',6500,2400,2600,150,''),(3,4,'Metálica',6550,2600,2600,150,''),(4,5,'Metálica',6000,2600,2600,150,'');
SELECT setval('public.carroceria_modificada_id_seq', 4);

-- Datos: calculos_modificado
INSERT INTO public.calculos_modificado (id, fk_proyecto_modificado_id, resultado_peso_bruto_total_maximo, resultado_carga_maxima_eje_delantero, resultado_carga_maxima_eje_trasero, resultado_carga_total_calculada, resultado_carga_eje_delantero_calculada, resultado_carga_eje_trasero_calculada, resultado_porcentaje_carga_eje_delantero, resultado_modificacion_chasis, resultado_voladizo_trasero_calculado, resultado_largo_final_camion, resultado_centro_carga_total, resultado_centro_carga_carroceria, resultado_nueva_distancia_entre_ejes, resultado_desplazamiento_eje, verificacion_distribucion_carga_ok, verificacion_voladizo_trasero_ok, recomendaciones) VALUES 
(2,2,16000,NULL,NULL,NULL,2160,7840,36,'Alargar 1200 mm (Confirmado en planta)',3450,8850,NULL,NULL,NULL,NULL,true,false,ARRAY['• Observaciones detectadas:','     - El voladizo trasero excede el máximo permitido en 1050 mm (actual: 3450 mm, máximo: 2400 mm).','-','• Posibles soluciones:','     Opción 1: Desplazar el eje trasero 1357 mm hacia atrás para corregir el voladizo.','     Opción 2: alargar 2350 mm el chasis para corregir la longitud del chasis.']),
(1,1,16000,NULL,NULL,NULL,2160,7840,36,'alargar 2350 mm el chasis',3450,8850,NULL,NULL,NULL,NULL,true,false,ARRAY['• Observaciones detectadas:','     - El voladizo trasero excede el máximo permitido en 1050 mm (actual: 3450 mm, máximo: 2400 mm).','-','• Posibles soluciones:','     Opción 1: Desplazar el eje trasero 1357 mm hacia atrás para corregir el voladizo.','     Opción 2: alargar 2350 mm el chasis para corregir la longitud del chasis.','ACTUALIZADO']),
(3,4,16500,NULL,NULL,NULL,2453.0471166090592,7746.952883390941,36.079073433994296,'alargar 803 mm el chasis',1953,8850,4175,4175,5487.757731958763,-9.242268041237367,false,true,ARRAY['{"texto":"Considerar cambiar a un camión 6x2. El 4x2 concentra más carga en el eje delantero (36.1%). El 6x2 distribuye más carga en los ejes traseros (25% en delantero).","prioridad":3,"tipo":"cambiar_a_6x2"}','{"texto":"Reducir el PBT ingresado. Con el PBT actual, la carga en el eje delantero excede el máximo permitido (36.1% vs máximo 36%).","prioridad":3,"tipo":"mayor_pbt"}']),
(4,5,16500,NULL,NULL,NULL,1912.5,8287.5,32.8030303030303,'alargar 950 mm el chasis',2100,8300,3900,3900,5126.288659793814,326.2886597938141,true,true,ARRAY['{"texto":"Desplazar el eje trasero 326 mm hacia atrás. Esto ajusta la distribución de carga al rango normativo sin exceder el voladizo máximo (34.6%).","prioridad":2,"tipo":"desplazar_eje"}']);
SELECT setval('public.calculos_modificado_id_seq', 4);
