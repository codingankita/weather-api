var express = require("express"),
    app = express(),
    model = require("../weather-api/model"),
    port = 8008;

    //routing-process
    app.get('/',function(req,res){
        model.getData(req, function(err,data){
            res.send({
                result: (err ? 'error' : 'success'),
                err: err,
                json: data
            });
        });
    });

    //listening to the server
    app.listen(port, function(){
        console.log('Server listening on http://localhost:'+port);
    });