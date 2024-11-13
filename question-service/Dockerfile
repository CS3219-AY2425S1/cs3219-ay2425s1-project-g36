FROM node:22
WORKDIR /usr/src/question-service
COPY package.json /usr/src/question-service/package.json
COPY package-lock.json /usr/src/question-service/package-lock.json
RUN npm install
COPY . /usr/src/question-service
EXPOSE 3000
CMD ["sh", "-c", "npm install && npm run dev"]
