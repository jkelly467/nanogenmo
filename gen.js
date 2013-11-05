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

var getSentenceEnd = function(){
  return ['.','!','?'][rand.getRandom(2,0)]
}


T.get('search/tweets', {q:'creepy OR scary OR horror OR evil', count:30}, function(err, reply){
  if(err){
    console.log(err)
  }else{
    var topicSentences = []
    var txt
    reply.statuses.forEach(function(item){
      txt = item.text
      if(!/@/.test(txt) && !/RT/.test(txt)){
        topicSentences.push(txt.replace(/http.*$/,'')/*.replace(/#[Ss][Cc][Aa][Rr][Yy]/,"")*/)
      }
    })

    generate(topicSentences)
  }
})

function generateSentence(seed, parLength){
  if(!parLength) return ""
  var sentence = m.respond(seed, rand.getRandom(35,8)).join(' ')
  if(/^[a-z]/.test(sentence)){
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1)
  }
  sentence.replace("  ", " ")
  if(!/[\.!\?]$/.test(sentence)){
    sentence += getSentenceEnd()
  }
  wordCount += sentence.split(' ').length
  sentence += "  "
  return sentence + generateSentence(sentence, parLength-1)
}

function generate(topicSentences){
  var s = fs.createReadStream(__dirname + "/source_material/horror/pg389.txt")
  m.seed(s, function(){
    topicSentences.forEach(function(sentence){
      var paragraph = "\t"+sentence + (/[\.!\?]\s*$/.test(sentence) ? "  " : ".  ")  + generateSentence(sentence, rand.getRandom(24,4))
      console.log(paragraph + "\n")
    })
  })
}
