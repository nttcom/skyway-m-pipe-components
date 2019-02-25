const { InputStream } = require('skyway-m-pipe-sdk/connector');

const token    = process.env.TOKEN;
const clientId = process.env.CLIENT_ID || 'unknown';
const inHost   = process.env.IN_HOST;
const inPort   = process.env.IN_PORT;
const label    = process.env.LABEL || 'no_label';
const interval = process.env.INTERVAL || 10 // default is 10 sec

if( !token || !inHost || !inPort ) {
  console.warn('TOKEN, IN_HOST and IN_PORT must be specified')
  process.exit(0);
}

console.log(`start metric module with token=${token}, inHost=${inHost}, inPort=${inPort} and label=${label}`);

function start() {
  try {
    let sum = 0, delta = 0
    const inputStream = new InputStream();

    inputStream.start({ host: inHost, port: inPort, token });

    inputStream.on( 'data', data => {
      // get length of payload, then count up sum and len
      const len = data.payload.length

      sum += len
      delta += len
    })

    setInterval( () => {
      const ts = new Date().toISOString()
      const Bps = delta / interval

      console.log(`[${ts}(${label})] ${token}/${clientId} - Bytes received: ${sum} ( ${Bps}[Bps] )`)
      delta = 0
    }, interval * 1000)
  } catch(err) {
    console.warn(err);
    process.exit(1);
  }
}

start()
