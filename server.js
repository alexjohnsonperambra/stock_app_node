const express = require("express");

//create a new express application
const app = express();

const mysql = require('mysql')
var session = require('express-session');
var bodyParser = require('body-parser');

//require the http module
const http = require("http").Server(app)

// require the socket.io module
const io = require("socket.io")(http);

app.use(express.static('.'))
var server = app.listen(process.env.PORT || 8081, () => {
    console.log('Server is started on 127.0.0.1:'+ (process.env.PORT || 8081))
})


// to allow cors origin
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.json());
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('hello'));

var request = require('request');

var path = require('path')

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Tms@1234",
  database:'stock_db'
});

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

cachedItems = []
// saving chatobject and emitting message to sender and reciever
app.post('/auth', function(request, response) {
	console.log('hit');
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		con.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				sess =request.session
				console.log(request.session,'gjgh');
				response.status(200).json({'status':1})
			} else {
				// response.send('Incorrect Username and/or Password!');
				response.status(200).json({'status':0,'reason': 'Invalid Username or Password'})
			}			
		});
	} else {
		response.status(200).json({'status':0,'reason': 'Please Enter Username and Password'})
		response.end();
	}
});


app.post('/stock', function(request, response) {
	console.log(request.session,'request.session');
	if (sess.loggedin) {
		console.log('asfjag');
		con.query("SELECT * FROM stockdetails WHERE name LIKE CONCAT('%', ? ,'%')", [request.body.term], function(error, results, fields) {
			console.log(results,'results');
			if (results.length > 0) {
				response.status(200).json({'status':1,'data':results})
			} else {
				// response.send('Incorrect Username and/or Password!');
				response.status(200).json({'status':0,'reason': 'No Data'})
			}			
		});
	} else {
		response.status(200).json({'status':0,'reason': 'Unauthorised'})
	}
});

app.post('/item', function(request, response) {
	console.log(request.session,'request.session');
	let blnFound = false
	if (sess.loggedin) {
		cachedItems.forEach(element=>{
			if(element.id == request.body.item.id){
				blnFound = true
			}
		})
		if(!blnFound){
			cachedItems.push(request.body.item)
		}
		console.log(cachedItems);
		response.status(200).json({'status':1})
	} else {
		response.status(200).json({'status':0,'reason': 'Unauthorised'})
	}
});

app.get('/itemcached', function(request, response) {
	console.log(request.session,'request.session');
	let blnFound = false
	if (sess.loggedin) {
		response.status(200).json({'status':1,'data':cachedItems})
	} else {
		response.status(200).json({'status':0,'reason': 'Unauthorised'})
	}
});





