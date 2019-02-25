const AWS = require('aws-sdk');

class AWSDynamoDB {
  /**
   * @param {Object} params
   * @param {string} params.region - region name of DynamoDB
   * @param {string} params.IdentityPoolId - from AWS cognito
   * @param {string} params.tableName - table name of DynamoDB
   *
   */
  constructor( params ) {
    this.params = Object.assign( {}, {
      region: params.region,
      IdentityPoolId: params.IdentityPoolId,
      tableName: params.tableName
    } )

    AWS.config.region   = this.params.region;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: this.params.IdentityPoolId,
    });

    this.dynamodb = new AWS.DynamoDB();
    this.docClient = new AWS.DynamoDB.DocumentClient();

    this.tableSetting = {
      TableName : this.params.tableName,
      KeySchema: [
        { AttributeName: "clientId", KeyType: "HASH" },  // partition Key
        { AttributeName: "timestamp", KeyType: "RANGE" } // sort key
      ],
      AttributeDefinitions: [
        { AttributeName: "clientId", AttributeType: "S" },
        { AttributeName: "timestamp", AttributeType: "N" }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
      }
    }
  }

  /**
   * setup
   *
   * @return {Promise<Object>}
   *
   * this method will check table availability. create if it is not exist
   * Then application will get ready state
   */
  async setup() {
    try {
      const tablelist = await this._listTables()
      const exists = tablelist.TableNames.filter( name => name === this.params.tableName ).length === 1
      if ( !exists ) {
        const res = await this._createTable()
        return res
      } else {
        return null
      }
    } catch(err) {
      throw err
    }
  }

  /**
   * write data to DynamoDB
   *
   * @param {object} data
   * @param {string} data.token
   * @param {string} data.clientId
   * @param {number} data.timestamp - unix timestamp
   * @param {string} data.transcript
   * @param {number} data.confidence
   * @param {string} data.translation
   *
   * @return {Promise<Void>}
   *
   * @example
   * const awsDynamoDB = new AWSDynamoDB({
   *   region: 'us-west-2',
   *   IdentityPoolId: '...',
   *   table: 'testtable'
   * })
   *
   * awsDynamoDB.setup()
   * await awsDynamoDB.write( {
   *  token,
   *  clientId,
   *  timestamp,
   *  transcript,
   *  confidence,
   *  translation
   * })
   *
   */
  async write( data ) {
    try {
      const item = {
        clientId: {
          S: data.clientId !== '' ? data.clientId : 'undefined'
        },
        token: {
          S: data.token !== '' ? data.token : 'undefined'
        },
        timestamp: {
          N: data.timestamp.toString()
        },
        transcript: {
          S: data.transcript !== '' ? data.transcript : 'undefined'
        },
        confidence: {
          N: data.confidence.toString()
        },
        translation: {
          S: data.translation !== '' ? data.translation : 'undefined'
        }
      }
      const res = await this._write( item )
      return res
    } catch(err) {
      throw err
    }
  }

  /**
   * list tables
   *
   * @private
   */
  _listTables() {
    return new Promise( (resolve, reject) => {
      this.dynamodb.listTables( {}, (err, data) => {
        if( err ) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  /**
   * create table
   *
   * @private
   */
  _createTable() {
    return new Promise( (resolve, reject) => {
      this.dynamodb.createTable( this.tableSetting, ( err, data ) => {
        if( err ) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  /**
   * write item
   *
   * @private
   */
  _write( item ) {
    const params = {
      Item: item,
      TableName: this.params.tableName
    }
    return new Promise( (resolve, reject) => {
      this.dynamodb.putItem( params, ( err, data ) => {
        if( err ) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }
}

module.exports = AWSDynamoDB
