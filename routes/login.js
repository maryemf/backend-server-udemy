var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

// google 
var CLIENT_ID = require('../config/config').CLIENT_ID;
var { OAuth2Client } = require('google-auth-library');
var client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    var ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    var payload = ticket.getPayload();
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
};

// autenticacion de google
app.post('/google', async(req, res) => {
    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: false,
                mensaje: 'Token inválido',
                errors: { message: 'Token inválido' }
            });
        });
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar al usuario',
                errors: err
            });
        }
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticación normal',
                    errors: { message: 'Debe usar su autenticación normal' }
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    id: usuarioDB._id
                });
            }
        } else { // el usuario no existe hay que crearlo
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.password = ':)';
            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar al usuario',
                        errors: err
                    });
                }

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    id: usuarioDB._id
                });

            });
        }
    });
});


// autenticacion normal
app.post('/', (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuario) => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuario.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // crear un token
        usuario.password = ':)';
        var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuario,
            id: usuario._id,
            token: token
        });
    });

});

module.exports = app;