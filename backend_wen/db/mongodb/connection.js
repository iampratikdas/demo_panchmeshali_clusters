const { ConnectCases } = require('aws-sdk');
const mongoose = require('mongoose');
require('dotenv/config');

let conn;

const connectToMongoDB = async (connstring) => {
  try {
    // const uri = process.env.MONGO_URI ;
    conn = await mongoose.createConnection(connstring ,{
      serverSelectionTimeoutMS : 5000
    });
    console.log("Connection=========>", process.env.MONGO_URI)

    console.info('Successfully connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

const getDb = async (connstring) => {
  if (!conn) {
    await connectToMongoDB(connstring);
  }
  return conn; // Returns the Mongoose connection object
};

const getClient = async () => {
  if (!conn) {
    await connectToMongoDB();
  }
  return ConnectCases; // Returns the Mongoose instance
};

const closeMongoDBConnection = async () => {
  try {
    // console.log("useNewUrlParser=====>", conn)
    // if (mongoose.connection.readyState !== 0) {
    //   await mongoose.connection.close();
    //   console.info('MongoDB connection closed');
    // }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    throw error;
  }
};

// Handle termination signals
process.on('SIGINT', async () => {
  await closeMongoDBConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeMongoDBConnection();
  process.exit(0);
});

module.exports = {
  connectToMongoDB,
  getDb,
  getClient,
};
