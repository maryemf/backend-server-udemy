// requires
var express = require('express');
var mongoose = require('mongoose');

// inicializar variables
var app = express();

//rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

// conexiones bd
mongoose.connection.openUri('mongodb://localhost:27017/hospitaldb', (err, res) => {
    if (err) throw err;
    console.log('Base de datos puerto 27017: \x1b[32m%s\x1b[0m', 'online');
});

// escuchar peticiones
app.listen(3000, () => {
    console.log('Server Express corriendo puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});