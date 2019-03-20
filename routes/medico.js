var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// obtener todos los usuarios 
app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando médicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, count) => {
                    if (err) {
                        res.status(500).json({
                            ok: false,
                            mensaje: 'Error cargando médicos',
                            errors: err
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        totalCount: count,
                        medicos: medicos
                    });

                });
            });
});

// crear medico
app.post('/', mdAutenticacion.verficaToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear médico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});

// actualizar medico 
app.put('/:id', mdAutenticacion.verficaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar médico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El médico con el id ' + id + ' no existe',
                errors: { message: 'No existe un médico con ese ID' }
            });
        }
        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.usuario = req.usuario;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar médico',
                    errors: err
                });
            }
            medicoGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });

    });
});

// borrar medico
app.delete('/:id', mdAutenticacion.verficaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar médico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El médico con el id ' + id + ' no existe',
                errors: { message: 'No existe un médico con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;