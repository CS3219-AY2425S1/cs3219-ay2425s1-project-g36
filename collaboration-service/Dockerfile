FROM node:22
WORKDIR /usr/src/collaboration-service
RUN apt-get update && apt-get install -y netcat-openbsd
COPY package.json /usr/src/collaboration-service/package.json
COPY package-lock.json /usr/src/collaboration-service/package-lock.json
COPY wait_for_kafka.sh /usr/src/collaboration-service/wait_for_kafka.sh
RUN chmod +x /usr/src/collaboration-service/wait_for_kafka.sh
RUN npm install
RUN npm install -g nodemon ts-node typescript
COPY . /usr/src/collaboration-service
EXPOSE 3001 3002 
ENTRYPOINT ["/bin/bash", "/usr/src/collaboration-service/wait_for_kafka.sh"]
CMD ["sh", "-c", "npm install && npm run dev"]
