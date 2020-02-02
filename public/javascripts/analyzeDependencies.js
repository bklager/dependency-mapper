var api = require('./api');
var parse = require('./parser');

var dependencyChains = [];
var numDevelopers = 0;
var developers = [];

function Node(issueKey, inwardLinkArray, outwardLinkArray, originalTime, remainingTime, status){
    this.key = issueKey;
    this.originalTimeEstimate = originalTime;
    this.timeRemaining = remainingTime;
    this.status = status;
    this.inwardlinks = [];
    this.outwardlinks = [];
    this.completed = false;
    this.minStartTime = 0;
    this.endTime = -1;
    inwardLinkArray.forEach(link => {
        this.inwardlinks.push(link.key);
    });
    outwardLinkArray.forEach(link => {
        this.outwardlinks.push(link.key);
    });
}

function buildMap( ) {
    dependencyChains = [];
    var nodeMap = new Map();
    return new Promise(resolve => {
        parse.getBoards().then(data => {
            // BOARD ID IS CURRENTLY HARD CODED, WILL NEED TO ADD ANOTHER LOOP
            // TO ADD ALL THE BOARD OPTIONS
            parse.getSprints(data[2].id).then(sprintData => {
                sprintData.forEach(sprint => {
                    if(sprint.state === 'active') {
                        parse.getIssuesForSprint(data[2].id, sprint.id).then(issues => {
                            console.log();
                            // console.log(issues);
                            issues.forEach(issue => {
                                // Add issue to the node map
                                // each node contains a key and an array of links (only link key)
                                if(issue.issueType !== 'Story') {
                                    let node = new Node(issue.key, issue.inwardLinks, issue.outwardLinks, issue.originalTimeEstimate, issue.timeRemaining, issue.status);
                                    nodeMap.set(node.key, node);
                                }
                            });
                            // I THINK THIS ONLY RETURNS A NODE MAP OF THE FIRST ACTIVE SPRINT
                            // THIS WILL PROBABLY NEED TO BE ADDRESSED LATER ON
                            resolve(nodeMap);
                        });

                    }
                });
            });

        });
    });

}

function buildDependencies(nodeMap){
//   create list of parent nodes
    var rootNodes = [];
    var totalTimeRemaining = 0;
    nodeMap.forEach(function checkRoot(value, key, map) {
        if(value.outwardlinks.length === 0 ) {
            rootNodes.push(key);
        }
    });

    rootNodes.forEach(rootKey => {
        // totalTimeRemaining = nodeMap.get(rootKey).timeRemaining;
        printDependencyChain(nodeMap, rootKey, 0,  '');
    });


}

function printDependencyChain(nodeMap, key, timeRemaining, str){
    // this is throwing undefined because there are dependencies between sprints
    // i'm like 99% sure
    str += key + ' -> ';

    if(nodeMap.has(key) && nodeMap.get(key).inwardlinks.length !== 0){
        timeRemaining += nodeMap.get(key).timeRemaining;
        nodeMap.get(key).inwardlinks.forEach(link => {
            printDependencyChain(nodeMap, link, timeRemaining, str);
        });
    }
    else {
        if(nodeMap.has(key)){
            timeRemaining += nodeMap.get(key).timeRemaining;
        }
        console.log('\nTime Remaining on Chain: ' + timeRemaining);
        console.log(str.substring(0, str.length-3));
    }

}

//Checks if all parents have been worked
function readyToWork(nodeMap, key) {
    var ready = true;
    if(nodeMap.has(key) && nodeMap.get(key).outwardlinks.length !== 0) {
        nodeMap.get(key).outwardlinks.forEach(parent => {
            if(nodeMap.get(parent).completed === false) {
                ready = false;
            }
        });
    }
    return ready;
}

// builds arrays where each entry is the next key in a dependency chain
// then pushes the resulting array into the global variable dependencyChains
function buildArrayOfDependencies(nodeMap, key, array, time) {
    array.push(key);
    if(nodeMap.has(key) && nodeMap.get(key).inwardlinks.length !== 0) {
        time += nodeMap.get(key).timeRemaining;

        // This should put the ideal min time on each nod if there were an infinite number of developers
        // potential problem to investigate: this should leave root nodes alone, but will there be a time
        // where a root node could be given a min start time other than 0?

        // nodeMap.get(key).inwardlinks.forEach(child => {
        //     if(nodeMap.has(child)) {
        //         if(nodeMap.get(child).minStartTime < (nodeMap.get(key).originalTimeEstimate + nodeMap.get(key).minStartTime) ){
        //             nodeMap.get(child).minStartTime = nodeMap.get(key).originalTimeEstimate + nodeMap.get(key).minStartTime;
        //         }
        //     }
        // });

        nodeMap.get(key).inwardlinks.forEach(link => {
            let nextChain = array.slice(0);
            buildArrayOfDependencies(nodeMap, link, nextChain, time);
        })
    }
    else {
        if(nodeMap.has(key)){
            time += nodeMap.get(key).timeRemaining;
        }
        array.push(time);
        dependencyChains.push(array);
    }

}

function minTimeUnlimitedDevelopers(nodeMap) {
    var longestChainTime = 0;
    var longestChainIndex = -1;

    if(dependencyChains.length === 0) {
        var rootNodes = [];
        nodeMap.forEach(function checkRoot(value, key, map) {
            if(value.outwardlinks.length === 0 ) {
                rootNodes.push(key);
            }
        });
        rootNodes.forEach(root => {
            buildArrayOfDependencies(nodeMap, root, [], 0);
        });
    }

    dependencyChains.forEach(function(value, index, array) {
        if(value[value.length-1] > longestChainTime) {
            longestChainTime = value[value.length-1];
            longestChainIndex = index;
        }
    });

    console.log('this is the longest chain: ' + longestChainTime);

    return {
            index: longestChainIndex,
            time: longestChainTime
    };
}

function initialMinStartTime(nodeMap){
//    this function should step through each dependency chain
//    and find the largest time for a dependency
   dependencyChains.forEach(chain => {
       // This loop will break before the last item in the array since I am storing the time there.
       for(let i = 0; i < chain.length - 1 ; i++) {
           // this loops through each task and will look at the parent task (the task in the position before it)
           // then it will find the new start time if it is larger than the current min time.
           if(nodeMap.has(chain[i])){ // we need this because we can end up with nodes not in the sprint, if we want to change this the array
               // of dependencies needs to be changed to not include things in other sprints
               if(i === 0){
                   nodeMap.get(chain[i]).endTime = nodeMap.get(chain[i]).timeRemaining;
               }
               else {
                   console.log(' IN THE ELSE STATEMENT FOR  ' + chain[i]);
                   let parentEnd = nodeMap.get(chain[i-1]).endTime;
                   console.log(parentEnd);
                   console.log(nodeMap.get(chain[i]).minStartTime);
                   if (parentEnd > nodeMap.get(chain[i]).minStartTime){
                       console.log('Ah but are we in this if statement?');
                       nodeMap.get(chain[i]).minStartTime = parentEnd;
                       nodeMap.get(chain[i]).endTime = parentEnd + nodeMap.get(chain[i]).timeRemaining;
                   }
               }
           }
       }
   });
}


function minTimeLimitedDevelopers(nodeMap, num) {
    numDevelopers = num;
    var index = -1;
    for(let i = 0; i < numDevelopers; i++) {
        developers.push(0);
    }
    var completedTasks = [];
    var incompleteTasks = [];

    nodeMap.forEach(function (value, key, map) {
        incompleteTasks.push(key);
    });

    while(incompleteTasks.length !== 0) {
        // if the task is ready to work then we can proceed to try and find if it is the
        // best task to place, increment the developers array, flag as completed
        // move the task to completed array, remove from

        let earliestEndTime = Number.MAX_VALUE;
        index = -1;

        // DOUBLE CHECK THAT THIS WORKS AS INTENDED
        // OH SHIT IT WILL JUST FIND THE SMALL VALUE, NOT THE INDEX OF IT
        // OKAY NEED TO SEE IF I CAN ADJUST THIS TO SAVE THE INDEX

        let smallestDeveloper = developers.reduce((min, p) => p < min ? p : min, developers[0]);
        for(let i = 0; i < incompleteTasks.length; i++) {

            if(readyToWork(nodeMap, incompleteTasks[i])){

            }
        }

    }

}

buildMap().then(nodeMap => {
    buildDependencies(nodeMap);

    // var rootNodes = [];
    // nodeMap.forEach(function checkRoot(value, key, map) {
    //     if(value.outwardlinks.length === 0 ) {
    //         rootNodes.push(key);
    //     }
    // });
    //
    // rootNodes.forEach(root => {
    //    buildArrayOfDependencies(nodeMap, root, [], 0);
    // });
    //
    // dependencyChains.forEach(chain => {
    //     let str ='';
    //    chain.forEach(node => {
    //        str += node + ' -> ';
    //    });
    //    console.log(str);
    // });

    minTimeUnlimitedDevelopers(nodeMap);

    initialMinStartTime(nodeMap);

    nodeMap.forEach(function (value, key, map) {
        console.log(key + ': '+ nodeMap.get(key).timeRemaining+ " : " + nodeMap.get(key).endTime)
    });
});


