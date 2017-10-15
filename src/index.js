'use strict';
var Alexa = require("alexa-sdk");
var aws = require("aws-sdk");
var { JIRA } = require('./JIRA');

var APP_ID = 'amzn1.ask.skill.4f05a321-de24-4a56-a7b4-9e83eb9e5a54';
const jiraUsername = "admin";
const jiraPassword = "hackgt2017";

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    //alexa.dynamoDBTableName = "JiraVoiceAttributes";
    alexa.registerHandlers(initialHandlers);
    alexa.execute();
};

var states = {
    START: '_START',  // Initial start up, prompt user for what they want to do.
    LIST: '_LIST' // Currently in progress of listing issues to user
};

const initialHandlers = {
    "LaunchRequest": function() {
        this.emit("InitialIntent");
    },
    "AMAZON.HelpIntent": function() {
        this.response.speak("You can ask to perform multiple different actions regarding your Jira issues. You can ask for descriptions" +
            "of them, edit fields on then, or even resolve them and assign them to other users.");
        this.emit(":responseReady");
    },
    "AMAZON.StopIntent": function() {
        this.response.speak("Goodbye!");
        this.emit(':responseReady');
    },
    "AMAZON.CancelIntent": function() {
        this.response.speak("Goodbye!");
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.response.speak("Goodbye!");
        this.emit(':responseReady');
    },
    "InitialIntent": function() {
        var jiraSession = new JIRA(jiraUsername, jiraPassword);
        var output = this;
        jiraSession.queryAll(jiraUsername, function(results){
            console.log(results);

            var attributeObject = [];
            var issueTypes = {
                toDo: 0,
                inProgress: 0,
                done: 0,
            }
            for (var i = 0; i < results.issues.length; i++) {
                var issue = results.issues[i];
                var attribute = { id: issue.id, summary : issue.fields.summary, column : issue.fields.status.name};
                attributeObject.push(attribute);
                console.log(issue);
                switch (issue.fields.status.name) {
                    case "To Do":
                        issueTypes.toDo++;
                        break;
                    case "In Progress":
                        issueTypes.inProgress++;
                        break;
                    case "Done":
                        issueTypes.done++;
                        break;
                }
            }
            output.attributes["issues"] = JSON.stringify(attributeObject)
            var text = "Welcome to JIRA Voice. Here is an overview of your issues. ";
            text += "You currently have " + issueTypes.toDo + " issues in To Do, ";
            text += issueTypes.inProgress + " issues In Progress, and ";
            text += issueTypes.done + " in Done. ";
            output.response.speak(text).listen("What would you like to do?");
            output.emit(':responseReady');
        });
    },
    "ListIssuesIntent": function() {
        var issues = JSON.parse(this.attributes["issues"]);
        var column = this.event.request.intent.slots.column.value.toLowerCase();
        var message = "";
        for (var i = 0; i < issues.length; i++) {
            var issue = issues[i];
            if (issue.column.toLowerCase() == column) {
                message += "Issue " + issue.id + ". " + issue.summary + " ";
            }
        }
        this.response.speak(message).listen();
        this.emit(":responseReady");
    },
    "AssignIssueIntent": function() {
        var jiraSession = new JIRA(jiraUsername, jiraPassword);
        var output = this;
        var issue = this.event.request.intent.slots.issue.value;
        var assignee = this.event.request.intent.slots.assignee.value;
        if (!issue || !assignee) {
            this.response.speak("I'm sorry, there was an issue with your arguments. Please try again");
            this.emit(":responseReady");
        }
        jiraSession.assign(issue, assignee, function(result){
            output.response.speak("Issue " + issue + " has been assigned to " + assignee);
            output.emit(":responseReady");
        });
    },
    "UpdateSummaryIntent": function() {
        var filledSlots = delegateSlotCollection.call(this);
        var jiraSession = new JIRA(jiraUsername, jiraPassword);
        var output = this;
        var issue = isSlotValid(this.event.request, "issue");
        var summary = isSlotValid(this.event.request, "summary");
        if (!issue || !summary) {
            this.response.speak("I'm sorry, there was an issue with your arguments. Please try again");
            this.emit(":responseReady");
        }
        jiraSession.updateSummary(issue, summary, function(result){
            output.response.speak("The summary for " + issue + " has been updated");
            output.emit(":responseReady");
        });
    },
    "UpdateDescriptionIntent": function() {
        var filledSlots = delegateSlotCollection.call(this);
        var jiraSession = new JIRA(jiraUsername, jiraPassword);
        var output = this;
        var issue = isSlotValid(this.event.request, "issue");
        var description = isSlotValid(this.event.request, "description");
        if (!issue || !description) {
            this.response.speak("I'm sorry, there was an issue with your arguments. Please try again");
            this.emit(":responseReady");
        }
        jiraSession.updateDescription(issue, summary, function(result){
            output.response.speak("The description for " + issue + " has been updated");
            output.emit(":responseReady");
        });
    },
    "AddCommentIntent": function() {
        var filledSlots = delegateSlotCollection.call(this);
        var jiraSession = new JIRA(jiraUsername, jiraPassword);
        var output = this;
        var issue = isSlotValid(this.event.request, "issue");
        var body = isSlotValid(this.event.request, "comment");
        if (!issue || !body) {
            this.response.speak("I'm sorry, there was an issue with your arguments. Please try again");
            this.emit(":responseReady");
        }
        jiraSession.addComment(issue, body, function(result){
            output.response.speak("Added your comment " + body + " to issue " + issue);
            output.emit(":responseReady");
        });
    },
    "MoveIssueIntent": function() {
        var jiraSession = new JIRA(jiraUsername, jiraPassword);
        var output = this;
        var issue = this.event.request.intent.slots.issue.value;
        var column = this.event.request.intent.slots.column.value;
        if (!issue || !column) {
            this.response.speak("I'm sorry, there was an issue with your arguments. Please try again");
            this.emit(":responseReady");
        }
        column = column.toLowerCase();
        var columns = {
            "to do" : "11",
            "in progress" : "21",
            "done": "31"
        }
        var selectedTransition = columns[column];
        jiraSession.transition(issue, selectedTransition, function(result){
            output.response.speak("Moved issue to " + column);
            output.emit(":responseReady");
        })
    }

};

function delegateSlotCollection(){
    console.log("in delegateSlotCollection");
    console.log("current dialogState: "+this.event.request.dialogState);
    if (this.event.request.dialogState === "STARTED") {
        console.log("in Beginning");
        var updatedIntent=this.event.request.intent;
        //optionally pre-fill slots: update the intent object with slot values for which
        //you have defaults, then return Dialog.Delegate with this updated intent
        // in the updatedIntent property
        this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
        console.log("in not completed");
        // return a Dialog.Delegate directive with no updatedIntent property.
        this.emit(":delegate");
    } else {
        console.log("in completed");
        console.log("returning: "+ JSON.stringify(this.event.request.intent));
        // Dialog is now complete and all required slots should be filled,
        // so call your normal intent handler.
        return this.event.request.intent;
    }
}

function isSlotValid(request, slotName){
    var slot = request.intent.slots[slotName];
    //console.log("request = "+JSON.stringify(request)); //uncomment if you want to see the request
    var slotValue;

    //if we have a slot, get the text and store it into speechOutput
    if (slot && slot.value) {
        //we have a value in the slot
        slotValue = slot.value.toLowerCase();
        return slotValue;
    } else {
        //we didn't get a value in the slot.
        return false;
    }
}