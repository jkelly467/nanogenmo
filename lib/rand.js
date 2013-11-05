
var Rand = {
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

module.exports = Rand
