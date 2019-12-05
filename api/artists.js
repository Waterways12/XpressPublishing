const express = require('express');
const sqlite3 = require('sqlite3');
const artistsRouter = express.Router();
const errorhandler = require('errorhandler');
const db = new sqlite3.Database(process.env.TEST_DATABASE|| './database.sqlite');

artistsRouter.use(errorhandler());

//Middleware to create an artistId param
artistsRouter.param('artistId', (req, res, next, artistId) => {
    req.params.artistId = artistId;
    next();
});
//Middleware to check an artistId Param exists
const checkIdParam = (req, res, next) => {
    db.get(`SELECT * FROM Artist WHERE id = '${req.params.artistId}'`, (error, row) => {
        if (row) {next()}
        else {res.status(404).send()}
    })
};

//GET all artists
artistsRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE is_currently_employed = 1', (error, rows) => {
        if (error) {next(error)}
        else {
            res.status(200).json({artists: rows})
        }
    })
});

// GET individual artist by ID
artistsRouter.get('/:artistId', checkIdParam, (req, res, next) => {
    db.get(`SELECT * FROM Artist WHERE id = '${req.params.artistId}'`, (error, row) => {
        if (error) {next(error)}
        else {res.status(200).send({artist: row})}
    });
});

// POST Artist
artistsRouter.post('/', (req, res, next) => {
    if (!(req.body.artist.name && req.body.artist.dateOfBirth && req.body.artist.biography)) {
        res.status(400).send()
    } else {
        if (!req.body.artist.isCurrentlyEmployed) {req.body.artist.isCurrentlyEmployed = 1}

        db.run(`INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES('${req.body.artist.name}','${req.body.artist.dateOfBirth}','${req.body.artist.biography}', ${req.body.artist.isCurrentlyEmployed})`, function (error) {
            if (error) {next(error)}

            db.get(`SELECT * FROM Artist WHERE id = ${this.lastID};`, (error, artist) => {
                res.status(201).json({artist: artist})
            })
        });
    }
});
// PUT Artist
artistsRouter.put('/:artistId', checkIdParam, (req, res, next) => {
    if (!(req.body.artist.name && req.body.artist.dateOfBirth && req.body.artist.biography)) {res.status(400).send()}

    db.run(`UPDATE Artist SET name ='${req.body.artist.name}', date_of_birth ='${req.body.artist.dateOfBirth}', biography ='${req.body.artist.biography}', is_currently_employed ='${req.body.artist.isCurrentlyEmployed}' WHERE id = ${req.params.artistId};`, function (error) {
        if (error) {next(error)}

        db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId};`, (error, artist) => {
            res.status(200).json({artist: artist})
        })
    });
});

//DELETE Artist (n.b. just sets artist's employment to 0)
artistsRouter.delete('/:artistId', checkIdParam, (req, res, next) => {
    console.log('HIHIHIHIHIHIHIFUCKYOUCODECADEMY')
    db.run(`UPDATE Artist SET is_currently_employed = 0 WHERE id = ${req.params.artistId};`, function(error) {
        if (error) {next(error)}
        db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId};`, (error, artist) => {
            res.status(200).json({artist: artist})
        })
    })
});

module.exports = artistsRouter;
 