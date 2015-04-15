var express = require('express');
var router = express.Router();
var flash = require('express-flash');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var async = require('async');
var utilities = require('../public/javascripts/utilities.js');

router.use(cookieParser('secret'));
router.use(session({key: "key", secret: "secret", cookie: { maxAge: 60000 }}));
router.use(flash());

router.use(function(req, res, next) {
	var sess = req.session;
	if (sess.user) {
		//req.flash('info', 'In a session');
		res.locals.loggedin = true;
	} else {
		res.locals.loggedin = false;
	}
	next();
});

router.get('/flash', function(req, res) {
	req.flash('info', 'Yes, flash messages work too!');
	res.redirect('/');
});


/* GET home page. */
router.get('/', function(req, res) {
	var db = req.db;
	var blogPosts = db.collection('blog');

	blogPosts.find({ $query: {}, $orderby: { id: -1 } }).toArray(function(e, docs) {
		res.render('index', {
			title: 'Sample Blog',
			blog: docs, 
			sidebar: true});
	});
});

/******************  LOGIN/LOGOUT  ****************/

/* GET login page */
router.get('/login', function(req, res) {
	res.render('login');
});

/* POST sign in, redirect to home */
router.post('/validatelogin', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	
	var adminInfo = req.db.collection('admin');
	
	adminInfo.findOne({}, function(err, docs) {
		if (err) {
			return res.render('error', {
				message: 'There was an error validating your login',
				error: err
			});
		}
		if (docs.username === username && docs.password === password) {
			sess = req.session;
			sess.user = req.body.username;
			req.flash('success', 'Welcome back!');
			res.redirect('/');
		} else {
			req.flash('warning', 'Invalid username and password. Please try again.');
			res.render('login');
		}
	});
});

/* GET logout */
router.post('/logout', function(req, res) {
	req.session.destroy(function(err) {
		if (err)
			return res.send(err);	
		res.redirect('/');
	});
});


/******************  BLOG POSTS  ******************/
//-------possibly move all post-related queries to separate doc, use format /posts/:id/(update, submit, etc.)


/* GET blog entry */
router.get('/post/:id', function(req, res) {        
	var blogPosts = req.db.collection('blog');
	var idVal = parseInt(req.params.id);
	var query = {};
	query['id'] = idVal;
	blogPosts.find(query).toArray(function(e, results) {
		if (e) {
			return res.render('error', {
				message: 'There was an error retrieving the post',
				error: err
			});
		}
		var result = results[0];
		res.render('post', {post: result, id: idVal, sidebar: true});
	});
});

/* GET new post page */
router.get('/newpost', function(req, res) {
	res.render('new-post'); 
});

/* POST entry, redirect to home */
router.post('/submitpost', function(req, res) {
	var postTitle = req.body.title;
	var postContents = req.body.contents;
	var blogPosts = req.db.collection('blog');
	
	if (utilities.valid(postTitle, postContents)) {
		var postDate = utilities.getPostDate();
		async.waterfall([
			function(callback) {
				blogPosts.findOne({
					$query: {},
					$orderby: {id: -1}
				}, function(err, doc) {
					var lastId = doc.id;
					callback(null, lastId);
				});
			},
			function(lastId, callback) {
				blogPosts.insert({
					id : lastId+1,
					title : postTitle,
					date : postDate,
					contents : postContents
				}, function(err, doc) {
					if (err) {
						return res.render('error', {
							message: 'There was an error adding to the database',
							error: err
						});
					}
				  res.redirect('/');
				});
			}
		]);
	} else {
		req.flash('warning', 'Invalid post. Please try again.');
		res.render('new-post');
	}	
});

/* GET post in editing form */
router.get('/editpost/:id', function(req, res) {
	var blogPosts = req.db.collection('blog');
	var postId = +req.params.id;
	
	blogPosts.findOne({id: postId}, function(err, docs) {
		if (err) {
			return res.render('error', {
				message: 'There was an error editing your post',
				error: err
			});
		}
		res.render('edit-post', {
			post: docs, 
		});
	});
});

/* POST updated entry */
router.post('/updatepost/:id', function(req, res) {
	
	var postId = +req.params.id;
	var newTitle = req.body.title;
	var newContents = req.body.contents;
	var blogPosts = req.db.collection('blog');
		
	if (utilities.valid(newTitle, newContents)) {
		var newDate = utilities.getPostDate();
		
		blogPosts.update(
			{id: postId},
			{ $set:
				{
					title: newTitle,
					date: newDate,
					contents: newContents,
					updated: true
				}
			}, function(err, doc) {
				if (err) {
					return res.render('error', {
						message: 'There was an error posting your update',
						error: err
					});
				}
				res.redirect('/');
			}
		)
	} else {
		req.flash('warning', 'Invalid post. Please try again.');
		res.render('new-post');
	}
});

/* DELETE entry */
router.post('/deletepost/:id', function(req, res) {
	var postNumber = +req.params.id;
	var blogPosts = req.db.collection('blog');
	newValues = {};
	newValues['id'] = postNumber;

	blogPosts.remove(newValues, function(err, doc) {
		if (err) {
			return res.send("There was an error removing the post.");
		}
		res.redirect('/');
	});
})


/*************** USER COMMENTS *************/
router.get('/comments/:id', function(req, res) {
	var blogComments = req.db.collection('comments');
	var query = {};
	query['postId'] = req.params.id;
	
	//TODO: fix orderby id to orderby time
	blogComments.find({ $query: query, $orderby: { time: -1 }}).toArray(function(err, items) {
	//blogComments.find(query).toArray(function(err, items) {
		if (err) {
			return res.render('error', {
				message: 'There was an error fetching the comments',
				error: err
			});
		}
		res.json(items);
	});
});


router.post('/addcomment', function(req, res) {
	var blogComments = req.db.collection('comments');
	
	blogComments.insert(req.body, function(err, doc) {
		if (err) {
			return res.render('error', {
				message: 'There was an error adding your comment',
				error: err
			});
		} else {
			res.send({msg: ''+doc});
		}
	})
	/*var blogPosts = req.db.collection('blog');
	var comments = {};
	
	blogPosts.update(
		{id: +req.params.id},
		{$set: 
			{comment: req.body}
		}, function(err, doc) {
		if (err) {
			return res.render('error', {
				message: 'There was an error adding your comment',
				error: err
			});
		} else {
			blogPosts.findOne({'id': +req.params.id}, function(err, doc) {
				if (err)
					return err;
				console.log(doc);
				res.send({msg: '' + doc});
			})
		}
	});*/
});


/* GET about page */
router.get('/about', function(req, res) {
	res.render('about', {sidebar: true});
})

/* GET contact page */
router.get('/contact', function(req, res) {
	res.render('contact', {sidebar: true});
})

/* GET gallery page */
router.get('/gallery', function(req, res) {
	res.render('gallery', {sidebar: true});
})

module.exports = router;
