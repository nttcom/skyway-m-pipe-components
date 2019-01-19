/* s3-driver.test.js */
const S3Driver = require('./s3-driver');

// We will run this test, only when needed environments are set
const region =       process.env.S3_REGION
  , IdentityPoolId = process.env.S3_IDENTITY_POOL_ID
  , bucket =         process.env.S3_BUCKET


describe('writeFile', () => {
  it('will write file', async done => {
    if( region && IdentityPoolId && bucket ) {
      const params = {
        region,
        IdentityPoolId,
        bucket
      };

      const s3 = new S3Driver(params);
      const filePath = 'test/hoge.txt';
      const expected = 'fuga';

      await s3.writeFile(filePath, expected)
      const ret = await s3.getFile(filePath)

      expect( ret.toString() ).toBe( expected );
    }
    done();
  });
});
