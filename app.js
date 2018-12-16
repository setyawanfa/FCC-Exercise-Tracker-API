let mongoose = require('mongoose');
require('dotenv').config();
var Schema = mongoose.Schema;
var person = new Schema({
    username: String
});
var exercise = new Schema({
    username: String,
    desc: String,
    dur: Number,
    dat: Date
});
var persontostore = mongoose.model('userlist', person);
var exercisetostore = mongoose.model('exerciselist', exercise);
module.exports = function (app) {
    console.log(process.env.MLAB_URI)

    mongoose.connect(process.env.MLAB_URI, { useMongoClient: true }, function (err) {
        if (err) {
            console.log("There is some problem with the connection " + err)
        }
        else {
            console.log("Connection run successfully")
        }

        function saveperson(req, res) {
            var user = req.body.username;
            if (user == null) {
                res.json({ "error": "fill the user name" });
            }
            else {
                var userdata = new persontostore({ username: user });
                userdata.save(function (err, data) {
                    if (err) {
                        console.log("error on storing data : " + err);
                    }
                    else {
                        res.json('success');
                    }
                })
            }
        }

        function insertdata(req, res) {
            var user = req.body.userId;
            var description = req.body.description;
            var duration = req.body.duration;
            var date = req.body.date;

            if (user != null && description != null && duration != null && date != null) {
                persontostore.findOne({ username: user }, function (err, obj) {
                    if (err) {
                        res.send("There is no such username");
                    }
                    else {
                    var exercisedata = new exercisetostore({username : user, desc : description, dur : duration, dat : date});
                    
                    exercisedata.save(function(err,data){
                        if(err){
                            console.log("error on storing data : " + err);
                        }
                        else{
                            res.send("Saving complete");
                        }
                    })
                }
                })

            }
        }

        function loaddata(req, res){
            let userid = req.params.userId;
            let from = new Date(req.params.from);
            let to = new Date(req.params.to);
            let limit = req.params.limit;
            const query = {};
            if(userid == undefined ){
                res.send("UserId is required");
            }
            else{
                persontostore.findOne({usename : userid},function(err,obj){
                    if(err){
                        res.send("There is no such userid")
                    }
                    else{
                        if(from !== undefined){
                            from = new Date(from);
                            query.date = { $gte : from};
                        }

                        if(to !== undefined){
                            from = new Date(to);
                            query.date = {$lt : to};
                        }

                        if(limit !== undefined){
                            limit = Number(limit);
                        }
                        query.username = userid;

                        exercisetostore.find(query).select(' username desc dat dur ').limit(limit).exec((err,data)=>{
                            if(err){
                                res.send('error while searaching result');
                            }
                            else {
                                res.json(data);
                            }
                        })
                    }
                })
            }
        }
    })

}