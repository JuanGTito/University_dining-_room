var tableContent = `
            <h2>Degustación Semanal</h2>
            <hr>
            <table border="1" style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr>
                        <th></th>
                        <th class="menu-diario">Desayuno</th>
                        <th class="menu-diario">Almuerzo</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="dia-semanal">Lunes</td>
                        <td class="comida-diaria">Avena, Frutas, Café</td>
                        <td class="comida-diaria">Pollo a la plancha, Ensalada, Arroz</td>
                    </tr>
                    <tr>
                        <td class="dia-semanal">Martes</td>
                        <td class="comida-diaria">Huevos revueltos, Pan tostado, Jugo</td>
                        <td class="comida-diaria">Pasta con salsa, Vegetales, Jugo</td>
                    </tr>
                    <tr>
                        <td class="dia-semanal">Miércoles</td>
                        <td class="comida-diaria">Yogur, Granola, Frutas</td>
                        <td class="comida-diaria">Carne asada, Papas, Ensalada</td>
                    </tr>
                    <tr>
                        <td class="dia-semanal">Jueves</td>
                        <td class="comida-diaria">Pancakes, Miel, Frutas</td>
                        <td class="comida-diaria">Pescado, Arroz, Verduras</td>
                    </tr>
                    <tr>
                        <td class="dia-semanal">Viernes</td>
                        <td class="comida-diaria">Cereal, Leche, Frutas</td>
                        <td class="comida-diaria">Pollo al horno, Puré de papas, Ensalada</td>
                    </tr>
                </tbody>
            </table>
        `;
        document.getElementById('myButton').onclick = function() {
            alertify.alert('Alert Title', tableContent, function(){
                alertify.success('Ok');
            });
        };