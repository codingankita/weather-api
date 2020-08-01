var async = require("async"),
    https = require("https"),
    pg = require("pg"),
    conString = "postgres://postgres_username:postgres_password@127.0.0.1:5432/my_db",
    pool = new pg.Pool({
        connectionString: conString
    });

function getData(req,res){
    async.waterfall([
        function(cb){
            var d = new Date(),
            date = d.getDate();
            //validation for date
            if(parseInt(date) == 0 || parseInt(date) == 1){
                cb("Date is not prime so no date")
            }else{
                checkPrime(date, function(err,isprime){
                    if(isprime == 'true' || isprime == true){
                        cb(null);
                    }else{
                        cb("Date is not prime so no date.")
                    }
                })
            }
        },
        function(cb){
            //requesting weather-api for data 
            var options = {
                headers: {"X-API-Key": "918688c1d6d1547065ab42ae4e302644"},
                hostname:  "api.openweathermap.org",
                path: "/data/2.5/weather?q=London",
                method: 'GET'
                };
                var request = https.get(options, function (res) {
                    var data = '';
                    var ret = [];
                    res.on('data', function (chunk) {
                        data += chunk;
                    });
                    res.on('end', function () {
                        console.log("Response by weather-api :",data)
                        cb(null,data)
                    });                     
            }).on("error", function(err){
                console.log("Error: ", err.message);
                cb(err.message)
            });
		request.end();
        },
        function(data,cb){
            //adding audit data in database
            data = JSON.parse(data);
            var qry = "INSERT INTO weather_data (weather_id, main_weather, max_temprature, min_temprature, feels_like, city) "
                qry += "VALUES ("+data.weather[0].id+","+data.weather[0].main+","+data.main.temp_min+","+data.main.temp_max+","+data.main.feels_like+")"
            pool.connect(function(err, client, done) {
                if (err) {
                    console.log("not able to get connection " + err);
                    cb(err);
                }
                client.query(qry, function(err, result) {
                    if (err) {
                        console.log('Query error.',err);
                        cb('Query error.');
                        }
                        else {
                        cb(null,data);
                        }
                        done();
                });
            });
        }
    ],function(err,data){
        if(err){
            res(err)
        }else{
            res(data)
        }
    })
}

function checkPrime(n,cb){        
    var i, flag = true; 
    n = parseInt(n) 
    for (i = 2; i <= n - 1; i++){
        if (n % i == 0) { 
            flag = false; 
            break; 
        } 
    } 
    cb(null,flag);
} 

module.exports = {getData : getData};