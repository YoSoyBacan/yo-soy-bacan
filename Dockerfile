FROM node:10.15.3-jessie

# Setup env
ENV NODE_ENV production

# Creating application directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install packages 
RUN npm i

#Copy Application code to app folder and environment
COPY . /usr/src/app
ENV GOOGLE_APPLICATION_CREDENTIALS /usr/src/app/src/config/service-account.json
# Bump contain heap memory
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Compile Typescript
RUN npm run build

#Expose port 8000 which the app runs on
EXPOSE 8000

CMD ["npm", "run", "do:start"]


