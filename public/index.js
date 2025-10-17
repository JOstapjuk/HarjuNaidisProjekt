const express = require('express');
const cors = require('cors');
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

app.use(cors());
app.use(express.json());

const games = [
    {id:1, name:"Witcher 3", price:29.99},
    {id:2, name:"Cyberpunk 2077", price:59.99},
    {id:3, name:"Minecraft", price:26.99},
    {id:4, name:"Counter-Strike: Global Offensive", price:0},
    {id:5, name:"Roblox", price:0},
    {id:6, name:"Grand Theft Auto V", price:29.99},
    {id:7, name:"Valorant", price:0},
    {id:8, name:"Forza Horizon 5", price:59.99}
]

app.get('/games', (req, res) => {
    res.send(games)
})

app.get('/games/:id', (req, res) => {
    if (typeof (req.params.id) === 'undefined') {
        return res.status(404).send({error: 'Game not found'})
    }

    res.send(games[req.params.id - 1])
})

app.post('/games', (req, res) => {
    if(!req.body.name || !req.body.price) {
        return res.status(400).send({error: 'One or all params are missing'})
    }
    let game = {
        id: games.length + 1,
        name: req.body.name,
        price: req.body.price,
    };

    games.push(game)

    res.status(201)
        .location(`${getBaseUrl(req)}/games/${games.length}`)
        .send(game)
})

app.delete('/games/:id', (req, res) => {
    if (typeof (req.params.id) === 'undefined') {
        return res.status(404).send({error: 'Game not found'})
    }
    games.splice(req.params.id - 1, 1);

    res.status(204).send({error: 'No content'})
})

app.put('/games/:id', (req, res) => {
    if (typeof (req.params.id) === 'undefined') {
        return res.status(404).send({error: 'Game not found'})
    }
    
    const id = parseInt(req.params.id);
    const index = games.findIndex(game => game.id === id);
    
    if (index === -1) {
        return res.status(404).send({error: 'Game not found'})
    }
    
    if(!req.body.name || !req.body.price) {
        return res.status(400).send({error: 'One or all params are missing'})
    }
    
    games[index] = {
        id: id,
        name: req.body.name,
        price: req.body.price
    };
    
    res.send(games[index]);
})

//mongoose
app.get('/games2', async (req, res) => {
    try {
        const games = await Game.find();
        res.json(games);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/games2', async (req, res) => {
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

app.put('/games2/:id', async (req, res) => {
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

app.delete('/games2/:id', async (req, res) => {
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
