const express = require('express');
const router = express.Router();

const conexion = require('./conection/conexion');
const authController = require('./controllers/loginController');
const supervisarController = require('./controllers/supervisor');

router.post('/auth', authController);

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/', (req, res) => {
    res.render('inicio', {
        login: req.session.loggedin || false,
        name: req.session.name || ''
    });
});


router.get('/register', supervisarController.showList);
router.post('/searchList', supervisarController.searchList);
router.post('/register', supervisarController.registerAttendance);
router.post('/autoRegister', supervisarController.autoRegister);
router.get('/generateReport', supervisarController.generateReport);

module.exports = router