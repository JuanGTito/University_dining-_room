const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const authController = require('./controllers/loginController');
const supervisarController = require('./controllers/supervisor');
const adminController = require('./controllers/administracion')
const inicioController = require('./controllers/inicio');
const nutricionistaController = require('./controllers/nutri')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Cambia la ruta a la carpeta uploads dentro de University_dining_room
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
// Autenticación
router.post('/auth', authController.auth);

// Páginas estáticas
router.get('/login', (req, res) => {
    res.render('login');
});
router.get('/', (req, res) => {
    res.render('inicio', {
        login: req.session.loggedin || false,
        name: req.session.name || ''
    });
});
router.post('/submitSurvey', inicioController.submitSurvey );

// Administración
router.get('/adm', adminController.showListAdm);
router.post('/searchListAdm', adminController.searchListAdm);
router.post('/addStudent', adminController.addStudent);
router.get('/getStudent/:codigoestudiante', adminController.getStudent);
router.post('/editStudent', adminController.editStudent);
router.delete('/deleteStudent/:codigoestudiante', adminController.deleteStudent);
router.post('/importar-relacion', upload.single('file'), adminController.importRelation);
router.post('/exportarAsistencia', adminController.exportarAsistencia);
router.get('/menuSemanal', adminController.menuSemanal);
router.get('/encuestas', adminController.encuestas);
router.get('/exportStudents', adminController.exportStudents);


// Supervisión
router.get('/register', supervisarController.showList);
router.post('/searchList', supervisarController.searchList);
router.post('/register', supervisarController.registerAttendance);
router.post('/autoRegister', supervisarController.autoRegister);
// Rutas para cada tipo de reporte
router.get('/generateExcelReport', supervisarController.generateExcelReport);
router.get('/generatePDFReport', supervisarController.generatePDFReport);
router.get('/printReport', supervisarController.printReport);
// Supervisor Routes
router.get('/getTotalStudents', supervisarController.getTotalStudents);
router.get('/getRegisteredStudentsCount', supervisarController.getRegisteredStudentsCount);

// Páginas adicionales
router.get('/nutri', nutricionistaController.showListNutri);
router.get('/menuSemanalNutri', nutricionistaController.menuSemanalNutri);
router.post('/addMenuNutri', nutricionistaController.addMenuNutri);
router.post('/updateMenuNutri', nutricionistaController.updateMenuNutri);



router.get('/concesio', (req, res) => {
    res.render('concesio', {
        login: req.session.loggedin || false,
        name: req.session.name || ''
    });
});


module.exports = router