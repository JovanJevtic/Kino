const mysql = require('mysql2/promise');
const asyncHandler = require('express-async-handler');

const dbConfig = {
  host: 'kino.c2pgawguqiep.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'cveceisplin',
  database: 'kino',
  // connectTimeout: 60000
};

async function connectToDatabase() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to the database');
    return connection;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
}

module.exports = { connectToDatabase };