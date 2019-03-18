var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// verificar token todo lo que viene despues de esta ruta requiere token MIDDLEWARE
exports.verficaToken = function(req, res, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
        req.usuario = decoded.usuario; // disponible para cualquier petition que use este middleware
        next();

    });
}