const express = require('express');
const router = express.Router();

const conexion = require('./conection/conexion');
const authController = require('./controllers/loginController');
const supervisarController = require('./controllers/supervisor');
const adminController = require('./controllers/administracion')

router.post('/auth', authController.auth);

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/', (req, res) => {
    res.render('inicio', {
        login: req.session.loggedin || false,
        name: req.session.name || ''
    });
});

router.get('/adm', adminController.showListAdm);
//router.post('/searchListAdm', adminController.searchListAdm);
//router.get('/generateReport', adminController.generateReportAdm);

router.get('/nutri', (req, res) => {
    res.render('nutri', {
        login: req.session.loggedin || false,
        name: req.session.name || ''
    });
});

router.get('/concesio', (req, res) => {
    res.render('concesio', {
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