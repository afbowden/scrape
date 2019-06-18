$("#refresh").on("click", function() {
	console.log("Clicked!")
	$.ajax({
			method: "GET",
			url: "/scrape",
	}).done(function(data) {
			window.location = "/"
	})
});

  $('.save').on("click", function () {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/save/" + thisId
    }).done(function(data) {
        window.location = "/"
    })
});
	
$('.delete').on("click", function () {
	var thisId = $(this).attr("data-id");
	$.ajax({
			method: "POST",
			url: "/articles/delete/" + thisId
	}).done(function(data) {
			window.location = "/saved"
	})
});

  $(document).on("click", ".comment", function() {
		$("#notes").empty();
		var thisId = $(this).attr("data-id");
		
		$.ajax({
			method: "GET",
			url: "/articles/" + thisId
		})

			.then(function(data) {
			console.log(data);
			$("#notes").append("<h2>" + data.title + "</h2>");
			$("#notes").append("<input id='titleinput' placeholder='comment title' name='title'></input>");
			$("#notes").append("<textarea id='bodyinput' placeholder='comment body' name='body'></textarea>");
			$("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
			$("#notes").append("<button data-id='" + data._id + "' class='deletenote'>Delete Note</button>");
		
			if (data.note) {
				$("#titleinput").val(data.note.title);
				$("#bodyinput").val(data.note.body);
			}
			});
		});

		$(document).on("click", "#savenote", function() {
		var thisId = $(this).attr("data-id");
		$.ajax({
			method: "POST",
			url: "/articles/" + thisId,
			data: {
			title: $("#titleinput").val(),
			body: $("#bodyinput").val()
			}
		})
			.then(function(data) {

			console.log(data);
			$("#notes").empty();
			});
		});

		$(document).on("click", ".deletenote", function() {
			var thisId = $(this).attr("data-id");
			
			$.ajax({
				method: "DELETE",
				url: "/articles/" + thisId,
				data: {
				title: $("#titleinput").val(),
				body: $("#bodyinput").val()
				}
			})
				.then(function(data) {
				console.log(data);
				$("#notes").empty();
				});
			});

