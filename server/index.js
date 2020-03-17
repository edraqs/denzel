const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const {PORT} = require('./constants');
const imdb = require('./imdb');
const DENZEL_IMDB_ID = 'nm0000243';


const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

var jsonMovies;

async function getMovies (actor = DENZEL_IMDB_ID) {
  const movies = await imdb(DENZEL_IMDB_ID);
  jsonMovies = JSON.stringify(movies, null, 2);
}

getMovies();
app.get('/movies/populate/' + DENZEL_IMDB_ID, (request, response) => {
    response.send(jsonMovies);
});


app.listen(PORT);
console.log(`📡 Running on port ${PORT}`);
