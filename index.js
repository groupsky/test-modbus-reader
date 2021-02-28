#!/usr/bin/env node
/* eslint-env node */
import ModbusRTU from 'modbus-serial'

const modbusClient = new ModbusRTU()

const devices = [1, 7]
const port = '/dev/ttyUSB0'
const portConfig = {
  baudRate: 9600,
  parity: 'none'
}

const reader = async (client) => {
  return {
    v1: await client.readHoldingRegisters(0x1000, 8),
    v2: await client.readHoldingRegisters(0x1008, 8),
    v3: await client.readHoldingRegisters(0x1010, 8),
    v4: await client.readHoldingRegisters(0x101C, 2),
    v5: await client.readHoldingRegisters(0x102F, 1),
    v6: await client.readHoldingRegisters(0x1100, 8),
    v7: await client.readHoldingRegisters(0x1120, 8),
    v8: await client.readHoldingRegisters(0x1182, 2),
  }
}

const getValues = async () => {
  try {
    // get value of all meters
    for (let device of devices) {
      // output value to console
      await modbusClient.setID(device)
      try {
        const start = Date.now()
        const val = await reader(modbusClient)
        val._tz = Date.now()
        val._ms = val._tz - start
        console.log(device, val)
      } catch (e) {
        console.error('Error reading', device, e)
      }
      await sleep(150)
    }
  } catch (e) {
    // if error, handle them here (it should not)
    console.error(e)
  } finally {
    // after get all data from slave repeat it again
    setTimeout(getValues)
  }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

Promise.all([
  modbusClient.connectRTUBuffered(port, portConfig)
]).then(() => {
  modbusClient.setTimeout(1000)

  return getValues()
})
