var simplesmtp = require("simplesmtp"),
    fs = require("fs"),
    crypto = require("crypto"),
    MailParser = require("mailparser").MailParser,
    mailparser = new MailParser(),
    request = require('request');

var options = {
	name: "oatmail.io",
	debug: true

};

var smtp = simplesmtp.createServer();
smtp.listen(2525);


smtp.on("startData", function(connection){
	console.log("Message from:", connection.from);
    console.log("Message to:", connection.to);
    connection.messageId = crypto.createHash('sha1')
        .update(connection.to + connection.from + Date.now() + Math.random() )
        .digest('hex');
    connection.saveStream = fs.createWriteStream("/tmp/" + connection.messageId);
});

smtp.on("data", function(connection, chunk){
    connection.saveStream.write(chunk);    
});

smtp.on("dataReady", function(connection, callback){
    connection.saveStream.end();
    console.log("Message received and stored at /tmp/" + connection.messageId);

    //parse with mailparser
    fs.createReadStream("/tmp/" + connection.messageId ).pipe(mailparser);
    
    //close the connection, with messageid as the queue id
    callback(null, connection.messageId);    

});

mailparser.on("end", function(mail_object){
    //delete email from server
    
    console.log("Email parsed with Subject:", mail_object.subject);
    sendToOatmail(mail_object);
});


var sendToOatmail = function(mail_object) {
    request.post("https://oatmail.io/api/recieve", mail_object);    
}