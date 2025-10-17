const express = require('express');
const app = express();
const port = 8080;
const swaggerUi = require('swagger-ui-express')
const yamljs = require('yamljs');
const swaggerDocument = yamljs.load('./docs/swagger.yaml')

const mongoose = require('mongoose');
const Game = require('../models/game');
 
const uri = 'mongodb+srv://User:1234@cluster0.rfetsed.mongodb.net/games-api?retryWrites=true&w=majority&appName=Cluster0'
 
 mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((error) => console.error('Error connecting to MongoDB Atlas:', error));


app.use(express.json());
//mongoose
app.get('/games', async (req, res) => {
    try {
        const games = await Game.find();
        res.json(games);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/games', async (req, res) => {
    try {
        const lastGame = await Game.findOne().sort({ id: -1 });
        const newId = lastGame ? lastGame.id + 1 : 1;
 
        const game = new Game({
            id: newId,
            name: req.body.name,
            price: req.body.price
        });
 
        const newGame = await game.save();
        res.status(201).json(newGame);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/games/:id', async (req, res) => {
    try {
        const game = await Game.findOne({ id: req.params.id });
        if (!game) return res.status(404).json({ message: 'Game not found' });
 
        game.name = req.body.name || game.name;
        game.price = req.body.price || game.price;
 
        const updatedGame = await game.save();
        res.json(updatedGame);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/games/:id', async (req, res) => {
    try {
        const result = await Game.deleteOne({ id: parseInt(req.params.id) });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Game not found' });
        }
        
        res.json({ message: 'Game deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(port, () => {
    console.log(`API up at: http://localhost:${port}`);
})

function getBaseUrl(req) {
    return req.connection && req.connection.encrypted ? 'https' : 'http' + `://${req.headers.host}:${req.headers.port}.host`
}
