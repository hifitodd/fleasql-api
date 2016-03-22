var express = require('express');
var app = express();
var router = express.Router();
//var http = require('http');
var mysql = require('mysql');
var bodyParser = require("body-parser");

// DB name will be different depending on where I am running.  I should probably make the test ones consistent.
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Audiofl3a!!',
    database: 'audioflea_dev'
});

// load in the submitListing router
var submitListing = require('./submitListing');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('trust proxy', 'loopback');

// set header for CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "localhost");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/submitListing', submitListing);

/**
 * GET - Get user Details
 * @param userid the WP id of the user passed in on the query string like this: /userinfo?userid=0
 */
app.get('/userinfo', function(req, res, next) {
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
            if(err) {
                return next(err);
            }

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
            if(err) {
                return next(err);
            }
            if(rows && rows.length != 0) {
                // fields to return, build an object of them
                var returnFields = {};


                // todo fix the sql statements so I'm only pulling the fields that I want
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

                // to get the avatar image, I should do a query here
                // need the 'avatar_image_url' meta field, and then check the 'posts' table for that ID to get the
                // image URL
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


/**
 * GET - Get Billing Details
 *
 * Details are TBD based on how I end up doing payment gateway, etc.
 */
app.get('/billinginfo', function(req, res, next) {
    res.send('Billing info brah!');
});

/**
 * GET - Get inbox.
 * Params will dictate what messages to return.  Details TBD
 * @param {int} userid
 */
app.get('/receivedMessages', function(req, res, next) {
    var data = {
        statusmsg: '',
        messages: {}
    };

    // get userId from query string
    var userId = req.query.userid;
    connection.query("SELECT * from flea_auction_pm WHERE user=? AND show_to_destination=1 ORDER BY datemade DESC", userId, function(err, rows, fields){
        // function here with the inbox messages
        if(err) {
            return next(err);
        }
        if(rows && rows.length != 0) {
            data.statusmsg = 'Sweet, got the PMs from the db!';
            data.messages = rows;
            res.json(data);
        } else if(rows && rows.length == 0) {
            res.send('you have no messages!');
        }
        else {
            return next(new Error("Got bogus response back from DB when querying flea_auction_pm for the inbox"));
        }
    });
    //res.send('I think this is an error and private messages were not retrieved most likely.');
});

/**
 * GET - get a single private message
 * Params will dictate what messages to return.  Details TBD
 * @param {int} userid
 */
app.get('/getSingleMessage', function(req, res, next) {
    var data = {
        statusmsg: '',
        message: {}
    };
    //var mySqlData = [userid,msgid];
    // get userId from query string
    var userId = req.query.userid;
    var msgId = req.query.msgid;
    connection.query("SELECT * from flea_auction_pm WHERE user=? AND show_to_destination=1 AND id=? ORDER BY datemade DESC", [userId, msgId], function(err, rows, fields){
        // function here with the inbox messages
        if(err) {
            return next(err);
        }
        if(rows && rows.length === 1) {
            data.statusmsg = 'sweet, got the single message loaded';
            data.message = rows[0];
            res.json(data);
        } else if(rows && rows.length == 0) {
            res.send("can't find this private message in the db. Either deleted, or user doesn't own it, or an invalid msgid.");
        }
        else {
            return next(new Error("Got bogus response back from DB when querying flea_auction_pm for a single message"));
        }
    });
});


/**
 * GET - Get Sent Messages.
 * Params will dictate what messages to return.  Details TBD
 */
app.get('/sentMessages', function(req, res, next) {
    // Connect to the DB and make the query to get the messages
    var data = {

    };

    /**
     * These are the params, TBD
     * @type {string}
     */
    var mySqlData = '';
    connection.query('SELECT * from flea_messages WHERE sender=? limt 10 order by message_time', mySqlData, function(){
        // function here with the sent messages
    });
    res.send('Will need to send some messages at some point');
});

/**
 * GET - Get My Purchases.
 * Params will dictate what messages to return.  Details TBD
 */
app.get('/myPurchases', function(req, res, next) {
    // Connect to the DB and make the query to get the messages
    var data = {

    };

    /**
     * These are the params, TBD
     * @type {string}
     */
    var mySqlData = '';
    connection.query('SELECT * from flea_my_purchases WHERE recipient=? limt 10 order by message_time', mySqlData, function(){
        // function here with the inbox messages
    });
    res.send('Will need to send some messages at some point');
});

/**
 * GET - Get my Sales.
 * Params will dictate what messages to return.  Details TBD
 */
app.get('/mySales', function(req, res, next) {
    // Connect to the DB and make the query to get the messages
    var data = {

    };

    /**
     * These are the params, TBD
     * @type {string}
     */
    var mySqlData = '';
    connection.query('SELECT * from flea_my_sales WHERE recipient=? limt 10 order by message_time', mySqlData, function(){
        // function here with the inbox messages
    });
    res.send('Will need to send some messages at some point');
});

/**
 * GET - Get my listings.
 * Params will dictate what messages to return.  Details TBD
 */
app.get('/myListings', function(req, res, next) {
    // Connect to the DB and make the query to get the messages
    var data = {

    };

    /**
     * These are the params, TBD
     * @type {string}
     */
    var mySqlData = '';
    connection.query('SELECT * from flea_my_listings WHERE recipient=? limt 10 order by message_time', mySqlData, function(){
        // function here with the inbox messages
    });
    res.send('Will need to send some messages at some point');
});

/**
 * GET - Get my favorites.
 * Params will dictate what messages to return.  Details TBD
 */
app.get('/myFavorites', function(req, res, next) {
    // Connect to the DB and make the query to get the messages
    var data = {

    };

    /**
     * These are the params, TBD
     * @type {string}
     */
    var mySqlData = '';
    connection.query('SELECT * from flea_my_favorites WHERE recipient=? limt 10 order by message_time', mySqlData, function(){
        // function here with the inbox messages
    });
    res.send('Will need to send some messages at some point');
});

/**
 * GET - Get my offers.
 * Params will dictate what messages to return.  Details TBD
 */
app.get('/myOffers', function(req, res, next) {
    // Connect to the DB and make the query to get the messages
    var data = {

    };

    /**
     * These are the params, TBD
     * @type {string}
     */
    var mySqlData = '';
    connection.query('SELECT * from flea_my_offers WHERE recipient=? limt 10 order by message_time', mySqlData, function(){
        // function here with the inbox messages
    });
    res.send('Will need to send some messages at some point');
});


/**
 * GET - Get my ReceivedOffers.
 * Params will dictate what messages to return.  Details TBD
 */
app.get('/myReceivedOffers', function(req, res, next) {
    // Connect to the DB and make the query to get the messages
    var data = {

    };

    /**
     * These are the params, TBD
     * @type {string}
     */
    var mySqlData = '';
    connection.query('SELECT * from flea_received_offers WHERE recipient=? limt 10 order by message_time', mySqlData, function(){
        // function here with the inbox messages
    });
    res.send('Will need to send some messages at some point');
});

/**
 * GET - Get my feedback.
 * Params will dictate what messages to return.  Details TBD
 */
app.get('/myFeedback', function(req, res, next) {
    // Connect to the DB and make the query to get the messages
    var data = {

    };

    /**
     * These are the params, TBD
     * @type {string}
     */
    var mySqlData = '';
    connection.query('SELECT * from flea_my_feedback WHERE recipient=? limt 10 order by message_time', mySqlData, function(){
        // function here with the inbox messages
    });
    res.send('Will need to send some messages at some point');
});

//app.use(function(err, req, res, next) {
/*    if (res.headersSent) {
        return next(err);
    }*/
    //console.error('you goofy bastad');
    //res.status(500).send('something broke!');
    //res.status(err.status || 500);
    //res.send('hey');

//});

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

/**
 * My global Error Handling
 * Prints out name and message of error.
 */
app.use(function(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    console.error('Error Name:' + err.name + '\nError message: ' + err.message);
    res.status(500);
    res.send('Database Service Layer had a problem.');
});


app.listen(3000, function () {
    console.log('Flea MySql Web Service layer is up on port 3000.   ');
});