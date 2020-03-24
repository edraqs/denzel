const cors = require('cors');
const express = require('express');
const expressGraphQL = require('express-graphql')
const{
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLFloat,
    GraphQLList,
    GraphQLNonNull
} = require('graphql')
const helmet = require('helmet');
const {
    PORT
} = require('./constants');
const imdb = require('./imdb');
const db = require('./db');
//const mongoose = require ('./mongoose')
const DENZEL_IMDB_ID = 'nm0000243';


const Mongoose = require("mongoose");
const MovieModel = Mongoose.model("movie", {
    link: String,
    id: String,
    metascore: Number,
    poster: String,
    rating: Number,
    synopsis: String,
    title: String,
    votes: Number,
    year: Number
});



const app = express();

//const MovieModel = mongoose.initialize();

const MovieType = new GraphQLObjectType({
    name :'Movie',
    description: 'Informations regarding a movie',
    fields: () => ({
        link: { type: GraphQLString },
        id: { type: GraphQLNonNull(GraphQLString) },
        metascore: { type: GraphQLInt },
        poster: { type: GraphQLString },
        rating: { type: GraphQLFloat },
        synopsis: { type: GraphQLString },
        title: { type: GraphQLString },
        votes: { type: GraphQLInt },
        year: { type: GraphQLInt }
    })
})

const QueryType = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
        movies: {
            type: GraphQLList(MovieType),
            resolve: (root, args, context, info) => {
                return MovieModel.find().exec();
            }
        },
        movie: {
            type: MovieType,
            args: {
                link: { type: GraphQLString },
                id: { type: GraphQLNonNull(GraphQLString) },
                metascore: { type: GraphQLInt },
                poster: { type: GraphQLString },
                rating: { type: GraphQLFloat },
                synopsis: { type: GraphQLString },
                title: { type: GraphQLString },
                votes: { type: GraphQLInt },
                year: { type: GraphQLInt }
            },
            resolve: (root, args, context, info) => {
                return MovieModel.findById(args.id).exec();
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: QueryType
})

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());
app.use('/graphql',expressGraphQL({
    schema: schema,
    graphiql: true
}))

app.options('*', cors());
const dbName = "denzel-webapp";
const dbCollectionName = "movies";
db.initialize(dbName, dbCollectionName, function(dbCollection) {
    app.get('/movies/populate/' + DENZEL_IMDB_ID, (request, response) => {
        dbCollection.find().toArray((error, result) => {
            if (error) throw error;
            response.json(result);
        });
    });
    app.get('/movies', (request, response) => {
        // return random must-watch movie
        var query = {
            "metascore": {
                $gte: 70
            }
        };

        dbCollection.aggregate([{
                $match: query
            },
            {
                $sample: {
                    size: 1
                }
            }
        ]).toArray((error, result) => {
            if (error) throw error;
            response.json(result);
        });
    });

    app.get('/movies/search', (request, response) => {
        //get the id from params & return the movie corresponding
        let limit = parseInt(request.query.limit, 10);
        let metascore = parseInt(request.query.metascore, 10);
        limit = limit ? limit : 5;
        metascore = metascore ? metascore : 0;

        var query = {
            "metascore": {
                $gte: metascore
            }
        };
        dbCollection.find(query).sort({
            metascore: -1
        }).limit(limit).toArray((error, result) => {
            if (error) throw error;
            response.json(result);
        });
    });

    app.put('/movies/:id', (request, response) => {
        const itemId = request.params.id;
        const item = request.body;
        console.log("Editing item: ", itemId, " to be ", item);

        dbCollection.updateOne({
            id: itemId
        }, {
            $set: item
        }, (error, result) => {
            if (error) throw error;
            dbCollection.find().toArray(function(_error, _result) {
                if (_error) throw _error;
                response.json(_result);
            });
        });
    });
    app.get('/movies/:id', (request, response) => {
        const itemID = request.params.id;
        dbCollection.find({
            id: itemID
        }).toArray((error, result) => {
            if (error) throw error;
            response.json(result);
        });
    });
});

app.listen(PORT);
console.log(`📡 Running on port ${PORT}`);
