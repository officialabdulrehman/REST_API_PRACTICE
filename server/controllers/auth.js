const { validationResult } = require('express-validator/check')
const User = require('../models/user')

exports.signup = (req, res, next) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    const error = new Error('Validation Failed')
    error.statusCode = 422;
    error.data = errors.array()
    throw err
  }
  const { email, password, name } = req.body
  
}