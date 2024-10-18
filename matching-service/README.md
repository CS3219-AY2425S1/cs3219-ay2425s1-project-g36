# PeerPrep Backend for Matching Service - Developer Readme

## Quick Start
 - Install `npm` on your device.

### Running the backend server
 - Run `npm i` in `./matching-service` to install the dependencies.
 - Use the `.env` file to change `FRONTEND_ADDRESS` and `PORT` if necessary (or the backend will use the default values `FRONTEND_ADDRESS=http://localhost:5173` and `PORT=5000`).
 - Run `npm run dev` in `./matching-service`. If it works, you will see `Server started. Port = xxxx` in the console.

### How to run the containerized backend server with docker:
 - 1. Install docker on your device: [Docker](https://www.docker.com)
 - 2. Setup the `.env` file as the above paragraph mentioned
 - 3. Run `npm run docker-build-image` to build the image (named `matching-service-image`)
 - 4. Run `npm run docker-create-container` to create a default container (named `matching-service`). This will create and run the default container. Now the server should be accessible via the port `5000`.
 - 5. Run `npm run docker-start` to (re)start the already-created default container. 
 - 6. Run `npm run docker-stop` to stop the default container.
 - Note: On some Linux OS, executing docker commands may require root permission. If you see permission errors such as `permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: ...` when running any of the commands, please try adding `sudo` before the commands or run `sudo su` before running the commands.
