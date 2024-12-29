FROM node:22.11.0
WORKDIR /user/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3100
CMD ["npm","run","dev"]