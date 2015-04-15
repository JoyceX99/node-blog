$(document).ready(function() {
	setHeights();
	hoverNavBar();
	displayComments($('#btnPostComment').data('id'));
	
	$('#btnPostComment').on('click', postComment);
});


function hoverNavBar() {
	$('.navlink').mouseenter(function() {
		$(this).addClass('outlined');
	});
	$('.navlink').mouseleave(function() {
		$(this).removeClass('outlined');
	});
	$('.navlink').click(function() {
		window.location = $(this).find('a').attr('href');
		return false;
	});
	
}

function setHeights() {
	//$('.header').height($(window).height());
	$('.blogspace').height($(document).height() - $('.header').outerHeight(true) - $('.customnav').outerHeight(true));
	$('.sidebar').height($('.blogspace').height());
};


function displayComments(id) {
	$.getJSON('/comments/'+id, function(data) {
		$('.comments').empty();
		$.each(data, function(key, value) {
			//alert("Name: " + this.name + ", Email: " + this.email + ", Comment: " + this.comment);
			var $hi = '';
			$hi += '<div class="comment-holder">';
			$hi += '<p><b><a href="mailto:' + this.email + '">' + this.name + '</a></b><span class="time-holder">' + getTimeApproximation(this.time) + '</span></p>';
			//$hi += '<p><b><a href="mailto:' + this.email + '">' + this.name + '</a></b> says: </p>';
			$hi += '<br>';
			$hi += '<p class="save-whitespace">' + this.comment + '</p>';
			$hi += '</div>';
			$('.comments').append($hi);
			//if (this.testVar) 
			//	alert(this.name + " " + typeof(+this.testVar));
		});
		setHeights();
	});
};

function postComment(event) {
	event.preventDefault();
	
	//check to make sure all fields filled in
	//TODO: email validation
	var blanks = 0;
	
	$('#postComment input').each(function(index, value) {
		if ($(this).val() === '') {
			blanks++
		}
	})
	
	var testVar = 1; 
	
	if (blanks===0) {
		var time = getTime();
		var comment = {
			'postId': $('#btnPostComment').data('id'), 
			'name': $('#postComment fieldset input#name').val(),
			'email': $('#postComment fieldset input#email').val(),
			'comment': $('#postComment fieldset textarea#comment').val(),
			'time': time
		};
		
		$.ajax({
			type: 'POST',
			data: comment,
			url: '/addcomment', 
			dataType: 'JSON'
		}).done(function(response) {
			
			//clear inputs
			$('#postComment fieldset input').val('');
			$('#postComment fieldset textarea').val('');
			
			//update comment section
			displayComments($('#btnPostComment').data('id'));
			
		});
	} else {
		alert("Please fill in all required fields");
		return false;
	}
};

function getTime() {
	var d = new Date();
	return d.getTime(); //number of milliseconds since Jan 1, 1970
}

function getTimeApproximation(postTime) { //postTime = milliseconds ellapsed when comment posted
	var date = new Date();
	var timeEllapsed = date.getTime() - postTime;

	var secondsAgo = Math.floor(timeEllapsed/1000);
	var minutesAgo = Math.floor(timeEllapsed/60000);
	var hoursAgo = Math.floor(minutesAgo/60);
	var daysAgo = Math.floor(hoursAgo/24);
	var monthsAgo = Math.floor(daysAgo/30);
	var yearsAgo = Math.floor(monthsAgo/12);

	//Just posted?
	if (secondsAgo <= 20) 
		return "Just now";
	
	//minutes ago
	if (minutesAgo < 60) { //get in minutes
		if (minutesAgo <= 1) //minute ago
			return "a minute ago";
		return "" + minutesAgo + " minutes ago";
	}
	//hours ago
	else if (hoursAgo < 24) { //get in hours
		if (hoursAgo <= 1)
			return "an hour ago";
		return "" + hoursAgo + " hours ago";
	}
	//days ago
	else if (daysAgo < 30) {
		if (daysAgo <= 1) 
			return "a day ago";
		return "" + daysAgo + " days ago";
	}
	//months ago
	else if (monthsAgo < 12) {
		if (monthsAgo <= 1)
			return "a month ago";
		return "" + monthsAgo + " months ago";
	}
	//years ago
	else {
		if (yearsAgo <= 1)
			return "a year ago";
		return "" + yearsAgo + " years ago";
	}
}


