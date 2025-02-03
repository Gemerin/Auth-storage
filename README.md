# Auth service

The auth service is responsible for handling accounts and handing out JWTs upon successful authentication.

## Multiple MongoDB instances

It is recommended that each service runs its MongoDB instance on the production server even though it would be possible to use the same one or an existing one on the production server. The reason for this is that services in microservice architectures should strive to be loosely coupled so that they can be developed, deployed, and scaled independently.

You can start different containers of the same image on the production server or on localhost to achieve this.
