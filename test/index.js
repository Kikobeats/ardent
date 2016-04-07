/* global describe, it */

'use strict'

require('should')
var Ardent = require('..')

describe('schema defintion', function () {
  it('simple rule', function () {
    [{age: Number}, {age: { type: Number }}].forEach(function (rule) {
      Ardent(rule)({age: '23'}).should.be.eql({age: 23})
    })
  })

  describe('support default values', function () {
    it('based in a value', function () {
      var schema = {
        age: {
          type: Number, default: 23
        }
      }

      var ardent = Ardent(schema)
      ardent().should.be.eql({age: 23})
    })

    it('based in a fn', function () {
      var schema = {
        age: {
          type: Number, default: function () { return 23 }
        }
      }

      var ardent = Ardent(schema)
      ardent().should.be.eql({age: 23})
    })
  })

  it('support transforms', function () {
    function trim (str) {
      return str.trim()
    }

    var schema = {
      age: {
        type: String,
        transform: [trim]
      }
    }

    var ardent = Ardent(schema)
    ardent({age: '  23  '}).should.be.eql({age: '23'})
  })

  describe('support required values', function () {
    it('throw an error under no values', function () {
      var schema = {
        age: {
          type: String,
          required: true
        }
      }

      var ardent = Ardent(schema)
      var errMessage = "Expected a {string} for 'age'."
      ;(function () { ardent() }).should.throw(errMessage)
    })

    it('custom error message', function () {
      var schema = {
        age: {
          type: String,
          required: [true, 'your message here']
        }
      }

      var ardent = Ardent(schema)
      var errMessage = 'your message here'
      ;(function () { ardent() }).should.throw(errMessage)
    })
  })

  it('disabling casting', function () {
    var schema = {
      age: {
        type: String,
        casting: false
      }
    }

    var errMessage = "Expected a {string} for 'age'."
    var ardent = Ardent(schema)

    ;[null, {age: 23}].forEach(function (obj) {
      ;(function () { ardent(obj) }).should.throw(errMessage)
    })
  })

  describe('support validation', function () {
    it('based in a function', function () {
      var schema = {
        age: {
          type: String,
          validate: function (v) {
            return v === '23'
          }
        }
      }

      var ardent = Ardent(schema)
      var errMessage = "Fail '25' validation for 'age'."
      ;(function () { ardent({age: 25}) }).should.throw(errMessage)
    })

    it('based in a object key', function () {
      var schema = {
        age: {
          type: String,
          validate: {
            validator: function (v) {
              return v === '23'
            }
          }
        }
      }

      var ardent = Ardent(schema)
      var errMessage = "Fail '25' validation for 'age'."
      ;(function () { ardent({age: 25}) }).should.throw(errMessage)
    })

    it('custom error message', function () {
      var schema = {
        age: {
          type: String,
          validate: {
            validator: function (v) {
              return v === '23'
            },
            message: 'expected a millenial instead of {VALUE}!'
          }
        }
      }

      var ardent = Ardent(schema)
      var errMessage = 'expected a millenial instead of 25!'
      ;(function () { ardent({age: 25}) }).should.throw(errMessage)
    })
  })
})
