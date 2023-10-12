const express = require("express");
require('dotenv').config();
const helmet = require('helmet');
const cors = require('cors')

const app = express();

const PORT = process.env.PORT || 3000;

app.use(helmet());

app.use(cors({
    // origin: ['http://localhost:8100', 'https://eventotest-b521f.web.app', 'http://localhost'],
    origin: true,
    credentials: true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', require('./routes/auth'))
app.use("/api/filmovi", require("./routes/filmovi"));
app.use('/api/projekcije', require('./routes/projekcije'))
app.use('/api/sjedista', require('./routes/sjedista'))
app.use('/api/sale', require('./routes/sale'))
app.use('/api/rezervacije', require('./routes/rezervacije'))

app.use(require('./middlewares/errorHandler'));

app.listen(PORT, () => {
  console.log(`app listening at http://localhost:${PORT}`);
});