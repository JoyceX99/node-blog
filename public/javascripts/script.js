$(document).ready(function() {
	setHeights();
	
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
	
	/** Set up Summernote **/
	$('#summernote').summernote({
		height: 300
	});
});

function matchHeights() {
	var leftHeight = $('.blogspace').height();
	var rightHeight = $('.sidebar').height();
	if (leftHeight > rightHeight) {
		$('.sidebar').height(leftHeight);
	} else {
		$('.blogspace').height(rightHeight);
	}
};

function setHeights() {
	//$('.header').height($(window).height());
	$('.blogspace').height($(document).height() - $('.header').height() - $('.customnav').height());
	$('.sidebar').height($('.blogspace').height());
}

