To get this running, treat it like a standard node app:

````
npm install
````
````
node app.js
````

The mail server we use is simplesmtp.

We then use mailparser to parse the mail into the correct format and send it over to the Oatmail server for storing on tent.

You will need to complete additional smtp server setup to get this working properly on your server.