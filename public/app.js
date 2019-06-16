// Grab the articles as a json
$("#refresh").on("click", function() {
	console.log("Clicked!")
	$.ajax({
			method: "GET",
			url: "/scrape",
	}).done(function(data) {
		// console.log(data)
			window.location = "/"
	})
});

  //click event to save an article
  $('.save').on("click", function () {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/save/" + thisId
    }).done(function(data) {
        window.location = "/"
    })
});
	