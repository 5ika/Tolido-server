# Tolido - Serveur

Ce programme est nécessaire au fonctionnement de l'application Tolido.

Il gère l'API REST ainsi que la sauvegarde des données.

## Installation
Tolido Serveur utilise MongoDB pour gérer les données. Il est nécessaire de l'installer au préalable.

```
sudo apt-get install nodejs npm mongodb
npm install -g bower
git clone https://github.com/5ika/Tolido-server.git
cd tolido-server
npm install && bower install
npm start
```
