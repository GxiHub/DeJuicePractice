MongoClient = require('mongodb').MongoClient;

var db;

MongoClient.connect('mongodb://dejuice_employee:mini0306@ds157487.mlab.com:57487/dejuice_employee', function(err, databaseEmployee){
  if (err) return console.log(err);
  db_employee = databaseEmployee;
}) 

exports.timeset = function(req,callback)
{
	  var salary = [];
	  var hour_checkout,minute_checkout,daily_salary,workPeriod;
	  db_employee.collection('dejuice_employee').find().toArray(function(err, results) {
	      if (err) return console.log(err);

		  for(var i=0; i<results.length; i++){
		  	  hour_checkout = 0;
		  	  minute_checkout = 0;
		  	  daily_salary = 0;
		  	  workPeriod = 0;
		  	  updatestatus = false;
			  for(var j=i+1; j<results.length; j++){

					if( (results[j].employee_name == results[i].employee_name) && 
						(results[j].year == results[i].year)&& 
						(results[j].month == results[i].month)&& 
						(results[j].day == results[i].day) &&
						(results[j].worktype == '下班')
						){
							hour_checkout = results[j].hour;
							minute_checkout = results[j].minute;
							offline=results[j].hour+':'+results[j].minute;
							workPeriod = (parseInt(hour_checkout,10)*60+parseInt(minute_checkout,10))-(parseInt(results[i].hour,10)*60+parseInt(results[i].minute,10));
							daily_salary = Math.round(workPeriod*126/60, 10);
							updatestatus = true;
							break;
						}
				}
				if(results[i].CountTag == 'no' && results[i].worktype == '上班' && updatestatus == true){
					  db_employee.collection('dejuice_employee').findOneAndUpdate({timeID:parseInt(results[i].timeID,10)},{
					    $set: 
					    {
					      CountTag: 'yes',
					      DailySalary: daily_salary,
					      OfflineHour: hour_checkout,
					      OfflineMinute: minute_checkout
					    }
					  },{
					      upsert: false
					  },(err, result) => {
					    if (err) return res.send(err)
					  });
				}
				
			}
	  });
	  
}

