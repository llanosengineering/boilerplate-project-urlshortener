require("dotenv").config();
const express = require("express");
const dns = require("dns");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

let mockDB = {}; // Store short urls
let shortUrl = 1; // Generate new shorturls
app
  .use(bodyParser.urlencoded({ extended: false }))
  .post("/api/shorturl", (req, res, next) => {
    // Validate url is https or http
    const originalUrl = new URL(req.body.url);

    // DNS lookup to validate hostname
    dns.lookup(originalUrl.hostname, (err) => {
      // Error handling
      if (err) res.json({ error: "invalid url" });

      // Check if URL is already in mockDB
      for (let key in mockDB) {
        if (mockDB[key] == originalUrl.href) {
          res.json({
            original_url: mockDB[shortUrl],
            short_url: key,
          });
        }
      }

      // if URL is new...
      mockDB[shortUrl] = originalUrl.href;
      res.json({
        original_url: originalUrl.href,
        short_url: shortUrl,
      });

      // Generate new shortURL for next stored URL
      shortUrl++;
    });
  })
  .get("/api/shorturl/:short_url", (req, res) => {
    if (mockDB[req.params.short_url]) {
      res.redirect(mockDB[req.params.short_url]);
    } else {
      res.json({
        error: "invalid url",
      });
    }
  });

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
