const express = require('express');

const app = express();

app.get('/', (req, res) => res.send('API running'));

const PORT = process.env.PORT || 27015;

app.listen(PORT, () => console.log(`Server starter on port ${PORT}`));