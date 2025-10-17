const vue = Vue.createApp({
                data() {
                    return {
                    gameInModal: { name: null },
                    games: []
                    }
                },
                async created() {
                    this.games = await (await fetch('http://localhost:8080/games')).json();
                },
                methods: {
                    getGame: async function (id) {
                        this.gameInModal = await (await fetch(`http://localhost:8080/games/${id}`)).json();
                        $('#gameInfoModal').modal('show');
                    }
                }
            }).mount('#app');