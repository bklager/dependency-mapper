var request = require('request');
var fs = require('fs');
const email = '12olympian@gmail.com';
const token = 'a95e5nx6V0sIfJ22xvjB0D3A';
    // 'LWpyQTzr1rTrQHvhZsl53FD5';

var apiRequests = {

    getDashboard: function() {
        request({method: 'GET',
            url: 'https://bklager.atlassian.net/rest/api/2/dashboard',
            auth: { username: email, password: token },
            headers: {
                'Accept': 'application/json'}
        }, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(
            'Response for dashboard: ' + response.statusCode + ' ' + response.statusMessage
        );
        console.log(body);
        });
    },

    getAllBoards: function() {
        return new Promise(resolve => {
            request({
                method: 'GET',
                url: 'https://bklager.atlassian.net/rest/agile/1.0/board/',
                auth: { username: email, password: token },
                headers: { 'Accept': 'application/json'}
            }, function(error, response, body) {
                if(error) throw new Error(error);
                console.log(
                    'Response for all boards: ' + response.statusCode + ' ' + response.statusMessage
                );
                // console.log(body);
                resolve(JSON.parse(body));
            });
        });
    },

    getAllSprints: function(boardId) {
        return new Promise(resolve => {
            request({
                method: 'GET',
                url: 'https://bklager.atlassian.net/rest/agile/1.0/board/' + boardId + '/sprint',
                auth: { username: email, password: token },
                headers: { 'Accept': 'application/json'}
            }, function(error, response, body) {
                if(error) throw new Error(error);
                console.log(
                    'Response for all sprints: ' + response.statusCode + ' ' + response.statusMessage
                );
                // console.log(body);
                resolve(JSON.parse(body));
            });
        });
    },

    getIssuesForSprint: function(boardId, sprintId) {
        return new Promise(resolve => {
            request({
                method: 'GET',
                url: 'https://bklager.atlassian.net/rest/agile/1.0/board/' + boardId + '/sprint/' + sprintId + '/issue',
                auth: { username: email, password: token },
                headers: { 'Accept': 'application/json'}
            }, function(error, response, body) {
                if(error) throw new Error(error);
                console.log(
                    'Response Issues for Sprint: ' + response.statusCode + ' ' + response.statusMessage
                );
                // console.log(body);
                resolve(JSON.parse(body));

                /////////////////// NOT SURE IF THIS IS REACHED OR NOT //////////////////

                fs.writeFile("./issueData.json", body, (error) => {
                    if(error) {
                        console.error(error);
                        return;
                    };
                    // console.log('File has been created');
                });
            });
        });
    },

    getIssue: function(issueId) {
        request({
            method: 'GET',
            url: 'https://bklager.atlassian.net/rest/agile/1.0/issue/' + issueId,
            auth: { username: email, password: token },
            headers: { 'Accept': 'application/json'}
        }, function(error, response, body) {
            if(error) throw new Error(error);
            console.log(
                'Response Issue: ' + response.statusCode + ' ' + response.statusMessage
            );
            console.log(body);
            fs.writeFile("./issueData.json", body, (error) => {
                if(error) {
                    console.error(error);
                    return;
                };
                console.log('File has been created');
            });
        });
    },

    getIssuesForEpic: function(boardId, epicId) {
        request({
            method: 'GET',
            url: 'https://bklager.atlassian.net/rest/agile/1.0/issue/board/' + boardId + '/epic/' + epicId + '/issue',
            auth: { username: email, password: token },
            headers: { 'Accept': 'application/json'}
        }, function(error, response, body) {
            if(error) throw new Error(error);
            console.log(
                'Response Issues for Epic: ' + response.statusCode + ' ' + response.statusMessage
            );
            console.log(body);
            fs.writeFile("./issueData.json", body, (error) => {
                if(error) {
                    console.error(error);
                    return;
                };
                console.log('File has been created');
            });
        });
    },

    getIssuesForBoard: function(boardId) {
        request({
            method: 'GET',
            url: 'https://bklager.atlassian.net/rest/agile/1.0/board/' + boardId + '/issue',
            auth: { username: email, password: token },
            headers: { 'Accept': 'application/json'}
        }, function(error, response, body) {
            if(error) throw new Error(error);
            console.log(
                'Response Issue: ' + response.statusCode + ' ' + response.statusMessage
            );
            console.log(body);
            fs.writeFile("./issueData.json", body, (error) => {
                if(error) {
                    console.error(error);
                    return;
                };
                console.log('File has been created');
            });
        });
    }
};


module.exports = apiRequests;