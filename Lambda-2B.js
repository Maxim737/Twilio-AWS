const AWS = require('aws-sdk');
const firehose = new AWS.Firehose({
  region: "us-east-1"
});
let reqCount = 0;

exports.handler = function(event, context) {
  reqCount = event.Records.length;

  firehose.describeDeliveryStream({DeliveryStreamName: process.env.FIREHOSE_STREAM_NAME}, function(err, streamInfo) {
    if (err) {
      console.log(err);
      context.fail();
    }
    else {
      console.log(streamInfo.DeliveryStreamDescription.Destinations);
      console.log(streamInfo.DeliveryStreamDescription.Destinations[0].RedshiftDestinationDescription.CopyCommand);
      console.log(streamInfo.DeliveryStreamDescription.Destinations[0].RedshiftDestinationDescription.S3DestinationDescription);
      console.log(streamInfo.DeliveryStreamDescription.Destinations[0].RedshiftDestinationDescription.ProcessingConfiguration);
      console.log(streamInfo.DeliveryStreamDescription.Destinations[0].RedshiftDestinationDescription.CloudWatchLoggingOptions);

      if(streamInfo.DeliveryStreamDescription.DeliveryStreamStatus === "ACTIVE" || streamInfo.DeliveryStreamDescription.DeliveryStreamStatus === "UPDATING" ) {
        for (let i = 0; i < event.Records.length; i += Number(process.env.RECORDS_LIMIT_PER_BATCH)) {
          let batch = event.Records.slice(i, i + Number(process.env.RECORDS_LIMIT_PER_BATCH));

          let records = [];
          batch.forEach(function(record) {
            record = Buffer.from(record.kinesis.data, 'base64').toString();

            let recordData = {};
            let pairs = record.split("&");
            pairs.forEach((pair) => {
              pair = pair.split("=");
              recordData[pair[0]] = pair[1] || '';
            });
            recordData = JSON.stringify(recordData);
            console.log(recordData);

            records.push({ Data: recordData });
          });

          let params = {
            DeliveryStreamName: process.env.FIREHOSE_STREAM_NAME,
            Records: records
          };

          firehose.putRecordBatch(params, function(err, data) {
            if (err) console.log(err);
            else     console.log(data);
          });
        }
      }
    }
  });
};