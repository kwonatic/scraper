var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs  = require('express-handlebars');
var db = require("./models")

var PORT = 3000

var app = express();


app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
// app.use(express.static("public"));

mongoose.connect("mongodb://localhost/scraper", { useNewUrlParser: true });


app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://news.ycombinator.com/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $(".athing").each(function (i, element) {
            // Save an empty result object
            var result = {};
            // console.log(element)
            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children(".title")
                .children("a")
                .text();
            result.link = $(this)
                .children(".title")
                .children("a")
                .attr("href");
            console.log(result)
            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
              .then(function(dbArticle) {
                // View the added result in the console
                console.log(dbArticle);
              })
              .catch(function(err) {
                // If an error occurred, log it
                console.log(err);
              });
        });

        // Send a message to the client
        res.render("scrape")
        // res.send("Scrape Complete");
    });
});

app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.render("home", {articles: dbArticle});
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
