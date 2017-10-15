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
    "InitialIntent": function() {
        var jiraSession = new JIRA(jiraUsername, jiraPassword);
        var output = this;
        jiraSession.queryAll(function(results){
            console.log(results);
            output.attributes["issues"] = JSON.stringify(results.issues)
            var issueTypes = {
                toDo: 0,
                inProgress: 0,
                done: 0,
            }
            for (var i = 0; i < results.issues.length; i++) {
                var issue = results.issues[i];
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
            if (issue.fields.status.name.toLowerCase() == column) {
                message += "Issue " + issue.id + ". " + issue.fields.summary + ".";
            }
        }
        this.response.speak(message);
        this.emit(':responseReady');
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
    }
};


/*


 if(Object.keys(this.attributes).length === 0) {
 this.attributes['endedSessionCount'] = 0;
 this.attributes['gamesPlayed'] = 0;
 }
var startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'NewSession': function () {
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
    'AMAZON.HelpIntent': function() {
        var message = 'I will think of a number between zero and one hundred, try to guess and I will tell you if it' +
            ' is higher or lower. Do you want to start the game?';
        this.response.speak(message).listen(message);
        this.emit(':responseReady');        
    },
    'AMAZON.YesIntent': function() {
        this.attributes["guessNumber"] = Math.floor(Math.random() * 100);
        this.handler.state = states.GUESSMODE;
        this.response.speak('Great! ' + 'Try saying a number to start the game.').listen('Try saying a number.');
        this.emit(':responseReady');        
    },
    'AMAZON.NoIntent': function() {
        console.log("NOINTENT");
        this.response.speak('Ok, see you next time!');
        this.emit(':responseReady');        
    },
    "AMAZON.StopIntent": function() {
      console.log("STOPINTENT");
      this.response.speak("Goodbye!");  
      this.emit(':responseReady');  
    },
    "AMAZON.CancelIntent": function() {
      console.log("CANCELINTENT");
      this.response.speak("Goodbye!");  
      this.emit(':responseReady');  
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        //this.attributes['endedSessionCount'] += 1;
        this.response.speak("Goodbye!");  
        this.emit(':responseReady');
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        var message = 'Say yes to continue, or no to end the game.';
        this.response.speak(message).listen(message);
        this.emit(':responseReady');        
    }
});

var guessModeHandlers = Alexa.CreateStateHandler(states.GUESSMODE, {
    'NewSession': function () {
        this.handler.state = '';
        this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
    },
    'NumberGuessIntent': function() {
        var guessNum = parseInt(this.event.request.intent.slots.number.value);
        var targetNum = this.attributes["guessNumber"];
        console.log('user guessed: ' + guessNum);

        if(guessNum > targetNum){
            this.emit('TooHigh', guessNum);
        } else if( guessNum < targetNum){
            this.emit('TooLow', guessNum);
        } else if (guessNum === targetNum){
            // With a callback, use the arrow function to preserve the correct 'this' context
            this.emit('JustRight', () => {
                this.response.speak(guessNum.toString() + 'is correct! Would you like to play a new game?')
                .listen('Say yes to start a new game, or no to end the game.');
                this.emit(':responseReady');                
        })
        } else {
            this.emit('NotANum');
        }
    },
    'AMAZON.HelpIntent': function() {
        this.response.speak('I am thinking of a number between zero and one hundred, try to guess and I will tell you' +
            ' if it is higher or lower.')
            .listen('Try saying a number.');
        this.emit(':responseReady');            
    },
    "AMAZON.StopIntent": function() {
        console.log("STOPINTENT");
      this.response.speak("Goodbye!"); 
      this.emit(':responseReady');      
    },
    "AMAZON.CancelIntent": function() {
        console.log("CANCELINTENT");
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        this.attributes['endedSessionCount'] += 1;
        this.response.speak("Goodbye!");
        this.emit(':responseReady');        
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        this.response.speak('Sorry, I didn\'t get that. Try saying a number.')
        .listen('Try saying a number.');
        this.emit(':responseReady');        
    }
});

// These handlers are not bound to a state
var guessAttemptHandlers = {
    'TooHigh': function(val) {
        this.response.speak(val.toString() + ' is too high.')
        .listen('Try saying a smaller number.');
        this.emit(':responseReady');
    },
    'TooLow': function(val) {
        this.response.speak(val.toString() + ' is too low.')
        .listen('Try saying a larger number.');
        this.emit(':responseReady');        
    },
    'JustRight': function(callback) {
        this.handler.state = states.STARTMODE;
        this.attributes['gamesPlayed']++;
        callback();
    },
    'NotANum': function() {
        this.response.speak('Sorry, I didn\'t get that. Try saying a number.')
        .listen('Try saying a number.');
        this.emit(':responseReady');        
    }
};*/
