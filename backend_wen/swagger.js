const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Panchmeshali',
    version: '1.0.0',
    description: 'All Apis listed here',
  },servers: [
      {
        url: "http://localhost:8600/api/", // Adjust if needed
      },
    ],
};

const options = {
  swaggerDefinition,
   
  apis: ['./Route/PatientAppRoutes/*.js', './Route/CareGiverRoutes/*.js', './utils/docs/swaggerdocs.js'], // Path to the API routes in your Node.js application
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
