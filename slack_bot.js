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

controller.hears(['report'], 'direct_message,direct_mention,mention', function(bot, message) {
    const parts = message.text.split(' ')
    var startdate = parts[1]
    var enddate = parts[3]
    var siteID = parts[5]
    
        if (parts.length != 6 || parts[0] !== 'report') {
            bot.reply(message, 'This is an invalid format, make sure you\'re using "report: YYYY-MM-DD to YYYY-MM-DD site: xxxxxx"')
            }
            
    console.log('-------parts length------' + parts.length)
    console.log('-------part 0------' + parts[0])
    
    var apikey = process.env.apikey
    var options = { method: 'POST',
        url: 'https://api.adzerk.net/v1/report/queue',
        headers: 
   { 'x-adzerk-apikey': apikey,
     'content-type': 'application/x-www-form-urlencoded' },
            body: `criteria={"StartDateISO":"${startdate}","EndDateISO":"${enddate}","Parameters":[{"siteId":${siteID}}],"GroupBy":[]}`
                  };
    
    console.log('------start date-------->' , startdate) 
    console.log('------end date-------->' , enddate) 
    console.log('------siteID-------->' , siteID) 


    
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
    
    console.log('------report response---------->' , reportresponse)
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
