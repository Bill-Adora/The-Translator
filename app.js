var express = require('express');
var app = express();
var server = require('http').createServer(app); 
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv();
var watson = require('watson-developer-cloud');
var language_translation = watson.language_translation({
  username: '5445ae19-f84b-4957-ba70-5c23b64be13f',
  password: 'D8woXuHqnnxT',
  version: 'v2'
});

app.use(express.static(__dirname + '/bower_components'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

/*app.get('/', function(req, res){
    res.sendFile(__dirname + '/public');
});*/

var inputText = '';
io.on('connection', function(client) {  
    console.log('Client connected...');

    client.on('input', function(data) {
        console.log(data);
        inputText = data;
        translator(function(translatedText){
            client.emit('translated', translatedText);
        });
    });

});

function translator (callback){
    language_translation.translate({
        text: inputText,
        source: 'en',
        target: 'fr'
    }, function(err, translation) {
        if (err){
            console.log(err);
        } else {
             var str = JSON.stringify(translation.translations[0].translation, null, 2);
             str = str.replace(/"/g, "");
             callback(str);
        }    
    });
}

// start server on the specified port and binding host
server.listen(appEnv.port, '0.0.0.0', function() {
  console.log("server starting on " + appEnv.url);
});
