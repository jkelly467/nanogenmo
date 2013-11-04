var markov = require('markov')
var fs = require('fs')
var N = {}

N.Rand = {
	_s0: 0,
	_s1: 0,
	_s2: 0,
	_c: 0,
	_frac: 2.3283064365386963e-10, /* 2^-32 */
  getUniform: function() {
    var t = 2091639 * this._s0 + this._c * this._frac;
    this._s0 = this._s1;
    this._s1 = this._s2;
    this._c = t | 0;
    this._s2 = t - this._c;
    return this._s2;
  },
  getRandom: function(end, start){
    start = start || 0
    return Math.floor(this.getUniform()*(end-start+1)+start)
  },
	setSeed: function(seed) {
		seed = (seed < 1 ? 1/seed : seed);

		this._seed = seed;
		this._s0 = (seed >>> 0) * this._frac;

		seed = (seed*69069 + 1) >>> 0;
		this._s1 = seed * this._frac;

		seed = (seed*69069 + 1) >>> 0;
		this._s2 = seed * this._frac;

		this._c = 1;
		return this;
	}
}

N.Rand.setSeed(Date.now())


var m = markov(1)
var rand = N.Rand

var getSentenceEnd = function(){
  return ['.','!','?'][rand.getRandom(2,0)]
}

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
  sentence += "  "
  return sentence + generateSentence(sentence, parLength-1)
}

var s = fs.createReadStream(__dirname + "/source_material/horror/pg389.txt")
var firstSentence = "They built the wall between Wisconsin and Minnesota to be unscalable and impenetrable.  "
m.seed(s, function(){
  var paragraph = firstSentence + generateSentence(firstSentence, rand.getRandom(14,2))
  console.log(paragraph)
})
