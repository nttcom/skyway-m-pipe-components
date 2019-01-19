const bitsPerSamples = {
  'S16LE': 16  // 16 bit little endien PCM
}

/**
 * ref: http://soundfile.sapp.org/doc/WaveFormat/
 *
 * @param {number} numChannels - number of channels
 * @param {number} sampleRate  - sampling rate
 * @param {string} format - PCM format
 * @param {Buffer} pcm - pcm data
 *
 * @example
 * getWav( 1, 48000, 'S16LE', Buffer.from([ 0x00, 0x00 ]);
 *
 *
 */
function getWav( numChannels, sampleRate, format, pcm ) {
  const bitsPerSample = bitsPerSamples[ format ];
  const ChunkID = Buffer.from('RIFF');
  const ChunkSize = Buffer.allocUnsafe(4);
  ChunkSize.writeInt32LE( 36 + pcm.length ); // since PCM
  const Format = Buffer.from('WAVE');

  const Subchunk1ID = Buffer.from('fmt ');
  const Subchunk1Size = Buffer.allocUnsafe(4);
  Subchunk1Size.writeInt32LE(16); // since PCM
  const AudioFormat = Buffer.allocUnsafe(2);
  AudioFormat.writeInt16LE(1); // since PCM
  const NumChannels = Buffer.allocUnsafe(2);
  NumChannels.writeInt16LE(numChannels);
  const SampleRate = Buffer.allocUnsafe(4);
  SampleRate.writeInt32LE(sampleRate);
  const ByteRate = Buffer.allocUnsafe(4);
  ByteRate.writeInt32LE( sampleRate * numChannels * bitsPerSample / 8 );
  const BlockAlign = Buffer.allocUnsafe(2);
  BlockAlign.writeInt16LE( numChannels * bitsPerSample / 8 );
  const BitsPerSample = Buffer.allocUnsafe(2);
  BitsPerSample.writeInt16LE( bitsPerSample );

  const Subchunk2ID = Buffer.from('data');
  const Subchunk2Size = Buffer.allocUnsafe(4);
  Subchunk2Size.writeInt32LE(pcm.length);

  return Buffer.concat([
    ChunkID,
    ChunkSize,
    Format,
    Subchunk1ID,
    Subchunk1Size,
    AudioFormat,
    NumChannels,
    SampleRate,
    ByteRate,
    BlockAlign,
    BitsPerSample,
    Subchunk2ID,
    Subchunk2Size,
    pcm
  ]);
}

module.exports = getWav;
