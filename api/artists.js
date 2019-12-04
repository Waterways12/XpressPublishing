const express = require('express');
const sqlite3 = require('sqlite3');
const artistsRouter = express.Router();
const errorhandler = require('errorhandler')
const db = new sqlite3.Database(process.env.TEST_DATABASE|| './database.sqlite');

artistsRouter.use(errorhandler());

artistsRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE is_currently_employed = 1', (error, rows) => {
        if (error) {next(error)}
        else {
            res.status(200).json({artists: rows})
        }
    })
});

artistsRouter.param('artistId', (req, res, next, artistId) => {
    req.params.artistId = artistId;
    next();
});

//Middleware to create an artistId param
artistsRouter.use('/:artistId', (req, res, next) => {
    db.get(`SELECT * FROM Artist WHERE id = '${req.params.artistId}'`, (error, row) => {
        if (row) {next()}
        else {res.status(404).send()}
    })
});

artistsRouter.get('/:artistId', (req, res, next) => {
    db.get(`SELECT * FROM Artist WHERE id = '${req.params.artistId}'`, (error, row) => {
        if (error) {next(error)}
        else {res.status(200).send({artist: row})}
    });
});

artistsRouter.post('/artistId', (req, res, next) => {
    if (req.body.)
    db.run('C')
});

artistsRouter.put('/:artistId', (req, res, next) => {
    db.run(``)
});

artistsRouter.delete('/:artistId', (req, res, next) => {
    db.run(`DELETE FROM Artist WHERE id = ${req.params.artistId}`)
    res.status(202).send()
});


module.exports = artistsRouter;