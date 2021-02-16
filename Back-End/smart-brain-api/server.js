const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const register = require('./controllers/register');
const signin = require('./controllers/signin')

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'admin',
        database: 'smart-brain'
    }
});

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req,res) => {
});


app.post('/signin', (req, res) => signin.handleSignIn(req, res, db, bcrypt))

app.post('/register', (req, res) =>  register.handleRegister(req, res, db, bcrypt))

app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        if(entries.length) {
            res.json(entries[0]);
        } else {
            res.status(400).json('not found')
        }
    })
    .catch(err => res.status(400).json('error getting entries'))
})

app.get('/profile/:id', (req, res)=> {
    const { id } = req.params;
    db.select('*').from('users').where({'id': id}).then(user => {
        if(user.length) {
            res.json(user[0]);
        } else {
            res.status(400).json('not found')
        }
    })
    .catch(err => res.status(400).json('error getting user'))
})

// bcrypt.hash("bacon", null, null, function(err, hash) {

// });

// bcrypt.compare("bacon", hash, function(err, res) {

// });

// bcrypt.compare("veggies", hash, function(err, res) {

// });


app.listen(4502, () => {
    console.log('ping');
})