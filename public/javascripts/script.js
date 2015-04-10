$(document).ready(function() {
	setHeights();
	hoverNavBar();
	
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
	$('.blogspace').height($(document).height() - $('.header').height() - $('.customnav').height());
	$('.sidebar').height($('.blogspace').height());
}

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
	
	if (blanks===0) {
		var comment = {
			'name': $('#postComment fieldset input#name').val(),
			'email': $('#postComment fieldset input#email').val(),
			'comment': $('#postComment fieldset textarea#comment').val()
		};
		
		$.ajax({
			type: 'POST',
			data: comment,
			url: '/addcomment/' + $('#btnPostComment').data('id'), 
			dataType: 'JSON'
		}).done(function(response) {
			alert(response);
		});
	} else {
		alert("Please fill in all required fields");
		return false;
	}
}

