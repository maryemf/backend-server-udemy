var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


// busqueda general (todas las colecciones)
app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regEx = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(busqueda, regEx),
            buscarMedicos(busqueda, regEx),
            buscarUsuarios(busqueda, regEx)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });

});


// busqueda por coleccion
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regEx = new RegExp(busqueda, 'i');
    var promesa;

    switch (tabla) {
        case 'medicos':
            promesa = buscarMedicos(busqueda, regEx);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regEx);
            break;
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regEx);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Las colecciones permitidas son: usuarios, medicos y hospitales',
                errors: 'Ha solicitado una coleccion que no existe'
            });
    }
    promesa.then(data => {
        res.status(200).json({
            ok: false,
            [tabla]: data //variables computadas
        });
    });

});


function buscarHospitales(busqueda, regEx) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regEx })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regEx) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regEx })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regEx) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or({ nombre: regEx }, { email: regEx })
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;