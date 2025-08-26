const express = require("express");
const shortid = require("shortid");

const app = express();
app.use(express.json());

const urls = {};
app.post("/shorturls", (req, res) => {
  try {
    const { url, validity = 30, shortcode } = req.body;
    if (!url) return res.status(400).json({ error: "url is required" });
    const expiry = new Date(Date.now() + validity * 60 * 1000);
    let shortCode = shortcode || shortid.generate();
    if (urls[shortCode]) {
      return res.status(400).json({ error: "Shortcode already in use" });
    }
    urls[shortCode] = { fullUrl: url, expiry };
    res.status(201).json({
      shortLink: `http://localhost:3000/${shortCode}`,
      expiry: expiry.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/shortCode", (req, res) => {
  const { shortCode } = req.params;
  const record = urls[shortCode];
  if (!record) return res.status(404).json({ error: "Not found" });
  if (new Date() > record.expiry) {
    return res.status(410).json({ error: "Link expired" });
  }
  res.redirect(record.fullUrl);
});

app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);
