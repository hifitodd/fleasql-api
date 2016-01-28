var app = require('express')();
var http = require('http');
//var http = require('http').server(app);
var mysql = require('mysql');
var bodyParser = require("body-parser");
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Audiofl3a!!',
    database: 'audioflea_bluehost_thinkpad_7-13-15'
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

/**
 * GET Example
 */
app.get('/userinfo', function(req, res) {
    var data = {
        error: 1,
        statusmsg: '',
        userFields: []
    };

    var userId = req.query.userid;
    if(userId) {
        connection.query("SELECT * from flea_users where ID=?", userId, function(err, rows, fields) {
            if(rows.length != 0) {
                data.error = 0;
                data.userFields = rows[0];
                data.statusmsg = "Cool, we got the user's info.";
                res.json(data);
            }
            else {
                data.statusmsg = "Couldn't find user in the DB";
                res.json(data);
            }
        });
    }
    else {
        data.statusmsg = "Please provided a userID in the request string.";
        res.json(data);
    }

    /*connection.query("select * from book", function(err, rows, fields) {
        if(rows.length != 0) {
            data.error = 0;
            data.Books = rows;
            res.json(data);
        } else {
            data.Books = 'No books found.';
            res.json(data);
        }
    })*/
});

/**
 * POST Example
 */

app.post('/bookpost', function(req, res) {
    // setup vars first

    // get vars from the post
    var Bookname = req.body.bookname;
    var Authorname = req.body.authorname;
    var Price = req.body.price;

    // error flag and data variable for books
    var data = {
        error: 1,
        Books: ''
    };

    if(Bookname && Authorname && Price) {
        connection.query("insert into book values('',?,?,?)",[Bookname, Authorname, Price], function (err, rows, fields) {
            if(err) {
                data.Books = "Error adding data";
            }
            else {
                data.error = 0;
                data.Books = "Book added successfully.";
            }
            res.json(data);
        });
    }
    else {
        data.Books = 'Please provide all required data!  Bookname, Authorname and Price.';
        res.json(data);
    }
});

/**
 * PUT example, doing a DB UPDATE
 */
app.put('/bookupdate', function(req, res) {
    var Id = req.body.id;
    var Bookname = req.body.bookname;
    var Authorname = req.body.authorname;
    var Price = req.body.price;
    var data = {
        error: 1,
        Books: ''
    };

    if(Id && Bookname && Authorname && Price) {
        connection.query("update book set BookName=?, AuthorName=?, Price=? where id=?", [Bookname, Authorname, Price, Id], function(err, rows, fields) {
            if(err) {
               data.Books = "Error updating data";
            } else {
               data.error = 0;
               data.Books = "Updated book successfully.";
            }
            res.json(data);
        });
    } else {
        data.Books = "provide all required data plz.";
        res.json(data);
    }
});

/**
 * DELETE Example
 */
app.delete('/bookdelete',function(req,res){
    var Id = req.body.id;
    var data = {
        "error":1,
        "Books":""
    };
    if(Id){
        connection.query("DELETE FROM book WHERE id=?",[Id],function(err, rows, fields){
            if(err){
                data.Books = "Error deleting data";
            }else{
                data.error = 0;
                data.Books = "Book was deleted Successfully.";
            }
            res.json(data);
        });
    }else{
        data.Books = "Please provide all required data (i.e : id )";
        res.json(data);
    }
});


/**
 * sample root GET handler
 */
app.get('/', function (req, res) {
    res.send('Hello world');
});

app.listen(3000, function () {
    console.log('Flea MySql Web Service layer is up on port 3000.   ');
});