/* eslint-disable  func-names */
/* eslint-disable  no-console */
const main = require('./main.json');
const Alexa = require('ask-sdk-core');
const questions = require("./questions");

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Hey !! you have a new assessment on AWS by Mr. Robert ,  Say lets begin to start';
        const repromptText = 'say lets begin to start';

        const sessionAttributes = { CURRENT_INDEX: 0 };
        sessionAttributes.correctCount = 0;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        if (supportsAPL(handlerInput)) {
            handlerInput.responseBuilder
                .addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    document: require('./main.json')
                });
        }

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(repromptText)
            .withSimpleCard('Assessment Test', speechText)
            .getResponse();
    },
};

const PlayGameIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'PlayGameIntent'
            || handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.totalQues = 5;    
        let spokenAnswer = "";
        let myData = {};
        let myDoc = {};
        const request = handlerInput.requestEnvelope.request;

        // Get the level the customer selected: 'easy', 'med', 'hard'
        if (request.type === 'Alexa.Presentation.APL.UserEvent') {
            spokenAnswer = handlerInput.requestEnvelope.request.arguments[0];
            //   if (request.arguments[0] === 'lets begin') {
            if (sessionAttributes.CURRENT_INDEX == 0 && request.arguments[0] === 'lets begin') {
                sessionAttributes.speechText += spokenAnswer;
                sessionAttributes.progress = "begin";
                sessionAttributes.currentLevel = "easy"
                sessionAttributes.currentRiddle = questions.LEVELS[sessionAttributes.currentLevel][sessionAttributes.CURRENT_INDEX];
                sessionAttributes.CURRENT_INDEX++;
                sessionAttributes.max = questions.LEVELS.easy.length;
                let firstques = {}; 
                firstques = questions.LEVELS[sessionAttributes.currentLevel][0];
                let quesops =  questions.LEVELS[sessionAttributes.currentLevel][0].hints;
                // let hints = quesops.hints;
                sessionAttributes.speechText = " First question  : " + firstques.question;

                    quesops.forEach(function(ops,idx) {
                      sessionAttributes.speechText += `<say-as interpret-as="ordinal">${idx+1}</say-as> option is ${ops}. `;
                    });
                    
                if (supportsAPL(handlerInput)) {
                    myDoc = require('./quiz.json');
                    myData = createDatasource.call(this, sessionAttributes);
                } else {
                    sessionAttributes.speechText += sessionAttributes.currentRiddle.question;
                }

            }
            else if(request.arguments[0] === ''){
                 sessionAttributes.speechText = "Please select the option from the given list";
            }
            else if (sessionAttributes.CURRENT_INDEX == sessionAttributes.totalQues) {
                if (request.arguments[0] === sessionAttributes.currentRiddle.answer) {
                    sessionAttributes.speechText = sessionAttributes.currentRiddle.answer + " is correct! You got it right! "
                    sessionAttributes.correctCount++;
                    sessionAttributes.correct = "Correct! ";
                }
                else {
                    sessionAttributes.speechText = "Oops, that was wrong. The correct answer is " + sessionAttributes.currentRiddle.answer + ". ";
                    sessionAttributes.correct = "Incorrect! ";
                }
                sessionAttributes.speechText += 
                    "You have completed all of the Questions! "
                    + "Your correct answer count is "
                    + sessionAttributes.correctCount
                if (supportsAPL(handlerInput)) {
                    myDoc = require('./summary.json');
                    myData = createDatasource.call(this, sessionAttributes);

                } else {
                    sessionAttributes.speechText += sessionAttributes.currentRiddle.question;
                }
            }
            else if (sessionAttributes.CURRENT_INDEX != 0) {
                if (request.arguments[0] === sessionAttributes.currentRiddle.answer) {
                    sessionAttributes.speechText = sessionAttributes.currentRiddle.answer + " is correct! You got it right! "
                    sessionAttributes.correctCount++;
                    sessionAttributes.correct = "Correct! ";
                }
                else {
                    sessionAttributes.speechText = "Oops, that was wrong. The correct answer is " + sessionAttributes.currentRiddle.answer + ". ";
                    sessionAttributes.correct = "Incorrect! ";
                }
                sessionAttributes.progress = "begin";
                sessionAttributes.currentLevel = "easy"
                sessionAttributes.currentRiddle = questions.LEVELS[sessionAttributes.currentLevel][sessionAttributes.CURRENT_INDEX];
                sessionAttributes.speechText += "Next Question is : " + sessionAttributes.currentRiddle.question;
                let quesops =  sessionAttributes.currentRiddle.hints;

                quesops.forEach(function(ops,idx) {
                    console.log(idx);
                    console.log(ops);
                    sessionAttributes.speechText += `<say-as interpret-as="ordinal">${idx+1}</say-as> option is ${ops}. `;
                    });

                sessionAttributes.CURRENT_INDEX++;
                if (supportsAPL(handlerInput)) {
                    myDoc = require('./quiz.json');
                    myData = createDatasource.call(this, sessionAttributes);
                } else {
                    sessionAttributes.speechText += sessionAttributes.currentRiddle.question;
                }
            }


        } else {
            spokenAnswer = handlerInput.requestEnvelope.request.intent.slots.answer;

            if (spokenAnswer.resolutions) {
                spokenAnswer = spokenAnswer.resolutions.resolutionsPerAuthority[0].values[0].value.name;
            }

            sessionAttributes.spokenAnswer = spokenAnswer;

            if (spokenAnswer != '' && sessionAttributes.CURRENT_INDEX == 0) {
                sessionAttributes.speechText += spokenAnswer;
                sessionAttributes.progress = "begin";
                sessionAttributes.currentLevel = "easy"
                sessionAttributes.currentRiddle = questions.LEVELS[sessionAttributes.currentLevel][sessionAttributes.CURRENT_INDEX];
                sessionAttributes.CURRENT_INDEX++;
                sessionAttributes.max = questions.LEVELS.easy.length;

                let firstques = {}; 
                firstques = questions.LEVELS[sessionAttributes.currentLevel][0];
                let quesops =  questions.LEVELS[sessionAttributes.currentLevel][0].hints;

                sessionAttributes.speechText = " First question  : " + firstques.question;

                quesops.forEach(function(ops,idx) {
                    console.log(idx);
                    console.log(ops);
                    sessionAttributes.speechText += `<say-as interpret-as="ordinal">${idx+1}</say-as> option is ${ops}. `;
                });
                if (supportsAPL(handlerInput)) {
                    myDoc = require('./quiz.json');
                    myData = createDatasource.call(this, sessionAttributes);
                } else {
                    sessionAttributes.speechText += sessionAttributes.currentRiddle.question;
                }
            }
            else if (spokenAnswer != '' && sessionAttributes.CURRENT_INDEX == sessionAttributes.totalQues) {
                if (spokenAnswer === sessionAttributes.currentRiddle.answer.toLowerCase()) {
                    sessionAttributes.speechText = sessionAttributes.currentRiddle.answer + " is correct! You got it right! "
                    sessionAttributes.correctCount++;
                    sessionAttributes.correct = "Correct! ";
                }
                else {
                    sessionAttributes.speechText = "Oops, that was wrong. The correct answer is " + sessionAttributes.currentRiddle.answer + ". ";
                    sessionAttributes.correct = "Incorrect! ";
                }
                sessionAttributes.speechText +=
                    "You have completed all of the Questions! "
                    + "Your score is "
                    + sessionAttributes.correctCount
                if (supportsAPL(handlerInput)) {

                    myDoc = require('./summary.json');
                    myData = createDatasource.call(this, sessionAttributes);

                } else {
                    sessionAttributes.speechText += sessionAttributes.currentRiddle.question;
                }
            }
            else if (spokenAnswer != '' && sessionAttributes.CURRENT_INDEX != 0) {
                if (spokenAnswer === sessionAttributes.currentRiddle.answer.toLowerCase()) {
                    sessionAttributes.speechText = sessionAttributes.currentRiddle.answer + " is correct! You got it right! "
                    sessionAttributes.correctCount++;
                    sessionAttributes.correct = "Correct! ";
                }
                else {
                    sessionAttributes.speechText = "Oops, that was wrong. The correct answer is " + sessionAttributes.currentRiddle.answer + ". ";
                    sessionAttributes.correct = "Incorrect! ";
                }
                sessionAttributes.progress = "begin";
                sessionAttributes.currentLevel = "easy"
                sessionAttributes.currentRiddle = questions.LEVELS[sessionAttributes.currentLevel][sessionAttributes.CURRENT_INDEX];
                sessionAttributes.speechText += "Next Question is : " + sessionAttributes.currentRiddle.question;

                let quesops =  sessionAttributes.currentRiddle.hints;

                quesops.forEach(function(ops,idx) {
                    console.log(idx);
                    console.log(ops);
                    sessionAttributes.speechText += `<say-as interpret-as="ordinal">${idx+1}</say-as> option is ${ops}. `;
                });
                
                sessionAttributes.CURRENT_INDEX++;
                if (supportsAPL(handlerInput)) {

                    myDoc = require('./quiz.json');
                    myData = createDatasource.call(this, sessionAttributes);

                } else {
                    sessionAttributes.speechText += sessionAttributes.currentRiddle.question;
                }
            }

            sessionAttributes.progress = "begin";
            sessionAttributes.currentLevel = "easy"
            sessionAttributes.totalRids = 5;
            // Check if the slot value for riddleNum is filled and <5, otherwise default to 5
            const riddleNum = 0;
            if (riddleNum) {
                sessionAttributes.totalRids = riddleNum <= 5 ? riddleNum : 5;
            } else {
                sessionAttributes.totalRids = 5;
            }
        }

        // Reset variables to 0 to start the new game
        // sessionAttributes.correctCount = 0;
        // sessionAttributes.currentIndex = 0;
        // sessionAttributes.currentHintIndex = 0;

        // Get the first riddle according to that level

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        return handlerInput.responseBuilder
            .speak(sessionAttributes.speechText)
            .reprompt(sessionAttributes.speechText + sessionAttributes.currentRiddle.question)
            .withSimpleCard('Level Up Riddles', sessionAttributes.speechText)
            .addDirective({
                type: "Alexa.Presentation.APL.RenderDocument",
                token: 'questionToken',
                document: myDoc,
                datasources: myData
            })
            .addDirective({
                type: 'Alexa.Presentation.APL.ExecuteCommands',
                token: 'riddleToken',
                commands: [
                    {
                        type: 'SpeakItem',
                        componentId: 'touchId',
                        highlightMode: 'line'
                    }
                ]
            })
            .getResponse();
    }
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'You can announce/click  the answer or exit by saying stop';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    },
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Thank you !! Bye';

        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

        return handlerInput.responseBuilder.getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak('Sorry, I can\'t understand the command. Please say again.')
            .reprompt('Sorry, I can\'t understand the command. Please say again.')
            .getResponse();
    },
};

function supportsAPL(handlerInput) {
    const supportedInterfaces =
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
    const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
    return aplInterface != null && aplInterface != undefined;
}

function createDatasource(attributes) {
    return {
        "riddleGameData": {
            "properties": {
                "currentQuestionSsml": "<speak>"
                    + attributes.currentRiddle.question
                    + "<speak>",
                "currentLevel": attributes.currentLevel,
                "currentQuestionNumber": (attributes.currentIndex + 1),
                "numCorrect": attributes.correctCount,
                "currentHint": attributes.currentRiddle.hints
            },
            "transformers": [
                {
                    "inputPath": "currentQuestionSsml",
                    "outputName": "currentQuestionSpeech",
                    "transformer": "ssmlToSpeech"
                },
                {
                    "inputPath": "currentQuestionSsml",
                    "outputName": "currentQuestionText",
                    "transformer": "ssmlToText"
                }
            ]
        }
    };
}

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
    .addRequestHandlers(
        LaunchRequestHandler,
        PlayGameIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
