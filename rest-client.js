const vue = Vue.createApp({
    data() {
        return {
            gameInModal: { name: null },
            games: [],
            newGame: { name: '', price: 0 },
            sortKey: 'name',
            sortOrder: 'asc'
        }
    },
    async created() {
        this.games = await (await fetch('http://localhost:8080/games')).json();
    },
    computed: {
        sortedGames() {
            return [...this.games].sort((a, b) => {
                let modifier = this.sortOrder === 'asc' ? 1 : -1;
                if (a[this.sortKey] < b[this.sortKey]) return -1 * modifier;
                if (a[this.sortKey] > b[this.sortKey]) return 1 * modifier;
                return 0;
            });
        }
    },
    methods: {
        setSort(key) {
            if (this.sortKey === key) {
                this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortKey = key;
                this.sortOrder = 'asc';
            }
        },
        getGame: async function (id) {
            this.gameInModal = await (await fetch(`http://localhost:8080/games/${id}`)).json();
            $('#gameInfoModal').modal('show');
        },
        addGame: async function (gameData) {
            const response = await fetch('http://localhost:8080/games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gameData)
            });
            
            if (response.ok) {
                const newGame = await response.json();
                this.games.push(newGame);
            } else {
                console.error('Failed to add game');
            }
        },
        addGameAndClose: async function () {
            await this.addGame(this.newGame);
            this.newGame = { name: '', price: 0 };
            $('#addGameModal').modal('hide');
        },
        deleteGame: async function (id) {
            const response = await fetch(`http://localhost:8080/games/${id}`, {
                method: 'DELETE'
            });
           
            if (response.ok) {
                this.games = this.games.filter(game => game.id !== id);
                $('#gameInfoModal').modal('hide');
            } else {
                console.error('Failed to delete game');
            }
        },
        updateGame: async function (id, updatedData) {
            const dataToSend = {
                ...updatedData,
                price: parseFloat(updatedData.price)
            };
            
            const response = await fetch(`http://localhost:8080/games/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            });
        
            if (response.ok) {
                const updatedGame = await response.json();
                const index = this.games.findIndex(game => game.id === id);
                if (index !== -1) {
                    this.games[index] = { ...updatedGame };
                }
                $('#gameInfoModal').modal('hide');
            } else {
                console.error('Failed to update game');
                const errorText = await response.text();
                console.error('Error details:', errorText);
            }
        }
    }
}).mount('#app');