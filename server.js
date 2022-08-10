const express = require('express');

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

app.use('/api', require('./routes/api'));

app.get('/', (req, res) => res.send('Hello world!'));

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});