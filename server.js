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
    response.write(jiraSession.queryAll());
    response.write(jiraSession.setValue("123", "summary", "test"));
    // Send the response body "Hello World"
    response.end('Hello World\n');
}).listen(8000);

// Print URL for accessing server
console.log('Server running at http://127.0.0.1:8000/')