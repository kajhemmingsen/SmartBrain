const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'admin',
        database: 'smart-brain'
    }
});

db.select('*').from('users').then(data => {
    console.log(data);
});

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req,res) => {
});


app.post('/signin', (req, res) => {
  db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
        if (isValid) {
            return db.select('*').from('users').where('email', '=', req.body.email)
            .then(user => {
                res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to login'))
        }else {
            res.status(400).json('bad info')
        }
    })
    .catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res) => {
    const { email, name, password} = req.body
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
                .returning('*')
                .insert({
                    email: loginEmail[0],
                    name: name,
                    joined: new Date()
                }).then(user => {
                    res.json(user);
                })   
            })
            .then(trx.commit)
            .catch(trx.rollback)
        })
        .catch(err => res.status(400).json('unable to join'))
    })

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