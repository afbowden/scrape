var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 8080;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
  defaultLayout: "main",
  partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGODB_URI || ("mongodb://localhost/HaroldDucksAss");
mongoose.connect(MONGODB_URI);

app.get("/scrape", function (req, res) {
  console.log("I'm scraping okay!")
  axios.get("https://www.technewsworld.com/").then(function (response) {
    var $ = cheerio.load(response.data);
    $("div.story-list").each(function (i, element) {
      var result = {};

      result.title = $(element)
        .children("div.title")
        .children("a")
        .text();
      result.summary = $(element)
        .children("div.teaser")
        .text();
      result.link = $(element)
        .children("div.image")
        .children()
        .attr("href");
      if (result.link) {
        result.link = "https://www.technewsworld.com" + result.link
      }
      result.img = $(element)
        .children("div.image")
        .children()
        .children()
        .attr("src");
      if (result.img) {
        result.img = "https://www.technewsworld.com" + result.img
      }
      if (result.title) {
        db.Article.find()
          .then(function (allArticles) {
            var newArticle = true
            allArticles.forEach(function (article) {
              if (article.title === result.title) {
                newArticle = false
              }
            })
            if (newArticle) {
              db.Article.create(result)
                .then(function (dbArticle) {
                  dbArticle
                })
                .catch(function (err) {
                  console.log(err);
                });
            }
          })
      }
    });
    res.render("index", { dbArticle: result })
  });
});

app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.get("/", function (req, res) {
  db.Article.find(function (error, data) {
    var hbsObject = {
      articles: data
    };
    res.render("index", hbsObject);
  });
});

app.get("/saved", function (req, res) {
  db.Article.find({ "saved": true }).exec(function (error, data) {
    var hbsObject = {
      articles: data
    };
    res.render("saved", hbsObject);
  });
});

app.post("/articles/save/:id", function (req, res) {
  db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true })
    .exec(function (err, data) {
      if (err) {
        console.log(err);
      }
      else {
        res.send(data);
      }
    });
});

app.post("/articles/delete/:id", function (req, res) {
  db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": false })
    .exec(function (err, data) {
      if (err) {
        console.log(err);
      }
      else {
        res.send(data);
      }
    });
});

app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});


app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
