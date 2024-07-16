//CASO OPCIONAL PARA REGISTRAR EN PRUEBA, SE PROBO DIRECTAMENTE DESDE CONEXION.JS

const bcrypt = require('bcryptjs');
//10 - Método para la REGISTRACIÓN
async function register(req, res){
	const user = "admin";
	const pass = "12345";
	let passwordHash = await bcrypt.hash(pass, 8);
    connection.query('INSERT INTO users SET ?',{usuario:user, contraseina:passwordHash}, async (error, results)=>{
        if(error){
            console.log(error);
        }else{            
			console.log('REGISTRADO')
            //res.redirect('/');         
        }
	});
}

module.exports = register;