# PeerPrep Backend for User Service - Developer Readme 

## Quick Start

- This backend service uses <b>npm</b> as the package manager
- Why not yarn? Because i don't like.

### How to run backend server

+ 1. Run `npm i` in the `user-service` directory to install dependencies
+ 2. Add the `USER_SERVICE_MONGODB_URL` (which max has sent in tele chat) into the `.env` file (follow .env.sample)
+ 3. Run `npm run dev` (make sure you are in the `/user-service/` directory)
    - If it works, you should see the following console logs in your terminal
  ```
        Server is running on port 4000
        MongoDB connected: ac-ofwon3u-shard-00-01.mnir8bt.mongodb.net
  ```
4. FYI: I used the nodemon dependency so that you can save your code changes and the backend server will automatically restart (observe your terminal for more information)

Credit: Zac

### How to run the containerized backend server with docker:
 - 1. Install docker on your device: [Docker](https://www.docker.com)
 - 2. Setup the `.env` file as the above paragraph mentioned
 - 3. Run `npm run docker-build-image` to build the image (named `user-service-image`)
 - 4. Run `npm run docker-create-container` to create a default container (named `user-service`). This will create and run the default container. Now the server should be accessible via the port `4000`.
 - 5. Run `npm run docker-start` to (re)start the already-created default container. 
 - 6. Run `npm run docker-stop` to stop the default container.
 - Note: On some Linux OS, executing docker commands may require root permission. If you see permission errors such as `permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: ...` when running any of the commands, please try adding `sudo` before the commands or run `sudo su` before running the commands.

 Credit: Wang Zihan
