const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const {PORT} = require('./constants');
const imdb = require('./imdb');
const db = require('./db');
const DENZEL_IMDB_ID = 'nm0000243';


const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());
const dbName = "denzel-webapp";
const dbCollectionName = "movies";
db.initialize(dbName,dbCollectionName,function(dbCollection){
    app.get('/movies/populate/' + DENZEL_IMDB_ID, (request, response) => {
        dbCollection.find().toArray((error, result) => {
            if (error) throw error;
            response.json(result);
        });
    });
}

app.listen(PORT);
console.log(`📡 Running on port ${PORT}`);
