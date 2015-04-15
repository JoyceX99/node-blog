exports.valid = function(title, contents) {
	console.log(contents);
	return (title.trim() && contents.trim());
};

exports.getPostDate = function() {
	var d = new Date();
	var months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var month = months[d.getMonth()];
	var em = (d.getHours() < 12) ? "AM":"PM";
	var hour = d.getHours() % 12 || 12;
	var min = (d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes();
	return month+" "+d.getDate()+", "+d.getFullYear() + " at " + hour+":"+min+" "+em;
};