const AWS = require('aws-sdk');
const firehose = new AWS.Firehose({
  region: "us-east-1"
});
let reqCount = 0;
const DATA_FIELDS = [
  "Sid",
  "EventType",
  "AccountSid",
  "WorkspaceSid",
  "WorkspaceName",
  "EventDescription",
  "ResourceType",
  "ResourceSid",
  "Timestamp",
  "TaskSid",
  "TaskAttributes",
  "TaskAge",
  "TaskPriority",
  "TaskAssignmentStatus",
  "TaskCanceledReason",
  "TaskCompletedReason",
  "WorkerSid",
  "WorkerName",
  "WorkerAttributes",
  "WorkerActivitySid",
  "WorkerActivityName",
  "WorkerTimeInPreviousActivity",
  "WorkerPreviousActivitySid",
  "Task",
  "WorkflowSid",
  "WorkflowName",
  "TaskChannelSid",
  "TaskChannelUniqueName",
  "TaskQueueSid",
  "TaskQueueName",
  "Worker",
  "ReservationSid"
];

exports.handler = (event, context) => {
  firehose.describeDeliveryStream({DeliveryStreamName: process.env.FIREHOSE_STREAM_NAME}, (err, streamInfo) => {
    if (err) {
      console.log(err);
      context.fail(err);
    }
    else {
      reqCount = event.Records.length;

      if(streamInfo.DeliveryStreamDescription.DeliveryStreamStatus === "ACTIVE" || streamInfo.DeliveryStreamDescription.DeliveryStreamStatus === "UPDATING" ) {
        for (let i = 0; i < event.Records.length; i += Number(process.env.RECORDS_LIMIT_PER_BATCH)) {
          let batch = event.Records.slice(i, i + Number(process.env.RECORDS_LIMIT_PER_BATCH));

          let records = [];
          batch.forEach((record) => {
            record = Buffer.from(record.kinesis.data, 'base64').toString();
            let recordData = {};
            let otherData = {};
            let isOtherData = false;

            let pairs = record.split("&");
            pairs.forEach((pair) => {
              pair = pair.split("=");
              if(DATA_FIELDS.includes(pair[0])) {
                recordData[pair[0].toLowerCase()] = decodeURIComponent(pair[1] || '');
              } else {
                otherData[pair[0]] = decodeURIComponent(pair[1] || '');
                isOtherData = true;
              }
            });

            isOtherData ? recordData["otherdata"] = otherData : '';
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