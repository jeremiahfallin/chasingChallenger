const express = require("express");
const app = express();
var cors = require("cors");
const getChallenger = require("./gatherChallengerChampions.js")
const port = process.env.PORT || 4444;

var whitelist = ["http://localhost:7777"];

var corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
};

app.use(cors(corsOptions));

//console.log that server is working.
app.listen(port, () => console.log(`Listening on port ${port}`));

//create GET route.
app.get("/express_backend", (req, res) => {
  const d = new Date();
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  const currentEpoch = d.getTime();
  const fileName = "./data/challenger.json";
  const file = require(fileName);
  for (let i in file) {
    if (file[i]['LastUpdate'] < currentEpoch) {
      getChallenger();
    }
  }
  res.send({ file });
});
