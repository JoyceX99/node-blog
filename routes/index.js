var express = require('express');
var router = express.Router();
var flash = require('express-flash');
var session = require('express-session');
var cookieParser = require('cookie-parser');

router.use(cookieParser('secret'));
router.use(session({key: "key", secret: "secret", cookie: { maxAge: 60000 }}));
router.use(flash());

var insession; 

router.use(function(req, res, next) {
	var sess = req.session;
	if (sess.user) {
		//req.flash('info', 'In a session');
		insession = true;
	} else {
		insession = false;
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
			sidebar: true,
			loggedin: insession});
	});
});

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
router.get('/logout', function(req, res) {
	req.session.destroy(function(err) {
		if (err)
			return res.send(err);	
		res.redirect('/');
	});
});

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
		res.render('post', { title: result.title, post: result, sidebar: true});
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
		
	if (valid(postTitle, postContents)) {
		var postDate = getPostDate();
		blogPosts.findOne({
			$query: {},
			$orderby: {id: -1}
		}, function(err, docs) {
			var lastId = docs.id;
			blogPosts.insert({
				"id" : lastId+1,
				"title" : postTitle,
				"date" : postDate,
				"contents" : postContents
			}, function(err, doc) {
			if (err) {
				return res.render('error', {
					message: 'There was an error adding to the database',
					error: err
				});
			}
		  res.redirect('/');
		  });
		});
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
		res.render('edit-post', {post: docs});
	});
});

/* POST updated entry */
router.post('/updatepost/:id', function(req, res) {
	
	var postId = +req.params.id;
	var newTitle = req.body.title;
	var newContents = req.body.contents;
	var blogPosts = req.db.collection('blog');
		
	if (valid(newTitle, newContents)) {
		var newDate = getPostDate();
		
		blogPosts.update(
			{'id': postId},
			{ $set:
				{
					"title": newTitle,
					"date": newDate,
					"contents": newContents,
					"updated": true
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

function valid(title, contents) {
	console.log(contents);
	return (title.trim() && contents.trim());
}

function getPostDate() {
	var d = new Date();
	var months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var month = months[d.getMonth()];
	var em = (d.getHours() < 12) ? "AM":"PM";
	var hour = d.getHours() % 12 || 12;
	var min = (d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes();
	return month+" "+d.getDate()+", "+d.getFullYear() + " at " + hour+":"+min+" "+em;
}


module.exports = router;
