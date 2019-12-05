const express = require('express');
const seriesRouter = express.Router();
const issuesRouter = require('./issues');
const sqlite3 = require('sqlite3');
const errorhandler = require('errorhandler');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

seriesRouter.use(errorhandler());

//Use Issues Router
seriesRouter.use('/:seriesId/issues', issuesRouter);


//Middleware to create seriesId Param
seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    req.params.seriesId = seriesId;
    next();
});

// Middleware to verify seriesId param is valid
const checkIdExists = (req, res, next) => {
    db.get(`SELECT * FROM Series WHERE id=${req.params.seriesId};`, (error, row) => {
        if(error) {errorhandler(error)}
        if(row) {next()}
        else {console.log('404 for requested ID');res.status(404).send()}
    })  
};

//GET ALL From Series
seriesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Series;', function(error, rows) {
        if (error) {next(error)}
        res.status(200).send({series: rows});
    });
});
// GET SPECIFIC From Series
seriesRouter.get('/:seriesId', checkIdExists, (req, res, next)=> {
    db.get(`SELECT * FROM Series WHERE id = ${req.params.seriesId};`, function(error, row) {
        if (error) {next(error)}
        else {res.status(200).send({series: row});}
    })
})
//POST into Series
seriesRouter.post('/', (req, res, next) => {
    if (!(req.body.series.name && req.body.series.description)) {
        console.log('bad input')
        res.status(400).send('bad input')}
        
    else {db.run(`INSERT INTO Series (name, description) VALUES('${req.body.series.name}', '${req.body.series.description}');`, function(error){
            if (error) {next(error)}
            db.get(`SELECT * FROM Series WHERE id = ${this.lastID};`, (error, series) => {
                if (error) {errorhandler(error)}
                res.status(201).send({series: series})
            })
        })}
});

// PUT Series
seriesRouter.put('/:seriesId', checkIdExists, (req, res, next) => {
    if (req.body.series.name && req.body.series.description) {
    db.run(`UPDATE Series SET name = '${req.body.series.name}', description = '${req.body.series.description}' WHERE id = ${req.params.seriesId};`, function(error) {
        if (error) {errorhandler(error)}
        db.get(`SELECT * FROM Series WHERE id=${req.params.seriesId};`, (error, row) => {
            if (error) {errorhandler(error)}
            res.status(200).send({series: row})
            })
    })} else {res.status(400).send()}
});

//DELETE Series

seriesRouter.delete('/:seriesId', checkIdExists, (req, res, next) => {
    db.get(`SELECT * FROM Issue WHERE series_id = ${req.params.seriesId};`, (error, row) => {
        if (error) {next(error)}
        if (row) {res.status(400).send('This Series contains issues that must be deleted first.')}
        else {
            db.run(`DELETE FROM Series WHERE id = ${req.params.seriesId};`, function (error) {
                if (error) {next(error)};
                res.status(204).send('The series has been deleted')
                });
        }
    })

});

module.exports = seriesRouter;