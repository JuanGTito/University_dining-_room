const bcryptjs = require('bcryptjs');
const connection = require('../conection/conexion');

async function auth(req, res) {
  const { user, pass } = req.body;

  if (!user || !pass) {
    res.send('Please enter user and Password!');
    res.end();
    return;
  }

  try {
    connection.query('SELECT * FROM users WHERE usuario = ?', [user], async (error, results) => {
      if (error) {
        console.error('Database query error:', error);
        res.status(500).send('Internal Server Error');
        return;
      }

      if (results.length === 0 || !(await bcryptjs.compare(pass, results[0].contrasenia))) {
        res.render('login', {
          alert: true,
          alertTitle: "Error",
          alertMessage: "USUARIO y/o PASSWORD incorrectas",
          alertIcon: 'error',
          showConfirmButton: true,
          timer: false,
          ruta: 'login'
        });
      } else {
        req.session.loggedin = true;
        req.session.name = results[0].name;

        // Define a mapping of usernames to their corresponding templates
        const userTemplateMap = {
          'administrador': 'adm',
          'supervisor': 'register',
          'nutricionista': 'nutri',
          'concesionaria': 'concesio'
        };

        // Use the username to find the corresponding template
        const route = userTemplateMap[user] || 'default'; // 'default' or any fallback template

        res.render('login', {
          alert: true,
          alertTitle: "Conexión exitosa",
          alertMessage: "¡LOGIN CORRECTO!",
          alertIcon: 'success',
          showConfirmButton: false,
          timer: 1500,
          ruta: route
        });
      }

      res.end();
    });
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).send('Internal Server Error');
  }
}

module.exports = {auth};