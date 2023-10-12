const { connectToDatabase } = require('../db/config');
const asyncHandler = require('express-async-handler')

const getMultiple = asyncHandler(async (req, res) => {
    const connection = await connectToDatabase();
    const [rows] = await connection.query(
        `SELECT KorisnikID, Ime, Prezime, Email
        FROM Korisnik`
    );
    await connection.end();
    res.json(rows);
});

module.exports = {
  getMultiple
}