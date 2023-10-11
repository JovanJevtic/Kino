const { connectToDatabase } = require('../db/config');

async function getMultiple(){
  const connection = await connectToDatabase();

  try {
    const [rows] = await connection.query(
        `SELECT KorisnikID, Ime, Prezime, Email
        FROM Korisnik`
    );
    connection.close();
    return rows;
  } catch (error) {
    console.error('Error querying the database:', error);
    connection.close();
  }
}

module.exports = {
  getMultiple
}