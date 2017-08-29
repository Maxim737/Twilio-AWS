const AWS = require('aws-sdk');
const firehose = new AWS.Firehose({
  region: "us-east-1a"
});

exports.handler = function(event, context) {
  const params = {
      DeliveryStreamName: '',
    Record: {
    Data: decodeURIComponent(event)
  }
};
  firehose.putRecord(params, function(err, data) {
    if (err) console.log(err);
    else     console.log(data);

    context.done();
  });
};


// var esDomain = {
//   region: 'us-east-1',
//   endpoint: 'my-domain-search-endpoint',
//   index: 'myindex',
//   doctype: 'mytype'
// };
// var endpoint = new AWS.Endpoint(esDomain.endpoint);
//
// var creds = new AWS.EnvironmentCredentials('AWS');

// var setRegion = 'REGION'; // TODO: ask which region they do prefer
//
// exports.firehose = new aws.Firehose({
//   apiVersion : '2015-08-04', // TODO: default value?
//   region : setRegion
// });
//
// exports.handler = function(event, context) {
//   console.log(JSON.stringify(event, null, '  '));
//   event.Records.forEach(function(record) {
//     var jsonDoc = new Buffer(record.kinesis.data, 'base64');
//     postToES(jsonDoc.toString(), context);
//   });
// }
//
// function writeToFirehose(firehoseBatch, streamName, deliveryStreamName, callback, retries) {
//   if (retries === undefined) {
//     retries = 0;
//   }
//
//   // write the batch to firehose with putRecordBatch
//   var putRecordBatchParams = {
//     DeliveryStreamName : deliveryStreamName.substring(0, 64),
//     Records : firehoseBatch
//   };
//
//   if (debug) {
//     console.log('Writing to firehose delivery stream (' + retries + ')');
//     console.log(JSON.stringify(putRecordBatchParams));
//   }
//
//   var startTime = new Date().getTime();
//   exports.firehose.putRecordBatch(putRecordBatchParams, function(err, data) {
//     if (err) {
//       console.log(JSON.stringify(err));
//       callback(err);
//     } else {
//       if (data.FailedPutCount !== 0) {
//         console.log("Failed to write " + data.FailedPutCount + "/" + firehoseBatch.length + " records. Retrying to write...");
//         if (retries < MAX_RETRY_ON_FAILED_PUT) {
//           // extract the failed records
//           var failedBatch = [];
//           data.RequestResponses.map(function(item, index) {
//             if (item.hasOwnProperty('ErrorCode')) {
//               failedBatch.push(firehoseBatch[index]);
//             }
//           });
//
//           setTimeout(exports.writeToFirehose.bind(undefined, failedBatch, streamName, deliveryStreamName, function(err) {
//             if (err) {
//               callback(err);
//             } else {
//               callback();
//             }
//           }, retries + 1), RETRY_INTERVAL_MS);
//         } else {
//           console.log('Maximum retries reached, giving up');
//           callback(data);
//         }
//       } else {
//         if (debug) {
//           var elapsedMs = new Date().getTime() - startTime;
//           console.log("Successfully wrote " + firehoseBatch.length + " records to Firehose " + deliveryStreamName + " in " + elapsedMs + " ms");
//         }
//         callback();
//       }
//     }
//   });
// }
// exports.writeToFirehose = writeToFirehose;