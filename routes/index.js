var express = require('express');
var request = require('request');
var app = require('../app.js');
var router = express.Router();

var api = require('../public/javascripts/api');
var parser = require('../public/javascripts/parser');


/* GET home page. */
router.get('/', function(req, res, next) {
    // var boardId = parser.getBoards();
    parser.getSprints('3');
    // api.getAllBoards();
    // api.getAllSprints('3');
    // api.getIssuesForSprint('3', '3');
    console.log('Dir Name: ' + __dirname + '/../views/home.html');
    res.sendFile('/Users/bentleylager/gitWorkspace/DependencyMapper/views/home.html');
    // res.render(__dirname +'/../home.html');
    // res.render('index', { title: 'Jira Dependency Mapper' });
});
router.post('/', (req, res) => {
    return res.send('Received a POST HTTP method\n');
});
router.put('/', (req, res) => {
    return res.send('Received a PUT HTTP method\n');
});
router.delete('/', (req, res) => {
    return res.send('Received a DELETE HTTP method\n');
});

module.exports = router;
