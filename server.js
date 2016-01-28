var app = require('express')();
var http = require('http');
//var http = require('http').server(app);
var mysql = require('mysql');
var bodyParser = require("body-parser");
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Audiofl3a!!',
    database: 'books'
});
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// set header for CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// LOL testinga DUE BITCH asdf FOOL BLOW BEYOTCH
app.get('/book', function(req, res) {
    var data = {
        error: 1,
        Books: ''
    };

    connection.query("select * from book", function(err, rows, fields) {
        if(rows.length != 0) {
            data.error = 0;
            data.Books = rows;
            res.json(data);
        } else {
            data.Books = 'No books found.';
            res.json(data);
        }
    })
});

app.get('/', function (req, res) {
    res.send('Hello world');
});

app.listen(3000, function () {
    console.log('sup fools');
});