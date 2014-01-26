To get this running, treat it like a standard node app (install deps and run):

````
npm install
````
````
node app.js
````

For incoming mail we use simplesmtp.

We then use mailparser to parse the mail into the correct format and send it over to the Oatmail server for storing on tent.

For outgoing mail we use Mailgun.

You'll need to fill in your own account details/domain for mailgun in the dummy config file (rename to config.js to get it working).