const { InputStream } = require('skyway-m-pipe-sdk/connector');

const token    = process.env.TOKEN;
const clientId = process.env.CLIENT_ID || 'unknown';
const inHost   = process.env.IN_HOST;
const inPort   = process.env.IN_PORT;
const label    = process.env.LABEL || 'no_label';
const plFormat = process.env.PL_FORMAT || 'raw';

if( !token || !inHost || !inPort ) {
  console.warn('TOKEN, IN_HOST and IN_PORT must be specified')
  process.exit(0);
}

console.log(`start logger module with token=${token}, inHost=${inHost}, inPort=${inPort} and label=${label}`);

function start() {
  try {
    const inputStream = new InputStream();

    inputStream.start({ host: inHost, port: inPort, token });

    inputStream.on( 'data', data => {
      const ts = new Date().toISOString()
      const meta = data.meta
      const payload = plFormat === 'string' ? data.payload.toString() : data.payload

      console.log(`[${ts}(${label})] ${token}/${clientId} - ${meta}`, payload, `(${payload.length})`)
    })
  } catch(err) {
    console.warn(err);
    process.exit(1);
  }
}

start()
