const { validationResult } = require('express-validator/check')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const User = require('../models/user')

exports.signup = (req, res, next) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    const error = new Error('Validation Failed')
    error.statusCode = 422;
    error.data = errors.array()
    throw error
  }
  const { email, password, name } = req.body
  bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        name: name
      })
      return user.save()
    })
    .then(result => {
      res.status(201).json({
        message: 'Successfully signed up!',
        userId: result._id
      })
    })
    .catch(err => {
      if(!err.statusCode){
        err.statusCode = 500
      }
      next(err)
    })
}

exports.login = (req, res, next) => {
const { email, password } = req.body;
let loadedUser;
User.findOne({email: email})
  .then(user => {
    if(!user){
      const error = new Error('No user found with that email')
      error.statusCode = 401
      throw error
    }
    loadedUser = user
    return bcrypt.compare(password, user.password)
  })
  .then(verified => {
    if(!verified){
      const error = new Error('Wrong password')
      error.statusCode = 401
      throw error
    }
    const token = jwt.sign({
      email: loadedUser.email,
      userId: loadedUser._id.toString()
    }, 'secret', { expiresIn: '1h'})
    res.status(200).json({token: token, userId: loadedUser._id.toString()})
  })
  .catch(err => {
    if(!err.statusCode){
      err.statusCode = 500
    }
    next(err)
  })
}