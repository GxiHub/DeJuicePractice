//var http = require('http');
express = require('express');
bodyParser = require('body-parser');
MongoClient = require('mongodb').MongoClient;
MongoEmployee= require('mongodb').MongoClient;
path = require('path');
moment = require('moment');
databaseSalary = require('./db');

app = express(); 

//app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.urlencoded({extended:true}));

app.engine('html', require('ejs').renderFile);

var db;
var db_employee;

// Here is data base connecting
MongoEmployee.connect('mongodb://_dejuice:mini0306@ds157987.mlab.com:57987/dejuice', function(err, database){
  if (err) return console.log(err);
  db = database;
  app.listen(8080, function(){
    console.log('listening on 8080');
  })
}) 

MongoClient.connect('mongodb://dejuice_employee:mini0306@ds157487.mlab.com:57487/dejuice_employee', function(err, databaseEmployee){
  if (err) return console.log(err);
  db_employee = databaseEmployee;
}) 
//============================================================


// Enter main system structure
app.get('/',function(req,res){
  db.collection('_dejuice').find().toArray(function(err, results) {
      res.render('index.ejs',{_dejuice:results});
  });
});

// Enter emplpyee system
app.post('/WorkHours/Check/',function(req,res){
  db_employee.collection('dejuice_employee').find().toArray(function(err, results) {
      res.render('EmployeeSalary.ejs',{dejuice_employee:results});
  });
});

// Count employee salary
app.post('/WorkHours/Show/',function(req,res){
  console.log('Show month period = ',req.body.checkPeriod);
  db_employee.collection('dejuice_employee').find().toArray(function(err, results) {
      res.render('ShowSalary.ejs',{dejuice_employee:results,PeriodYear:req.body.checkPeriodyear,PeriodMonth:req.body.checkPeriodmonth,PeriodName:req.body.employee_name});
  });
});

// Count employee salary
app.post('/ShowAllSalaryForSingleMonth/',function(req,res){
  console.log('Show month period = ',req.body.checkPeriod);
  db_employee.collection('dejuice_employee').find().toArray(function(err, results) {
      res.render('ShowAllSalary.ejs',{dejuice_employee:results,PeriodYear:req.body.checkPeriodyear,PeriodMonth:req.body.checkPeriodmonth,PeriodName:req.body.employee_name});
  });
});

// Count employee salary
app.post('/RunningAccount/',function(req,res){
  db.collection('_dejuice').find().toArray(function(err, results) {
      res.render('./../partials/EachItemList.ejs',{_dejuice:results});
  });
});

app.post('/ProfitCount/',function(req,res){
  var data = [];
  function GetDate(callback){
      db.collection('_dejuice').find().toArray(function(err, results) {
      //res.render('ProfitCount.ejs',{_dejuice:results,PeriodYear:req.body.checkPeriodyear,PeriodMonth:req.body.checkPeriodmonth});
        if(err){
          console.log(err);
        }
        else if(results.length>0){
          console.log(results);
          data.push(results);
          callback();
        }
      });
  }
  

});

//============================================================

// Store data into employee data base 
app.post('/WorkHours/',function(req,res){
    db_employee.collection('dejuice_employee').save({timeID:Date.now(),year:req.body.year,month:req.body.month,day:req.body.day,hour:req.body.hour,minute:req.body.minute,worktype:req.body.worktype,employee_name:req.body.employee_name,CountTag:'no'},function(error,result){
      if(error)return console.log (error);
      console.log('saved to database');
    });
    db_employee.collection('dejuice_employee').find().toArray(function(err, results) {
      res.render('EmployeeSalary.ejs',{dejuice_employee:results});
    });
});

// Store data into acoount data base
app.post('/running_account/',function(req,res){
    db.collection('_dejuice').save({timeID:Date.now(),year:req.body.year,month:req.body.month,day:req.body.day,income:req.body.income,class:req.body.class,number:req.body.number,amount:req.body.amount,item:req.body.item,note:req.body.note},function(error,result){
      if(error)return console.log (error);
      console.log('saved to database');
    });
    db.collection('_dejuice').find().toArray(function(err, results) {
      res.render('./../partials/EachItemList.ejs',{_dejuice:results});
    });
});

//============================================================

// Delete data from data base via data unique id
app.post('/delete/', (req, res) => {
  console.log('delete once  = ',req.body.timeID);
  //db.collection('_dejuice').findOneAndDelete({name:parseInt(req.body.timeID,10)},
  db.collection('_dejuice').findOneAndDelete({timeID:parseInt(req.body.timeID,10)},
  (err, result) => {
    if (err) return res.send(500, err);
     res.redirect('/');
  });
});

// Delete employee data from data base via data unique id
app.post('/delete/EmployeeSalary/', (req, res) => {
  console.log('delete work employee salary  = ',req.body.timeID);
  db_employee.collection('dejuice_employee').findOneAndDelete({timeID:parseInt(req.body.timeID,10)},
  (err, result) => {
    if (err) return res.send(500, err);
    db_employee.collection('dejuice_employee').find().toArray(function(err, results) {
      res.render('EmployeeSalary.ejs',{dejuice_employee:results});
    });
  });
});

//============================================================

app.post('/update', (req, res) => {
  db_employee.collection('dejuice_employee').findOneAndUpdate({timeID:parseInt(req.body.timeID,10)},{
    $set: 
    {
      CountTag: req.body.CountTag
    }
  },{
      upsert: false
  },(err, result) => {
    if (err) return res.send(err)
     db_employee.collection('dejuice_employee').find().toArray(function(err, results) {
       res.render('ShowSalary.ejs',{dejuice_employee:results});
     });

  });
});

app.post('/update/Salary/', (req, res) => {
  databaseSalary.timeset(req,function(error,results){
      if(error)return console.log (error);
      //console.log('saved to database ',JSON.stringify(results[0]));
  });
  res.redirect('/');
});
