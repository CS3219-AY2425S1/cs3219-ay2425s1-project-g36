# PeerPrep Backend for Question Service - Developer Readme 

## Quick Start

- This backend service uses <b>npm</b> as the package manager
- Why not yarn? Because I was too lazy to switch to yarn

### How to run backend server

1. run `npm i` in the `backend` directory to install dependencies
2. Add the `QUESTION_SERVICE_MONGODB_URL` (which zac sent in tele chat) into the `.env` file
3. Run `npm run dev` (make sure you are in the `backend` directory)
    - If it works, you should see the following console logs in your terminal
  ```
    MongoDB URL:  <the URL>
    App connected to database
    App is listening to port: 3000
  ```
4. FYI: I used the nodemon dependency so that you can save your code changes and the backend server will automatically restart (observe your terminal for more information)

### How to run the containerized backend server with docker:
 - 1. Install docker on your device: [Docker](https://www.docker.com)
 - 2. Setup the `.env` file as the above paragraph mentioned
 - 3. Run `npm run docker-build-image` to build the image (named `question-service-image`)
 - 4. Run `npm run docker-create-container` to create a default container (named `question-service`). This will create and run the default container. Now the server should be accessible via the port `3000`.
 - 5. Run `npm run docker-start` to (re)start the already-created default container. 
 - 6. Run `npm run docker-stop` to stop the default container.
 - Note: On some Linux OS, executing docker commands may require root permission. If you see permission errors such as `permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: ...` when running any of the commands, please try adding `sudo` before the commands or run `sudo su` before running the commands.

### Things to take note if you face some issues running the application

1. If you see the following, try connecting to VPN before running the application
  ```
    querySrv ETIMEOUT _mongodb._tcp.peerprep.reijg.mongodb.net
  ```
2. Any further troubles direct to @z_acwon_g on telegram (pls dont)

### Example queries to run on Postman

1. `GET http://localhost:3000/questions`
    - Retrieves all the questions

2. `GET http://localhost:3000/questions/:id`
    - Retrieves a specific question by id

3. `POST http://localhost:3000/questions`
    - Create a question with a question JSON object
    ```
        {
            "title": "Word Search II",
            "difficulty": "hard",
            "description": "brute force is the way",
            "topics": ["brute force"]
        }
        
        {
            "title": "N queens",
            "difficulty": "hard",
            "description": "I like searching through arrays",
            "topics": ["DP", "array"]
        }
            
        {
            "title": "Longest Common Subsequence",
            "difficulty": "medium",
            "description": "DP is too easy",
            "topics": ["stack", "DP"]
        }
    ```

4. `PUT http://localhost:3000/questions/:id`
    - Update a question by id with a question JSON object

5. `DELETE http://localhost:3000/questions/:id`
    - Deletes a specific question by id