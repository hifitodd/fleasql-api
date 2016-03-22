var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var _ = require('lodash');
var bodyParser = require("body-parser");

var pool = mysql.createPool({
    connectionLimit: 1,
    host: 'localhost',
    user: 'root',
    password: 'Audiofl3a!!',
    database: 'audioflea_dev'
});
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
    var listingTitle = listingData.brand + ' - ' + listingData.model + ' - ' + listingData.subtitle + ' - ' + listingData.userId;
    var listingName = listingData.brand + '-' + listingData.model + '-' + listingData.userId;
    var data = {
        error: 1,
        statusmsg: '',
        postId: null
    };

    if(listingData) {
        pool.getConnection(function(err, poolConnection) {
            if(err) {
                return next(err);
            }
            var currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
            var postToInsert = {
                post_author: parseInt(listingData.userId),
                post_title: listingTitle,
                post_date: currentDate,
                guid: '/browse/listing/',
                post_name: listingName,
                post_status: 'publish',
                post_content: listingData.description,
                post_excerpt: listingData.subtitle,
                post_type: 'listing'
            };

            var test1;
            poolConnection.query("INSERT INTO flea_posts SET ?", postToInsert , function (err, rows, fields) {
                if(err) {
                    data.statusmsg = 'error writing to flea_posts';
                    console.log('error writing to flea_posts');
                    poolConnection.release();
                    res.json(data);
                } else {
                    //data.error = 0;
                    data.statusmsg = 'wrote to flea_posts successfully';
                    console.log('wrote to flea_posts successfully');

                    data.postId = rows.insertId;

                    var parentValues = [data.postId, listingData.parentCat];
                    var childValues = [data.postId, listingData.childCat];

                    poolConnection.query("INSERT INTO flea_term_relationships (object_id,term_taxonomy_id) VALUES(?),(?)",
                        [parentValues, childValues], function (err, rows, fields) {
                       if(err) {
                           data.statusmsg = 'error writing to flea_term_relationships';
                           console.log('error writing to flea_term_relationships');
                           poolConnection.release();
                           res.json(data);
                       } else {
                            data.statusmsg += ', and relationships';
                           console.log('wrote to flea_term_relationships successfully');

                           var allMeta = [];

                           // add global meta fields
                           allMeta.push([data.postId, 'flea_listing_brand', listingData.brand]);
                           allMeta.push([data.postId, 'flea_model', listingData.model]);
                           if(listingData.retailPrice) {
                               allMeta.push([data.postId, 'retail_price', listingData.retailPrice]);
                           }

                           // now iterate through the category specific meta fields
                           _.forEach(listingData.catMeta, function (metaProp) {
                               allMeta.push([data.postId, metaProp.name, metaProp.value ]);
                           });
                           //var allMeta = [meta1, meta2];
                           var metaSql = "INSERT INTO flea_postmeta (post_id, meta_key, meta_value) VALUES ?";

                           poolConnection.query(metaSql, [allMeta], function () {
                                   if(err) {
                                       data.statusmsg = 'error writing to flea_meta';
                                       console.log('error writing to flea_meta');
                                       poolConnection.release();
                                       res.json(data);
                                   } else {
                                       data.statusmsg += ', and meta';
                                       data.error = 0;
                                       console.log('wrote to flea_meta successfully');
                                       poolConnection.release();
                                       res.json(data);
                                   }
                           });

                       }
                    });
                }
            });
/*                    poolConnection.query("INSERT into flea_postmeta values ('',?)",[postId], function (err, rows, fields) {
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
                


            //data.error = 0;
            //data.statusmsg = "Successully made the trip to fleasql!";
        });
    }
    else {
        data.statusmsg = "fleasql layer doesn't have the listing data";
        res.json(data);
    }
});

// error handler
router.use(function(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    console.error('Error Name:' + err.name + '\nError message: ' + err.message);
    res.status(500);
    res.send('Database Service Layer had a problem.');
});
/*router.post('/', function (req, res, next) {
    
    if(err) {
        return next(err);
    }
});*/
module.exports = router;