const express = require('express');
const router = express.Router();

const { getMultiple } = require('../services/filmovi');

router.get('/', getMultiple)

module.exports = router;