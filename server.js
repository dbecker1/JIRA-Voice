/**
 * Created by dbeckerfl on 10/14/17.
 */

var http = require("http");
var { JIRA } = require('./src/JIRA');


//Create HTTP server and listen on port 8000 for requests
http.createServer(function (request, response) {

    // Set the response HTTP header with HTTP status and Content type
    response.writeHead(200, {'Content-Type': 'text/plain'});

    var jiraSession = new JIRA("admin", "hackgt2017");
    response.write(jiraSession.queryAll("admin"));
    //response.write(jiraSession.doTransition("10005"));
    response.write(jiraSession.updateSummary("10005", "Summary test 1"));
    response.write(jiraSession.updateDescription("10005", "Description test 1"));
    response.write(jiraSession.assign("10005", "Daniel"));
    response.write(jiraSession.transition("10005", "4"));
    response.write(jiraSession.getTransitions("10005"));
    response.write(jiraSession.notifyOnIssue("10005", "Testing",
        "Damn, Daniel! It Works!", ["Daniel", "Will"]));
    // Send the response body "Hello World"
    response.end('Hello World\n');
}).listen(8000);

// Print URL for accessing server
console.log('Server running at http://127.0.0.1:8000/')