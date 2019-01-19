const getWav = require('./get-wav')

describe('getWav()', () => {
  it('will return wav format data', () => {
    const wav = getWav( 1, 48000, 16, Buffer.from([ 0xff, 0xff ]));
    console.log(wav);

  });
});
