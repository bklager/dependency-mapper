var api = require('./api');

// var boards = getBoards();
// boards.then(values => {
//     values.forEach(value => {
//         getSprints(value.id);
//     });
// });

var parsing = {

    getBoards: function( ) {
        var boardsPromise  = api.getAllBoards();
        var parsedBoardData = [];
        var values;

        return new Promise(resolve => {
            boardsPromise.then(data => {
                values = data.values;
                values.forEach(value => {
                    parsedBoardData.push({
                        id: value.id,
                        name: value.name,
                        projectKey: value.location.projectKey,
                        projectName: value.location.projectName,

                    })
                });
                resolve(parsedBoardData);
            });
        });

    },

    getSprints: function(boardId) {
        var sprintsPromise = api.getAllSprints(boardId);
        var values;
        var parsedSprintData = [];

        return new Promise(resolve => {
            sprintsPromise.then(data => {
                values = data.values;
                values.forEach(value => {
                    parsedSprintData.push({
                        id: value.id,
                        state: value.state,
                        name: value.name,
                        startDate: value.startDate,
                        endDate: value.endDate,
                        boardId: value.originBoardId
                    });
                });
                resolve(parsedSprintData);
            });
        });
    },

    getIssuesForSprint: function(boardId, sprintId) {
        var issuesPromise = api.getIssuesForSprint(boardId, sprintId);
        var issues;
        var parsedIssueData = [];
        var parsedWorkLogs = [];

        return new Promise(resolve => {
            issuesPromise.then(data => {
                issues = data.issues;
                issues.forEach(issue => {
                    var subtaskIdArray = [];
                    var outwardlinks = [];
                    var inwardlinks = [];

                    issue.fields.subtasks.forEach(task => {
                        subtaskIdArray.push({
                            id: task.id,
                            key: task.key
                        })
                    });

                    // depends on these issues
                    issue.fields.issuelinks.forEach(link => {
                        if( link.outwardIssue != null ) {
                            outwardlinks.push({
                                id: link.outwardIssue.id,
                                key: link.outwardIssue.key,
                                name: link.outwardIssue.fields.summary,
                            });
                        }

                    });

                    // is depended upon by these issues
                    issue.fields.issuelinks.forEach(link => {
                        if( link.inwardIssue != null ) {
                            inwardlinks.push({
                                id: link.inwardIssue.id,
                                key: link.inwardIssue.key,
                                name: link.inwardIssue.fields.summary,
                            });
                        }
                    });

                    issue.fields.worklog.worklogs.forEach(log => {
                        if(log != null) {
                            parsedWorkLogs.push({
                                timeSpent: log.timeSpentSeconds
                            })
                        }
                    });

                    parsedIssueData.push({
                        id : issue.id,
                        key : issue.key,
                        sprintId: issue.fields.sprint.id,
                        inwardLinks : inwardlinks,
                        outwardLinks : outwardlinks,
                        issueType : (issue.fields.issuetype != null ? issue.fields.issuetype.name : null ),
                        subtasksId : subtaskIdArray,
                        worklogs : parsedWorkLogs,
                        originalTimeEstimate : issue.fields.timetracking.originalEstimateSeconds,
                        timeRemaining : issue.fields.timetracking.remainingEstimateSeconds,
                        status : issue.fields.status.name
                    });
                });

                // parsedIssueData.forEach(issue => {
                //    console.log('Original Time estimate: ' + issue.originalTimeEstimate);
                //    console.log('Status of ' + issue.key + ': ' + issue.status);
                // });

                // parsedIssueData.forEach(issue => {
                //     console.log('Issue Id: ' + issue.id);
                //     console.log('Issue key: ' + issue.key);
                //     console.log('Sprint Id: ' + issue.sprintId);
                //     console.log('Issue Type: ' + issue.issueType);
                //     console.log('Inward Links:');
                //     issue.inwardLinks.forEach(link => {
                //         console.log('Link id: ' + link.id);
                //         console.log('Link summary: ' + link.summary);
                //     });
                //     console.log('Outward Links:');
                //     issue.outwardLinks.forEach(link => {
                //         console.log('   Link id: ' + link.id);
                //         console.log('   Link summary: ' + link.summary);
                //     });
                //     console.log('Subtask Id Array: ' + issue.subtasksId.toString());
                //     console.log('Work Logs: ');
                //     issue.worklogs.forEach(log => {
                //         console.log('   Log: '+ log.timeSpent);
                //     });
                //     console.log();
                //
                // });

                resolve(parsedIssueData);

            });
        });
    }


};

function getBoards( ) {
    var boardsPromise  = api.getAllBoards();
    var values;
    var parsedBoardData = [];

    return new Promise (resolve => {
        boardsPromise.then(data => {
            values = data.values;
            values.forEach(value => {
                parsedBoardData.push({
                    id: value.id,
                    name: value.name,
                    projectKey: value.location.projectKey,
                    projectName: value.location.projectName,

                })
            });
            parsedBoardData.forEach(value => {
                console.log('Id: '+ value.id);
                console.log('Name: ' + value.name);
                console.log('projectKey: ' + value.projectKey);
                console.log('projectName: ' + value.projectName);
            });
            resolve(parsedBoardData);

        });
    });

}

function getSprints(boardId ) {
    var sprintsPromise = api.getAllSprints(boardId);
    var values;
    var parsedSprintData = [];

    return new Promise(resolve => {
        sprintsPromise.then(data => {
            values = data.values;
            values.forEach(value => {
                parsedSprintData.push({
                    id: value.id,
                    state: value.state,
                    name: value.name,
                    startDate: value.startDate,
                    endDate: value.endDate,
                    boardId: value.originBoardId
                });
            });

            parsedSprintData.forEach(value => {
                console.log('ID: ' + value.id);
                console.log('startDate: ' + value.startDate);
                console.log('state: ' + value.state);
            });

            resolve(parsedSprintData);
        });
    });
}

// var array = parsing.getIssuesForSprint('3', '3');
// getBoards();

module.exports = parsing;