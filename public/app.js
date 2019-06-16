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
	

  // Whenever someone clicks a p tag
  $(document).on("click", ".comment", function() {
		// Empty the notes from the note section
		$("#notes").empty();
		// Save the id from the p tag
		var thisId = $(this).attr("data-id");
		
		// Now make an ajax call for the Article
		$.ajax({
			method: "GET",
			url: "/articles/" + thisId
		})
			// With that done, add the note information to the page
			.then(function(data) {
			console.log(data);
			// The title of the article
			$("#notes").append("<h2>" + data.title + "</h2>");
			// An input to enter a new title
			$("#notes").append("<input id='titleinput' placeholder='comment title' name='title'></input>");
			// A textarea to add a new note body
			$("#notes").append("<textarea id='bodyinput' placeholder='comment body' name='body'></textarea>");
			// A button to submit a new note, with the id of the article saved to it
			$("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
			$("#notes").append("<button data-id='" + data._id + "' class='deletenote'>Delete Note</button>");
		
			// If there's a note in the article
			if (data.note) {
				// Place the title of the note in the title input
				$("#titleinput").val(data.note.title);
				// Place the body of the note in the body textarea
				$("#bodyinput").val(data.note.body);
			}
			});
		});
		
		// When you click the savenote button
		$(document).on("click", "#savenote", function() {
		// Grab the id associated with the article from the submit button
		var thisId = $(this).attr("data-id");
		
		// Run a POST request to change the note, using what's entered in the inputs
		$.ajax({
			method: "POST",
			url: "/articles/" + thisId,
			data: {
			// Value taken from title input
			title: $("#titleinput").val(),
			// Value taken from note textarea
			body: $("#bodyinput").val()
			}
		})
			// With that done
			.then(function(data) {
			// Log the response
			console.log(data);
			// Empty the notes section
			$("#notes").empty();
			});
		});

		$(document).on("click", ".deletenote", function() {
			// Grab the id associated with the article from the submit button
			var thisId = $(this).attr("data-id");
			
			// Run a POST request to change the note, using what's entered in the inputs
			$.ajax({
				method: "DELETE",
				url: "/articles/" + thisId,
				data: {
				// Value taken from title input
				title: $("#titleinput").val(),
				// Value taken from note textarea
				body: $("#bodyinput").val()
				}
			})
				// With that done
				.then(function(data) {
				// Log the response
				console.log(data);
				// Empty the notes section
				$("#notes").empty();
				});
			});