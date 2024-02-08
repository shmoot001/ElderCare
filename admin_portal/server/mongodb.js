const mongoose = require('mongoose');

//mongoDB configz
const dbURL = 'mongodb://127.0.0.1:27017/Eldercare';
//andra och tredje parametern skippar vissa varningar
mongoose.connect(dbURL, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => console.log("Ansluten till mongoDB"))
    .catch((err) => console.log(err));

//temporärt tills jag löser login via mongoDB!
//const admins=[{username:'admin', password:'trocadero'}];

const AdminSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const CaretakerSchema = new mongoose.Schema({
    username: String,
    password: String,
    contact: String,
    birthday: Date,
    name: String,
    carerecepients: [{ type: String }],
    formal: Boolean,
    language: String,
    address: String,
  });

  const ElderSchema = new mongoose.Schema({
    username: String,
    password: String,
    contact: String,
    address: String,
    birthday: Date,
    preferences: String,
    name: String,
    pin: String,
    language: String,
  });

  const MealSchema = new mongoose.Schema({
    owner: String,
    name: String,
    eaten: Boolean,
    date: Date,
  });
  
  const Admin = mongoose.model('admins', AdminSchema, 'admins');
  const Caretaker = mongoose.model('caretakers', CaretakerSchema, 'caretakers'); //förutfattat namn, vårt schema, collection-namn
  const Elder = mongoose.model('Elder', ElderSchema, 'elders');

module.exports = Object.freeze({
    Admin,
    Caretaker,
    Elder,
});