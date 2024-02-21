# Use Node 18 Alpine for a lightweight image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock to leverage Docker cache
COPY package.json yarn.lock ./

# Install project dependencies using Yarn
RUN yarn install --frozen-lockfile

# Bundle app source
COPY . .

# Expose port 3000 for the application
EXPOSE 3000

# Define the command to run the app
CMD ["yarn", "run", "start:prod"]
