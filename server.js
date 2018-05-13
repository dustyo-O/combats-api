const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3333;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

require('./app/routes')(app);

app.listen(port, () => {
    console.log('We are live on ' + port);
});
