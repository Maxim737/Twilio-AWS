var AWS = require('aws-sdk');
var path = require('path');

exports.handler = function(event, context) {
  console.log(JSON.stringify(event, null, '  '));
  //TODO: twilio API accepts one record or an array?
  event.Records.forEach(function(record) {
    var jsonDoc = new Buffer(record.kinesis.data, 'base64');
    postToTwilio(jsonDoc.toString(), context);
  });
}

function postToTwilio(doc, context) {
  var endpoint = {};
  var req = new AWS.HttpRequest(endpoint);

  req.method = 'POST';
  req.headers['presigned-expires'] = false;
  req.headers['Host'] = endpoint.host;
  req.body = doc;

  var send = new AWS.NodeHttpClient();
  send.handleRequest(req, null, function(httpResp) {
    var respBody = '';
    httpResp.on('data', function (chunk) {
      respBody += chunk;
    });
    httpResp.on('end', function (chunk) {
      console.log('Response: ' + respBody);
      context.succeed('Lambda added document ' + doc);
    });
  }, function(err) {
    console.log('Error: ' + err);
    context.fail('Lambda failed with error ' + err);
  });
}