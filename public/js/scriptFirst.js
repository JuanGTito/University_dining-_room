function openSurveyModal() {
    document.getElementById('surveyModal').style.display = 'flex';
  }

function closeSurveyModal() {
  document.getElementById('surveyModal').style.display = 'none';
}

window.addEventListener('click', (event) => {
  if (event.target === document.getElementById('surveyModal')) {
    closeSurveyModal();
  }
});

function submitSurvey() {
  const comentario = document.getElementById('comentario').value;
  const puntuacion = document.getElementById('puntuacion').value;
  if (puntuacion <= 5) {
    fetch('/submitSurvey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comentario,
        puntuacion
      }),
    })
    .then(response => response.json())
    .then(data => {
      alert('Encuesta enviada con éxito');
      closeSurveyModal();
    })
    .catch(error => {
      console.error('Error:', error);
    });
  } else {
    alert("la puntuacion no corresponde")
  } 
};

function showMenu() {
  fetch('/menuSemanal')
      .then(response => response.json())
      .then(data => {
          const tableBody = document.getElementById('menuTableBody');
          tableBody.innerHTML = ''; // Limpia el contenido previo
          data.forEach(row => {
              const tr = document.createElement('tr');
              tr.innerHTML = `
                  <td>${row.dia_semana}</td>
                  <td>${row.desayuno}</td>
                  <td>${row.almuerzo}</td>
              `;
              tableBody.appendChild(tr);
          });
          document.getElementById('menuModal').style.display = 'block';
      })
      .catch(error => console.error('Error al cargar el menú:', error));
}

function closeMenuModal() {
  document.getElementById('menuModal').style.display = 'none';
  alertify.success('Gracias por ver el menu.');
}

const quienesSomos = `
  <p>
      Bienvenidos al Comedor Universitario de la Universidad Nacional De Juliaca. 
      Somos un espacio dedicado a proporcionar a nuestra comunidad estudiantil, 
      una alimentación balanceada, saludable y accesible. Nuestro objetivo es no solo satisfacer las necesidades nutricionales, 
      sino también fomentar hábitos alimenticios saludables y sostenibles.
  </p>
`;

function showQuienesSomos() {
  alertify.alert('¿Quiénes Somos?', quienesSomos, function(){
      alertify.success('Gracias por su interés.');
  }).set('closable', true); // Asegura que el modal sea cerrable
}