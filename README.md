# FastSpring Encryption Playground

The Encryption Playground is a simple webapp that allows vendors to interactively learn how to create [custom sessions](https://fastspring.com/docs/passing-sensitive-data-with-secure-requests/) using the secure method of the [Store Builder Library](https://fastspring.com/docs/store-builder-library/). It streamlines the encryption process with the help of a Wizard that walks the user through the key creation steps.
The backend consists of two open endpoints that be used indepent of the frontend:
- `GET /keys/new`: get a pair of RSA-2048 bits private key and a self-signed certificate
- `POST /encrypt`: encrypt the custom payload found in the body of the request. If a customKey is provided, it will be used for the encryption. Otherwise, it will default to the fastspringexamplessII store

You can interact with the live demo [here](https://fs-encryption.herokuapp.com/).

## Requirements

- Node >= v11.0.0

## Installation
```
npm install
```

## License

MIT.

