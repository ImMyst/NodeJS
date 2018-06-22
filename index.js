const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');

const db = new Sequelize('rattrapage_nodejs', 'user', 'root', {
    host: 'localhost',
    dialect: 'mysql'
});

app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', 'public/views')
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('home');
});




app.listen(3000);
