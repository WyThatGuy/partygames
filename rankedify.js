const request = require('request');

let adjList;

function generateWords() {
request('https://random-word-form.repl.co/random/adjective?count=5', (err, res, body) => {
  if (err) {
    console.log(err);
    return;
  }
  adjList = body.substr(1, (body.length-2)).split('"').join("").split(",")
  });
}