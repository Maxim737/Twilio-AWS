--------------------------------------------DATA FLOW--------------------------------------------
1) Twilio: sends HTTPS POST requests with event data to AWS API Gateway endpoint
2) Amazon API Gateway: maps endpoint to Lambda-1 function, calls that function
3) Lambda function 1: pushes data into Kinesis stream
4) Kinesis stream: receives and stores data
5) Lambda 2A: reads from Kinesis and sends data to Twilio over HTTPS
    <br>5.1) Twilio: synchronises data over many devices
6) Lambda 2B: reads from Kinesis and pushes data into Kinesis Firehose
    <br>6.1) Kinesis Firehose
    <br>6.2) Redshift