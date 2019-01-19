const getWav = require('./libs/get-wav');

/**
 * start file writer
 *
 * @param {string} path - path to write file
 * @return {Pormise<FileWriter>}
 *
 * @example
 * const writer = await FileWriter.start( _dirname + '/recorded/test.wav' )
 * writer.write( buf );
 * ...
 * writer.close()
 */
const start = ( params ) => {
  const {
    inputStream,
    token,
    clientId,
    driverName,
    driverParams,
    chunkTime
  } = params;

  let driver, driverObj;

  if( params.driverName.toUpperCase() === 'S3' ) {
    driverObj = require('./drivers/s3-driver');
    driver = new driverObj( driverParams );
  }

  let last = 0, curr, caps, bufs = [];

  // save remaining data when SIGTERM is emitted
  //
  process.on('cleanup', async (exit_id) => {
    console.log(`cleanup catched - exit_id = ${exit_id}`);

    try {
      console.log('=== start saving reamining data...');
      await _save( curr + 1, null);
      console.log('=== save finished');
    } catch(err) {
      console.warn(err);
    }
    process.exit(exit_id);
  });

  process.on('SIGTERM', () => {
    process.emit('cleanup', 0);
  });
  process.on('SIGINT', () => {
    process.emit('cleanup', 2);
  });
  process.on('uncaughtException', () => {
    process.emit('cleanup', 99);
  });

  /**
   * Internal function for saving data to external Storage
   *
   * @param {number} timeIdx
   * @param {Buffer} data
   */
  async function _save( timeIdx, data ) {
    if(bufs.length > 0) {
      try {
        if( data && data.payload instanceof Buffer ) bufs.push( data.payload );
        const pcm = Buffer.concat( bufs );
        bufs.length = 0;

        if( data && !caps) {
          caps = JSON.parse( data.meta );
        }

        if( caps ) {
          const wav = getWav( caps.channels, caps.rate, caps.format, pcm );

          const filepath = `recorded/${clientId}/${timeIdx * chunkTime * 1000}.wav`;
          await driver.writeFile(filepath, wav)
          console.log(`finished saving file - ${filepath}`);
        }
      } catch(err) {
        console.warn( err );
      }
    } else {
      if( data && data.payload instanceof Buffer ) bufs.push( data.payload );
    }
  }

  // event handler for inputStream data
  // when timespan exceeds chunkTime, it will start saving file.
  // otherwise just push buffer array
  //
  inputStream.on('data', async data => {
    curr = Math.floor( Date.now() / ( chunkTime * 1000 ) );

    if( curr > last ) {
      last = curr;
      await _save( curr, data );
    } else {
      bufs.push( data.payload );
    }
  });
}

module.exports = {
  start
}
