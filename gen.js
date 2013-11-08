var markov = require('markov')
var fs = require('fs')
var Twit = require('twit')
var rand = require('./lib/rand.js')
var sources = require('./lib/sources.js')
var util = require('util')

var T = new Twit(require('./private/twitter.js'))

rand.setSeed(Date.now())

var m = markov(1)
var wordCount = 0 
var chapterCount = 1

var getSentenceEnd = function(){
  return ['.','!','?'][rand.getRandom(2,0)]
}

function generateSentence(seed, parLength){
  //termination condition
  if(!parLength) return ""

  //get a sentence of random length
  var sentence = m.respond(seed, rand.getRandom(35,8)).join(' ')

  //capitalize the first letter if necessary
  if(/^[a-z]/.test(sentence)){
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1)
  }
  
  //replace double spaces with single spaces
  sentence.replace("  ", " ")

  //throw a random sentence ender in there if necessary
  if(!/[\.!\?]$/.test(sentence)){
    sentence += getSentenceEnd()
  }

  //update word count
  wordCount += sentence.split(' ').length
  sentence += "  "
  
  //call this recursively
  return sentence + generateSentence(sentence, parLength-1)
}

function generate(topicInfo){
  //chapter header
  var paragraph = '#'+chapterCount+'. "'+topicInfo.tweet+'"\n    ~'+topicInfo.user+'\n\n'
  //for each tweet in timeline
  topicInfo.timeline.forEach(function(sentence){
    //create a paragraph
    paragraph += "  " +sentence + (/[\.!\?]\s*$/.test(sentence) ? "  " : ".  ")  + generateSentence(sentence, rand.getRandom(24,4))+"\n\n"
  })
  //write paragraph out
  console.log(paragraph)
  if(wordCount > 50000) process.exit(0)
  chapterCount++
}

function getTimeline(topics){
  T.get('statuses/user_timeline',
        {
          user_id: topics.id,
          count: rand.getRandom(75,20),
          trim_user: true,
          exclude_replies: true,
          include_rts: false
        }, function(err, reply){
          if(err) cb(err)
          topics.timeline = reply.map(function(item){
            return item.text
          })
          generate(topics)
        }
  )
}

function getChapterTweets(){
  T.get('search/tweets', {q:'creepy OR scary OR horror OR evil', count:20}, function(err, reply){
    if(err){
      console.log(err)
    }else{
      var topicSentences = []
      var txt
      reply.statuses.forEach(function(item){
        txt = item.text
        if(!/@/.test(txt) && !/RT/.test(txt)){
          topicSentences.push({
            tweet: txt.replace(/http.*$/,''),
            id: item.user.id,
            user: item.user.screen_name
          })
        }
      })

      topicSentences.forEach(function(topic){
        getTimeline(topic)
      })

      if(wordCount < 50000){
        getChapterTweets()
      }
    }
  })
}

var s = fs.createReadStream(__dirname + "/source_material/horror/horror.txt")
// var s = fs.createReadStream(__dirname + "/source_material/horror/pg375.txt")
m.seed(s, getChapterTweets)
