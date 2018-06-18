FROM node

# exec mkdir command into docker image to create a /app folder
RUN mkdir /app
# set the above folder to be ouw working directory
WORKDIR /app

# now copy ouw package.json and package-lock.json to our /app directory already created
COPY package*.json /app/

# exec `npm install` to install all packages dependencies neede into the docker image
RUN npm install

# copy all files that aren't ignore by dockerignore file to our /app directory
COPY . /app

# start our server application by executing `npm start`, this command can be found into package.json scripts
CMD ["npm", "dev-webapp"]

# let's expose our app for port number 3300
#expose 3300
