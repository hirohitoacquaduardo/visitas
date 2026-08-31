CREATE TABLE visitas (
    tipo_visita CHAR(2) NOT NULL,
    fec_aper DATE NOT NULL,
    fec_cier DATE,
    control_estatus CHAR(2) NOT NULL DEFAULT 'ab',
    id_visitado VARCHAR(100),
    tm_control TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacion TEXT,
    num_expediente VARCHAR(10) NOT NULL PRIMARY KEY,
    nombre_empleado VARCHAR(100)
);