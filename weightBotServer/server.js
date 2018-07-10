const net = require('net');
const ip = require('ip');
var mysql = require('mysql');
var express = require("express");
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const PORT = 4242;
const ADDRESS = "10.4.0.49"; //ip.address()

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "weightbot",
    //socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
});

var myRouter = express.Router();

var clients = []; //get ip address clients[i].remoteAddress

var server = net.createServer(function(socket) {
    con.query("SELECT * FROM bot where IpAddress='" + socket.remoteAddress + "'", function(err, result, fields) {
        if (result != null) {
            var bot;
            for (var i = 0; i < result.length; i++) {
                bot = result[i];
            }
            clients.push(socket);

            action(socket.remoteAddress, null);
        }

    });

    socket.on('data', function(data) {
        console.log(data.toString('utf8'));
    });



});
server.listen(PORT, ADDRESS);
console.log(ADDRESS + " - " + PORT);


myRouter.route('/startLigneDetect/').get(function(req, res) {
      res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    broadcast("solution.py", "10.4.0.5");
    if (res.status(200)) {
        res.json("Détection de ligne");
    } else {
        res.json("Problème pas de détection de ligne");
    }
});


myRouter.route('/callBot/').get(function(req, res) {

          res.setHeader('Content-Type', 'application/json');
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var bot;

    con.query("SELECT * FROM bot b where b.State=1", function(er, r, f) {
        var botId;
        if (r.length > 0) {
            bot = r[0];
        }



        res.send(JSON.stringify({
            bot
        }));

    });
});

var paths = [];
var parentNodes = [];

myRouter.route('/moveBot/:locationId/:botId').get(function(req, res) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var locationId = parseInt(req.param('locationId'));
    var botId = parseInt(req.param('botId'));

    var bot;
    var location;

    con.query("SELECT * FROM bot where id=" + botId, (err, rows) => {
        for (var i = 0; i < rows.length; i++) {
            bot = rows[i];
        }

        con.query("SELECT * FROM location where id=" + locationId, (err, rows2) => {
            for (var i = 0; i < rows2.length; i++) {
                location = rows2[i];
            }


            var tampArray = [];
            tampArray.push(location['Id']);
            paths.push(tampArray);

            checkLocation(location['Id'], null, bot['LastLocation'], botId, res);

        });

    });
});




function checkLocation(destinationId, parentLocation, botLocation, botId, resultatApi) {


    var goodPath;

    var l;
    var bot;

    con.query("SELECT * FROM bot where id=" + botId, function(e, r, f) {
        for (var i = 0; i < r.length; i++) {
            bot = r[i];
        }
        con.query("SELECT * FROM location where id=" + destinationId, function(err, res, fields) {
            for (var j = 0; j < res.length; j++) {
                l = res[j];
            }
            var child = l['Child'].split(',');

            var isNull = true;

            var lastRightPath;

            for (var j = 0; j < paths.length; j++) {
                if (paths[j][paths[j].length - 1] == l['Id']) {
                    lastRightPath = paths[j];
                }
            }


            parentNodes.push(parseInt(l['Id']));

            for (var i = 0; i < child.length; i++) {

                if (child[i] != 'null' && !parentNodes.includes(parseInt(child[i]))) {
                    if (child[i] != botLocation) {
                        var path = [];
                        path.push(l['Id']);
                        path.push(parseInt(child[i]));

                        for (var y = 0; y < paths.length; y++) {

                            if (paths[y][paths[y].length - 1] == path[0]) {

                                path.splice(0, 1);
                                paths.push(paths[y].concat(path));

                                break;
                            }
                        }


                        checkLocation(child[i], l['Id'], botLocation, botId, resultatApi);
                    } else {
                        var path = [];
                        path.push(l['Id']);
                        path.push(parseInt(child[i]));



                        for (var y = 0; y < paths.length; y++) {
                            if (paths[y][paths[y].length - 1] == path[0]) {

                                path.splice(0, 1);
                                paths.push(paths[y].concat(path));
                                break;
                            }
                        }


                        goodPath = paths[paths.length - 1];
                        goodPath = goodPath.reverse();

                        fillAction(goodPath, botId, bot['IpAddress'], resultatApi);
                    }

                }
            }
        });
    });
}

async function fillAction(ActionArray, botId, ip, resultatApi) {

    var res = 0;
    for (var i = 1; i < ActionArray.length; i++) {


        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd
        }

        if (mm < 10) {
            mm = '0' + mm
        }

        today = yyyy + '-' + mm + '-' + dd;

        await con.query("INSERT INTO action (Date,Done,BotId,LocationId) VALUES ('" + today + "'," + 0 + "," + botId + "," + ActionArray[i] + ")", function(error) {
            if (error) {
                console.log(error);
            } else {
                res++;

                console.log("ACTION ADDED FOR BOT " + botId);



                if(res == (ActionArray.length-1))
                {
                  resultatApi.sendStatus(200);

                }

            }

        });
    }


  


    //action(ip,null);
}


myRouter.route('/receiveData/').post(function(req, res) {

      res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var data = req.body;
    if (data.status == "OK" && data.type != "demitour") {
        console.log("- solution");
        broadcast("solution.py", data.ip);
       
    } else if (data.type == "QRCODE") {
        res.sendStatus(200);
        con.query("SELECT * FROM location where Id=" + data.value, function(err, result, fields) {
            var location;
            if (result != null) {
                for (var i = 0; i < result.length; i++) {
                    location = result[i];
                }
            }

            if (location != null) {
                con.query("SELECT * from bot where IpAddress='" + data.ip + "'", function(err, result, fields) {
                    var bot;
                    if (result != null) {
                        for (var i = 0; i < result.length; i++) {
                            bot = result[i];
                        }
                    }

                    if (bot != null && location['Type'] != 0) {
                        action(data.ip, data.value);
                    } else if (bot != null && location['Type'] == 0) {
                        console.log("- demitour");
                        broadcast("demitour.py", data.ip);
                        con.connect(function(err) {
                            con.query("update bot set LastLocation=" + location['Id'] + " where Id=" + bot['Id'], function(err, result, fields) {});
                        });
                    }

                });
            }
        });
    } else {
        res.sendStatus(200);
        console.log(data.type+" executé");
    }
});

myRouter.route('/askAction/:botIp').get(function(req, res) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    action(req.param('botIp'), null);
});


myRouter.route('/getLocations/').get(function(req, res) {

    res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var location = [];
    con.connect(function(err) {
        con.query("select * from location where Type=0", function(err, result, fields) {
            if (result.length > 0) {
                for (var i = 0 - 1; i < result.length; i++) {
                    if (result[i] != null)
                        location.push(result[i]);
                }
            }

        
            res.send(location);
        });
    });
});



function action(ip, qrcode) {
    var action;
    con.connect(function(err) {
        var bot;
        con.query("SELECT * FROM bot where ipAddress='" + ip + "'", function(err, result, fields) {
            if (result != null) {
                for (var i = 0; i < result.length; i++) {
                    bot = result[i];
                }
            }

            con.query("SELECT * FROM location where Id=" + qrcode, function(err, res, fields) {
                var loc = [];
                loc['Type'] = 2;
                if (res.length > 0) {
                    for (var i = 0; i < res.length; i++) {
                        loc = res[i];
                    }
                }

                con.query("SELECT a.Id as actionId, a.Date ,a.Done , a.BotId as botId, a.LocationId, b.Name, b.State, b.IpAddress, b.LastLocation, l.Id, l.Name, l.Child, l.Type from action a left join location l on l.Id = a.LocationId left join bot b on b.Id = a.BotId where a.BotId=" + parseInt(bot["Id"]) + " and a.Done=0 order by a.Date, a.Id limit 1", function(err, r, fields) {
                    if (r != null) {
                        for (var i = 0; i < r.length; i++) {
                            action = r[i];
                        }
                    }

                    if (action != null) {
                        if (loc['Type'] == 0) //pas croisement
                        {
                            console.log("- demitour");
                            broadcast("demitour.py", bot['IpAddress']);
                        } else {

                            var id;
                            if (qrcode != null) {
                                id = qrcode;
                            } else {
                                id = bot['LastLocation'];
                            }

                            con.query("SELECT * from location where Id=" + id, (err, re) => {

                                var l;
                                if (re != null) {
                                    for (var i = 0; i < re.length; i++) {
                                        l = re[i];
                                    }
                                }

                                var tabPosition = [];
                                var tabPosition = l['Child'].split(',');

                                var positionRobot = tabPosition.indexOf(action['LastLocation'].toString());
                                var positionFinal = tabPosition.indexOf(action['LocationId'].toString());

                                for (var i = 0; i < tabPosition.length; i++) {
                                    if (positionRobot == 3) {
                                        if (positionFinal == (positionRobot - 1)) {
                                            // tourner à droite
                                            console.log("- virageDroite");
                                            broadcast("virageDroite.py", bot['IpAddress']);
                                            break;
                                        } else if (positionFinal == 0) {
                                            // tourner à gauche
                                            console.log("- virageGauche");
                                            broadcast("virageGauche.py", bot['IpAddress']);
                                            break;
                                        } else {
                                            // tout droit
                                            console.log("- toutDroit");
                                            broadcast("toutDroit.py", bot['IpAddress']);
                                            break;
                                        }
                                    } else if (positionRobot == 0) {
                                        if (positionFinal == (positionRobot + 1)) {
                                            // tourner à gauche
                                            console.log("- virageGauche");
                                            broadcast("virageGauche.py", bot['IpAddress']);
                                            break;
                                        } else if (positionFinal == 3) {
                                            // tourner à droite
                                            console.log("- virageDroite");
                                            broadcast("virageDroite.py", bot['IpAddress']);
                                            break;
                                        } else {
                                            // tout droit
                                            console.log("- toutDroit");
                                            broadcast("toutDroit.py", bot['IpAddress']);
                                            break;
                                        }
                                    } else if (positionRobot == -1) {
                                        console.log("- solution");
                                        broadcast("solution.py", bot['IpAddress']);
                                        break;
                                    } else {
                                        if (positionFinal == (positionRobot - 1)) {
                                            //tourner à droite
                                            console.log("- virageDroite");
                                            broadcast("virageDroite.py", bot['IpAddress']);
                                            break;
                                        } else if (positionFinal == (positionRobot + 1)) {
                                            //tourner à gauche
                                            console.log("- virageGauche");
                                            broadcast("virageGauche.py", bot['IpAddress']);
                                            break;
                                        } else {
                                            //tout droit
                                            console.log("- toutDroit");
                                            broadcast("toutDroit.py", bot['IpAddress']);
                                            break;
                                        }
                                    }
                                }
                                con.query("update bot set LastLocation=" + id + " where Id=" + action['botId'], function(err, result, fields) {});
                                con.query("update action set Done=1 where Id=" + action['actionId'], function(err, result, fields) {});
                            });
                        }
                    }
                });
            });
        });
    });
}


myRouter.route('/stopMotor/').get(function(req, res) {
      res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    broadcast("-stopMotor");
    if (res.status(200)) {
        res.json("Arrêt moteurs");
    } else {
        res.json("Moteurs non arrêtés");
    }
});

myRouter.route('/startMotor/').get(function(req, res) {
      res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    broadcast("- motor.py");

    if (res.status(200)) {
        res.json("Moteurs démarrés");
    } else {
        res.json("Moteurs non démarrés");
    }
});

myRouter.route('/stopRobot/').get(function(req, res) {
      res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    broadcast("- stopRobot");
    if (res.status(200)) {
        res.json("Tous les scripts arrêtés");
    } else {
        res.json("Pas de scripts arrêtés");
    }
});

app.use(myRouter);
app.listen(1337, ADDRESS, function() {});

function broadcast(message, receiver) {
    clients.forEach(function(client) {
        if (client.remoteAddress == receiver) {
            client.write(message);
        }
    });
}


function clone(obj) {
    try {
        var copy = JSON.parse(JSON.stringify(obj));
    } catch (ex) {

    }
    return copy;
}