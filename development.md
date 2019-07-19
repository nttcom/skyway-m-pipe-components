# CI

We use CircleCI for this repository to automate test and build/push.

## workflow

CircleCI does the jobs below.
The jobs with () hasn't been automated.

1. Before Pull Request, test it
2. When Merged into master, build and push it to development registry as latest image
3. When tagged, build it
   1. test it
   2. build and push the image to the development registry as versioned image
   3. (change dashboard config to use the new version and test it manually)
   4. wait for approval on circleci
   5. send approval link to slack
   6. Once approved, push the image to production registry
   7. (change dashboard config to use the new version in production)

## trigger release

When you want to promote current commit to version tagged and release, follow these commands to kick the release workflow in circleci.

```
$ git checkout master
$ git pull
$ VERSION=0.0.0 # change version number!
$ npm version $VERSION -m "Release v${VERSION}"
$ git push --tags
```