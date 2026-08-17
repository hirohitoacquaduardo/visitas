CREATE TABLE visitas (
    num_exp CHAR(10) NOT NULL PRIMARY KEY,
    tipo_visita CHAR(2) NOT NULL,
    fec_aper DATE NOT NULL,
    fec_cier DATE,
    estatus CHAR(2) NOT NULL DEFAULT 'ab',
    visitado VARCHAR(100),
    tm_control TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacion TEXT
);