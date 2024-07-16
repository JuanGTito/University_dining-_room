const bcryptjs = require('bcryptjs');
const connection= require('../conection/conexion');

async function auth(req, res) {
  const user = req.body.user;
  const pass = req.body.pass;

  let passwordHaash = await bcryptjs.hash(pass, 8);

  if (user && pass) {
		connection.query('SELECT * FROM users WHERE usuario = ?', [user], async (error, results, fields)=> {
			if( results.length == 0 || !(await bcryptjs.compare(pass, results[0].contrasenia)) ) {    
				res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "USUARIO y/o PASSWORD incorrectas",
                        alertIcon:'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'    
                    });				
			} else {               
				req.session.loggedin = true;                
				req.session.name = results[0].name;
				res.render('login', {
					alert: true,
					alertTitle: "Conexión exitosa",
					alertMessage: "¡LOGIN CORRECTO!",
					alertIcon:'success',
					showConfirmButton: false,
					timer: 1500,
					ruta: 'register'
				});        			
			}			
			res.end();
		});
	} else {	
		res.send('Please enter user and Password!');
		res.end();
	}
}

module.exports = auth;