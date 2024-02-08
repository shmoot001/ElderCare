'use strict';
//Adminportal Eldercare, Börja läs här.
let portnr = 4000;
const hour_in_milliseconds = 3600000;
const express = require('express');
const session = require('express-session'); //behövs tydligen
const sessionKey = '0631ac84e7be3ed8701bd57e499c313e09f6b75ae323f73855d62fc33a826b45' //genererade med cryptopaketet i npm 23-09-16
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var cookieParser = require('cookie-parser');
const { Console } = require('console');
app.use(cookieParser());
app.use(express.json()); //för att kunna ta emot jsondata

var mongodb = require('./mongodb.js');

//simulerar att public är static
app.use('/public', express.static(__dirname + '/static'));
//middleware så vi kan ta emot data
app.use(express.urlencoded({extended : true}));
//sätt igång servern.
server.listen(portnr, function(){
    console.log('Server live på port: ', portnr);
});


//cookies för inlogg
app.use(cookieParser());
app.use(session({
  secret: sessionKey,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: hour_in_milliseconds, //Hur lång en inloggnings-session kan vara
  },
}));

function ensureLoggedin(req, res, next) {
    if (req.session.user) {
      return next(); //Fortsätt med funktionen om användaren är inloggad.
    }
    res.redirect('/login'); //annars utloggad och tillbaks till login!
  }

function ensureDatabaseAccess(req, res, next) {
    if(req.session.user){
        return next();
    }
    res.send(null);
}

//behöver göra en fin liten ikon till hemsidan...
app.get('/favicon.ico', function(req,res) {
    res.sendFile(__dirname + '/favicon.ico');
});



//all form av redigering händer här.
io.on('connect', (socket) => {
  

});




//------------------------------------------------------------ Login page ----------------------------------------------------------------
app.get('/login', function(req, res){
    //console.log('ger ut loginsidan...');
    res.sendFile(__dirname + '/public/loginpage/login.html'); 
});

//Validering inlogg
app.post('/login', function(req, res){
    let data = {username: req.body.username, password: req.body.password}
    mongodb.Admin.find({}).then(admins => { //Admin.find asynkront så därav skrivs det på detta sättet. enda sättet om man hämtar fr mongodb
        if (admins.find(admin => admin.username === data.username && admin.password === data.password)) {
          console.log("Lyckad inloggning för: ", data.username);
          req.session.user = { username: req.body.username };
          res.redirect('/dashboard');
        } else {
          res.send('<script>alert("Wrong login.");window.location.href = "/login";</script>');
          console.log("Felaktig inloggning", data);
        }
      }).catch(err => {
        console.log("Database error:", err);
      });
});

app.get('/', ensureLoggedin, function(req, res){
    res.redirect('/dashboard');
});
//----------------------------------------------------------------------------------------------------------------------------------------


//------------------------------------------------------------ Settings page -------------------------------------------------------------


app.get('/settings',  ensureLoggedin, function(req, res){
    //console.log('ger ut loginsidan...');
    res.sendFile(__dirname + '/public/settings/settings.html'); 
});

app.post('/signout',  ensureLoggedin, function(req, res){
    //ta bort login-cookie
    req.session.destroy((err) => {
        if (err) {
          console.error(err);
        }
    
    res.redirect('/login')
    }); 
});
//----------------------------------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------ Dashboard page -------------------------------------------------------------
app.get('/dashboard',  ensureLoggedin, function(req, res){
    //console.log('ger ut loginsidan...');
    res.sendFile(__dirname + '/public/dashboard/dashboard.html'); 
});

app.post('/newAdmin', ensureDatabaseAccess, async (req, res) => {
  console.log("Skapar ny admin");
  const adminData = {
      username: req.body.username,
      password: req.body.password,
    };
  const caretakers = await mongodb.Admin.create(adminData);
  res.redirect('/dashboard');
  });
//----------------------------------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------ Elder page ------------------------------------------------------------
app.use('/elders', express.static(__dirname + '/public/elders')); //så att alla separata filer följer med!! viktigt
app.get('/elders',  ensureLoggedin, function(req, res){
  res.sendFile(path.join(__dirname, 'public/elders', 'elders.html')); 
});
app.get('/elderDB', ensureDatabaseAccess, async (req, res) => {
  console.log("Skrickar Elderdata");
  const elders = await mongodb.Elder.find({});
  res.json(elders);
});


//lägger till en ny användare från Admininterfacet.
app.post('/newElder', ensureDatabaseAccess, async (req, res) => {
console.log("Skapar ny Elder");
const elderData = {
  username: req.body.username,
  password: req.body.password,
  contact: req.body.contact,
  birthday: req.body.birthday,
  name: req.body.name,
  preferences: req.body.preferences,
  language: req.body.language,
  pin: req.body.pin,
  address: req.body.address,
};

//TODO Lägg in kontroller för användarnamn här

const elders = await mongodb.Elder.create(elderData);
res.redirect('/elders');
});


//tar bort caregiver från Admininterfacet.
app.post('/deleteElder', ensureDatabaseAccess, async (req, res) => {
const elderData = {username: req.body.username};
console.log("tar bort elder: ", elderData);
const caretakers = await mongodb.Elder.deleteOne(elderData);
res.redirect('/elders');
});


//Uppdaterar elder
app.post('/updateElder', ensureDatabaseAccess, async (req, res) => {
  const elderData = req.body;
  //TODO Lägg in kontroller för användarnamn här
  await mongodb.Elder.updateOne({username : elderData.current_username}, {$set: elderData});
});

//----------------------------------------------------------------------------------------------------------------------------------------


//------------------------------------------------------------ Caretaker page ------------------------------------------------------------

app.use('/caretakers', express.static(__dirname + '/public/caretakers')); //så att alla separata filer följer med!! viktigt
app.get('/caretakers',  ensureLoggedin, function(req, res){
    res.sendFile(path.join(__dirname, 'public/caretakers', 'caretakers.html')); 
});


app.get('/caretakersDB', ensureDatabaseAccess, async (req, res) => {
    console.log("Skrickar Caregiverdata");
    const caretakers = await mongodb.Caretaker.find({});
    res.json(caretakers);
  });


//lägger till en ny användare från Admininterfacet.
app.post('/newCaregiver', ensureDatabaseAccess, async (req, res) => {
console.log("Skapar ny Caregiver");
const careGiverData = {
    username: req.body.username,
    password: req.body.password,
    contact: req.body.contact,
    birthday: req.body.birthday,
    name: req.body.name,
    carerecipients: [], //temporärt tills jag löst ett bra system
    formal: req.body.formal,
    address: req.body.address,
    language: req.body.language
  };
const caretakers = await mongodb.Caretaker.create(careGiverData);
res.redirect('/caretakers');
});


//tar bort caregiver från Admininterfacet.
app.post('/deleteCareGiver', ensureDatabaseAccess, async (req, res) => {
  const careGiverData = {username: req.body.username};
  console.log("tar bort caregiver: ", careGiverData);
  const caretakers = await mongodb.Caretaker.deleteOne(careGiverData);
  res.redirect('/caretakers');
  });


//Uppdaterar caregiver
app.post('/updateCaregiver', ensureDatabaseAccess, async (req, res) => {
  const caregiverData = req.body;
  //TODO Lägg in kontroller för användarnamn här
  await mongodb.Caretaker.updateOne({username : caregiverData.current_username}, {$set: caregiverData});
});


//----------------------------------------------------------------------------------------------------------------------------------------





