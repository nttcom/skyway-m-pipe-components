/////////////////////////////////////////////////////////
// utility functions
//
/////////////////////////////////////////////////////////

/**
 * transform object into Base64 string
 *
 * @param {Object} obj
 * @return {String} - base64 encoded string
 */
function objToBase64( obj ) {
  const buff = new Buffer( JSON.stringify( obj ));

  return buff.toString('base64');
}

/**
 * transform Base64 string into object
 *
 * @param {string} str
 * @return {object}
 */
function base64ToObj( str ) {
  const buff = new Buffer(str, 'base64');

  return JSON.parse(buff.toString('ascii'));
}

module.exports = {
  objToBase64,
  base64ToObj
}
