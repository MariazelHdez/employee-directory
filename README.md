# YG Find a government employee
App and service to find the contact information of a person who works for a Government of Yukon organization

## Development

Before starting the API server, you need to create the appropriate .env file which can be done by running `cp src/api/.env src/api/.env.development`. You must then set the appropriate values

Before starting the WEB server, you need to create the appropriate .env file which can be done by running `cp src/web/.env.sample src/web/.env.development`. You must then set the appropriate value

To develop within this environment, you must have Node.js and NPM installed on your development machine. Open two terminal windows and open one to `/src/api` and `src/web` respectively. Both the API back-end and the web front-end can be started with: `npm run start:dev`.

Once both are running, open your browser and navigate to http://localhost:8080 to view the application.

## Understanding the environment variables

Environment variables should never be checked into the repository! 

- API_PORT=(the port the API will be listening on (doesn't have to match the docker port))
- FRONTEND_URL=(the URL of the service, from browser.)
- SMTP_SERVER= (The host of your outgoing SMTP server.)
- SMTP_PORT=(SMTP Port)
- EMAIL_FROM=(The e-mail address that all e-mails will be from.)
- NAME_FROM= (The name that all e-mails will be from.)
- EMAIL_SUBJECT= (The  e-mail subject.)
- EMAIL_TO= (The e-mail address that all e-mails will be to.)
- SMTP_PASS= (The password of the service)
- DIVISIONSJSON= (URL of the API to get the information of the divisions)
- EMPLOYEEJSON= (URL of the API to get the information of the employees)
- ESRI_KEY= (Key for esri)
- APP_STAFF_DIRECTORY_URL= (URL of Directory Api server)

## Building the container image

`docker-compose -f docker-compose.production.yml up --build -d`

## Running the container in test or production

By default, the container will run in development mode, but following the step above, you can create the appropriate environment files for the instance you are targetting. Depending, the application will look for either `src/api/.env.test` or `src/api/.env.production`. To tell the API which instance to use, add the environment variable `NODE_ENV` to the docker run command like below.


`docker run -p 8080:3000 -e NODE_ENV=production --restart=on-failure Find-employee"`