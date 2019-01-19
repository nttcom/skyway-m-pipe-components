class BaseStorage {
  /**
   * @param {string} filePath
   * @param {any} data
   * @return {Promise<Any>}
   *
   */
  writeFile( filePath, data ) {
    return new Promise((resolve, reject) => {
      console.log('`writeFile()` is not implemented');
      resolve();
    });
  }
}

module.exports = BaseStorage;
