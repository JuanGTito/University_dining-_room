const express = require('express');
const router = express.Router();

const conexion = require('./conection/conexion');
const authController = require('./controllers/loginController');
const supervisarController = require('./controllers/supervisor');

router.post('/auth', authController);

router.get('/login', (req, res) => {
    res.render('login');
});

//router.get('/search', supervisarController);

router.get('/register', (req, res) => {
	
    if (req.session.loggedin) {
		res.render('register',{
			login: true,
			name: req.session.name			
		});		
	} else {
		res.render('register',{
			login:false,
			name: req.session.name,			
		});				
	}
});



router.get('/', (req, res)=> {
	if (req.session.loggedin) {
		res.render('inicio',{
			login: true,
			name: req.session.name			
		});		
	} else {
		res.render('inicio',{
			login:false,
			name: req.session.name,			
		});				
	}
	res.end();
});

module.exports = router