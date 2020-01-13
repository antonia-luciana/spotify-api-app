let express = require("express");
let request = require("request");
let querystring = require("querystring");

let app = express();

const REDIRECT_URI = "http://localhost:8888/callback";
const SPOTIFY_CLIENT_ID = "2037c012d6a6401fb338b43ade821da8";
const SPOTIFY_CLIENT_SECRET = "11d12c179cee4ffa8d3e0fe953ec1afb";
const SPOTIFY_SCOPES = [
  "user-read-private",
  "user-read-email",
  "playlist-modify-public",
  "playlist-modify-private"
];

let redirect_uri = encodeURI("http://localhost:8888/callback");

app.use(function(request, response, next) {
  response.header("Access-Control-Allow-Origin", "http://localhost:3000");
  response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.header('Access-Control-Allow-Headers', 'Origin, Content-Type ,X-CSRF-TOKEN');
  next();
});

app.get("/login", function(req, res) {
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: SPOTIFY_CLIENT_ID,
        scope: SPOTIFY_SCOPES.join(" "),
        redirect_uri
      })
  );
});

//app.use(express.urlencoded());
app.use(express.json());

app.post("/user", function(req, res) {
  const access_token = req.body.access_token
  console.log("aaa", access_token );
  request.get(
    {
      url: "https://api.spotify.com/v1/me",
      headers: {
        "Authorization": `Bearer ${access_token}`
      },
      json: true
    },
    function(error, response, body) {
      //console.log(response);
      console.log(body, response.statusCode, response.body);
      console.log("error", error);
      if(response.statusCode === 200 ) {
        res.end(JSON.stringify({ user: body }));
      } else {
        res.end(JSON.stringify({ user: error }));
      }
    }
  );
  //res.end(JSON.stringify({ user: response }));
  
});

app.get("/callback", function(req, res) {
  let code = req.query.code || null;
  let authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri,
      grant_type: "authorization_code"
    },
    headers: {
      Authorization:
        "Basic " +
        new Buffer.from(
          SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET
        ).toString("base64")
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    console.log(body);
    var access_token = body.access_token;
    let uri = "http://localhost:3000";
    console.log("acces token: ", access_token);
    request.get(
      {
        url: "https://accounts.spotify.com/v1/me",
        headers: {
          Authorization:
            "Bearer BQAd3plwGXsWnnd6H2h5WqMYQfZJFzapt7TOWMGSOcsD8w87GH3TBPaZjLkBtVTZABfmFW2-pXTOqTInwE4Ept34HatdP4GXFlAPqZybVbzUV_Qe7LQAcM3rPA0Si6XmPNnT5YB8LrfZnd1e8KrQ98VOFnzfGx8hvQ6fOxwIIUjpzL5O27njPiLDEeMF-hjHuOobm9bz1602YmGI8zqCAaUkXp1yz8CEPI1TG7kNTa5u"
        }
      },
      function(error, response, body) {
        //console.log(response);
        console.log(body);
        console.log(error);
      }
    );
    res.redirect(uri + "?access_token=" + access_token);
  });
});

let port = 8888;
console.log(
  `Listening on port ${port}. Go /login to initiate authentication flow.`
);
app.listen(port);
