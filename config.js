var os = require("os");

var config = {
    // App infos
    app: {
        name: "Tolido",
        port: 3000
    },
    // Base de données
    db: {
        server: 'mongodb://localhost/tolido'
    },
    client: 'http://' + os.hostname() + ':5050' // Utiliser pour la redirection après l'enregistrement d'un utilisateur
}
module.exports = config;
