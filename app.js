const bodyParser = require('body-parser');
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 1111;
const mongoose = require("mongoose");
const path = require('path'); 

app.set('views', path.join(__dirname, 'views'));

app.use(
    session({
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: true,
    })
);

app.set('view engine', 'ejs');
app.use(express.static('public'));

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

const User = mongoose.model("User", userSchema);

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('home');
});

app.post('/', (req, res) => {
    const { username, email, password } = req.body;

    const newUser = new User({ username, email, password });

    newUser
        .save()
        .then(() => {
            console.log('User saved successfully');
            req.session.isAuthenticated = true;
            res.redirect('/greet');
        })
        .catch((err) => {
            console.error('Error saving user:', err);
            res.status(500).send('Error saving user');
        });
});

app.get('/greet', (req, res) => {
    if (req.session.isAuthenticated) {
        res.render('greet'); 
    } else {
        res.redirect('/');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
