# m-pipe-components

Collection of components of M-PIPE.

# Spec of Components

## filewriter

Write chunked file of incoming data into cloud storage.

```
  worker: /app/components/file-writer/index.js
  environments:
    TOKEN {string} - token string
    IN_HOST {string} - name of previous component
    IN_PORT {number} - port number of previous component
    DRIVER_NAME {string} - name of driver (currently S3 only supported )
    S3_BUCKET {string} - (S3 only) bucket name
    AWS_IDENTITY_POOL_ID {string} - (S3 only) identity pool id
    AWS_REGION {string} - (S3 only) region name of AWS
    CHUNK_TIME {number} - chunk time in second unit
    CLIENT_ID {string} - id of each client
```

## recognizer

Speech to text using Google Speech API

```
  worker: /app/components/voice-recognizer/index.js
  environments:
    TOKEN {string} - token string
    IN_HOST {string} - name of previous component
    IN_PORT {number} - port number of previous component
    OUT_PORT {number} - port number of this component
    BASE64_GOOGLE_CREDENTIALS {string} - base64 encoded google credentials
    G_PROJECT_ID {string} - project id of GCP
    LANGUAGE_CODE {string} - language code (e.g. ja-JP)
```

## translator

Machine translation using Google Translate API from recognizer

```
  worker: /app/components/translator/index.js
  environments:
    TOKEN {string} - token string
    IN_HOST {string} - name of previous component
    IN_PORT {number} - port number of previous component
    OUT_PORT {number} - port number of this component
    BASE64_GOOGLE_CREDENTIALS {string} - base64 encoded google credentials
    G_PROJECT_ID {string} - project id of GCP
    TARGET_LANGUAGE {string} - target language (e.g. en)
```

## logger

Logging out incoming stream data ( meta and payload )

```
  worker: /app/components/logger/index.js
  environments:
    TOKEN {string} - token string
    IN_HOST {string} - name of previous component
    IN_PORT {number} - port number of previous component
    LABEL {number} - label of log [default: no_label]
    PL_FORMAT {number} - output format of payload ( raw : raw binary, string : string ) [default: raw]
    CLIENT_ID {string} - id of each client
```

## dbwriter

Write incoming payload data from translator into DynamoDB

```
  worker: /app/components/db-writer/index.js
  environments:
    TOKEN {string} - token string
    IN_HOST {string} - name of previous component
    IN_PORT {number} - port number of previous component
    AWS_IDENTITY_POOL_ID {string} - identity pool id
    AWS_REGION {string} - region name of AWS
    TABLE_NAME {string} - name of table
    CLIENT_ID {string} - id of each client
```

## publisher

Publish incoming payload data from previous component to Google PubSub

```
  worker: /app/components/publisher/index.js
  environments:
    TOKEN {string} - token string
    IN_HOST {string} - name of previous component
    IN_PORT {number} - port number of previous component
    OUT_PORT {number} - port number of this component
    BASE64_GOOGLE_CREDENTIALS {string} - base64 encoded google credentials
    G_PROJECT_ID {string} - project id of GCP
    TOPIC {string} - name of topic
    CLIENT_ID {string} - id of each client
```

---
Copyright. NTT Communications Corporation All rights reserved.
