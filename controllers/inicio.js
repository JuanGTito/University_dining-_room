const connection = require('../conection/conexion');

function submitSurvey (req, res) {
    const { comentario, puntuacion } = req.body;
  
    const codigoEstudiante = null; // Establece en null si no lo usas
  
    connection.query(
      'INSERT INTO Encuesta (fecha, Comentario, Puntuacion, codigoestudiante2) VALUES (CURDATE(), ?, ?, ?)',
      [comentario, puntuacion, codigoEstudiante],
      (error, results) => {
        if (error) {
          console.error('Database query error:', error);
          res.status(500).send('Internal Server Error');
          return;
        }
        res.json({ success: true });
      }
    );
};

module.exports = {
    submitSurvey
};