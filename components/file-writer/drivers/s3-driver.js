const BaseStorageDriver = require('./base-storage-driver');
const AWS = require('aws-sdk');

class S3Driver extends BaseStorageDriver {
  /**
   * constructor
   *
   * @param {object} params
   * @param {string} params.region
   * @param {string} params.IdentityPoolId
   * @param {string} params.bucket
   * @constructor
   */
  constructor( params ) {
    super( params );
    this.params = Object.assign( {}, {
      region:         params.region,
      IdentityPoolId: params.identityPoolId,
      bucket:         params.bucket
    });

    AWS.config.region = this.params.region;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: this.params.IdentityPoolId,
    });

    this.s3 = new AWS.S3();
  }

  /**
   * @param {string} filePath
   * @param {Binary|String} data
   * @return {Promise<void>}
   *
   */
  writeFile( filePath, data ) {
    return new Promise( (resolve, reject) => {
      const params = {Bucket: this.params.bucket, Key: filePath, Body: data};

      this.s3.putObject(params, function(err, data) {
        if (err) {
          reject(err)
        } else {
          console.log(`Successfully uploaded data to ${params.Bucket}/${params.Key}`);
          resolve();
        }
      });
    });
  }

  /**
   * @param {string} filePath
   * @return {Promise<Binary|String>}
   *
   */
  getFile( filePath ) {
    return new Promise( (resolve, reject) => {
      const params = {Bucket: this.params.bucket, Key: filePath};

      this.s3.getObject(params, function(err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(data.Body);
        }
      });
    });
  }
}

module.exports = S3Driver

