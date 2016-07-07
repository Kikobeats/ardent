'use strict'

var isFunction = require('lodash.isfunction')
var isString = require('lodash.isstring')
var isArray = require('lodash.isarray')
var assign = require('lodash.assign')
var reduce = require('lodash.reduce')
var merge = require('lodash.merge')
var type = require('type-detect')
var chaste = require('chaste')

function exists (value) {
  return value != null
}

var DEFAULT = {
  BLUEPRINT: {
    casting: true,
    transform: []
  }
}

function createSchemaRule (rule, globalRules) {
  var schema = typeof rule === 'function' ? { type: rule } : rule
  var fields = merge(globalRules, schema)
  return assign({}, DEFAULT.BLUEPRINT, fields)
}

function addRule (globalRules, schema, blueprint, name) {
  schema[name] = createSchemaRule(blueprint, globalRules)
  return schema
}

function throwTypeError (name, type, required) {
  var msg
  if (isArray(required) && isString(required[1])) msg = required[1]
  else msg = 'Expected a {' + type + "} for '" + name + "'."
  throw new TypeError(msg)
}

function throwValidationError (name, value, desription) {
  var msg
  if (desription) msg = desription.replace('{VALUE}', value)
  else msg = "Fail '" + value + "' validation for '" + name + "'."
  throw new TypeError(msg)
}

function Osom (schemaBlueprint, globalRules) {
  if (!(this instanceof Osom)) return new Osom(schemaBlueprint, globalRules)
  globalRules = globalRules || {}
  var schemaTypes = {}
  var schema = reduce(schemaBlueprint, function (schema, blueprint, name) {
    schema = addRule(globalRules, schema, blueprint, name)
    var type = schema[name].type
    schemaTypes[name] = type.name.toLowerCase()
    schema[name].type = chaste(type)
    return schema
  }, {})

  function osom (obj) {
    obj = obj || {}

    return reduce(schema, function applyRule (objSchema, rule, name) {
      var hasValue = exists(obj[name])

      if ((rule.required && !hasValue) || (hasValue && !rule.casting && type(value !== schemaTypes[name]))) {
        throwTypeError(name, schemaTypes[name], rule.required)
      }

      var value
      if (rule.casting && hasValue) value = rule.type(obj[name])
      else if (rule.default) value = !isFunction(rule.default) ? rule.default : rule.default()
      // else {
      //   value = obj[name]
      // }

      // lodash.flow is buggy, this is a workaround (and dep-free)
      value = reduce(rule.transform, function (acc, fn) {
        return fn(acc)
      }, value)

      if (rule.validate) {
        var validator = isFunction(rule.validate) ? rule.validate : rule.validate.validator
        if (!validator(value)) throwValidationError(name, value, rule.validate.message)
      }

      if (exists(value)) objSchema[name] = value
      return objSchema
    }, {})
  }

  return osom
}

module.exports = Osom
