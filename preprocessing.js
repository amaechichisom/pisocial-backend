const csv = require('csv-parser');
const fs = require('fs');
const result = []

let tweets = fs.createWriteStream('./data/election.json');
let Regex=/[a-zA-Z]*$/;
let count = 0

const hyt = async () =>{
    fs
    .createReadStream('election_tweets.csv')
    .pipe(csv({}))
    .on('data', (data) => 
    {
        if(data.tweet_text === "" || data.tweet_text === null || !Regex.exec(data)){
            return
        }
        else{
            count = count + 1;
            result.push(data)
        }
    }
    )
    .on('end', () => {
        tweets.write(JSON.stringify(result), (err)=> {
            if(err){
                console.log(err.message)
            }
            else{
                console.log("data written");
                console.log(count);
            }
        });
    });
}

hyt();



