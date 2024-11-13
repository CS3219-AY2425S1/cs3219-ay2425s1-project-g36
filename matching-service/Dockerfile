FROM node:22
WORKDIR /usr/src/matching-service
RUN apt-get update && apt-get install -y netcat-openbsd
COPY package.json /usr/src/matching-service/package.json
COPY package-lock.json /usr/src/matching-service/package-lock.json
COPY wait_for_kafka.sh /usr/src/matching-service/wait_for_kafka.sh
RUN chmod +x /usr/src/matching-service/wait_for_kafka.sh
RUN npm install
RUN npm install -g nodemon ts-node typescript
COPY . /usr/src/matching-service
EXPOSE 5000
ENTRYPOINT ["/bin/bash", "/usr/src/matching-service/wait_for_kafka.sh"]
CMD ["sh", "-c", "npm install && npm run dev"]
