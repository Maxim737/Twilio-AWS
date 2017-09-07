--------------------------------------------DATA FLOW--------------------------------------------
1) Twilio: sends HTTPS POST requests with event data to AWS API Gateway endpoint
2) Amazon API Gateway: maps endpoint to Lambda-1 function, calls that function
3) Lambda function 1: pushes data into Kinesis stream
4) Kinesis stream: receives and stores data
5) Lambda 2A: reads from Kinesis and sends data to Twilio over HTTPS
    <br>5.1) Twilio: synchronises data over many devices
6) Lambda 2B: reads from Kinesis and pushes data into Kinesis Firehose
    <br>6.1) Kinesis Firehose: saves data to the intermediate S3 bucket
    <br>6.2) S3 bucket: issues COPY command, which copies the data from bucket to the Redshift cluster
    <br>6.3) Redshift: stores the data in databases

-------------------------------------------PRODUCTION SETUP-------------------------------------------
1. Lambda-1<br>
Apart from the "aws", the function also needs a "twilio" package, so both the function .js file and the node_modules directory has to be zipped and uploaded as code for Lambda-1.<br>
In Configuration > Handler should be the name of the zipped function with .handler extension.<br>
Function validates the authenticity of the request (that the request came directly from Twilio and no data was corrupted) and puts the data record to the Kinesis-1 stream.

2. API Gateway<br>
In API Gateway create some API. (e.g. LambdaMicroservice)<br>
In Lambda settings find Triggers > Add trigger, choose API Gateway and point the created API to Lambda function.<br>
In the created API, that is pointing to the function, create a POST method.<br>
Don't forget to Actions > Deploy API to deploy the changes or the endpoint won't be visible from the Internet.

3. Kinesis-1<br>
Create Kinesis Stream, specify the name of the stream and the number of shards.

4. Lambda-2A and Lambda-2B<br>
Triggers > Add trigger, choose the created Kinesis Stream.<br>
Functions will poll that stream every second and run if there are any records present.<br>
Lambda-2A sends the event data to TwilioSync by using aws-sdk's NodeHttpClient and HttpRequest.<br>
Lambda-2B puts the data records to the Firehose-1 stream in batches no more than 500.

5. Redshift cluster<br>
Create Redshift cluster, provide the cluster username and password.<br>
Choose the nodes type and number:<br>
DC1 provide SSD storage and are good for computing (querying the database).<br>
DS2 provide HDD storage and are good for storing a large amount of data.

6. S3 bucket<br>
Create a bucket where the data will be stored before copying to the Redshift

7. Firehose-1<br>
Create the Kinesis Firehose Stream. Provide the intermediate S3 bucket and the Redshift cluster as destination.<br>
Data is being put to the Firehose, being saved to the S3 bucket which then calls a COPY command, to copy the data to the Redshift cluster.<br>
The database name, table name, user name and password should be provided. User should have INSERT privileges.<br>
The data comes in JSON format, so add "json 'auto'" COPY option.<br>
The names of JSON object attributes should be in lower case, since Redshift maps the attributes directly to the table field names and they are in a lower case in PostgreSQL.