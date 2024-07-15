const express = require('express');
const router = express.Router();

const conexion = require('./conection/conexion')
//const LoginController = require('./controllers/loginController');

router.get('/', (req, res) =>{
    res.render('inicio')
})
//router.get('/login', LoginController.login);
//router.post('/auth', LoginController.auth);
//router.get('/logout', LoginController.logout);

module.exports = router