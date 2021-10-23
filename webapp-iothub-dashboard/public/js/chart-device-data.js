/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
$(document).ready(() => {
  // if deployed to a site supporting SSL, use wss://
  const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
  const webSocket = new WebSocket(protocol + location.host);

  // A class for holding the last N points of telemetry for a device
  class DeviceData {
    constructor(deviceId) {
      this.deviceId = deviceId;
      this.maxLen = 50;
      this.timeData = new Array(this.maxLen);
      this.temperatureData = new Array(this.maxLen);
      this.humidityData = new Array(this.maxLen);
      
      this.pressureData = new Array(this.maxLen);
    }

    addData(time, temperature, humidity, pressure) {
      this.timeData.push(time);
      this.temperatureData.push(temperature);
      this.humidityData.push(humidity || null);

      this.pressureData.push(pressure || null);

      if (this.timeData.length > this.maxLen) {
        this.timeData.shift();
        this.temperatureData.shift();
        this.humidityData.shift();

        this.pressureData.shift();
      }
    }
  }

  // All the devices in the list (those that have been sending telemetry)
  class TrackedDevices {
    constructor() {
      this.devices = [];
    }

    // Find a device based on its Id
    findDevice(deviceId) {
      for (let i = 0; i < this.devices.length; ++i) {
        if (this.devices[i].deviceId === deviceId) {
          return this.devices[i];
        }
      }

      return undefined;
    }

    getDevicesCount() {
      return this.devices.length;
    }
  }

  const trackedDevices = new TrackedDevices();

  // Define the chart axes
  const temperatureChartData = {
    datasets: [
      {
        fill: false,
        label: 'Temperature',
        yAxisID: 'Temperature',
        borderColor: 'rgba(255, 204, 0, 0.6)',
        pointBoarderColor: 'rgba(255, 204, 0, 0.6)',
        backgroundColor: 'rgba(255, 204, 0, 0.3)',
        pointHoverBackgroundColor: 'rgba(255, 204, 0, 0.6)',
        pointHoverBorderColor: 'rgba(255, 204, 0, 0.6)',
        spanGaps: true,
      },
    ]
  };

  const humidityChartData = {
    datasets: [
       {
        fill: false,
        label: 'Humidity',
        yAxisID: 'Humidity',
        borderColor: 'rgba(24, 120, 240, 0.6)',
        pointBoarderColor: 'rgba(24, 120, 240, 0.6)',
        backgroundColor: 'rgba(24, 120, 240, 0.3)',
        pointHoverBackgroundColor: 'rgba(24, 120, 240, 0.6)',
        pointHoverBorderColor: 'rgba(24, 120, 240, 0.6)',
        spanGaps: true,
      }
    ]
  };

  const ahumidityChartData = {
    datasets: [
       {
        fill: false,
        label: 'Pressure',
        yAxisID: 'Pressure',
        borderColor: 'rgba(190, 190, 190, 0.6)',
        pointBoarderColor: 'rgba(190, 190, 190, 0.6)',
        backgroundColor: 'rgba(190, 190, 190, 0.3)',
        pointHoverBackgroundColor: 'rgba(2190, 190, 190, 0.6)',
        pointHoverBorderColor: 'rgba(190, 190, 190, 0.6)',
        spanGaps: true,
      }
    ]
  };

  const temperaturechartOptions = {
    responsive: false, 
    scales: {
      yAxes: [{
        id: 'Temperature',
        type: 'linear',
        scaleLabel: {
          labelString: 'Temperature (ºC)',
          display: true,
        },
        position: 'left',
      },
     ]
    }
  };

  const humidityChartOptions = {
    responsive: false, 
    scales: {
      yAxes: [
      {
        id: 'Humidity',
        type: 'linear',
        scaleLabel: {
          labelString: 'Humidity (%)',
          display: true,
        },
        position: 'left',
      }]
    }
  };

  const ahumidityChartOptions = {
    responsive: false, 
    scales: {
      yAxes: [
      {
        id: 'Pressure',
        type: 'linear',
        scaleLabel: {
          labelString: 'Pressure (hpa)',
          display: true,
        },
        position: 'left',
      }]
    }
  };

  // Get the context of the canvas element we want to select
  const ctx_temperature = document.getElementById('temperatureIotChart').getContext('2d');
  const myTemperatureLineChart = new Chart(
    ctx_temperature,
    {
      type: 'line',
      data: temperatureChartData,
      options: temperaturechartOptions,
    });

  // groper 일단 추가...
  const ctx_humidity = document.getElementById('humidityIotChart').getContext('2d');
  const myHumidityLineChart = new Chart(
    ctx_humidity,
    {
      type: 'line',
      data: humidityChartData,
      options: humidityChartOptions,
    });

  // groper 일단 추가...
  const ctx_pressure = document.getElementById('pressureIotChart').getContext('2d');
  const myPressureLineChart = new Chart(
    ctx_pressure,
    {
      type: 'line',
      data: ahumidityChartData,
      options: ahumidityChartOptions,
    });


  // Manage a list of devices in the UI, and update which device data the chart is showing
  // based on selection
  let needsAutoSelect = true;
  const deviceCount = document.getElementById('deviceCount');
  const listOfDevices = document.getElementById('listOfDevices');
  const navDeviceInfo = document.getElementById('navDeviceInfo');

  function OnSelectionChange() {
    const device = trackedDevices.findDevice(listOfDevices[listOfDevices.selectedIndex].text);
    temperatureChartData.labels = device.timeData;
    temperatureChartData.datasets[0].data = device.temperatureData;

    humidityChartData.labels = device.timeData;
    humidityChartData.datasets[0].data = device.humidityData;

    ahumidityChartData.labels = device.timeData;
    ahumidityChartData.datasets[0].data = !(device.pressureData) ? 1 : device.pressureData;

    // groper - 디바이스 정보 추가 - DB작업을 해야 하지만 급하니 우선 넣자.
    console.log("device id : " + device.deviceId);
    if(device.deviceId == "bumblebee"){
      navDeviceInfo.innerHTML = `<img src="bare-bears-profile.png" height="100" style="display: block; padding:20px; float:left; auto;">
      <br><br><br>
      전동차 ID : ${listOfDevices[listOfDevices.selectedIndex].text}
      <p>
      Driver Info : 이태훈
      <p>
      Driver reg ID : #0119
      <p>
      <pre>    
    Contact</pre>
      <p>
      <hr style="width: 280px; border:none; border:2px double rgba(32, 31, 255, 0.66);">
      <pre>
    Phone : 010-1234-5678

    Address : 태훈네
      </pre>`
    }
    else if(device.deviceId == "thor"){
      navDeviceInfo.innerHTML = `<img src="lhl.png" height="100" style="display: block; padding:20px; float:left; auto;">
      <br><br><br>
      전동차 ID : ${listOfDevices[listOfDevices.selectedIndex].text}
      <p>
      Driver Info : 이혜리
      <p>
      Driver reg ID : #0678
      <p>
      <pre>    
    Contact</pre>
      <p>
      <hr style="width: 280px; border:none; border:2px double rgba(32, 31, 255, 0.66);">
      <pre>
    Phone : 010-4567-9012

    Address : 혜리네
      </pre>`
    }
    else{
      navDeviceInfo.innerHTML = `<img src="driver_default.png" height="100" style="display: block; padding:20px; float:left; auto;">
      <br><br><br>
      등록되어 있지 않은 드라이버`
    }


    myTemperatureLineChart.update();
    // groper
    myHumidityLineChart.update();
    myPressureLineChart.update();
  }
  listOfDevices.addEventListener('change', OnSelectionChange, false);

  // When a web socket message arrives:
  // 1. Unpack it
  // 2. Validate it has date/time and temperature
  // 3. Find or create a cached device to hold the telemetry data
  // 4. Append the telemetry data
  // 5. Update the chart UI
  webSocket.onmessage = function onMessage(message) {
    try {
      const messageData = JSON.parse(message.data);
      //console.log(messageData);

      // time and either temperature or humidity are required
      if (!messageData.MessageDate || (!messageData.IotData.temperature && !messageData.IotData.humidity)) {
        return;
      }

      // find or add device to list of tracked devices
      const existingDeviceData = trackedDevices.findDevice(messageData.DeviceId);

      if (existingDeviceData) {
        existingDeviceData.addData(messageData.MessageDate, messageData.IotData.temperature, messageData.IotData.humidity, !(messageData.IotData.pressure)?1:messageData.IotData.pressure);
      } else {
        const newDeviceData = new DeviceData(messageData.DeviceId);
        trackedDevices.devices.push(newDeviceData);
        const numDevices = trackedDevices.getDevicesCount();
        deviceCount.innerText = numDevices === 1 ? `${numDevices} device` : `${numDevices} devices`;

        // groper - 디바이스 정보 추가 - 여기서 말고 OnSelectionChanged에서 처리, 코드만 남겨둔다.
        //navDeviceInfo.innerText = `DeviceId : ${messageData.DeviceId} Driver Info : 이태훈`;

        newDeviceData.addData(messageData.MessageDate, messageData.IotData.temperature, messageData.IotData.humidity, !(messageData.IotData.pressure)?1:messageData.IotData.pressurey);

        // add device to the UI list
        const node = document.createElement('option');
        const nodeText = document.createTextNode(messageData.DeviceId);
        node.appendChild(nodeText);
        listOfDevices.appendChild(node);

        // if this is the first device being discovered, auto-select it
        if (needsAutoSelect) {
          needsAutoSelect = false;
          listOfDevices.selectedIndex = 0;
          OnSelectionChange();
        }
      }

      // groper - 경고 버튼 활성화
      //const testval = parseInt(messageData.IotData.temperature); // 테스트
      console.log('test %f', messageData.IotData.temperature);
      if(messageData.IotData.temperature > 30.0)
      {
        const alert_element = document.getElementById('btn_alert');
        alert_element.classList.add("is-active");
        alert_element.innerHTML = "!! Alert";
        console.log("Over - Temperature!!!")
      }


      myTemperatureLineChart.update();
      // groper
      myHumidityLineChart.update();
      myPressureLineChart.update();

    } catch (err) {
      console.error(err);
    }
  };

  document.addEventListener("click", click);

  function click(e) {
    let el;

    el = e.target;

    if (el !== e.currentTarget) {
      if (el.nodeName === "BUTTON") {
        if (el.classList.contains("is-active")) {
          el.classList.remove("is-active");
          el.innerHTML = "Normal Status";
        } else {
          el.classList.add("is-active");
          el.innerHTML = "!! Alert";
        }
      }
    }
    event.stopPropagation();
  }
});
