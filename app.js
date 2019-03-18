// requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')

// inicializar variables
var app = express();

// body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');



// conexiones bd
mongoose.connection.openUri('mongodb://localhost:27017/hospitaldb', (err, res) => {
    if (err) throw err;
    console.log('Base de datos puerto 27017: \x1b[32m%s\x1b[0m', 'online');
});

// rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// escuchar peticiones
app.listen(3000, () => {
    console.log('Server Express corriendo puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});