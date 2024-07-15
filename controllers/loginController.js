const bcrypt = require('bcrypt');

function login(req, res) {
    if (req.session.loggedin) {
          if(req.session.loggedin != true)
      res.redirect('login/inicio');
      
    } else {
      res.render('/');
    }
  }

function auth(req, res) {
    const data = req.body;
  
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM users WHERE email = ?', [data.email], (err, userdata) => {
            if(userdata.length > 0) {
                userdata.forEach(element => {
                    bcrypt.compare(data.password, element.password, (err, isMatch) => {
                        if (!isMatch) {
                            res.render('login/index', {error: 'error: incorrect password'});
                        } else {
                            req.session.loggedin = true;
                            req.session.name  = element.name;

                            res.redirect('/')

                        }
                    });
                });
                } else {
                    res.render('login/index', {error: 'error: user not exists !'})
                    }
      });
    });
  }
  
  function logout(req, res) {
    if (req.session.loggedin == true) {
      req.session.destroy();
    }
    res.redirect('/');
  }
  
  
  module.exports = {
    login: login,
    auth: auth,
    logout: logout,
  }