const yaml = require('js-yaml')
const fs = require('fs')
const chalk = require('chalk')
const Sensor = require('./src/Sensor')
const log = console.log;

try {
    log('Reading the mock config file...')
    const mockConfig = yaml.safeLoad(fs.readFileSync('./mockConfig.yml', 'utf8'))

    const sensors = Object.entries(mockConfig.sensors)
    log(chalk.green('Found the following sensor(s):'))

    sensors.forEach(([key, val]) => {
        log(chalk.yellow(key))

        const sensorProps = Object.keys(val)

        sensorProps.forEach(prop => {
            if (prop !== 'timeDelay' && prop !== 'debug' && prop !== 'path' && prop !== 'verbose') {
                log(chalk.cyan(`\t- ${prop}`))
            }
        })
    });

    log('Mocking up sensors...')

    const mockedSensors = [];

    sensors.forEach(([key, val]) => {
        const { timeDelay, debug, path, verbose } = val

        // get a new copy of the props
        // and delete the timeDelay & debug prop
        const props = { ...val }
        delete props.path
        delete props.timeDelay
        delete props.debug
        delete props.verbose

        let sensor = new Sensor(key, path, props, timeDelay, debug, verbose)
        mockedSensors.push(sensor)
    })

    log('Mocked up all of the sensors... starting them now.')

    mockedSensors.forEach(mockSensor => {
        mockSensor.start()
    })

    // setup a listener for ctrl-c
    process.on('SIGINT', () => {
        log("\ngracefully shutting down from  SIGINT (Crtl-C)")
        mockedSensors.forEach(mockSensor => {
            mockSensor.stop()
        })
        process.exit()
    })
}
catch (e) {
    console.error(e)
}