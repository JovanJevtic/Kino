const { connectToDatabase } = require('../db/config');
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken')

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
    const connection = await connectToDatabase();
    const [emailEquieped] = await connection.query(
        `SELECT KorisnikID, Ime, Prezime, Email
        FROM Korisnik WHERE Email = '${email}'`
    );

    if (emailEquieped.length > 0) {
        connection.end();
        res.status(400);
        throw new Error('Email zauzet!')
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPwd = await bcrypt.hash(lozinka, salt);
    const token = (Math.floor(10000 + Math.random() * 90000)).toString();

    const [verifToken] = await connection.query(
        `INSERT INTO EmailVerificationToken (Ime, Prezime, Email, Lozinka, Token, Istice) VALUES (
            '${ime}', '${prezime}', '${email}', '${hashedPwd}', '${token}', DATE_ADD(NOW(), INTERVAL 24 HOUR)
        )`
    )

    if (!verifToken) {
        res.status(400);
        throw new Error('Los zahtjev, c cc c!')
    }
    
    try {
        const transporter = nodemailer.createTransport({ 
            service: 'gmail',
            auth: { 
                user: process.env.NODEMAILER_AUTH_EMAIL, 
                pass: process.env.NODEMAILER_AUTH_PWD
            } 
        });

        const mailOptions = { 
            from: process.env.NODEMAILER_AUTH_EMAIL, 
            to: email,     
            subject: 'Account Verification Code', 
            html: 'Cao,  '+ ime +',\n\n' + 'Tvoj verifikacijski kod je: ' + token  + '\n\n, Pusa!\n' 
        };

        const sendResult = await transporter.sendMail(mailOptions);
        await connection.end();
        res.status(200).json({ verifTokenId: verifToken.insertId });
    } catch (error) {
        await connection.end();
        res.status(400);
        throw new Error(error);        
    }
});

const confirmEmail = asyncHandler(async (req, res) => {
    const { verifTokenId, confirmToken } = req.body;

    if (!verifTokenId || !confirmToken) {
        res.status(400);
        throw new Error("Los zahtjev, c cc c!")
    }

    const connection = await connectToDatabase();

    try {
        connection.query(
            `DELETE FROM EmailVerificationToken WHERE Istice < Now();`
        );
        const [verifToken] = await connection.query(
            `SELECT * FROM EmailVerificationToken WHERE EmailVerificationTokenID = ${verifTokenId}`
        );

        if (verifToken.length < 1) {
            res.status(400);
            connection.end();
            throw new Error('Nesto je poslo po zlu, isprike..!')
        };
        
        if (verifToken[0].Token == confirmToken) {
            const data = {
                ime: verifToken[0].Ime,
                prezime: verifToken[0].Prezime,
                email: verifToken[0].Email,
                lozinka: verifToken[0].Lozinka
            }

            const [emailEquiped] = await connection.query(`
                SELECT KorisnikID, Ime, Prezime, Email
                FROM Korisnik WHERE Email = '${data.email}'
            `)

            if (emailEquiped.length > 0) {
                const [updated] = await connection.query(`
                    UPDATE EmailVerificationToken
                    SET ime = '${data.ime}', prezime = '${data.prezime}', email = '${data.email}', lozinka = '${data.lozinka}'
                    WHERE Email = '${emailEquiped[0].email}';
                `)

                await connection.query(`
                    DELETE FROM EmailVerificationToken WHERE Email = '${emailEquiped[0].email}'
                `)
                connection.end();

                res.status(200).json({ 
                    ime: updated[0].ime,
                    prezime: updated[0].prezime,
                    email: updated[0].email
                })
            }

           const [userInfo] = await connection.query(`
                INSERT INTO Korisnik (Ime, Prezime, Email, Lozinka) VALUES (
                    '${data.ime}', '${data.prezime}', '${data.email}', '${data.lozinka}'
                )
            `)

            const [user] = await connection.query(`
                SELECT * FROM Korisnik WHERE KorisnikID = '${userInfo.insertId}'
            `)
                    
            await connection.query(`
                DELETE FROM EmailVerificationToken WHERE EmailVerificationTokenID = '${verifTokenId}'
            `)
            connection.end();        

            
            
            res.status(201).json({ 
                ime: user[0].Ime,
                prezime: user[0].Prezime,
                email: user[0].Email,
                token: generateToken(userInfo.insertId)
            });
        } else {
            await connection.end();
            res.status(400);
            throw new Error(`Netačan kod`);
        }
    } catch (error) {
        await connection.end();
        res.status(400)
        throw new Error(error);
   }
});

const login = asyncHandler(async (req, res) => {
    const { email, lozinka } = req.body;

    if (!email || !lozinka) {
        res.status(400);
        throw new Error("Los zahtjev!");
    }

    const connection = await connectToDatabase();
    const emailExists = await connection.query(`
        SELECT * FROM Korisnik WHERE Email = '${email}'
    `)
    const user = emailExists[0][0]

    console.log(user);

    if (!user) {
        res.status(400);
        throw new Error("Pogresan unos!");
    }

    if (user && user.Lozinka && (await bcrypt.compare(lozinka, user.Lozinka))) {
        res.status(200).json({ 
            ime: user.Ime,
            prezime: user.Prezime,
            email: user.Email,
            id: user.KorisnikID,
            token: generateToken(user.KorisnikID)
        })
    } else {
        connection.end();
        res.status(400);
        throw new Error('Pogresan unos!');
    }

});

const resendConfirmEmail = asyncHandler(async (req, res) => {
    res.json({ msg: 'reconf' })

});

const me = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(404).json({message: 'Nisi prijavljen, covece!'});
    } 
    const user = req.user[0];
    console.log(user);

    res.status(200).json({ 
        ime: user.Ime,
        prezime: user.Prezime,
        email: user.Email,
        id: user.KorisnikID,
        token: generateToken(user.KorisnikID)
    });

});

module.exports = {
    register,
    login,
    confirmEmail,
    resendConfirmEmail,
    me
}