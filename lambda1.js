const AWS = require('aws-sdk');
const kinesis = new AWS.Kinesis({
  region: 'REGION'
});

exports.handler = (event, context, callback) => {
  console.log('LOADING handler');

  const done = (err, res) => callback(null, {
    statusCode: err ? '400' : '200',
    body: err || res,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const params = {
    StreamName: 'STREAM_NAME',
  };

  kinesis.describeStream(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else {
      //Make sure stream is able to take new writes (ACTIVE or UPDATING are good)
      if(data.StreamDescription.StreamStatus === kinesisConstant.STATE.ACTIVE
        || data.StreamDescription.StreamStatus === kinesisConstant.STATE.UPDATING ) {
        // SAVE
        if (typeof payload !== kinesisConstant.PAYLOAD_TYPE) {
          try {
            payload = JSON.stringify(payload);
          } catch (e) {
            console.log(e);
          }
        }

        let params = {
          Data: payload,
          PartitionKey: kinesisConstant.PARTITION_KEY,
          StreamName: kinesisConstant.STREAM_NAME
        };

        kinesis.putRecord(params, function(err, data) {
          if (err) console.log(err, err.stack);
          else     console.log('Record added:',data);
        });

      } else {
        console.log(`Kinesis stream ${kinesisConstant.STREAM_NAME} is ${data.StreamDescription.StreamStatus}.`);
        console.log(`Record Lost`, JSON.parse(payload));
      }
    }
  });

  done(null, event);
}