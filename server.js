var app = require('express')();
var http = require('http');
var mysql = require('mysql');
var bodyParser = require("body-parser");

// DB name will be different depending on where I am running.  I should probably make the test ones consistent.
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Audiofl3a!!',
    database: 'audioflea_dev'
});
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// set header for CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
/**
 *
 * Error handler
 */


/**
 * GET - Get user Details
 * @param userid the WP id of the user passed in on the query string like this: /userinfo?userid=0
 */
app.get('/userinfo', function(req, res) {
    var data = {
        error: 1,
        statusmsg: '',
        userFields: [],
        metaFields: {}
    };

    var userId = req.query.userid;
    if(userId) {
        // first check the flea_users table to get basic user details
        connection.query("SELECT * from flea_users where ID=?", userId, function(err, rows, fields) {

            // If there is an error, bail out and handle it safely
            //if(err) { return next(err); }

            if(rows) {
                if(rows.length != 0) {
                    data.error = 0;
                    data.userFields = rows[0];
                    data.statusmsg = "Cool, we got the user's info.";
                    //res.json(data);
                }
                else {
                    data.statusmsg = "Couldn't find user in the DB - table is flea_users";
                    res.json(data);
                }
            }
            else {
                data.statusmsg = "rows variable is null";
                res.json(data);
            }
        });

        // OK, now let's get the user's meta fields from the 'usermeta' table
        connection.query("SELECT * from flea_usermeta WHERE user_id=?", userId, function(err, rows, fields) {
            if(rows && rows.length != 0) {
                // fields to return, build an object of them
                var returnFields = {};

                // list of the fields I want
                var metaFieldsToReturn = ['author_custom', 'author_description', 'author_title_line', 'avatar_image_field', 'description', 'first_name', 'last_name', 'flea_user_level', 'nickname', 'reg_mail_signup_box'];
                // iterate over each meta field
                rows.forEach(function(row) {
                    if(metaFieldsToReturn.indexOf(row.meta_key) !== -1) {
                        // if this item is in the array of ones to keep...
                        data.metaFields[row.meta_key] = row.meta_value;
                    }
                    data.statusmsg = "got meta stuff";
                });
            }
            else {
                data.statusmsg = "failed to get meta info about user";
            }
            // send the response back now!
            res.json(data);
        });
    }
    else {
        data.statusmsg = "Please provided a userID in the request string.";
        res.json(data);
    }
});
/*app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});*/

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