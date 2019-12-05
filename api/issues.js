const express = require('express');
const issuesRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const errorhandler = require('errorhandler');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

issuesRouter.use(errorhandler());

//Middleware to create issueId Param
issuesRouter.param('issueId', (req, res, next, issueId) => {
    req.params.issueId = issueId;
    next();
}); 

// Middleware to verify issueId param is valid
const checkIdParam = (req, res, next) => {
    db.get(`SELECT * FROM Issue WHERE id=${req.params.issueId};`, (error, row) => {
        if(error) {errorhandler(error)}
        if(row) {next()}
        else {console.log('404 for requested ID');res.status(404).send()}
    })  
};

// Middleware to verify seriesId param is valid
const checkSeriesId = (req, res, next) => {
    db.get(`SELECT * FROM Series WHERE id=${req.params.seriesId};`, (error, row) => {
        if(error) {errorhandler(error)}
        if(row) {next()}
        else {console.log('404 for requested ID');res.status(404).send()}
    })  
};


//GET all issues
issuesRouter.get('/', checkSeriesId, (req, res, next) => {
    db.all(`SELECT * FROM Issue WHERE series_id = ${req.params.seriesId}`, (error, rows) => {
        if (error) {next(error)}
        else {
            res.status(200).send({issues: rows})
        }
    })
});

// GET individual issue by ID
issuesRouter.get('/:issueId', checkIdParam, (req, res, next) => {
    db.get(`SELECT * FROM Issue WHERE id = '${req.params.issueId}'`, (error, row) => {
        if (error) {next(error)}
        else {res.status(200).send({artist: row})}
    });
});

// POST Issue
issuesRouter.post('/', (req, res, next) => {
    if (!(req.body.issue.issueNumber && req.body.issue.publicationDate && req.body.issue.artistId)) {
        res.status(400).send('Invalid inputs')
    } else {
        db.get(`SELECT * FROM Artist WHERE id = ${req.body.issue.artistId};`, (error, row) => {
            if (row) {
                db.run(`INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES('${req.body.issue.name}','${req.body.issue.issueNumber}','${req.body.issue.publicationDate}', ${req.body.issue.artistId}, ${req.params.seriesId})`, function (error) {
                    if (error) {next(error)}
        
                    db.get(`SELECT * FROM Issue WHERE id = ${this.lastID};`, (error, issue) => {
                        res.status(201).send({issue: issue})
                    })
                });   
            }
            else {console.log(req.params.artistId); res.status(400).send({results: row})}
        })
    }
});

// PUT Issue
issuesRouter.put('/:issueId', checkIdParam, (req, res, next) => {
    if (!(req.body.issueNumber && req.body.publicationDate && req.body.artistId)) {res.status(400).send('Invalid inputs')}

    db.run(`UPDATE Issue SET name ='${req.body.name}', issue_number ='${req.body.issue_number}', publication_date ='${req.body.publicationDate}', artist_id ='${req.body.artistId}' WHERE id = ${req.params.issueId};`, function (error) {
        if (error) {next(error)}

        db.get(`SELECT * FROM Issue WHERE id = ${req.params.issueId};`, (error, issue) => {
            res.status(200).send({issue: issue})
        })
    });
});

//DELETE Issue
issuesRouter.delete('/:issueId', checkIdParam, (req, res, next) => {
    db.run(`DELETE FROM Issue WHERE id = ${req.params.issueId};`, function(error) {
        if (error) {next(error)}
        res.status(204).send('The issue has been deleted');
        })
});

module.exports = issuesRouter;