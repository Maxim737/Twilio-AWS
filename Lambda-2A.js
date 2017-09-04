const AWS = require('aws-sdk');
let reqCount = 0;

exports.handler = function(event, context) {
  reqCount = event.Records.length;

  event.Records.forEach(function(record) {
    let recordData = Buffer.from(record.kinesis.data, 'base64').toString();
    console.log(recordData);

    postToTwilio(recordData, context);
  });
};

function postToTwilio(data, context) {
  let req = new AWS.HttpRequest("https://d03d43f7.ngrok.io"); //Twilio endpoint here

  req.method = 'POST';
  req.body = data;

  new AWS.NodeHttpClient().handleRequest(req, null, (res) => {
    let respBody = '';

    res.on('data', function (chunk) {
      respBody += chunk;
    });

    res.on('end', function () {
      console.log('Response: ' + respBody);
      if (--reqCount === 0) context.succeed();
    });
  }, (err) => {
    console.log(err);
    context.fail('Lambda failed with error ' + err);
  });
}