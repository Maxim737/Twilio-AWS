const AWS = require("aws-sdk");
const twilio = require("twilio");
const kinesis = new AWS.Kinesis({
  region: process.env.KINESIS_STREAM_REGION
});

exports.handler = (event, context, callback) => {
  const url = `https://${event.headers.Host}${event.requestContext.path}`;
  const twilioSignature = event.headers["X-Twilio-Signature"];

  let params = {};
  let pairs = event.body.split("&");
  pairs.forEach((pair) => {
    pair = pair.split("=");
    params[pair[0]] = decodeURIComponent(pair[1] || '');
  });

  // Validating that the request came directly from Twilio
  if (twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN, twilioSignature, url, params)) {
    // Checking for the Kinesis Stream availability
    kinesis.describeStream({StreamName: process.env.KINESIS_STREAM_NAME}, function(err, streamInfo) {
      if (err) console.log(err);
      else {
        if(streamInfo.StreamDescription.StreamStatus === "ACTIVE" || streamInfo.StreamDescription.StreamStatus === "UPDATING" ) {
          let payload = event.body;

          console.log(payload);

          const params = {
            Data: payload,
            PartitionKey: process.env.PARTITION_KEY,
            StreamName: process.env.KINESIS_STREAM_NAME
          };

          kinesis.putRecord(params, function(err, data) {
            if (err) console.log(err);
            else     console.log("Record added:", data);
          });
        } else {
          console.log(`Kinesis stream ${process.env.KINESIS_STREAM_NAME} is ${streamInfo.StreamDescription.StreamStatus}.`);
          console.log(`Record Lost`, event.body);
        }
      }
    });

    callback(null, { statusCode: "200" });
  } else {
    callback(null, { statusCode: "401" });
  }
};