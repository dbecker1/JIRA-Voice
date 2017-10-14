/**
 * Created by dbeckerfl on 10/14/17.
 *
 *
 *
 */
var Client = require('node-rest-client').Client;
var b64 = require('base-64');


const baseUrl = "https://jira-voice.atlassian.net/rest/"

class JIRA {

    constructor(username, password) {
        this.client = new Client();
        this.auth = b64.encode(username + ":" + password);
    }

    // Format for doing http request:
    // http://hostname/rest/<api-name>/<api-version>/<resource-name>
    queryAll(callback) {
        var searchArgs = {
            headers: {
                    // Set the cookie from the session information
                    "Authorization": "Basic " + this.auth,
                    "Content-Type": "application/json"
            },
            data: {
                    // Provide additional data for the JIRA search. You can modify the JQL to search for whatever you want.
                    jql: "assignee=admin"
            }
        };
        // Make the request return the search results, passing the header information including the cookie.
        this.client.post(baseUrl + "api/2/search", searchArgs, function(searchResult, response) {
            console.log('status code:', response.statusCode);
            console.log('search result:', searchResult);
            callback(searchResult);
        });
        return "All issues: ";
    }

    setValue(issue, field, value) {
        return "Set " + field + " to " + value + " in issue " + issue;
    }

    authenticate(username, password) {
        // Provide user credentials, which will be used to log into JIRA
        var loginArgs = {
            data: {
                "username": username,
                "password": password
            },
            headers: {
                "Content-Type": "application/json"
            }
        };

        this.client.post(baseUrl + "auth/1/session", loginArgs, function(data, response){
                if (response.statusCode == 200) {
                        console.log('succesfully logged in, session:', data.session);
                        this.session = data.session;
                }
                else {
                        console.log(response.statusCode);
                        throw "Login failed :(";
                }
        });

        return "Authenticated!";
    }
}
exports.JIRA = JIRA;


/* Get the session information and store it in a cookie in the header
var searchArgs = {
        headers: {
                // Set the cookie from the session information
                cookie: session.name + '=' + session.value,
                "Content-Type": "application/json"
        },
        data: {
                // Provide additional data for the JIRA search. You can modify the JQL to search for whatever you want.
                jql: "type=Story"
        }
};
// Make the request return the search results, passing the header information including the cookie.
client.post(baseUrl + "api/2/search", searchArgs, function(searchResult, response) {
        console.log('status code:', response.statusCode);
        console.log('search result:', searchResult);
}); */