if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

if (!process.env.apikey) {
    console.log('Error: Specify API Key in environment');
    process.exit(1);
}

var Botkit = require('./lib/Botkit.js');
var os = require('os');
var request = require('request');

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

controller.hears(['Pull a report', 'report'], 'direct_message,direct_mention,mention', function(bot, message) {
    var apikey = process.env.apikey
    var options = { method: 'POST',
        url: 'https://api.adzerk.net/v1/report/queue',
        headers: 
   { 'x-adzerk-apikey': apikey,
     'content-type': 'application/x-www-form-urlencoded' },
            body: 'criteria={"StartDateISO":"2017-01-01","EndDateISO":"2017-01-24","Parameters":[{"siteId":687249}],"GroupBy":[]}' };
   
    
request(options, function (error, response, body) {
  if (error) throw new Error(error);

      var report = JSON.parse(response.body)
      var reportID = report.Id

    setTimeout(function() {

            console.log('------reportID-------->' , reportID) 
            bot.reply(message, 'ReportID:  ' + reportID)
    
function checkforreport () {
 
    var options = { method: 'GET',
        url: 'https://api.adzerk.net/v1/report/queue/' + reportID,
        apikey: process.env.apikey,
        headers: 
   { 'x-adzerk-apikey': apikey,
     'content-type': 'application/json' }, 
             }
    
    request(options, function (error, response, body) {
        if (error) throw new Error(error);   
    
    var reportresponse = JSON.parse(response.body)
    var reportstatus = reportresponse.Status
    
    console.log('------reportstatus---------->' , reportstatus)

	if (reportstatus != 2) {
		setTimeout(checkforreport, 10000)
    } else {
        
     var impressionresponse = JSON.parse(response.body)
     var impressionsdelivered = impressionresponse.Result.TotalImpressions
    
    console.log('------impressionreponse---------->' , impressionresponse)
    console.log('------impressiondelivered---------->' , impressionsdelivered)
        bot.reply(message, 'Total Impressions:   ' + impressionsdelivered);
           }
	                       }
                                                    
            )
}

checkforreport()

})
    
    

}, 1000);

    });
