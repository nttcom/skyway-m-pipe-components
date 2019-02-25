class BaseStorage {
  /**
   * @param {string} filePath
   * @param {any} data
   * @return {Promise<Any>}
   *
   */
  writeFile( filePath, data ) {
    return new Promise( resolve => {
      console.log('`writeFile()` is not implemented');
      console.log(`  filePath - ${filePath}, data - ${data}`)
      resolve();
    });
  }
}

module.exports = BaseStorage;
