var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 8080;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

// Routes

// A GET route for scraping the echoJS website

app.get("/scrape", function(req, res) {
console.log("I'm scraping okay!")
  // here empty
  // First, we grab the body of the html with axios
  axios.get("https://www.technewsworld.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("div.story-list").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(element)
        .children("div.title")
        .text();
      result.summary = $(element)
        .children("div.teaser")
        .text();
      result.link = $(element)
        .children("div.image")
        .children()
        .attr("href");
      result.img = $(element)
        .children("div.image")
        .children()
        .children()
        .attr("src");
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          res.render("index", {dbArticle: result})
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    console.log(result)
    res.send("Scrape Complete");
  });
});

app.get("/", function (req, res) {
  db.Article.find({ "saved": false }, function (error, data) {
      var hbsObject = {
          article: data
      };
      console.log(hbsObject);
      res.render("index", hbsObject);
  });
});

app.get("/saved", function (req, res) {
  db.Article.find({ "saved": true }).populate("notes").exec(function (error, articles) {
      var hbsObject = {
          article: articles
      };
      res.render("saved", hbsObject);
  });
});

app.get('/clear', function(req, res) {
  db.Article.remove({ saved: false}, function(err, doc) {
      if (err) {
          console.log(err);
      } else {
          console.log('removed');
      }

  });
  res.redirect('/');
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
      res.render("index", hbsObject)
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
// app.post("/articles/:id", function(req, res) {
//   // Create a new note and pass the req.body to the entry
//   db.Note.create(req.body)
//     .then(function(dbNote) {
//       // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
//       // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
//       // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
//       return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
//     })
//     .then(function(dbArticle) {
//       // If we were able to successfully update an Article, send it back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

app.post("/articles/save/:id", function (req, res) {
  // Use the article id to find and update its saved boolean
  db.Article.findOneAndUpdate({ _id: req.params.id }, { "saved": true })
      // Execute the above query
      .exec(function (err, data) {
          // Log any errors
          if (err) {
              console.log(err);
          }
          else {

              res.send(data);
          }
      });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
