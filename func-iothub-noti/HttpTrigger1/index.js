const https = require('https');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    context.log('cicd success!')
    const DeviceId = (req.query.name || (req.body && req.body[0].IoTHub.ConnectionDeviceId));
    const temperature = (req.query.name || (req.body && req.body[0].temperature));
    const humidity = (req.query.name || (req.body && req.body[0].humidity));
    const pressure = (req.query.name || (req.body && !req.body[0].pressure ? 0 : req.body[0].pressure));
    const Time = (req.query.name || (req.body && req.body[0].EventProcessedUtcTime));
    const testval = temperature - 30;
    const testval2 = testval.toFixed(2);
    var DeviceURL='https://iot-FleetMgmt01.azure-devices.net/twins/'+ DeviceID +'/methods?api-version=2018-06-30';
    context.log("DeviceId : ",DeviceId);
    context.log("Temperature : ",temperature);
    context.log("humidity : ",humidity);
    context.log("pressure : ",pressure);
    context.log("Time : ",Time);    
    const data = JSON.stringify({
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": "0076D7",
        "summary": "Temperature WARING MESSAGE",
        "sections": [
            {
                "activityTitle": "The current temperature is " + testval2 + "degrees higher than the reference temperature.",
                "activitySubtitle": "Maxim-device",
                "activityImage": "https://cdn.icon-icons.com/icons2/2699/PNG/512/microsoft_azure_logo_icon_170956.png",
                "facts": [
                    {
                        "name": "DeviceId:",
                        "value": DeviceId
                    },
                    {
                        "name": "temperature:",
                        "value": temperature    
                    },
                    {
                        "name": "humidity:",
                        "value": humidity
                    },
                    {
                        "name": "pressure:",
                        "value": pressure
                    },
                    {
                        "name": "Time:",
                        "value": Time
                    }
                ],
                "markdown": true
            }
        ]
    })

    const options = {
        hostname: 'cloocus.webhook.office.com',
        port: 443,
        path: '/webhookb2/b486dc56-baa1-4e34-bd8d-5758bb9d0563@355deae4-a1d6-4d5e-be34-0ad0c20aaa0f/IncomingWebhook/af007c0a25844a8cbc71b99432c5779e/1bd9511a-ab2f-4ef1-aaa3-121c9c32fc34',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }

    const requ = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)

        res.on('data', d => {
            process.stdout.write(d)
        })
    })

    requ.on('error', error => {
        console.error(error)
    })


    requ.write(data)
    requ.end()


    var request = require('request');

    var headers = {
        'Authorization': 'SharedAccessSignature sr=iot-FleetMgmt01.azure-devices.net&sig=h1zXaVdlViqXrgPVrGKApnS7xXIaoSl5c7SS6VORQuQ%3D&se=1636800220&skn=iothubowner',
        'Content-Type': 'application/json'
    };
    
    var dataString = '{"methodName": "setDisplayText", "responseTimeoutInSeconds": 30, "payload": "Warning"}';
    
    var option = {
        url: DeviceURL,
        method: 'POST',
        headers: headers,
        body: dataString
    };
    
    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
        }
    }
    
    request(option, callback);
    


    const name = (req.query.name || (req.body && req.body.name));
    const responseMessage = name
        ? "Hello, " + name + ". This HTTP triggered function executed successfully."
        : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };
}