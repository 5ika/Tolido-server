var mongoose = require('mongoose');

var taskScheme = mongoose.Schema({
    name: String,
    group: String,
    priority: {
        type: String,
        default: "todo"
    },
    labels: [String],
    done: {
        type: Boolean,
        default: false
    },
    doneDate: Date
});

exports.scheme = taskScheme;
exports.model = mongoose.model('Task', taskScheme);
