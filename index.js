const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const Sequelize = require('sequelize');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const db = new Sequelize('rattrapage_nodejs', 'user', 'root', {
    host: 'localhost',
    dialect: 'mysql'
});

const COOKIE_SECRET = 'J\'aime les cookies';


app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', 'public/views')
app.use(express.static('public'));

const Article = db.define('article', {
        name : { type: Sequelize.STRING},
        description : { type: Sequelize.STRING },
        price : { type: Sequelize.INTEGER },
        stock : { type: Sequelize.INTEGER }
      });

const User = db.define('user', {
        username : { type: Sequelize.STRING },
        email : { type: Sequelize.STRING },
        password : { type: Sequelize.STRING }
      });



db.sync().then(r => {
}).catch(e => {
    console.error(e);
});

app.set('view engine', 'pug');
app.use(bodyParser.urlencoded());

passport.use(new LocalStrategy((username, password, done) => {
    User
        .findOne({
            where: {username, password}
        }).then(function (user) {
        if (user) {
            return done(null, user)
        } else {
            return done(null, false, {
                message: 'Error!'
            });
        }
    })

        .catch(done);
}));


passport.serializeUser((user, cookieBuilder) => {
    cookieBuilder(null, user.email);
});

passport.deserializeUser((email, callback) => {

    User.findOne({
        where : { email }
    }).then(r => {
        if(r) return callback(null, r);
        else return callback(new Error("No corresponding with a user's cookie"));
    });
});

app.use(cookieParser(COOKIE_SECRET));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: COOKIE_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));

app.get('/',(req,res) => {
    Article
        .sync()
        .then(() => {
            return Article.findAll();
          })
                .then((articles) => {
                    res.render( 'list', { articles });
                });
        });


app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/',
        sucessRedirect: '/login'
    })
);

app.get('/register',(req,res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { username, email, password} = req.body;
    User
        .sync()
        .then(() => {return User.count()})
            User.create({ username, email, password })

        .then(() => res.redirect('/login'));
});


app.get('/create', (req, res) => {
    res.render('create');
});

app.post('/create', (req, res) => {
    const { name, description, price, stock} = req.body;
    Article
        .sync()
        .then(() => Article.create({ name, description, price, stock}))
        .then(() => res.redirect('/'));
});





app.listen(3000);
