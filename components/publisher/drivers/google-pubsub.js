const {PubSub} = require('@google-cloud/pubsub');

class GooglePubSub {
  /**
   * @param {Object} params
   * @param {string} params.gProjectId
   * @param {string} params.topic
   * @param {object} params.googleCredentials
   */
  constructor( params ) {
    this.params = Object.assign( {}, {
      projectId: params.gProjectId,
      topic:    params.topic,
      credentials: params.googleCredentials
    } )

    this.pubsubClient = new PubSub( {
      projectId: this.params.projectId,
      credentials: this.params.credentials
    } )
  }

  /**
   * start
   *
   * @return {Promise<Array>}
   *
   * this method will check topic name availability. create if it is not exist
   * Then application ready state
   */
  async start() {
    let topicExists
    try {
      const topics = await this.pubsubClient.getTopics()

      topicExists = topics[0].filter( topic => {
        const name = topic.name
        const t = this.params.topic

        // since google pubsub automatically set preamble to topic name depends on projectId
        // like `projects/some_project_id/topics/${topic.name}` in `createTopic()` and `topic()`
        // methods. So, it will be quite natural to use `${topic.name}` in this code (not full name of topic).
        //
        // But getTopics() returns full name of current topics. This is obiously mis-matched.
        // To check existance of topic name under such a mis-matched situation, we will check
        // last name match only.
        return ( name.indexOf( t ) === ( name.length - t.length ) )
      }).length === 1
    } catch(err) {
      throw err
    }

    // since `createTopic()` is async function, error will be happen when two or more client
    // call it at very same time. In this case, it will not be considered as Error cases.
    // So we will simply log error message and return null Array.
    try {
      if( !topicExists ) {
        const result = await this.pubsubClient.createTopic( this.params.topic )
        console.log(`new topic ${this.params.topic} created`)
        return result
      } else {
        return []
      }
    } catch(err) {
      console.log(err.message)
      return []
    }
  }

  /**
   * @param {object} data
   * @return {Promise<Void>}
   *
   * @example
   * const googlePubSub = new GooglePubSub({
   *   projectId: '...',
   *   topic: 'testtopic'
   * })
   *
   * googlePubSub.start()
   * await googlePubSub.publish( {'message': 'hello'} )
   *
   */
  async publish( data ) {
    try {
      const buf = Buffer.from( JSON.stringify( data ) )
      this.messageId = await this.pubsubClient
        .topic( this.params.topic )
        .publisher()
        .publish( buf )
    } catch(err) {
      throw err
    }
  }
}

module.exports = GooglePubSub
