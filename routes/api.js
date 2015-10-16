// Requirements
var express = require('express');
var router = express.Router();
var tokenAuth = require('../config/token');
var config = require('../config');
var mongoose = require('mongoose');
var Project = require('../config/project-model');

//Connexion à la base de données
mongoose.connect(config.db.server);

// Sécurité sur le header
router.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'x-access-token');
    res.header('Access-Control-Allow-Methods',
        'GET, HEAD, PUT, DELETE, POST');
    next();
});

/////////
// API //
/////////

/* GET all projects */
router.get('/', isValidToken, function(req, res) {
    console.log("[" + req.user.local.name + "] Retrieve all projects");
    Project.find({
        userId: req.user._id
    }, function(err, projects) {
        if (!err) {
            res.send(projects);
        } else res.sendStatus(404);
    })
});


/* GET specific project informations and tasks */
router.get('/:id', isValidToken, function(req, res) {
    var id = req.params.id;
    console.log("[" + req.user.local.name + "] Retrieve project " + id);
    Project.findById(id, function(err, project) {
        if (!err)
            if (project.userId == req.user._id)
                res.send(project);
            else res.sendStatus(401);
        else res.sendStatus(404);
    })
});

/* GET specific task informations */
router.get('/:idProject/:idTask', isValidToken, function(req, res) {
    var idProject = req.params.idProject,
        idTask = req.params.idTask;
    console.log("[" + req.user.local.name +
        "] Retrieve task in project " + idProject);
    Project.findById(idProject, function(err, project) {
        if (!err)
            if (project.userId == req.user._id)
                res.json(project.tasks.id(idTask));
            else res.sendStatus(401);
        else res.sendStatus(404);
    })
});

/* POST new project */
router.post('/', isValidToken, function(req, res) {
    console.log("[" + req.user.local.name + "] Add new project");
    req.body.userId = req.user._id;
    var newProject = new Project(req.body);
    newProject.save(function(err) {
        if (!err) res.json(newProject);
        else res.sendStatus(404);
    })
});

/* POST new task in a project */
router.post('/:idProject/', isValidToken, function(req, res) {
    var idProject = req.params.idProject;
    console.log("[" + req.user.local.name + "] Add a task in project " +
        idProject);
    Project.findByIdAndUpdate(idProject, {
        $addToSet: {
            "tasks": req.body
        }
    }, function(err, project) {
        handleError(err, res);
    })
});

/* PUT / update project info */
router.put('/:idProject/', isValidToken, function(req, res) {
    var idProject = req.params.idProject,
        projectUpdate = req.body;
    console.log("[" + req.user.local.name + "] Update project " +
        idProject);
    Project.findByIdAndUpdate(idProject, {
        $set: projectUpdate
    }, function(err) {
        handleError(err, res);
    })
});

/* PUT / finish a task */
router.put('/:idProject/:idTask', isValidToken, function(req, res) {
    var idProject = req.params.idProject,
        idTask = req.params.idTask;
    console.log("[" + req.user.local.name +
        "] Retrieve task in project " + idProject);
    Project.findById(idProject, function(err, project) {
        if (!err)
            if (project.userId == req.user._id) {
                project.tasks.id(idTask).done = true;
                project.tasks.id(idTask).doneDate = new Date();
                project.save(function(err) {
                    handleError(err, res);
                })
            } else res.sendStatus(401);
        else res.sendStatus(404);
    })
});


/* DELETE project */
router.delete('/:idProject/', isValidToken, function(req, res) {
    var idProject = req.params.idProject;
    console.log("[" + req.user.local.name + "] Delete project " +
        idProject);
    Project.findByIdAndRemove(idProject, function(err) {
        handleError(err, res);
    })
});

/* DELETE task in a project */
router.delete('/:idProject/:idTask', isValidToken, function(req, res) {
    var idProject = req.params.idProject,
        idTask = req.params.idTask;
    console.log("[" + req.user.local.name +
        "] Delete a task in project " + idProject);
    Project.findByIdAndUpdate(idProject, {
        $pull: {
            tasks: {
                _id: idTask
            }
        }
    }, function(err, project) {
        handleError(err, res);
    })
});

// Handle API Errors and send response
function handleError(err, res) {
    if (!err) res.json({
        result: 'success'
    });
    else res.sendStatus(400);
}

// route middleware to make sure user uses a valid auth token
function isValidToken(req, res, next) {
    // Récupération du token (plusieurs méthodes possibles)
    var token = (req.body && req.body.access_token) || (req.query &&
        req.query
        .access_token) || req.headers['x-access-token'];

    if (token)
        tokenAuth.isValid(token, function(user) {
            if (user) { // if user token is valid, carry on
                req.user = user;
                return next();
            } else // if it isn't, send error message
                console.log("Token not valid");
            res.status(401).json({
                error: 'Your token is not valid'
            });
        });
    else res.status(401).json({
        error: 'No token'
    })
}

module.exports = router;
