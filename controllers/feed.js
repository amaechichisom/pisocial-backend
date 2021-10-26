const fs = require('fs');
const path = require('path');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

const States = require('../data/state_abbr')

const tweets = require('../data/election.json')

const {validationResult} = require('express-validator/check');

const User = require('../models/user');

//Helps to check if a word exists in a string of text

function checkWord(word, str) {
    const allowedSeparator = '\\\s,;"\'|';

    const regex = new RegExp(`(^.*[${allowedSeparator}]${word}$)|(^${word}[${allowedSeparator}].*)|(^${word}$)|(^.*[${allowedSeparator}]${word}[${allowedSeparator}].*$)`,

    // Case insensitive
    'i',);

    return regex.test(str);
}

const twitterSentiment = async(token) => {
    const feed = {
        mentions: [],
        positive: [],
        negative: [],
        neutral: [],
        polarity: [],
        subject: [],
        states:{},
        time: {}
    }

    tokens = token.split(" ")

    for (let i in tweets) {
        for (let j in tokens) {
            if (checkWord(tokens[j], tweets[i].tweet_text)) {
                if (tweets[i].state){
                    feed.states[States[tweets[i].state]] += 1
                }
                
                let date = tweets[i].created_at.split("T")[0].toString()
            
                if(!feed.time.hasOwnProperty(date)){
                    
                    feed.time[date] = {
                        'positive': 0,
                        'negative': 0,
                        'neutral' : 0

                    }
                
                }

                tweets[i].sentimentScore = sentiment
                    .analyze(tweets[i].tweet_text)
                    .score
                feed
                    .mentions
                    .push(tweets[i])
                feed
                    .polarity
                    .push(tweets[i].polarity)
                feed
                    .subject
                    .push(tweets[i].subjectivity)
                if (tweets[i].sentimentScore > 0) {
                    tweets[i].sentiment = "positive"
                    
                    feed.time[date]['positive'] += 1;
                    feed
                        .positive
                        .push(tweets[i])
                } else if (tweets[i].sentimentScore < 0) {
                  tweets[i].sentiment = "negative";
                  feed.time[date]['negative'] += 1;
                    feed
                        .negative
                        .push(tweets[i])
                } else {
                  tweets[i].sentiment = "neutral";
                  feed.time[date]['neutral'] += 1
                    
                    feed
                        .neutral
                        .push(tweets[i])
                }

            }
        }

    }

    return feed
}

exports.postTwitter = async (req, res, next) => {
    token = req.body.token;

    feed = await twitterSentiment(token)

    User
        .findById(req.userId)
        .then(user => {
            user
                .keywords
                .push(token)
            return user.save();
        })
        .then(result => {
            res
                .status(200)
                .json({feed: feed, message: 'Successfully processed'});
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
                res
                    .status(500)
                    .json({status: 500, message: 'Something went wrong, our Godfrey is working on it, please try again'});
            }
            next(err);
        });
}
