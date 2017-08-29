const AWS = require("aws-sdk");
const kinesis = new AWS.Kinesis({
  region: "us-east-1"
});

const KINESIS_STREAM_NAME = "Kinesis-1";
const PARTITION_KEY = "1";

exports.handler = (event, context, callback) => {
  kinesis.describeStream({StreamName: KINESIS_STREAM_NAME}, function(err, streamInfo) {
    if (err) console.log(err);
    else {
      if(streamInfo.StreamDescription.StreamStatus === "ACTIVE" || streamInfo.StreamDescription.StreamStatus === "UPDATING" ) {
        let payload = JSON.stringify(event);

        console.log(payload);

        const params = {
          Data: payload,
          PartitionKey: PARTITION_KEY,
          StreamName: KINESIS_STREAM_NAME
        };

        kinesis.putRecord(params, function(err, data) {
          if (err) console.log(err);
          else     console.log("Record added:", data);
        });
      } else {
        console.log(`Kinesis stream ${KINESIS_STREAM_NAME} is ${streamInfo.StreamDescription.StreamStatus}.`);
        console.log(`Record Lost`, event);
      }
    }
  });

  callback(null, {
    statusCode: "200",
    body: "Response test data",
    headers: {
      "Content-Type": "application/json"
    },
  });
};