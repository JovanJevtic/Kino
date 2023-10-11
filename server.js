const express = require("express");
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.json());

const programmingLanguagesRouter = require("./routes/filmovi");
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });
    return;
});

app.get("/", (req, res) => {
  res.json({ message: "ok" });
});

app.use("/korisnik", programmingLanguagesRouter);

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});