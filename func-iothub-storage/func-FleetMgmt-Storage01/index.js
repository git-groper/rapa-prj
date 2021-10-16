module.exports = function (context, IoTHubMessages)   {
    //context에서 devID, time 추출
    let deti = context.bindingData;   //bindingData 객체
    let deid = context.bindingData.systemProperties["iothub-connection-device-id"];
    context.log('cicd success!3')


    // IotHubMessages data에서 추출
    let devid = !deid ? "N/A" : deid;
    let iottemp = IoTHubMessages.temperature;
    let iothumi = IoTHubMessages.humidity;
    let iottime = !deti.enqueuedTimeUtc ? "N/A" : deti.enqueuedTimeUtc;
    let iotpressure = !IoTHubMessages.pressure ? "N/A" : IoTHubMessages.pressure;
    // let iottime = !context.bindingData.systemProperties.enqueuedTimeUtc ? "N/A" : Invocationcontext.bindingData.systemProperties.enqueuedTimeUtc;
    // let iotdevid = context.bindingData.systemProperties[0];
    //let iotdevid = deid;
    
    console.log(deid)
    //const hub = {"MessageId": msgid, "DeviceId": iotdevid, "Temperature": iottemp, "Humidity": iothumi};
    //const hub = {"DeviceId": "iot-device", "Time": iottime, "Temperature": iottemp, "Humidity": iothumi, "pressure": iotpressure};
    const hub = {"DeviceID": devid, "Time": iottime, "Temperature": iottemp, "Humidity": iothumi, "pressure": iotpressure};
    // ^ mongodb 저장시에는 JSON object로 넣어준다

	//MongoDB API 정보
	const mongodb_uri = "mongodb://cosmos-fleetmgmt01:SHwczkmquNEnzQJtmhQ6lIrdeK96kwR8Fj6ksPLyNooVOo51XeXwRxF69pvqASuuLFhxdMYiE7rlBBjPGAZcFw==@cosmos-fleetmgmt01.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&replicaSet=globaldb&maxIdleTimeMS=120000&appName=@cosmos-fleetmgmt01@";

    // Mongo Client 접속
    const mongoClient = require("mongodb").MongoClient;
    mongoClient.connect(mongodb_uri, {useUnifiedTopology: true}, (error, client) => {
        if (error) {
            console.log(`Error occurred while connecting to Cosmos MongoDB ${err}`)
            return;
        }  else {
            console.log('Mongo Client connected to DB');
        //저장 컬렉션 경로
        const cli = client.db("iot-database")               // DB
        const Collec = cli.collection("raw-data");          // Collection
        console.log('MongoClient collection retreived');
        // 데이터 insert
        Collec.insertOne(hub)
        .then(result => {
            console.log("Insert OK");
            client.close();
        })
        .catch(error => console.error(error))
      }
 
		console.log(`IoT Message saved to CosmosDB: ${JSON.stringify(hub)}`);
    });
        context.bindings.outputQueueItem = JSON.stringify(hub); // Queue 스토리지 저장 코드

        // context.bindings.outputBlob = JSON.stringify(hub); // Blob Storage 저장 코드

    // //여기서 부터 스토리지 저장시 이어쓰기 테스트 중.
    // const fs = require('fs');
    // // const storageuri = 'https://safleetmgmt01.blob.core.windows.net/iot-container/test.json';
    
    // // // //const bindd = context.bindings.outputBlob;
    // const strhubb = JSON.stringify(hub);

    //   fs.appendFile(storageuri, strhubb, function (err) { 
    //       if (err){console.log(err); throw err; }  
    //       else {
    //           console.log('The "data to append" was appended to file!');
    //       }
    //   });

    // context.bindings.outputBlob = 
    // fs.appendFile(JSON.stringify(hub), function (err) { 
    //     if (err){storageuri.console.log(err); throw err; }  
    //     else {
    //         console.log('The "data to append" was appended to file!');
    //     }
    // });

    context.done();
 };