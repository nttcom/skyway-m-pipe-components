const {Translate} = require('@google-cloud/translate');

class GoogleTranslate {
  /**
   * @param {Object} params
   * @param {string} params.gProjectId
   * @param {string} param.targetLanguage - en, ja etc. ( see https://cloud.google.com/translate/docs/languages more detail )
   * @param {object} param.googleCredentials
   */
  constructor( params ) {
    this.params = Object.assign( {}, {
      projectId: params.gProjectId,
      target:    params.targetLanguage,
      credentials: params.googleCredentials
    } )

    this.gTranslate = new Translate( {
      projectId: this.params.projectId,
      credentials: this.params.credentials
    } )
  }

  /**
   * @param {string} text
   * @return {Promise<Object>}
   *
   * @example
   * const googleTranslate = new GoogleTranslate({
   *   projectId: '...',
   *   targetLanguage: 'en'
   * })
   *
   * const res = await googleTranslate.translate( 'こんにちは' )
   *
   */
  translate( text ) {
    return new Promise( ( resolve, reject ) => {
      this.gTranslate
        .translate(text, this.params.target)
        .then(results => {
          const translation = results[0];

          resolve( translation )
        })
      .catch(err => {
        reject( err )
      });
    })
  }
}

module.exports = GoogleTranslate
