const axios = require('axios').default;

module.exports = (api) => {
  api.registerAccessory('BathroomFan', Fan);
}

class Fan {

  /**
   * REQUIRED - This is the entry point to your plugin
   */
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;
    this.log.debug('Bathroom Fan Accessory Loaded');

    // your accessory must have an AccessoryInformation service
    this.informationService = new this.api.hap.Service.AccessoryInformation()
      .setCharacteristic(this.api.hap.Characteristic.Manufacturer, "RPI and alcohol")
      .setCharacteristic(this.api.hap.Characteristic.Model, "IPA to be exact");

    // create a new "Switch" service
    this.switchService = new this.api.hap.Service.Switch(this.name);

    // link methods used when getting or setting the state of the service 
    this.switchService.getCharacteristic(this.api.hap.Characteristic.On)
      .onGet(this.getOnHandler.bind(this))   // bind to getOnHandler method below
      .onSet(this.setOnHandler.bind(this));  // bind to setOnHandler method below
  }

  /**
   * REQUIRED - This must return an array of the services you want to expose.
   * This method must be named "getServices".
   */
  getServices() {
    return [
      this.informationService,
      this.switchService,
    ];
  }

  async getOnHandler() {
    this.log.info('Getting switch state');
    const response = await axios.get(`http://${this.config.rootUrl}/state`)
    const state = response.data['pin state']
    this.log.info(`fan is ${state ? 'On' : 'Off'}`)

    return Boolean(state);
  }

  async setOnHandler(value) {
    this.log.info('Setting switch state to:', value);
    const params = {
      time: this.config.runTime ? this.config.runTime : 60
    }

    if (value) {
      const response = await axios.post(`http://${this.config.rootUrl}/fan/start`, params)
      this.log.debug(response.data)
    } else {
      const response = await axios.post(`http://${this.config.rootUrl}/fan/stop`)
      this.log.debug(response.data)
    }
  }

}