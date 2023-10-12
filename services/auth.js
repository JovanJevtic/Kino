const { connectToDatabase } = require('../db/config');
const asyncHandler = require('express-async-handler')

// const connection = await connectToDatabase();
//     const [rows] = await connection.query(
//         `SELECT KorisnikID, Ime, Prezime, Email
//         FROM Korisnik`
//     );
//     await connection.end();
//     res.json(rows);

//* Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    })
}

const register = asyncHandler(async (req, res) => {
    const { email, ime, prezime, lozinka } = req.body;
    
    if (!lozinka || !ime || !prezime || !email)  { 
        res.status(400);
        throw new Error('Sva polja su neophodna!');
    }
    console.log('email', email);

    const connection = await connectToDatabase();
    const [emailEquieped] = await connection.query(
        `SELECT KorisnikID, Ime, Prezime, Email
        FROM Korisnik WHERE Email = '${email}'`
    );
    connection.end()

    if (emailEquieped.length > 0) {
        res.status(400);
        throw new Error('Email zauzet!')
    }
    res.json('Email nije zauzet!');
});

const login = asyncHandler(async (req, res) => {
    res.json({ msg: 'Login' })
});

const confirmEmail = asyncHandler(async (req, res) => {
    res.json({ msg: 'conf' })

});

const resendConfirmEmail = asyncHandler(async (req, res) => {
    res.json({ msg: 'reconf' })

});

const me = asyncHandler(async (req, res) => {
    res.json({ msg: 'blubp' })

});

module.exports = {
    register,
    login,
    confirmEmail,
    resendConfirmEmail,
    me
}