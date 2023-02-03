const mongoose = require('mongoose')

const listingSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true
  },
  title: {
    required: true,
    type: String
  },
  description: {
    type: String
  },
  price: {
    type: Number
  },
  shipping: {
    type: Number
  },
  currency: {
    required: true,
    type: String
  },
  //https://stackoverflow.com/questions/39948196/saving-coordinates-into-mongoose
  location: {
    type: [Number],
    default: [0, 0]
  },
  site: {
    required: true,
    type: String
  },
  url: {
    required: true,
    type: String
  },
  date_posted: {
    type: Date,
    default: Date.now
  },
  date_posted: {
    type: Date
  },
  date_recorded: {
    type: Date,
    default: Date.now
  },
  InStock:{
    type: Boolean,
    default: true
  },
  tags: { type: [String], index: true }
})

module.exports = mongoose.model('Listing', listingSchema)
