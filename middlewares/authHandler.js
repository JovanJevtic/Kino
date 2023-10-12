const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { connectToDatabase } = require('../db/config');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]

            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            const connection = await connectToDatabase();
            const [row] = await connection.query(
                `SELECT KorisnikID, Ime, Prezime, Email
                FROM Korisnik WHERE KorisnikID = ${decoded.id}`
            );
            connection.close();
            req.user = row
            console.log(row)

            next()
        } catch (error) {
            res.status(401)
            throw new Error('Pristup zabranjen!')
        }
    } else {
        res.status(401)
        throw new Error('Pristup zabranjen!')
    }
});

module.exports = { protect }