import express from 'express';
import path from 'path';

const app = express();

let serverPath = path.resolve();
let buildPath = path.join(serverPath, '../../build');

app.use(express.static(serverPath));
app.use(express.static(buildPath));


app.get('/', (req, res, next) => {
    res.sendFile('index.html');
});


app.listen(3333, () => console.log('Listening on port: 3333'));
