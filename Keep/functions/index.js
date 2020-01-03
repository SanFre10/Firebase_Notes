const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
const handlebars = require('express-handlebars');
const path = require('path');

const firebaseApp = firebase.initializeApp(
    functions.config().firebase
);

const app = express();

//Usar hbs como vistas
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', handlebars({
    //Default page
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    extname: '.hbs',
}));
app.set('view engine', '.hbs');

app.use('/client', express.static(path.join(__dirname, 'client')));

//Routes
app.get('/', (req, res) => {
    res.set('Cache-Control', 'public', 'max-age=300', 's-maxage=600');
    res.render('pages/index.hbs');
})

app.get('/signup', (req, res) => {
    res.set('Cache-Control', 'public', 'max-age=300', 's-maxage=600');
    res.render('pages/signup.hbs');
})

app.get('/signin', (req, res) => {
    res.set('Cache-Control', 'public', 'max-age=300', 's-maxage=600');
    res.render('pages/login.hbs');
})

app.get('/notes', (req, res) => {
    res.render('pages/notes.hbs');
})



exports.app = functions.https.onRequest(app);