var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// default options - middelware
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    //colecciones
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Colección no válida',
            errors: 'Las colecciones válidas son: ' + tiposValidos.join(', ')
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No ha seleccionado ningun archivo',
            errors: 'Debe seleccionar una imagen'
        });
    }

    // obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado[nombreCortado.length - 1];

    // extensiones permitidas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: 'Las extensiones válidas son: ' + extensionesValidas.join(', ')
        });
    }

    // nombre de archivo personalizado
    var nombreArchivo = `${id}-${ new Date().getMilliseconds()}.${extension}`;

    //mover el archivo
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
    });



});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    switch (tipo) {
        case 'usuarios':
            Usuario.findById(id, (err, usuario) => {
                if (!usuario) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Usuario no existe',
                        errors: { message: 'Usuario no existe' }
                    });
                }

                var pathAnt = './uploads/usuarios/' + usuario.img;
                // elimina la imagen anterior
                if (fs.existsSync(pathAnt)) {
                    fs.unlinkSync(pathAnt);
                }
                usuario.img = nombreArchivo;
                usuario.save((err, usuarioActualizado) => {
                    usuarioActualizado.password = ':)';
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        usuario: usuarioActualizado
                    });
                });
            });
            break;
        case 'medicos':
            Medico.findById(id, (err, medico) => {
                if (!medico) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Médico no existe',
                        errors: { message: 'Médico no existe' }
                    });
                }

                var pathAnt = './uploads/medicos/' + medico.img;
                // elimina la imagen anterior
                if (fs.existsSync(pathAnt)) {
                    fs.unlinkSync(pathAnt);
                }
                medico.img = nombreArchivo;
                medico.save((err, medicoActualizado) => {
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de médico actualizada',
                        medico: medicoActualizado
                    });
                });
            });
            break;
        case 'hospitales':
            Hospital.findById(id, (err, hospital) => {
                if (!hospital) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Hospital no existe',
                        errors: { message: 'Hospital no existe' }
                    });
                }

                var pathAnt = './uploads/hospitales/' + hospital.img;
                // elimina la imagen anterior
                if (fs.existsSync(pathAnt)) {
                    fs.unlinkSync(pathAnt);
                }
                hospital.img = nombreArchivo;
                hospital.save((err, hospitalActualizado) => {
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada',
                        hospital: hospitalActualizado
                    });
                });
            });
            break;
    }
}

module.exports = app;