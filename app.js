var simplesmtp = require("simplesmtp"),
    fs = require("fs"),
    crypto = require("crypto"),
    MailParser = require("mailparser").MailParser,
    mailparser = new MailParser(),
    request = require('request'),
    express = require('express'),
    app = express(),
    smtpPort = 25,
    http = require('http'),
    config = require('./config');

/***

SMTP SERVER

***/

var options = {
	name: "oatmail.io",
	debug: true
};

var smtp = simplesmtp.createServer();
smtp.listen(smtpPort);

//email starts being recieved
smtp.on("startData", function(connection){
    var oatmailid = crypto.createHash('sha1')
        .update(connection.to + connection.from + Date.now() + Math.random() )
        .digest('hex');
    connection.saveStream = fs.createWriteStream("/tmp/" + oatmailid);

    //add the file name to the headers so we can delete it later
    connection.saveStream.write("oatmailid: " + oatmailid + "\n");
});

//start saving it
smtp.on("data", function(connection, chunk){
    connection.saveStream.write(chunk);    
});

//once email is saved, send it for parsing 
smtp.on("dataReady", function(connection, callback){
    var path = connection.saveStream.path;
    connection.saveStream.end();

    //parse with mailparser
    fs.createReadStream(path).pipe(mailparser);
    
    //close the connection, with oatmailid as the queue id
    callback(null, "qID");

});


//once email is parsed, ship it off to oatmail
mailparser.on("end", function(mail_object){ 
    console.log("Email recieved and parsed with Subject:", mail_object.subject);
    sendToOatmail(mail_object);
});


var sendToOatmail = function(mail_object) {
    var reqOptions = {
        url: 'https://oatmail.io/api/recieve',
        method: "POST",     
        body: mail_object,
        json: true,
        strictSSL: true
    }

    request(reqOptions, function(error, response, body) {
        if(!error && response.statusCode == 200) {
           deleteTmpEmail(mail_object.headers.oatmailid);
           console.log("Sent email to oatmail app, success! Code: " + response.statusCode + ". Deleting the email from /tmp/");            
        } else {
           console.log("Error sending email to oatmail app, need some kind of logic to keep trying? " + response);
        }
    });
}

//function to remove emails from the /tmp/ folder after they're sent
deleteTmpEmail = function(oatmailid) {
    fs.unlink('/tmp/' + oatmailid);
}


/***

Nodemailer (sending emails)

***/


app.set('port', process.env.PORT || 3000);
app.use(express.json());
app.use(express.urlencoded());

//http endpoint
app.post('/smtp/send', function(req, res){
    var email = req.body.email;

    var mailGunCreds = config.mailGun();  
    var api_key = mailGunCreds.api_key;
    var domain = mailGunCreds.domain;

 
    var mailgun = require('mailgun-js')(api_key, domain);
  
    mailgun.messages.send(email, function (error, response, body) {
      if(error) {
        console.log(error);
      } else {
        console.log(response.statusCode);
        return response.statusCode;
      }
    });

});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Mailer listening on port ' + app.get('port'));
});