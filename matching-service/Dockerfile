FROM node:22
WORKDIR /usr/src/matching-service
COPY package.json /usr/src/matching-service/package.json
COPY package-lock.json /usr/src/matching-service/package-lock.json
RUN npm install
COPY . /usr/src/matching-service
EXPOSE 5000
CMD ["npm", "run", "dev"]
