var mongoose = require('mongoose');
var taskScheme = require('./task-model').scheme;

var projectScheme = mongoose.Schema({
    name: String,
    description: String,
    date: {
        type: Date,
        default: Date.now
    },
    category: String,
    tasks: [taskScheme],
    userId: String
});

module.exports = mongoose.model('Project', projectScheme);
