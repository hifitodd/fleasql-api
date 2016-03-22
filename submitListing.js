var express = require('express');
var router = express.Router();

// define the home page route
/*router.get('/', function(req, res) {
    res.send('Birds home page');
});
// define the about route
router.get('/about', function(req, res) {
    res.send('About birds');
});*/

router.post('/', function(req, res, next) {
    // So listingData here is an object with all the fields
    var listingData = req.body;

    // error flag and data variable for books
    var data = {
        error: 1,
        statusmsg: '',
        highestId: null
    };

    // test data
    var postId = 5;

    if(listingData) {
        pool.getConnection(function(err, poolConnection) {
            // connected! (unless `err` is set)
            if(err) {
                return next(err);
            }

            // so first step is to get the highest listing ID
            poolConnection.query("SELECT MAX(ID) AS ID FROM flea_posts", function (err, rows) {
                if(err) {
                    next(err);
                } else {
                    data.highestId = rows[0].ID;

                    // this is just a test query for now.  here is where I put the DB queries
                    poolConnection.query("SELECT * FROM flea_posts WHERE ID=?",[data.highestId], function (err, rows) {
                        if(err) {
                            next(err);
                        } else {
                            data.thisRow = rows[0];
                        }
                    });
                    poolConnection.release();
                    res.send('blah');
                }
            });

            /*         poolConnection.query("INSERT into flea_posts values ('',?)",[postId], function (err, rows, fields) {
             if(err) {
             data.statusmsg = 'error writing to flea_posts';
             }
             else {
             data.statusmsg = 'wrote to flea_posts successfully';
             }
             });
             poolConnection.query("INSERT into flea_postmeta values ('',?)",[postId], function (err, rows, fields) {
             if(err) {
             data.statusmsg = 'error writing to flea_posts';
             }
             else {
             data.statusmsg = 'wrote to flea_posts successfully';
             }
             });
             poolConnection.query("INSERT into flea_term_relationships values ('',?)",[postId], function (err, rows, fields) {
             if(err) {
             data.statusmsg = 'error writing to flea_posts';
             }
             else {
             data.statusmsg = 'wrote to flea_posts successfully';
             }
             });*/

        });

        /* connection.query("insert into book values('',?,?,?)",[Bookname, Authorname, Price], function (err, rows, fields) {
         if(err) {
         data.Books = "Error adding data";
         }
         else {
         data.error = 0;
         data.Books = "Book added successfully.";
         }
         res.json(data);
         });*/
        //res.json(listingData);
    }
    else {
        /*data.Books = 'Please provide all required data!  Bookname, Authorname and Price.';
         res.json(data);*/
        res.send('did not get listing data!');
    }
});

/*router.post('/', function (req, res, next) {
    
    if(err) {
        return next(err);
    }
});*/
module.exports = router;