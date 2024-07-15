const express = require('express');
const app = express();
const path = require('path');

app.use('/assets', express.static(path.join(process.cwd(), "public")))

app.set('view engine', 'ejs');
app.use('/', require('./router'));

app.use(express.static('views'))

app.listen(5000, ()=>{
    console.log("servidor corriendo en http://localhost:5000");
})