var simplesmtp = require("simplesmtp"),
    fs = require("fs"),
    crypto = require("crypto"),
    MailParser = require("mailparser").MailParser,
    mailparser = new MailParser(),
    request = require('request'),
    express = require('express'),
    app = express(),
    smtpPort = 2525,
    http = require('http');

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
	console.log("Message from:", connection.from);
    console.log("Message to:", connection.to);
    connection.messageId = crypto.createHash('sha1')
        .update(connection.to + connection.from + Date.now() + Math.random() )
        .digest('hex');
    connection.saveStream = fs.createWriteStream("/tmp/" + connection.messageId);
});

//start saving it
smtp.on("data", function(connection, chunk){
    connection.saveStream.write(chunk);    
});

//once email is saved, parse it
smtp.on("dataReady", function(connection, callback){
    connection.saveStream.end();
    console.log("Message received and stored at /tmp/" + connection.messageId);

    //parse with mailparser
    fs.createReadStream("/tmp/" + connection.messageId ).pipe(mailparser);
    
    //close the connection, with messageid as the queue id
    callback(null, connection.messageId);    

});

//once email is parsed, ship it off to oatmail
mailparser.on("end", function(mail_object){    
    console.log("Email parsed with Subject:", mail_object.subject);
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

    request(reqOptions, function(error, incomingMessage, response) {
        if(error) {
            console.log("Error sending email to oatmail: " + response.statusCode)
        } else {
           console.log("Response storing email from the app: " + response);
        }
    });
}

/***

Nodemailer (sending emails)

***/

var nodemailer = require("nodemailer");

var transport = nodemailer.createTransport("SMTP", { 
    secureConnection: true, // use SSL
    port: 1465, // port for secure SMTP
});

app.set('port', process.env.PORT || 3000);
app.use(express.json());
app.use(express.urlencoded());

//http endpoint
app.post('/smtp/send', function(req, res){
    //var email = req.body.email;
    var email =  { 
        from: "Fred Foo ✔ <foo@blurdybloop.com>", // sender address
        to: "bar@blurdybloop.com, baz@blurdybloop.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world ✔", // plaintext body
        html: "<b>Hello world ✔</b>" // html body 
    };

    transport.sendMail(email, function(error, responseStatus) {
        if(error){
            console.log("sending email, " + error); // response from the server
        } else {
            console.log("sent message from: " + email.from);
        }
    });

});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Mailer listening on port ' + app.get('port'));
});