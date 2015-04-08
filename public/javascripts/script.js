$(document).ready(function() {
	setHeights();
	hoverNavBar();
	
	$('.show-content').on('click', function() {
		$('#contents').html(tinymce.get('contents').getContent());
		//var content = tinyMCE.activeEditor.getContent();
		alert($('#contents').html());
	})
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

