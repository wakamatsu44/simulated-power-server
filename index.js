var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:false}));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
//  response.writeHead(200,{'Content-Type': 'text/plain'});
//  response.end('Hello World\n');
    response.send(request.query);
});

app.post('/v1/init', function(request, response) {
    response.writeHead(200,{'Content-Type': 'application/json'});
    var sendData = {
      info:{
        powcon:[{devKind:0,type:'1_SA099T01'}],
        sensor:null,
        tradeSens:null
      },
      protocol:{
        powcon:0,
        sensor:null,
        tradeSens:null
      },
      outputCtl:{
        enableCtl:1,
        id:'08900000000000000100300016',
        systemCapacity:'10.0',
        panelCapacity:'10.0',
        ctlTime:'600',
        scheduleServer:'re-ene.yonden.co.jp /schedulesend/ 443',
        NTPServer:'re-ene.yonden.co.jp 123'
      }
    };
    response.end(JSON.stringify(sendData));
});

app.post('/', function(request, response) {
  if (request.body.schedule_kbn == 0000) {

    if (request.body.power_plant_id == 00000000000000000000000000) {
      var dt0 = new Date();
      dt0.setTime(dt0.getTime()+32400000);	// +9h
      var day0 = dt0.getDate();

      if ((day0 % 2) == 0)
        return LoadUpdateSchedule_2(response);
      else
        return LoadUpdateSchedule_1(response);
    //} else if (request.body.power_plant_id == '10000000000000000000000010'){
    //  return LoadUpdateSchedule_Kyuden_14_1_8_A(response, request);
      //return LoadUpdateSchedule_Kyuden(response, request);
    //} else if (request.body.power_plant_id == '00000000000000000000000082'){
    //  return LoadUpdateSchedule_Kyuden_New(response, request);
    //} else if (request.body.power_plant_id == '10000000000000000000000010'){
    //  return LoadUpdateSchedule_Kyuden_14_1_8_A(response, request);
      //return LoadUpdateSchedule_Kyuden_14_1_9(response, request);
    } else if (request.body.power_plant_id == '00000000000000000000000046'){
       return LoadUpdateSchedule_Kyuden_30min(response, request);
    } else if (request.body.power_plant_id == '00000000000000000000000073'){
        return LoadUpdateSchedule_Kyuden_30min(response, request);
    } else if (request.body.power_plant_id == '00000000000000000000000082'){
        return LoadUpdateSchedule_Kyuden_30min_100per(response, request);
        //return LoadUpdateSchedule_Kyuden_30min(response, request);
    } else if (request.body.power_plant_id == '00000000000000000000000091'){
        return LoadUpdateSchedule_Kyuden_30min_JET(response, request);
    } else if (request.body.power_plant_id == '00000000000000000000000107'){
      return 0;
    } else {
      return LoadUpdateSchedule_Kyuden(response, request);
      //return LoadUpdateSchedule_Kyuden_14_1_8_A(response, request);
    }
    //  return LoadUpdateSchedule_3(response);



//    if (request.body.power_plant_id == 00000000000000000000000000)
    response.writeHead(200,{'Content-Type': 'multipart/mixed;boundary="BOUNDARY"'});
//    else
//      response.writeHead(406,{'Content-Type': 'multipart/mixed;boundary="BOUNDARY"'});
    response.write('--BOUNDARY\n');
    response.write('Content-Length: 412\n');
    response.write('Content-Type: application/octet-stream\n');
    response.write('Content-Disposition: attachment; filename=203_0000.data\n');
    response.write('\n');

    var daily;
    if (request.body.power_plant_id == 00000000000000000000000000)
      daily = new Buffer(dailyTestDataNew(0));
    else
      daily = new Buffer(dailyTestDataNew(3));

    var cnt = new Buffer(6);
    cnt[0] = 0;
    cnt[1] = 0;
    cnt[2] = 0;
    cnt[3] = 0;
    cnt[4] = 0;
    cnt[5] = 1;
    response.write(cnt);

    var no = new Buffer(10);
    no.fill(0);
    response.write(no);

    var id = new Buffer(26);
    for (var i = 0; i < 26; i++)
      id[i] = request.body.power_plant_id[i];
    response.write(id);

    var buf = new Buffer(370);
    var offset = 0;
    var dt1 = new Date();
    dt1.setTime(dt1.getTime()+32400000);	// +9h
    var year1 = dt1.getFullYear();
    var month1 = dt1.getMonth() + 1;
    var day1 = dt1.getDate();

    buf[offset+0] = year1 / 1000;
    buf[offset+1] = (year1 / 100) % 10;
    buf[offset+2] = (year1 / 10) % 10;
    buf[offset+3] = year1 % 10;
    buf[offset+4] = month1 / 10;
    buf[offset+5] = month1 % 10;
    buf[offset+6] = day1 / 10;
    buf[offset+7] = day1 % 10;

    buf[offset+8] = 0;
    buf[offset+9] = 0;
    buf[offset+10] = 0;
    buf[offset+11] = 0;
/*
    buf[offset+8] = 1;
    buf[offset+9] = 5;
    buf[offset+10] = 0;
    buf[offset+11] = 0;
*/
    offset += 12;

    if (request.body.power_plant_id == 00000000000000000000000000) {
      buf[offset+0] = 0;
      buf[offset+1] = 0;

      buf[offset+2] = 3;
      buf[offset+3] = 3;
      buf[offset+4] = 6;
/*
      buf[offset+2] = 0;
      buf[offset+3] = 0;
      buf[offset+4] = 5;
*/
      offset += 5;

      var length = 336;
      //var length = 5;
      var sum = 0;
      for (var i = 0; i < length; i++) {
        buf[offset+i] = daily[i%48];
        //buf[offset+i] = daily[i];
        sum += buf[offset+i];
      }
      offset += length;
    } else {
      buf[offset+0] = 0;
      buf[offset+1] = 0;
      buf[offset+2] = 0;
      buf[offset+3] = 2;
      buf[offset+4] = 9;
      offset += 5;

      var length = 29;
      var sum = 0;
      for (var i = 0; i < length; i++) {
        buf[offset+i] = daily[i%48];
        sum += buf[offset+i];
      }
      offset += length;
    }

//    buf[offset+0] = dt1.getHours() % 10;
    buf[offset+0] = 4;
    offset += 1;

    var mod = sum % (month1 + day1);
    buf[offset+0] = ((mod % 100) / 10);
    buf[offset+1] = (mod % 10);
    offset += 2;

    var dt2 = new Date();
    dt2.setTime(dt2.getTime()+32400000+1800000);	// +9h+0.5h
    var year2 = dt2.getFullYear();
    var month2 = dt2.getMonth() + 1;
//    var month2 = dt2.getMonth();
    var day2 = dt2.getDate();
    var hour2 = dt2.getHours();
    var min2 = dt2.getMinutes()

    buf[offset+0] = year2 / 1000;
    buf[offset+1] = (year2 / 100) % 10;
    buf[offset+2] = (year2 / 10) % 10;
    buf[offset+3] = year2 % 10;
    buf[offset+4] = month2 / 10;
    buf[offset+5] = month2 % 10;
    buf[offset+6] = day2 / 10;
    buf[offset+7] = day2 % 10;

    buf[offset+8] = hour2 / 10;
    buf[offset+9] = hour2 % 10;
    buf[offset+10] = min2 / 10;
    buf[offset+11] = min2 % 10;
/*
    buf[offset+8] = 1;
    buf[offset+9] = 7;
    buf[offset+10] = 3;
    buf[offset+11] = 0;
*/
    buf[offset+12] = 0;
    buf[offset+13] = 0;
    offset += 14;

    response.write(buf);
    response.write('\n');
    response.end('--BOUNDARY--\n');
  } else if (9990 <= request.body.schedule_kbn && request.body.schedule_kbn <= 9999) {
    response.writeHead(200,{'Content-Type': 'multipart/mixed;boundary="BOUNDARY"'});
    response.write('--BOUNDARY\n');
    response.write('Content-Length: 20065\n');
    response.write('Content-Type: application/octet-stream\n');
    if (request.body.power_plant_id == 00000000000000000000000000) {
      response.write('Content-Disposition: attachment; filename=201_');
      response.write(request.body.schedule_kbn);
      response.write('.data\n');
//      response.write('Content-Disposition: attachment; filename=ERR_0000.data\n');
//      response.write('\n');
//      response.write('E0001\n');
//      response.end('--BOUNDARY--\n');
//      return;
    } else {
      response.write('Content-Disposition: attachment; filename=201_');
      response.write(request.body.schedule_kbn);
      response.write('.data\n');
    }
    response.write('\n');

    var cnt = new Buffer(6);
    cnt[0] = 0;
    cnt[1] = 0;
    cnt[2] = 0;
    cnt[3] = 0;
    cnt[4] = 1;
    cnt[5] = 3;
    response.write(cnt);

    var dt = new Date();
    dt.setTime(dt.getTime()+32400000);	// +9h
    var year = dt.getFullYear();
    var month = dt.getMonth() + 1;

    var no = new Buffer(10);
    no.fill(0);

    var id = new Buffer(26);
    for (var i = 0; i < 26; i++)
      id[i] = request.body.power_plant_id[i];

    if (request.body.power_plant_id == '10000000000000000000000010') {
      year = 2018;
      month = 2;
    }
    for (var i = 0; i < 13; i++) {
      response.write(no);
      response.write(id);

      if (request.body.power_plant_id == 00000000000000000000000000) {
        response.write(monthlyTestData(year, month, 0));
      } else if (request.body.power_plant_id == '10000000000000000000000010') {
        //response.write(monthlyTestData_14_1_9(year, month, 0));
        response.write(monthlyTestData_14_1_9(year, month, 2));
      } else {
        response.write(monthlyTestData(year, month, 0));
      }
      if (month < 12) {
        month += 1;
      } else {
        month = 1;
        year += 1;
      }
    }

    response.write('\n');
    response.end('--BOUNDARY--\n');
  } else if (request.body.schedule_kbn == 8888) {
    response.writeHead(200,{'Content-Type': 'multipart/mixed;boundary="BOUNDARY"'});
    response.write('--BOUNDARY\n');
    response.write('Content-Length: 33\n');
    response.write('Content-Type: application/octet-stream\n');
    response.write('Content-Disposition: attachment; filename=301_0000.data\n');
    response.write('\r\n');

    var cnt = new Buffer(6);
    cnt[0] = 0;
    cnt[1] = 0;
    cnt[2] = 0;
    cnt[3] = 0;
    cnt[4] = 0;
    cnt[5] = 1;
    response.write(cnt);

    var id = new Buffer(26);
    for (var i = 0; i < 26; i++)
      id[i] = request.body.power_plant_id[i];
    response.write(id);

    var regist = new Buffer(1);
    regist[0] = 0;
    response.write(regist);

    response.end('\n');
  } else {
    response.writeHead(200,{'Content-Type': 'multipart/mixed;boundary="BOUNDARY"'});
    response.write('--BOUNDARY\n');
    response.write('Content-Length: 1549\n');
    response.write('Content-Type: application/octet-stream\n');
    response.write('Content-Disposition: attachment; filename=202_');
    response.write(request.body.schedule_kbn);
    response.write('.data\n');
    response.write('\n');

    var cnt = new Buffer(6);
    cnt[0] = 0;
    cnt[1] = 0;
    cnt[2] = 0;
    cnt[3] = 0;
    cnt[4] = 0;
    cnt[5] = 1;
    response.write(cnt);

    var no = new Buffer(10);
    no.fill(0);
    response.write(no);

    var id = new Buffer(26);
    for (var i = 0; i < 26; i++)
      id[i] = request.body.power_plant_id[i];
    response.write(id);

    var year = 2000 + (request.body.schedule_kbn / 100);
    var month = request.body.schedule_kbn % 100;
    if (request.body.power_plant_id == 00000000000000000000000000)
      response.write(monthlyTestData(year, month, 0));
    else
      response.write(monthlyTestData(year, month, 0));

    response.write('\n');
    response.end('--BOUNDARY--\n');
  }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function LoadUpdateSchedule_1(response) {
  var dt0 = new Date();
  dt0.setTime(dt0.getTime()+32400000);	// +9h
  var hour0 = dt0.getHours();
  var min0 = dt0.getMinutes()

  response.writeHead(200,{'Content-Type': 'multipart/mixed;boundary="BOUNDARY"'});
  response.write('--BOUNDARY\n');
  response.write('Content-Length: 110\n');
  response.write('Content-Type: application/octet-stream\n');
  response.write('Content-Disposition: attachment; filename=203_0000.data\n');
  response.write('\n');

//  if ((hour0 <= 14) || (hour0 <= 15 && min0 <= 30)) {
  if ((hour0 <= 14) || (hour0 <= 17 && min0 <= 30)) {
    var daily = new Buffer(17);
    daily[0] = 100;
    daily[1] = 100;
    daily[2] = 100;
    daily[3] = 80;
    daily[4] = 80;
    daily[5] = 100;
    daily[6] = 100;
    daily[7] = 80;
    daily[8] = 80;
    daily[9] = 100;
    daily[10] = 100;
    daily[11] = 80;
    daily[12] = 80;
    daily[13] = 100;
    daily[14] = 100;
    daily[15] = 100;
    daily[16] = 100;
  } else {
    var daily = new Buffer(33);
    daily.fill(100);
    daily[0] = 0;
    daily[1] = 0;
  }

  var cnt = new Buffer(6);
  cnt[0] = 0;
  cnt[1] = 0;
  cnt[2] = 0;
  cnt[3] = 0;
  cnt[4] = 0;
  cnt[5] = 1;
  response.write(cnt);


  var no = new Buffer(10);
  no.fill(0);
  response.write(no);

  var id = new Buffer(26);
  id.fill(0);
  response.write(id);

  var buf = new Buffer(67);
  var offset = 0;
  var dt1 = new Date();
  dt1.setTime(dt1.getTime()+32400000);	// +9h
  var year1 = dt1.getFullYear();
  var month1 = dt1.getMonth() + 1;
  var day1 = dt1.getDate();

  if ((hour0 <= 14) || (hour0 <= 15 && min0 <= 30)) {
    buf[offset+0] = year1 / 1000;
    buf[offset+1] = (year1 / 100) % 10;
    buf[offset+2] = (year1 / 10) % 10;
    buf[offset+3] = year1 % 10;
    buf[offset+4] = month1 / 10;
    buf[offset+5] = month1 % 10;
    buf[offset+6] = day1 / 10;
    buf[offset+7] = day1 % 10;
    buf[offset+8] = 0;
    buf[offset+9] = 8;
    buf[offset+10] = 3;
    buf[offset+11] = 0;
    offset += 12;

    buf[offset+0] = 0;
    buf[offset+1] = 0;
    buf[offset+2] = 0;
    buf[offset+3] = 1;
    buf[offset+4] = 7;
    offset += 5;

    var length = 17;
    var sum = 0;
    for (var i = 0; i < length; i++) {
      buf[offset+i] = daily[i];
      sum += buf[offset+i];
    }
    offset += length;
  } else {
    buf[offset+0] = year1 / 1000;
    buf[offset+1] = (year1 / 100) % 10;
    buf[offset+2] = (year1 / 10) % 10;
    buf[offset+3] = year1 % 10;
    buf[offset+4] = month1 / 10;
    buf[offset+5] = month1 % 10;
    buf[offset+6] = day1 / 10;
    buf[offset+7] = day1 % 10;
    buf[offset+8] = 1;
    buf[offset+9] = 6;
    buf[offset+10] = 3;
    buf[offset+11] = 0;
    offset += 12;

    buf[offset+0] = 0;
    buf[offset+1] = 0;
    buf[offset+2] = 0;
    buf[offset+3] = 3;
    buf[offset+4] = 3;
    offset += 5;

    var length = 33;
    var sum = 0;
    for (var i = 0; i < length; i++) {
      buf[offset+i] = daily[i];
      sum += buf[offset+i];
    }
    offset += length;
  }

  buf[offset+0] = day1 % 10;
  offset += 1;

  var mod = sum % (month1 + day1);
  buf[offset+0] = ((mod % 100) / 10);
  buf[offset+1] = (mod % 10);
  offset += 2;

  var dt2 = new Date();
  dt2.setTime(dt2.getTime()+32400000);	// +9h
  var year2 = dt2.getFullYear();
  var month2 = dt2.getMonth() + 1;
  var day2 = dt2.getDate();

  if ((hour0 <= 14) || (hour0 <= 15 && min0 <= 30)) {
    buf[offset+0] = year2 / 1000;
    buf[offset+1] = (year2 / 100) % 10;
    buf[offset+2] = (year2 / 10) % 10;
    buf[offset+3] = year2 % 10;
    buf[offset+4] = month2 / 10;
    buf[offset+5] = month2 % 10;
    buf[offset+6] = day2 / 10;
    buf[offset+7] = day2 % 10;
    buf[offset+8] = 1;
    buf[offset+9] = 6;
    buf[offset+10] = 0;
    buf[offset+11] = 0;
    buf[offset+12] = 0;
    buf[offset+13] = 0;
    offset += 14;
  } else {
    dt2.setTime(dt2.getTime()+3600000*24);	// 次の日
    year2 = dt2.getFullYear();
    month2 = dt2.getMonth() + 1;
    day2 = dt2.getDate();

    buf[offset+0] = year2 / 1000;
    buf[offset+1] = (year2 / 100) % 10;
    buf[offset+2] = (year2 / 10) % 10;
    buf[offset+3] = year2 % 10;
    buf[offset+4] = month2 / 10;
    buf[offset+5] = month2 % 10;
    buf[offset+6] = day2 / 10;
    buf[offset+7] = day2 % 10;
    buf[offset+8] = 0;
    buf[offset+9] = 8;
    buf[offset+10] = 0;
    buf[offset+11] = 0;
    buf[offset+12] = 0;
    buf[offset+13] = 0;
    offset += 14;
  }

  response.write(buf);
  response.write('\n');
  response.end('--BOUNDARY--\n');
}

function LoadUpdateSchedule_2(response) {
  var dt0 = new Date();
  dt0.setTime(dt0.getTime()+32400000);	// +9h
  var hour0 = dt0.getHours();
  var min0 = dt0.getMinutes()
  if (((11 <= hour0) && ((hour0 <= 13) || (hour0 <= 14 && min0 <= 29))) || (15 <= hour0 && hour0 <= 22)) {
    response.writeHead(200,{'Content-Type': 'multipart/mixed;boundary="BOUNDARY"'});
    response.write('--BOUNDARY\n');
    response.write('Content-Length: 5\n');
    response.write('Content-Type: application/octet-stream\n');
    response.write('Content-Disposition: attachment; filename=ERR_0000.data\n');
    response.write('\n');
    response.write('E0003 配信する更新スケジュールが存在しません\n');
    response.end('--BOUNDARY--\n');
    return;
  }

  response.writeHead(200,{'Content-Type': 'multipart/mixed;boundary="BOUNDARY"'});
  response.write('--BOUNDARY\n');
  response.write('Content-Length: 101\n');
  response.write('Content-Type: application/octet-stream\n');
  response.write('Content-Disposition: attachment; filename=203_0000.data\n');
  response.write('\n');

  if (23 <= hour0) {
    var daily = new Buffer(19);
    daily.fill(100);
  }
  else if (14 <= hour0) {
    var daily = new Buffer(2);
    daily.fill(0);
  } else {
    var daily = new Buffer(8);
    daily.fill(0);
    daily[0] = 100;
    daily[1] = 100;
    daily[2] = 100;
  }

  var cnt = new Buffer(6);
  cnt[0] = 0;
  cnt[1] = 0;
  cnt[2] = 0;
  cnt[3] = 0;
  cnt[4] = 0;
  cnt[5] = 1;
  response.write(cnt);

  var no = new Buffer(10);
  no.fill(0);
  response.write(no);

  var id = new Buffer(26);
  id.fill(0);
  response.write(id);

  var buf = new Buffer(53);
  var offset = 0;
  var dt1 = new Date();
  dt1.setTime(dt1.getTime()+32400000);	// +9h
  var year1 = dt1.getFullYear();
  var month1 = dt1.getMonth() + 1;
  var day1 = dt1.getDate();

  if (23 <= hour0) {
    buf[offset+0] = year1 / 1000;
    buf[offset+1] = (year1 / 100) % 10;
    buf[offset+2] = (year1 / 10) % 10;
    buf[offset+3] = year1 % 10;
    buf[offset+4] = month1 / 10;
    buf[offset+5] = month1 % 10;
    buf[offset+6] = day1 / 10;
    buf[offset+7] = day1 % 10;
    buf[offset+8] = 2;
    buf[offset+9] = 3;
    buf[offset+10] = 3;
    buf[offset+11] = 0;
    offset += 12;

    buf[offset+0] = 0;
    buf[offset+1] = 0;
    buf[offset+2] = 0;
    buf[offset+3] = 1;
    buf[offset+4] = 9;
    offset += 5;

    var length = 19;
    var sum = 0;
    for (var i = 0; i < length; i++) {
      buf[offset+i] = daily[i];
      sum += buf[offset+i];
    }
    offset += length;
  } else if (14 <= hour0) {
    buf[offset+0] = year1 / 1000;
    buf[offset+1] = (year1 / 100) % 10;
    buf[offset+2] = (year1 / 10) % 10;
    buf[offset+3] = year1 % 10;
    buf[offset+4] = month1 / 10;
    buf[offset+5] = month1 % 10;
    buf[offset+6] = day1 / 10;
    buf[offset+7] = day1 % 10;
    buf[offset+8] = 1;
    buf[offset+9] = 5;
    buf[offset+10] = 0;
    buf[offset+11] = 0;
    offset += 12;

    buf[offset+0] = 0;
    buf[offset+1] = 0;
    buf[offset+2] = 0;
    buf[offset+3] = 0;
    buf[offset+4] = 2;
    offset += 5;

    var length = 2;
    var sum = 0;
    for (var i = 0; i < length; i++) {
      buf[offset+i] = daily[i];
      sum += buf[offset+i];
    }
    offset += length;
  }
  else {
    buf[offset+0] = year1 / 1000;
    buf[offset+1] = (year1 / 100) % 10;
    buf[offset+2] = (year1 / 10) % 10;
    buf[offset+3] = year1 % 10;
    buf[offset+4] = month1 / 10;
    buf[offset+5] = month1 % 10;
    buf[offset+6] = day1 / 10;
    buf[offset+7] = day1 % 10;
    buf[offset+8] = 0;
    buf[offset+9] = 8;
    buf[offset+10] = 3;
    buf[offset+11] = 0;
    offset += 12;

    buf[offset+0] = 0;
    buf[offset+1] = 0;
    buf[offset+2] = 0;
    buf[offset+3] = 0;
    buf[offset+4] = 8;
    offset += 5;

    var length = 8;
    var sum = 0;
    for (var i = 0; i < length; i++) {
      buf[offset+i] = daily[i];
      sum += buf[offset+i];
    }
    offset += length;
  }

  buf[offset+0] = day1 % 10;
  offset += 1;

  var mod = sum % (month1 + day1);
  buf[offset+0] = ((mod % 100) / 10);
  buf[offset+1] = (mod % 10);
  offset += 2;

  var dt2 = new Date();
  dt2.setTime(dt2.getTime()+32400000);	// +9h
  var year2 = dt2.getFullYear();
  var month2 = dt2.getMonth() + 1;
  var day2 = dt2.getDate();

  if (23 <= hour0) {
    dt2.setTime(dt2.getTime()+3600000*24);	// 次の日
    year2 = dt2.getFullYear();
    month2 = dt2.getMonth() + 1;
    day2 = dt2.getDate();

    buf[offset+0] = year2 / 1000;
    buf[offset+1] = (year2 / 100) % 10;
    buf[offset+2] = (year2 / 10) % 10;
    buf[offset+3] = year2 % 10;
    buf[offset+4] = month2 / 10;
    buf[offset+5] = month2 % 10;
    buf[offset+6] = day2 / 10;
    buf[offset+7] = day2 % 10;
    buf[offset+8] = 0;
    buf[offset+9] = 8;
    buf[offset+10] = 0;
    buf[offset+11] = 0;
    buf[offset+12] = 0;
    buf[offset+13] = 0;
    offset += 14;
  } else if (14 <= hour0) {
    buf[offset+0] = year2 / 1000;
    buf[offset+1] = (year2 / 100) % 10;
    buf[offset+2] = (year2 / 10) % 10;
    buf[offset+3] = year2 % 10;
    buf[offset+4] = month2 / 10;
    buf[offset+5] = month2 % 10;
    buf[offset+6] = day2 / 10;
    buf[offset+7] = day2 % 10;
    buf[offset+8] = 2;
    buf[offset+9] = 3;
    buf[offset+10] = 0;
    buf[offset+11] = 0;
    buf[offset+12] = 0;
    buf[offset+13] = 0;
    offset += 14;
  } else {
    buf[offset+0] = year2 / 1000;
    buf[offset+1] = (year2 / 100) % 10;
    buf[offset+2] = (year2 / 10) % 10;
    buf[offset+3] = year2 % 10;
    buf[offset+4] = month2 / 10;
    buf[offset+5] = month2 % 10;
    buf[offset+6] = day2 / 10;
    buf[offset+7] = day2 % 10;
    buf[offset+8] = 1;
    buf[offset+9] = 1;
    buf[offset+10] = 3;
    buf[offset+11] = 0;
    buf[offset+12] = 0;
    buf[offset+13] = 0;
    offset += 14;
  }

  response.write(buf);
  response.write('\n');
  response.end('--BOUNDARY--\n');
}

function LoadUpdateSchedule_3(response) {
  var dt0 = new Date();
  dt0.setTime(dt0.getTime()+32400000);	// +9h
  var hour0 = dt0.getHours();
  var min0 = dt0.getMinutes()

  response.writeHead(200,{'Content-Type': 'multipart/mixed;boundary="BOUNDARY"'});
  response.write('--BOUNDARY\n');
  response.write('Content-Length: 110\n');
  response.write('Content-Type: application/octet-stream\n');
  response.write('Content-Disposition: attachment; filename=203_0000.data\n');
  response.write('\n');

//  if ((hour0 <= 14) || (hour0 <= 15 && min0 <= 30)) {
//  if ((hour0 <= 14) || (hour0 <= 17 && min0 <= 30)) {
    var daily = new Buffer(17);
    daily[0] = 100;
    daily[1] = 100;
    daily[2] = 100;
    daily[3] = 20;
    daily[4] = 20;
    daily[5] = 50;
    daily[6] = 50;
    daily[7] = 100;
    daily[8] = 100;
    daily[9] = 0;
    daily[10] = 0;
    daily[11] = 50;
    daily[12] = 50;
    daily[13] = 20;
    daily[14] = 20;
    daily[15] = 100;
    daily[16] = 100;
//  } else {
//    var daily = new Buffer(33);
//    daily.fill(100);
//    daily[0] = 0;
//    daily[1] = 0;
//  }

  var cnt = new Buffer(6);
  cnt[0] = 0;
  cnt[1] = 0;
  cnt[2] = 0;
  cnt[3] = 0;
  cnt[4] = 0;
  cnt[5] = 1;
  response.write(cnt);

  var no = new Buffer(10);
  no.fill(0);
  response.write(no);

  var id = new Buffer(26);
  id.fill(0);
  response.write(id);

  var buf = new Buffer(67);
  var offset = 0;
  var dt1 = new Date();
  dt1.setTime(dt1.getTime()+32400000);	// +9h
  var year1 = dt1.getFullYear();
  var month1 = dt1.getMonth() + 1;
  var day1 = dt1.getDate();


  buf[offset+0] = year1 / 1000;
  buf[offset+1] = (year1 / 100) % 10;
  buf[offset+2] = (year1 / 10) % 10;
  buf[offset+3] = year1 % 10;
  buf[offset+4] = month1 / 10;
  buf[offset+5] = month1 % 10;
  buf[offset+6] = day1 / 10;
  buf[offset+7] = day1 % 10;
  buf[offset+8] = 1;
  buf[offset+9] = 9;
  buf[offset+10] = 3;
  buf[offset+11] = 0;
  offset += 12;

  buf[offset+0] = 0;
  buf[offset+1] = 0;
  buf[offset+2] = 0;
  buf[offset+3] = 1;
  buf[offset+4] = 7;
  offset += 5;

  var length = 17;
  var sum = 0;
  for (var i = 0; i < length; i++) {
    buf[offset+i] = daily[i];
    sum += buf[offset+i];
  }
  offset += length;


  buf[offset+0] = day1 % 10;
  offset += 1;

  var mod = sum % (month1 + day1);
  buf[offset+0] = ((mod % 100) / 10);
  buf[offset+1] = (mod % 10);
  offset += 2;

  var dt2 = new Date();
  //dt2.setTime(dt2.getTime()+32400000);	// +9h
  dt2.setTime(dt2.getTime()+3600000*24);	// 次の日
  var year2 = dt2.getFullYear();
  var month2 = dt2.getMonth() + 1;
  var day2 = dt2.getDate();

  buf[offset+0] = year2 / 1000;
  buf[offset+1] = (year2 / 100) % 10;
  buf[offset+2] = (year2 / 10) % 10;
  buf[offset+3] = year2 % 10;
  buf[offset+4] = month2 / 10;
  buf[offset+5] = month2 % 10;
  buf[offset+6] = day2 / 10;
  buf[offset+7] = day2 % 10;
  buf[offset+8] = 0;
  buf[offset+9] = 3;
  buf[offset+10] = 3;
  buf[offset+11] = 0;
  buf[offset+12] = 0;
  buf[offset+13] = 0;
  offset += 14;

  response.write(buf);
  response.write('\n');
  response.end('--BOUNDARY--\n');
}


function monthlyData(year, month) {

    var dt = new Date(year,month,0);
    var days = dt.getDate();
    var length = days * 48;
    var buf = new Buffer(19+length);
    var offset = 0;

    buf[offset+0] = year / 1000;
    buf[offset+1] = (year / 100) % 10;
    buf[offset+2] = (year / 10) % 10;
    buf[offset+3] = year % 10;
    buf[offset+4] = month / 10;
    buf[offset+5] = month % 10;
    buf[offset+6] = 0;
    buf[offset+7] = 1;
    buf[offset+8] = 0;
    buf[offset+9] = 0;
    buf[offset+10] = 0;
    buf[offset+11] = 0;
    offset += 12;

    buf[offset+0] = 0;
    buf[offset+1] = length / 1000;
    buf[offset+2] = (length / 100) % 10;
    buf[offset+3] = (length / 10) % 10;
    buf[offset+4] = length % 10;
    offset += 5;

    var sum = 0;
    for (var i = 0; i < length; i++) {
      buf[offset+i] = ((9 - (i % 10)) * 10 + 0);
      sum += buf[offset+i];
    }
    offset += length;

    var mod = sum % (month + 1);
    buf[offset+0] = ((mod % 100) / 10);
    buf[offset+1] = (mod % 10);
    offset += 2;

    return buf;
}
function LoadUpdateSchedule_Kyuden(response, request) {
  var dt0 = new Date();
  dt0.setTime(dt0.getTime()+32400000);	// +9h
  var hour0 = dt0.getHours();
  var min0 = dt0.getMinutes();



  var updsche = new Buffer(48);
  updsche[0] = 100;  //00:00
  updsche[1] = 100;  //00:30
  updsche[2] = 100;  //01:00
  updsche[3] = 100;  //01:30
  updsche[4] = 100;  //02:00
  updsche[5] = 100;  //02:30
  updsche[6] = 100;  //03:00
  updsche[7] = 100;  //03:30
  updsche[8] = 100;  //04:00
  updsche[9] = 100;  //04:30
  updsche[10] = 100; //05:00
  updsche[11] = 100; //05:30
  updsche[12] = 100; //06:00
  updsche[13] = 100; //06:30
  updsche[14] = 100; //07:00
  updsche[15] = 98;  //07:30
  updsche[16] = 96;  //08:00
  updsche[17] = 90;  //08:30

  updsche[18] = 90;  //09:00
  updsche[19] = 80;  //09:30
  updsche[20] = 62;  //10:00
  updsche[21] = 50;  //10:30
  updsche[22] = 24;  //11:00
  updsche[23] = 0;   //11:30
  updsche[24] = 0;   //12:00
  updsche[25] = 0;   //12:30
  updsche[26] = 16;  //13:00
  updsche[27] = 20;  //13:30
  updsche[28] = 30;  //14:00
  updsche[29] = 30;  //14:30

  updsche[30] = 40;  //15:00
  updsche[31] = 40;  //15:30
  updsche[32] = 50;  //16:00
  updsche[33] = 70;  //16:30
  updsche[34] = 90;  //17:00
  updsche[35] = 95;  //17:30
  updsche[36] = 98;  //18:00
  updsche[37] = 100; //18:30
  updsche[38] = 100; //19:00
  updsche[39] = 100; //19:30
  updsche[40] = 100; //20:00
  updsche[41] = 100; //20:30
  updsche[42] = 100; //21:00
  updsche[43] = 100; //21:30
  updsche[44] = 100; //22:00
  updsche[45] = 100; //22:30
  updsche[46] = 100; //23:00
  updsche[47] = 100; //23:30

  var staidx = 0;
  if (hour0 == 23 && min0 >= 30) {
    staidx = 0;
    endidx = 21;
  } else {
    staidx = hour0 * 2 + 1;
    if (min0 >= 30) {
      staidx = staidx + 1;
    }
    if (hour0 < 10) {
      endidx = 21;
    }
    if (hour0 >= 10 && hour0 < 16) {
      endidx = 33;
    }
    if (hour0 >= 16) {
      endidx = 47;
    }
  }
  var idx = 0;
  if (endidx == 47) {
    idx = endidx - staidx + 23;
  } else {
    idx = endidx - staidx + 1;
  }

  console.log(staidx);
  console.log(endidx);
  console.log(idx);

  var daily = new Buffer(idx);

  for (var ii = 0; ii < idx; ii++) {
    if ((staidx + ii) > 47) {
      daily[ii] = updsche[staidx + ii - 48];
    } else {
      daily[ii] = updsche[staidx + ii];
    }
  }

  var cnt = new Buffer(6);
  cnt[0] = 0;
  cnt[1] = 0;
  cnt[2] = 0;
  cnt[3] = 0;
  cnt[4] = 0;
  cnt[5] = 1;


  var no = new Buffer(10);
  no.fill(0);


  var id = new Buffer(26);
  for (ii = 0; ii < 26; ii++)
    id[ii] = request.body.power_plant_id[ii];


  var buf = new Buffer(34 + idx);
  var offset = 0;
  var dt1 = new Date();
  dt1.setTime(dt1.getTime()+32400000 + 1800000);	// +9h + 30
  var year1 = dt1.getFullYear();
  var month1 = dt1.getMonth() + 1;
  var day1 = dt1.getDate();
  var hour1 = dt1.getHours();

  buf[offset+0] = year1 / 1000;
  buf[offset+1] = (year1 / 100) % 10;
  buf[offset+2] = (year1 / 10) % 10;
  buf[offset+3] = year1 % 10;
  buf[offset+4] = month1 / 10;
  buf[offset+5] = month1 % 10;
  buf[offset+6] = day1 / 10;
  buf[offset+7] = day1 % 10;
  buf[offset+8] = hour1 / 10;
  buf[offset+9] = hour1 % 10;
  if (min0 >= 30) {
    buf[offset+10] = 0;
    buf[offset+11] = 0;
  } else {
    buf[offset+10] = 3;
    buf[offset+11] = 0;
  }
  offset += 12;

  buf[offset+0] = 0;
  buf[offset+1] = 0;
  buf[offset+2] = 0;
  buf[offset+3] = idx / 10;
  buf[offset+4] = idx % 10;
  offset += 5;

//    var length = 33;
  var sum = 0;
  for (var i = 0; i < idx; i++) {
    buf[offset+i] = daily[i];
    sum += buf[offset+i];
  }
  offset += idx;


  //buf[offset+0] = day1 % 10;
  buf[offset+0] = 0;
  offset += 1;

  var mod = sum % (month1 + day1);
  buf[offset+0] = ((mod % 100) / 10);
  buf[offset+1] = (mod % 10);
  offset += 2;

  var dt2 = new Date();
  dt2.setTime(dt2.getTime()+32400000);	// +9h
  var year2 = dt2.getFullYear();
  var month2 = dt2.getMonth() + 1;
  if (hour0 >= 16) {
    dt2.setDate(dt2.getDate() + 1);
  }
  var day2 = dt2.getDate();

  buf[offset+0] = year2 / 1000;
  buf[offset+1] = (year2 / 100) % 10;
  buf[offset+2] = (year2 / 10) % 10;
  buf[offset+3] = year2 % 10;
  buf[offset+4] = month2 / 10;
  buf[offset+5] = month2 % 10;
  buf[offset+6] = day2 / 10;
  buf[offset+7] = day2 % 10;
  if (hour0 < 10) {
    buf[offset+8] = 1;
    buf[offset+9] = 0;
  } else if (hour0 >= 10 && hour0 < 16) {
    buf[offset+8] = 1;
    buf[offset+9] = 6;
  } else {
    buf[offset+8] = 1;
    buf[offset+9] = 0;
  }
  buf[offset+10] = 0;
  buf[offset+11] = 1;
  buf[offset+12] = 0;
  buf[offset+13] = 0;
  offset += 14;

  response.writeHead(200,{'Content-Type': 'multipart/mixed;boundary="BOUNDARY"'});
  response.write('--BOUNDARY\n');
  response.write('Content-Length: ');
  var wint = 6 + 10 + 26 + 34 + idx;
  response.write(wint.toString(10));
  response.write('\n');
  response.write('Content-Type: application/octet-stream\n');
  response.write('Content-Disposition: attachment; filename=203_0000.data\n');
  response.write('\n');
  console.log(wint);
  console.log(cnt);
  console.log(no);
  console.log(id);
  console.log(buf);
  response.write(cnt);
  response.write(no);
  response.write(id);

  response.write(buf);
  response.write('\n');
  response.end('--BOUNDARY--\n');
}

function monthlyTestData(year, month, kubun) {
    var dt = new Date(year,month,0);
    var days = dt.getDate();
    var length = days * 48;
    var buf = new Buffer(19+length);
    var offset = 0;
    var daily = new Buffer(dailyTestDataNew(kubun));

    buf[offset+0] = year / 1000;
    buf[offset+1] = (year / 100) % 10;
    buf[offset+2] = (year / 10) % 10;
    buf[offset+3] = year % 10;
    buf[offset+4] = month / 10;
    buf[offset+5] = month % 10;
    buf[offset+6] = 0;
    buf[offset+7] = 1;
    buf[offset+8] = 0;
    buf[offset+9] = 0;
    buf[offset+10] = 0;
    buf[offset+11] = 0;
    offset += 12;

    buf[offset+0] = 0;
    buf[offset+1] = length / 1000;
    buf[offset+2] = (length / 100) % 10;
    buf[offset+3] = (length / 10) % 10;
    buf[offset+4] = length % 10;
    offset += 5;

    var sum = 0;
    for (var i = 0; i < length; i++) {
      buf[offset+i] = daily[i%48];
      sum += buf[offset+i];
    }
    offset += length;

    var mod = sum % (month + 1);
    buf[offset+0] = ((mod % 100) / 10);
    buf[offset+1] = (mod % 10);
    offset += 2;

    return buf;
}
function monthlyTestData_14_1_9(year, month, kubun) {
    var dt = new Date(year,month,0);
    var days = dt.getDate();
    var length = days * 48;
    var buf = new Buffer(19+length);
    var offset = 0;
    var daily = new Buffer(dailyTestDataNew(kubun));

    buf[offset+0] = year / 1000;
    buf[offset+1] = (year / 100) % 10;
    buf[offset+2] = (year / 10) % 10;
    buf[offset+3] = year % 10;
    buf[offset+4] = month / 10;
    buf[offset+5] = month % 10;
    buf[offset+6] = 0;
    buf[offset+7] = 1;
    buf[offset+8] = 0;
    buf[offset+9] = 0;
    buf[offset+10] = 0;
    buf[offset+11] = 0;
    offset += 12;

    buf[offset+0] = 0;
    buf[offset+1] = length / 1000;
    buf[offset+2] = (length / 100) % 10;
    buf[offset+3] = (length / 10) % 10;
    buf[offset+4] = length % 10;
    offset += 5;

    var sum = 0;
    for (var i = 0; i < length; i++) {
      buf[offset+i] = daily[i%48];
      sum += buf[offset+i];
    }
    offset += length;

    var mod = sum % (month + 1);
    buf[offset+0] = ((mod % 100) / 10);
    buf[offset+1] = (mod % 10);
    offset += 2;

    return buf;
}

function LoadUpdateSchedule_Kyuden_14_1_8_A(response, request) {


  response.writeHead(200,{'Content-Type': 'multipart/mixed;boundary="BOUNDARY"'});
  response.write('--BOUNDARY\n');
  response.write('Content-Length: 82\n');
  response.write('Content-Type: application/octet-stream\n');
  response.write('Content-Disposition: attachment; filename=203_0000.data\n');
  response.write('\n');


  var daily = new Buffer(3);
  daily[0] = 30;
  daily[1] = 20;
  daily[2] = 10;
  //daily[3] = 100;
  //daily[4] = 100;

  var cnt = new Buffer(6);
  cnt[0] = 0;
  cnt[1] = 0;
  cnt[2] = 0;
  cnt[3] = 0;
  cnt[4] = 0;
  cnt[5] = 1;
  response.write(cnt);

  var no = new Buffer(10);
  no.fill(0);
  response.write(no);

  var id = new Buffer(26);
  for (var ii = 0; ii < 26; ii++)
    id[ii] = request.body.power_plant_id[ii];
  response.write(id);

  var buf = new Buffer(37);
  var offset = 0;

  buf[offset+0] = 2;
  buf[offset+1] = 0;
  buf[offset+2] = 1;
  buf[offset+3] = 8;
  buf[offset+4] = 0;
  buf[offset+5] = 2;
  buf[offset+6] = 0;
  buf[offset+7] = 1;
  buf[offset+8] = 1;
  buf[offset+9] = 0;
  buf[offset+10] = 0;
  buf[offset+11] = 0;
  offset += 12;

  buf[offset+0] = 0;
  buf[offset+1] = 0;
  buf[offset+2] = 0;
  buf[offset+3] = 0;
  buf[offset+4] = 3;
  offset += 5;

  var length = 3;
  var sum = 0;
  for (var i = 0; i < length; i++) {
    buf[offset+i] = daily[i];
    sum += buf[offset+i];
  }
  offset += length;


  buf[offset+0] = 2;
  offset += 1;

  var mod = sum % 3;
  buf[offset+0] = ((mod % 100) / 10);
  buf[offset+1] = (mod % 10);
  offset += 2;

  buf[offset+0] = 2;
  buf[offset+1] = 0;
  buf[offset+2] = 1;
  buf[offset+3] = 8;
  buf[offset+4] = 0;
  buf[offset+5] = 2;
  buf[offset+6] = 0;
  buf[offset+7] = 1;
  buf[offset+8] = 1;
  buf[offset+9] = 0;
  buf[offset+10] = 3;
  buf[offset+11] = 0;
  buf[offset+12] = 0;
  buf[offset+13] = 0;
  offset += 14;

  response.write(buf);
  response.write('\n');
  response.end('--BOUNDARY--\n');

}

function LoadUpdateSchedule_Kyuden_14_1_9(response, request) {


  response.writeHead(200,{'Content-Type': 'multipart/mixed;boundary="BOUNDARY"'});
  response.write('--BOUNDARY\n');
  response.write('Content-Length: 78\n');
  response.write('Content-Type: application/octet-stream\n');
  response.write('Content-Disposition: attachment; filename=203_0000.data\n');
  response.write('\n');


  var daily = new Buffer(2);
  daily[0] = 20;
  daily[1] = 40;
  //daily[2] = 10;

  var cnt = new Buffer(6);
  cnt[0] = 0;
  cnt[1] = 0;
  cnt[2] = 0;
  cnt[3] = 0;
  cnt[4] = 0;
  cnt[5] = 1;
  response.write(cnt);

  var no = new Buffer(10);
  no.fill(0);
  response.write(no);

  var id = new Buffer(26);
  for (var ii = 0; ii < 26; ii++)
    id[ii] = request.body.power_plant_id[ii];
  response.write(id);

  var buf = new Buffer(37);
  var offset = 0;

  buf[offset+0] = 2;
  buf[offset+1] = 0;
  buf[offset+2] = 1;
  buf[offset+3] = 8;
  buf[offset+4] = 0;
  buf[offset+5] = 1;
  buf[offset+6] = 0;
  buf[offset+7] = 1;
  buf[offset+8] = 1;
  buf[offset+9] = 0;
  buf[offset+10] = 0;
  buf[offset+11] = 0;
  offset += 12;

  buf[offset+0] = 0;
  buf[offset+1] = 0;
  buf[offset+2] = 0;
  buf[offset+3] = 0;
  buf[offset+4] = 2;
  offset += 5;

  var length = 2;
  var sum = 0;
  for (var i = 0; i < length; i++) {
    buf[offset+i] = daily[i];
    sum += buf[offset+i];
  }
  offset += length;


  buf[offset+0] = 0;
  offset += 1;

  var mod = sum % 2;
  buf[offset+0] = ((mod % 100) / 10);
  buf[offset+1] = (mod % 10);
  offset += 2;

  buf[offset+0] = 2;
  buf[offset+1] = 0;
  buf[offset+2] = 1;
  buf[offset+3] = 8;
  buf[offset+4] = 0;
  buf[offset+5] = 1;
  buf[offset+6] = 0;
  buf[offset+7] = 1;
  buf[offset+8] = 1;
  buf[offset+9] = 0;
  buf[offset+10] = 3;
  buf[offset+11] = 0;
  buf[offset+12] = 0;
  buf[offset+13] = 0;
  offset += 14;

  response.write(buf);
  response.write('\n');
  response.end('--BOUNDARY--\n');

}


function dailyTestData() {
    var daily = new Buffer(48);

    for (var i = 0; i < 48; i++)
      daily[i] = 100;
/*
   var daily = new Buffer(5);
   daily[0] = 10;
   daily[1] = 20;
   daily[2] = 30;
   daily[3] = 40;
   daily[4] = 50;
*/
/*
daily[0] = 100;
daily[1] = 0;
daily[2] = 50;
daily[3] = 100;
daily[4] = 50;
daily[5] = 0;
daily[6] = 100;
daily[7] = 0;
daily[8] = 50;
daily[9] = 100;
daily[10] = 50;
daily[11] = 0;
daily[12] = 100;
daily[13] = 0;
daily[14] = 50;
daily[15] = 100;
daily[16] = 50;
daily[17] = 0;
daily[18] = 100;
daily[19] = 0;
daily[20] = 50;
daily[21] = 100;
daily[22] = 50;
daily[23] = 0;
daily[24] = 100;
daily[25] = 0;
daily[26] = 50;
daily[27] = 100;
daily[28] = 50;
daily[29] = 0;
daily[30] = 100;
daily[31] = 0;
daily[32] = 50;
daily[33] = 100;
daily[34] = 50;
daily[35] = 0;
daily[36] = 100;
daily[37] = 0;
daily[38] = 50;
daily[39] = 100;
daily[40] = 50;
daily[41] = 0;
daily[42] = 100;
daily[43] = 0;
daily[44] = 50;
daily[45] = 100;
daily[46] = 50;
daily[47] = 0;
*/
    return daily;

}
function dailyTestData_14_1_9() {
    var daily = new Buffer(48);

    for (var i = 0; i < 48; i++)
      if (i == 47) {
        daily[i] = 100;
        //daily[i] = 5;
      } else {
        daily[i] = 5;
      }
/*
   var daily = new Buffer(5);
   daily[0] = 10;
   daily[1] = 20;
   daily[2] = 30;
   daily[3] = 40;
   daily[4] = 50;
*/
    return daily;

}
function dailyTestDataNew(kubun) {
    if (kubun == 0) {
      return dailyTestData();
    } else if (kubun == 2) {
      return dailyTestData_14_1_9();
    }
    var daily = new Buffer(48);

    for (var i = 0; i < 48; i++)
      daily[i] = 100;
    for (var i = 0; i < 20; i++)
      daily[14+i] = ((9 - (i % 10)) * 10 + kubun);

    return daily;
}
function LoadUpdateSchedule_Kyuden_New(response, request) {


  response.writeHead(200,{'Content-Type': 'multipart/mixed;boundary="BOUNDARY"'});
  response.write('--BOUNDARY\n');
  response.write('Content-Length: 127\n');
  response.write('Content-Type: application/octet-stream\n');
  response.write('Content-Disposition: attachment; filename=203_0000.data\n');
  response.write('\n');


  var daily = new Buffer(48);
  daily[0] = 100;
  daily[1] = 100;
  daily[2] = 100;
  daily[3] = 100;
  daily[4] = 100;
  daily[5] = 100;
  daily[6] = 100;
  daily[7] = 100;
  daily[8] = 100;
  daily[9] = 100;
  daily[10] = 100;
  daily[11] = 100;
  daily[12] = 100;
  daily[13] = 100;
  daily[14] = 100;
  daily[15] = 98;
  daily[16] = 96;
  daily[17] = 90;
  daily[18] = 90;
  daily[19] = 80;
  daily[20] = 62;
  daily[21] = 50;
  daily[22] = 24;
  daily[23] = 0;
  daily[24] = 0;
  daily[25] = 0;
  daily[26] = 16;
  daily[27] = 20;
  daily[28] = 30;
  daily[29] = 30;
  daily[30] = 40;
  daily[31] = 40;
  daily[32] = 50;
  daily[33] = 70;
  daily[34] = 90;
  daily[35] = 95;
  daily[36] = 98;
  daily[37] = 100;
  daily[38] = 100;
  daily[39] = 100;
  daily[40] = 100;
  daily[41] = 100;
  daily[42] = 100;
  daily[43] = 100;
  daily[44] = 100;
  daily[45] = 100;
  daily[46] = 100;
  daily[47] = 100;

  var cnt = new Buffer(6);
  cnt[0] = 0;
  cnt[1] = 0;
  cnt[2] = 0;
  cnt[3] = 0;
  cnt[4] = 0;
  cnt[5] = 1;
  response.write(cnt);

  var no = new Buffer(10);
  no.fill(0);
  response.write(no);

  var id = new Buffer(26);
  for (var ii = 0; ii < 26; ii++)
    id[ii] = request.body.power_plant_id[ii];
  response.write(id);

  var buf = new Buffer(82);
  var offset = 0;

  buf[offset+0] = 2;
  buf[offset+1] = 0;
  buf[offset+2] = 1;
  buf[offset+3] = 8;
  buf[offset+4] = 0;
  buf[offset+5] = 6;
  buf[offset+6] = 0;
  buf[offset+7] = 6;
  buf[offset+8] = 1;
  buf[offset+9] = 3;
  buf[offset+10] = 3;
  buf[offset+11] = 0;
  offset += 12;

  buf[offset+0] = 0;
  buf[offset+1] = 0;
  buf[offset+2] = 0;
  buf[offset+3] = 4;
  buf[offset+4] = 8;
  offset += 5;

  var length = 48;
  var sum = 0;
  for (var i = 0; i < length; i++) {
    buf[offset+i] = daily[i];
    sum += buf[offset+i];
  }
  offset += length;


  buf[offset+0] = 1;
  offset += 1;

  var mod = sum % 12;
  buf[offset+0] = ((mod % 100) / 10);
  buf[offset+1] = (mod % 10);
  offset += 2;

  buf[offset+0] = 2;
  buf[offset+1] = 0;
  buf[offset+2] = 1;
  buf[offset+3] = 8;
  buf[offset+4] = 0;
  buf[offset+5] = 6;
  buf[offset+6] = 0;
  buf[offset+7] = 6;
  buf[offset+8] = 1;
  buf[offset+9] = 7;
  buf[offset+10] = 0;
  buf[offset+11] = 0;
  buf[offset+12] = 0;
  buf[offset+13] = 0;
  offset += 14;

  response.write(buf);
  response.write('\n');
  response.end('--BOUNDARY--\n');
}
function LoadUpdateSchedule_Kyuden_30min(response, request) {
  var dt0 = new Date();
  dt0.setTime(dt0.getTime()+32400000);	// +9h
  var hour0 = dt0.getHours();
  var min0 = dt0.getMinutes();



  var updsche = new Buffer(48);
  updsche[0] = 100;  //00:00
  updsche[1] = 100;  //00:30
  updsche[2] = 100;  //01:00
  updsche[3] = 100;  //01:30
  updsche[4] = 100;  //02:00
  updsche[5] = 100;  //02:30
  updsche[6] = 100;  //03:00
  updsche[7] = 100;  //03:30
  updsche[8] = 100;  //04:00
  updsche[9] = 100;  //04:30
  updsche[10] = 100; //05:00
  updsche[11] = 100; //05:30
  updsche[12] = 100; //06:00
  updsche[13] = 100; //06:30
  updsche[14] = 100; //07:00
  updsche[15] = 98;  //07:30
  updsche[16] = 96;  //08:00
  updsche[17] = 90;  //08:30

  updsche[18] = 90;  //09:00
  updsche[19] = 80;  //09:30
  updsche[20] = 62;  //10:00
  updsche[21] = 50;  //10:30
  updsche[22] = 24;  //11:00
  updsche[23] = 0;   //11:30
  updsche[24] = 0;   //12:00
  updsche[25] = 0;   //12:30
  updsche[26] = 16;  //13:00
  updsche[27] = 20;  //13:30
  updsche[28] = 30;  //14:00
  updsche[29] = 30;  //14:30

  updsche[30] = 40;  //15:00
  updsche[31] = 40;  //15:30
  updsche[32] = 50;  //16:00
  updsche[33] = 70;  //16:30
  updsche[34] = 90;  //17:00
  updsche[35] = 95;  //17:30
  updsche[36] = 98;  //18:00
  updsche[37] = 100; //18:30
  updsche[38] = 100; //19:00
  updsche[39] = 100; //19:30
  updsche[40] = 100; //20:00
  updsche[41] = 100; //20:30
  updsche[42] = 100; //21:00
  updsche[43] = 100; //21:30
  updsche[44] = 100; //22:00
  updsche[45] = 100; //22:30
  updsche[46] = 100; //23:00
  updsche[47] = 100; //23:30

  var staidx = 0;
  if (hour0 == 23 && min0 >= 30) {
    staidx = 0;
    endidx = 1;
  } else if (hour0 == 23 && min0 >= 00) {
    staidx = 47;
    endidx = 0;
  } else {
    staidx = hour0 * 2 + 1;
    if (min0 >= 30) {
      staidx = staidx + 1;
    }
/*
    if (hour0 < 10) {
      endidx = 21;
    }
    if (hour0 >= 10 && hour0 < 16) {
      endidx = 33;
    }
    if (hour0 >= 16) {
      endidx = 47;
    }
*/
    endidx  = staidx + 1;
  }
  var idx = 0;
/*
  if (endidx == 47) {
    idx = endidx - staidx + 23;
  } else {
    idx = endidx - staidx + 1;
  }
*/
  idx = 2;
  console.log(staidx);
  console.log(endidx);
  console.log(idx);

  var daily = new Buffer(idx);

  for (var ii = 0; ii < idx; ii++) {
    if ((staidx + ii) > 47) {
      daily[ii] = updsche[staidx + ii - 48];
    } else {
      daily[ii] = updsche[staidx + ii];
    }
  }

  var cnt = new Buffer(6);
  cnt[0] = 0;
  cnt[1] = 0;
  cnt[2] = 0;
  cnt[3] = 0;
  cnt[4] = 0;
  cnt[5] = 1;


  var no = new Buffer(10);
  no.fill(0);


  var id = new Buffer(26);
  for (ii = 0; ii < 26; ii++)
    id[ii] = request.body.power_plant_id[ii];


  var buf = new Buffer(34 + idx);
  var offset = 0;
  var dt1 = new Date();
  dt1.setTime(dt1.getTime()+32400000 + 1800000);	// +9h + 30
  var year1 = dt1.getFullYear();
  var month1 = dt1.getMonth() + 1;
  var day1 = dt1.getDate();
  var hour1 = dt1.getHours();

  buf[offset+0] = year1 / 1000;
  buf[offset+1] = (year1 / 100) % 10;
  buf[offset+2] = (year1 / 10) % 10;
  buf[offset+3] = year1 % 10;
  buf[offset+4] = month1 / 10;
  buf[offset+5] = month1 % 10;
  buf[offset+6] = day1 / 10;
  buf[offset+7] = day1 % 10;
  buf[offset+8] = hour1 / 10;
  buf[offset+9] = hour1 % 10;
  if (min0 >= 30) {
    buf[offset+10] = 0;
    buf[offset+11] = 0;
  } else {
    buf[offset+10] = 3;
    buf[offset+11] = 0;
  }
  offset += 12;

  buf[offset+0] = 0;
  buf[offset+1] = 0;
  buf[offset+2] = 0;
  buf[offset+3] = idx / 10;
  buf[offset+4] = idx % 10;
  offset += 5;

//    var length = 33;
  var sum = 0;
  for (var i = 0; i < idx; i++) {
    buf[offset+i] = daily[i];
    sum += buf[offset+i];
  }
  offset += idx;


  //buf[offset+0] = day1 % 10;
  buf[offset+0] = 0;
  offset += 1;

  var mod = sum % (month1 + day1);
  buf[offset+0] = ((mod % 100) / 10);
  buf[offset+1] = (mod % 10);
  offset += 2;

  var dt2 = new Date();
  dt2.setTime(dt2.getTime()+32400000);	// +9h
  var year2 = dt2.getFullYear();
  var month2 = dt2.getMonth() + 1;
  if (hour0 >= 23 && min0 >= 30) {
    dt2.setDate(dt2.getDate() + 1);
  }
  var day2 = dt2.getDate();

  buf[offset+0] = year2 / 1000;
  buf[offset+1] = (year2 / 100) % 10;
  buf[offset+2] = (year2 / 10) % 10;
  buf[offset+3] = year2 % 10;
  buf[offset+4] = month2 / 10;
  buf[offset+5] = month2 % 10;
  buf[offset+6] = day2 / 10;
  buf[offset+7] = day2 % 10;
  if (min0 >= 30) {
    if (hour0 == 23) {
      buf[offset+8] = 0;
      buf[offset+9] = 0;
    } else {
      buf[offset+8] = (hour0 + 1) / 10;
      buf[offset+9] = (hour0 + 1) % 10
    }
    buf[offset+10] = 0;
    buf[offset+11] = 1;
  } else {
    buf[offset+8] = hour0 / 10;
    buf[offset+9] = hour0 % 10;
    buf[offset+10] = 3;
    buf[offset+11] = 1;
  }
/*
  if (hour0 < 10) {
    buf[offset+8] = 1;
    buf[offset+9] = 0;
  } else if (hour0 >= 10 && hour0 < 16) {
    buf[offset+8] = 1;
    buf[offset+9] = 6;
  } else {
    buf[offset+8] = 1;
    buf[offset+9] = 0;
  }
  buf[offset+10] = 0;
  buf[offset+11] = 1;
*/
  buf[offset+12] = 0;
  buf[offset+13] = 0;
  offset += 14;

  response.writeHead(200,{'Content-Type': 'multipart/mixed;boundary="BOUNDARY"'});
  response.write('--BOUNDARY\n');
  response.write('Content-Length: ');
  var wint = 6 + 10 + 26 + 34 + idx;
  response.write(wint.toString(10));
  response.write('\n');
  response.write('Content-Type: application/octet-stream\n');
  response.write('Content-Disposition: attachment; filename=203_0000.data\n');
  response.write('\n');
  console.log(wint);
  console.log(cnt);
  console.log(no);
  console.log(id);
  console.log(buf);
  response.write(cnt);
  response.write(no);
  response.write(id);

  response.write(buf);
  response.write('\n');
  response.end('--BOUNDARY--\n');
}
function LoadUpdateSchedule_Kyuden_30min_100per(response, request) {
  var dt0 = new Date();
  dt0.setTime(dt0.getTime()+32400000);	// +9h
  var hour0 = dt0.getHours();
  var min0 = dt0.getMinutes();



  var updsche = new Buffer(48);
  updsche[0] = 100;  //00:00
  updsche[1] = 0;  //00:30
  updsche[2] = 100;  //01:00
  updsche[3] = 0;  //01:30
  updsche[4] = 100;  //02:00
  updsche[5] = 0;  //02:30
  updsche[6] = 100;  //03:00
  updsche[7] = 0;  //03:30
  updsche[8] = 100;  //04:00
  updsche[9] = 0;  //04:30
  updsche[10] = 100; //05:00
  updsche[11] = 0; //05:30
  updsche[12] = 100; //06:00
  updsche[13] = 0; //06:30
  updsche[14] = 100; //07:00
  updsche[15] = 0;  //07:30
  updsche[16] = 100;  //08:00
  updsche[17] = 0;  //08:30

  updsche[18] = 100;  //09:00
  updsche[19] = 0;  //09:30
  updsche[20] = 100;  //10:00
  updsche[21] = 0;  //10:30
  updsche[22] = 100;  //11:00
  updsche[23] = 0;   //11:30
  updsche[24] = 100;   //12:00
  updsche[25] = 0;   //12:30
  updsche[26] = 100;  //13:00
  updsche[27] = 0;  //13:30
  updsche[28] = 100;  //14:00
  updsche[29] = 0;  //14:30

  updsche[30] = 100;  //15:00
  updsche[31] = 0;  //15:30
  updsche[32] = 100;  //16:00
  updsche[33] = 0;  //16:30
  updsche[34] = 100;  //17:00
  updsche[35] = 0;  //17:30
  updsche[36] = 100;  //18:00
  updsche[37] = 0; //18:30
  updsche[38] = 100; //19:00
  updsche[39] = 0; //19:30
  updsche[40] = 100; //20:00
  updsche[41] = 0; //20:30
  updsche[42] = 100; //21:00
  updsche[43] = 0; //21:30
  updsche[44] = 100; //22:00
  updsche[45] = 0; //22:30
  updsche[46] = 100; //23:00
  updsche[47] = 0; //23:30

  var staidx = 0;
  if (hour0 == 23 && min0 >= 30) {
    staidx = 0;
    endidx = 1;
  } else if (hour0 == 23 && min0 >= 00) {
    staidx = 47;
    endidx = 0;
  } else {
    staidx = hour0 * 2 + 1;
    if (min0 >= 30) {
      staidx = staidx + 1;
    }
/*
    if (hour0 < 10) {
      endidx = 21;
    }
    if (hour0 >= 10 && hour0 < 16) {
      endidx = 33;
    }
    if (hour0 >= 16) {
      endidx = 47;
    }
*/
    endidx  = staidx + 1;
  }
  var idx = 0;
/*
  if (endidx == 47) {
    idx = endidx - staidx + 23;
  } else {
    idx = endidx - staidx + 1;
  }
*/
  idx = 2;
  console.log(staidx);
  console.log(endidx);
  console.log(idx);

  var daily = new Buffer(idx);

  for (var ii = 0; ii < idx; ii++) {
    if ((staidx + ii) > 47) {
      daily[ii] = updsche[staidx + ii - 48];
    } else {
      daily[ii] = updsche[staidx + ii];
    }
  }

  var cnt = new Buffer(6);
  cnt[0] = 0;
  cnt[1] = 0;
  cnt[2] = 0;
  cnt[3] = 0;
  cnt[4] = 0;
  cnt[5] = 1;


  var no = new Buffer(10);
  no.fill(0);


  var id = new Buffer(26);
  for (ii = 0; ii < 26; ii++)
    id[ii] = request.body.power_plant_id[ii];


  var buf = new Buffer(34 + idx);
  var offset = 0;
  var dt1 = new Date();
  dt1.setTime(dt1.getTime()+32400000 + 1800000);	// +9h + 30
  var year1 = dt1.getFullYear();
  var month1 = dt1.getMonth() + 1;
  var day1 = dt1.getDate();
  var hour1 = dt1.getHours();

  buf[offset+0] = year1 / 1000;
  buf[offset+1] = (year1 / 100) % 10;
  buf[offset+2] = (year1 / 10) % 10;
  buf[offset+3] = year1 % 10;
  buf[offset+4] = month1 / 10;
  buf[offset+5] = month1 % 10;
  buf[offset+6] = day1 / 10;
  buf[offset+7] = day1 % 10;
  buf[offset+8] = hour1 / 10;
  buf[offset+9] = hour1 % 10;
  if (min0 >= 30) {
    buf[offset+10] = 0;
    buf[offset+11] = 0;
  } else {
    buf[offset+10] = 3;
    buf[offset+11] = 0;
  }
  offset += 12;

  buf[offset+0] = 0;
  buf[offset+1] = 0;
  buf[offset+2] = 0;
  buf[offset+3] = idx / 10;
  buf[offset+4] = idx % 10;
  offset += 5;

//    var length = 33;
  var sum = 0;
  for (var i = 0; i < idx; i++) {
    buf[offset+i] = daily[i];
    sum += buf[offset+i];
  }
  offset += idx;


  //buf[offset+0] = day1 % 10;
  buf[offset+0] = 0;
  offset += 1;

  var mod = sum % (month1 + day1);
  buf[offset+0] = ((mod % 100) / 10);
  buf[offset+1] = (mod % 10);
  offset += 2;

  var dt2 = new Date();
  dt2.setTime(dt2.getTime()+32400000);	// +9h
  var year2 = dt2.getFullYear();
  var month2 = dt2.getMonth() + 1;
  if (hour0 >= 23 && min0 >= 30) {
    dt2.setDate(dt2.getDate() + 1);
  }
  var day2 = dt2.getDate();

  buf[offset+0] = year2 / 1000;
  buf[offset+1] = (year2 / 100) % 10;
  buf[offset+2] = (year2 / 10) % 10;
  buf[offset+3] = year2 % 10;
  buf[offset+4] = month2 / 10;
  buf[offset+5] = month2 % 10;
  buf[offset+6] = day2 / 10;
  buf[offset+7] = day2 % 10;
  if (min0 >= 30) {
    if (hour0 == 23) {
      buf[offset+8] = 0;
      buf[offset+9] = 0;
    } else {
      buf[offset+8] = (hour0 + 1) / 10;
      buf[offset+9] = (hour0 + 1) % 10
    }
    buf[offset+10] = 0;
    buf[offset+11] = 1;
  } else {
    buf[offset+8] = hour0 / 10;
    buf[offset+9] = hour0 % 10;
    buf[offset+10] = 3;
    buf[offset+11] = 1;
  }
/*
  if (hour0 < 10) {
    buf[offset+8] = 1;
    buf[offset+9] = 0;
  } else if (hour0 >= 10 && hour0 < 16) {
    buf[offset+8] = 1;
    buf[offset+9] = 6;
  } else {
    buf[offset+8] = 1;
    buf[offset+9] = 0;
  }
  buf[offset+10] = 0;
  buf[offset+11] = 1;
*/
  buf[offset+12] = 0;
  buf[offset+13] = 0;
  offset += 14;

  response.writeHead(200,{'Content-Type': 'multipart/mixed;boundary="BOUNDARY"'});
  response.write('--BOUNDARY\n');
  response.write('Content-Length: ');
  var wint = 6 + 10 + 26 + 34 + idx;
  response.write(wint.toString(10));
  response.write('\n');
  response.write('Content-Type: application/octet-stream\n');
  response.write('Content-Disposition: attachment; filename=203_0000.data\n');
  response.write('\n');
  console.log(wint);
  console.log(cnt);
  console.log(no);
  console.log(id);
  console.log(buf);
  response.write(cnt);
  response.write(no);
  response.write(id);

  response.write(buf);
  response.write('\n');
  response.end('--BOUNDARY--\n');
}
function LoadUpdateSchedule_Kyuden_30min_JET(response, request) {
  var dt0 = new Date();
  dt0.setTime(dt0.getTime()+32400000);	// +9h
  var hour0 = dt0.getHours();
  var min0 = dt0.getMinutes();

  var updsche = new Buffer(48);
  updsche[0] = 100;  //00:00
  updsche[1] = 0;  //00:30
  updsche[2] = 100;  //01:00
  updsche[3] = 0;  //01:30
  updsche[4] = 100;  //02:00
  updsche[5] = 0;  //02:30
  updsche[6] = 100;  //03:00
  updsche[7] = 0;  //03:30
  updsche[8] = 100;  //04:00
  updsche[9] = 0;  //04:30
  updsche[10] = 100; //05:00
  updsche[11] = 0; //05:30
  updsche[12] = 100; //06:00
  updsche[13] = 0; //06:30
  updsche[14] = 100; //07:00
  updsche[15] = 0;  //07:30
  updsche[16] = 100;  //08:00
  updsche[17] = 0;  //08:30

  updsche[18] = 100;  //09:00
  updsche[19] = 0;  //09:30
  updsche[20] = 100;  //10:00
  updsche[21] = 0;  //10:30
  updsche[22] = 100;  //11:00
  updsche[23] = 99;   //11:30
  updsche[24] = 50;   //12:00
  updsche[25] = 100;   //12:30
  updsche[26] = 99;  //13:00
  updsche[27] = 50;  //13:30
  updsche[28] = 100;  //14:00
  updsche[29] = 50;  //14:30

  updsche[30] = 100;  //15:00
  updsche[31] = 50;  //15:30
  updsche[32] = 100;  //16:00
  updsche[33] = 0;  //16:30
  updsche[34] = 100;  //17:00
  updsche[35] = 0;  //17:30
  updsche[36] = 100;  //18:00
  updsche[37] = 0; //18:30
  updsche[38] = 100; //19:00
  updsche[39] = 0; //19:30
  updsche[40] = 100; //20:00
  updsche[41] = 0; //20:30
  updsche[42] = 100; //21:00
  updsche[43] = 0; //21:30
  updsche[44] = 100; //22:00
  updsche[45] = 0; //22:30
  updsche[46] = 100; //23:00
  updsche[47] = 0; //23:30

  var staidx = 0;
  if (hour0 == 23 && min0 >= 30) {
    staidx = 0;
    endidx = 1;
  } else if (hour0 == 23 && min0 >= 00) {
    staidx = 47;
    endidx = 0;
  } else {
    staidx = hour0 * 2 + 1;
    if (min0 >= 30) {
      staidx = staidx + 1;
    }
    endidx  = staidx + 1;
  }
  var idx = 0;
  idx = 2;
  console.log(staidx);
  console.log(endidx);
  console.log(idx);

  var daily = new Buffer(idx);

  for (var ii = 0; ii < idx; ii++) {
    if ((staidx + ii) > 47) {
      daily[ii] = updsche[staidx + ii - 48];
    } else {
      daily[ii] = updsche[staidx + ii];
    }
  }

  var cnt = new Buffer(6);
  cnt[0] = 0;
  cnt[1] = 0;
  cnt[2] = 0;
  cnt[3] = 0;
  cnt[4] = 0;
  cnt[5] = 1;


  var no = new Buffer(10);
  no.fill(0);


  var id = new Buffer(26);
  for (ii = 0; ii < 26; ii++)
    id[ii] = request.body.power_plant_id[ii];


  var buf = new Buffer(34 + idx);
  var offset = 0;
  var dt1 = new Date();
  dt1.setTime(dt1.getTime()+32400000 + 1800000);	// +9h + 30
  var year1 = dt1.getFullYear();
  var month1 = dt1.getMonth() + 1;
  var day1 = dt1.getDate();
  var hour1 = dt1.getHours();

  buf[offset+0] = year1 / 1000;
  buf[offset+1] = (year1 / 100) % 10;
  buf[offset+2] = (year1 / 10) % 10;
  buf[offset+3] = year1 % 10;
  buf[offset+4] = month1 / 10;
  buf[offset+5] = month1 % 10;
  buf[offset+6] = day1 / 10;
  buf[offset+7] = day1 % 10;
  buf[offset+8] = hour1 / 10;
  buf[offset+9] = hour1 % 10;
  if (min0 >= 30) {
    buf[offset+10] = 0;
    buf[offset+11] = 0;
  } else {
    buf[offset+10] = 3;
    buf[offset+11] = 0;
  }
  offset += 12;

  buf[offset+0] = 0;
  buf[offset+1] = 0;
  buf[offset+2] = 0;
  buf[offset+3] = idx / 10;
  buf[offset+4] = idx % 10;
  offset += 5;

  var sum = 0;
  for (var i = 0; i < idx; i++) {
    buf[offset+i] = daily[i];
    sum += buf[offset+i];
  }
  offset += idx;


  //buf[offset+0] = day1 % 10;
  buf[offset+0] = 0;
  offset += 1;

  var mod = sum % (month1 + day1);
  buf[offset+0] = ((mod % 100) / 10);
  buf[offset+1] = (mod % 10);
  offset += 2;

  var dt2 = new Date();
  dt2.setTime(dt2.getTime()+32400000);	// +9h
  var year2 = dt2.getFullYear();
  var month2 = dt2.getMonth() + 1;
  if (hour0 >= 23 && min0 >= 30) {
    dt2.setDate(dt2.getDate() + 1);
  }
  var day2 = dt2.getDate();

  buf[offset+0] = year2 / 1000;
  buf[offset+1] = (year2 / 100) % 10;
  buf[offset+2] = (year2 / 10) % 10;
  buf[offset+3] = year2 % 10;
  buf[offset+4] = month2 / 10;
  buf[offset+5] = month2 % 10;
  buf[offset+6] = day2 / 10;
  buf[offset+7] = day2 % 10;
  if (min0 >= 30) {
    if (hour0 == 23) {
      buf[offset+8] = 0;
      buf[offset+9] = 0;
    } else {
      buf[offset+8] = (hour0 + 1) / 10;
      buf[offset+9] = (hour0 + 1) % 10
    }
    buf[offset+10] = 0;
    buf[offset+11] = 1;
  } else {
    buf[offset+8] = hour0 / 10;
    buf[offset+9] = hour0 % 10;
    buf[offset+10] = 3;
    buf[offset+11] = 1;
  }
  buf[offset+12] = 0;
  buf[offset+13] = 0;
  offset += 14;

  response.writeHead(200,{'Content-Type': 'multipart/mixed;boundary="BOUNDARY"'});
  response.write('--BOUNDARY\n');
  response.write('Content-Length: ');
  var wint = 6 + 10 + 26 + 34 + idx;
  response.write(wint.toString(10));
  response.write('\n');
  response.write('Content-Type: application/octet-stream\n');
  response.write('Content-Disposition: attachment; filename=203_0000.data\n');
  response.write('\n');
  console.log(wint);
  console.log(cnt);
  console.log(no);
  console.log(id);
  console.log(buf);
  response.write(cnt);
  response.write(no);
  response.write(id);

  response.write(buf);
  response.write('\n');
  response.end('--BOUNDARY--\n');
}
