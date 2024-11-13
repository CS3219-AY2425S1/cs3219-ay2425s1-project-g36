FROM node:22
WORKDIR /usr/src/frontend
COPY package.json /usr/src/frontend/package.json
COPY yarn.lock /usr/src/frontend/yarn.lock
RUN yarn
COPY . /usr/src/frontend
RUN yarn global add vite
EXPOSE 5173
CMD ["yarn", "dev", "--host", "0.0.0.0"]
