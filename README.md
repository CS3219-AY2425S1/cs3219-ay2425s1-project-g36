[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/bzPrOe11)
# CS3219 Project (PeerPrep) - AY2425S1
## Group: G36

### Running the Docker Compose file to run microservices easily
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) if you haven't already. This should contain Docker, as well as the Docker Compose service that allows multiple Docker containers to be run easily.
2. Open Docker Desktop.
3. Setup the two environment variable files in `./user-service/.env` and `./question-service/.env` using the `.env.sample` template found within these folders.
4. Setup the environment variable file `./.env` with the port numbers you want to use for the respective frontend and backend services using the `./.env.sample` template. Defaults are `3000` for `question-service`, `4000` for `user-service`, `5000` for `matching-service`, and `5173` for frontend.
5. Run the command `docker compose build --no-cache` to build the Dockerfiles for the user service and question service. This should create new Docker images for the user service (`cs3219-ay2425s1-project-g36-user`) and the question service (`cs3219-ay2425s1-project-g36-question`).
6. Run the command `docker compose up -d` to run the user and question services together.
7. You should be able to visit the user service on `http://localhost:4000` and the question service on `http://localhost:3000`. You may test by viewing the question list on `http://localhost:3000/questions`.
8. To stop running the user and question service in the Docker containers, you may run the command `docker compose down`.
9. To reflect code changes, you can `docker compose down` then `docker compose up -d` again to restart the backend services.

### Note: 
- You can choose to develop individual microservices within separate folders within this repository **OR** use individual repositories (all public) for each microservice. 
- In the latter scenario, you should enable sub-modules on this GitHub classroom repository to manage the development/deployment **AND** add your mentor to the individual repositories as a collaborator. 
- The teaching team should be given access to the repositories as we may require viewing the history of the repository in case of any disputes or disagreements. 
