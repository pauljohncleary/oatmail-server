// http://nodejs.org/api.html#_child_processes
var sys = require('sys')
var exec = require('child_process').exec;
var child;

for (var i=0;i<10;i++) {
	child = exec("swaks -h localhost -t paul@oatmail.io -f test@oatmail.io -s localhost -p 25 --attach ./test.jpeg", function (error, stdout, stderr) {
	  if (error !== null) {
	    console.log('exec error: ' + error);
	  }
	});
	console.log(i);
}
