FROM node:22
WORKDIR /usr/src/user-service
COPY package.json /usr/src/user-service/package.json
COPY package-lock.json /usr/src/user-service/package-lock.json
RUN npm install
RUN npm install -g nodemon ts-node typescript
COPY . /usr/src/user-service
EXPOSE 4000
# CMD ["npm", "run", "dev"]
CMD ["sh", "-c", "npm install && npm run dev"]
