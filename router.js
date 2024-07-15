const express = require('express');
const router = express.Router();

const conexion = require('./conection/conexion')

router.get('/', (req, res) =>{
    res.render('inicio')
    /*conexion.query('SELECT * FROM estudiante', (error, results)=>{
        if (error) {
            throw error;
        } else {
            res.send(results);
        }
    })*/
})

module.exports = router