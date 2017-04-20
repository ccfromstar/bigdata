var settings = require('../settings');
var mysql = require('../models/db');
var ejsExcel = require("./ejsExcel");
var fs = require("fs");
var formidable = require('formidable');

exports.getopenid = function(req, res) {
	
}

Date.prototype.Format = function(fmt) {
	var d = this;
	var o = {
		"M+": d.getMonth() + 1, //月份
		"d+": d.getDate(), //日
		"h+": d.getHours(), //小时
		"m+": d.getMinutes(), //分
		"s+": d.getSeconds(), //秒
		"q+": Math.floor((d.getMonth() + 3) / 3), //季度
		"S": d.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
}

exports.index = function(req, res) {
	res.render("index");
}

exports.home = function(req, res) {
	res.render("home");
}

exports.carpool = function(req, res) {
	res.render("carpool");
}

exports.summary = function(req, res) {
	res.render("summary");
}

exports.servicedo = function(req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	var _sql = req.params.sql;
	if(_sql == "create") {
		var date = req.param("date");
		var cname = req.param("cname");
		var platform = req.param("platform");
		var price = req.param("price");
		var sql = "insert into bigdata(date,name_id,platform_id,price) values('"+date+"',"+cname+","+platform+","+price+")";
		mysql.query(sql, function(err, result) {
			if(err) return console.error(err.stack);
			res.send("200");
		});
	}else if(_sql == "createcar") {
		var date = req.param("date");
		var cname = req.param("cname");
		var platform = req.param("platform");
		var price = req.param("price");
		var sql = "insert into carpooling(date,name,platform_id,price) values('"+date+"','"+cname+"',"+platform+","+price+")";
		console.log(sql);
		mysql.query(sql, function(err, result) {
			if(err) return console.error(err.stack);
			res.send("200");
		});
	}else if(_sql == "getTotal") {
		var myDate = new Date();
	    var y = myDate.getFullYear(); 
	    var m = (((myDate.getMonth()+1)+"").length==1)?"0"+(myDate.getMonth()+1):(myDate.getMonth()+1);
	    var d = (((myDate.getDate())+"").length==1)?"0"+(myDate.getDate()):(myDate.getDate());
	    var sendtime = y+"-"+m+"-"+d;
		var sql = "select sum(price) as sum from bigdata";
		mysql.query(sql, function(err, result) {
			if(err) return console.error(err.stack);
			//console.log(result[0].sum);
			var sq2 = "select sum(price) as sum from bigdata where date = '"+sendtime+"'";
			mysql.query(sq2, function(err, result2) {
				if(err) return console.error(err.stack);
				console.log(result2[0].sum);
				if(!result2[0].sum || (result2[0].sum == 'null')){
					result[0].today = 0;
				}else{
					result[0].today = result2[0].sum;
				}
				//console.log(result);
				res.send(result);
			});
		});
	}else if(_sql == "getTotalcar") {
		var myDate = new Date();
	    var y = myDate.getFullYear(); 
	    var m = (((myDate.getMonth()+1)+"").length==1)?"0"+(myDate.getMonth()+1):(myDate.getMonth()+1);
	    var d = (((myDate.getDate())+"").length==1)?"0"+(myDate.getDate()):(myDate.getDate());
	    var sendtime = y+"-"+m+"-"+d;
		var sql = "select sum(price) as sum from carpooling";
		mysql.query(sql, function(err, result) {
			if(err) return console.error(err.stack);
			//console.log(result[0].sum);
			var sq2 = "select sum(price) as sum from carpooling where date = '"+sendtime+"'";
			mysql.query(sq2, function(err, result2) {
				if(err) return console.error(err.stack);
				console.log(result2[0].sum);
				if(!result2[0].sum || (result2[0].sum == 'null')){
					result[0].today = 0;
				}else{
					result[0].today = result2[0].sum;
				}
				//console.log(result);
				res.send(result);
			});
		});
	}else if(_sql == "getList") {
		var sql = "select * from list";
		mysql.query(sql, function(err, result) {
			if(err) return console.error(err.stack);
			res.send(result);
		});
	}else if(_sql == "getDetail") {
		var sql = "select * from v_data order by date desc";
		mysql.query(sql, function(err, result) {
			if(err) return console.error(err.stack);
			res.send(result);
		});
	}else if(_sql == "getDetailcar") {
		var sql = "select * from v_carpool order by date desc";
		mysql.query(sql, function(err, result) {
			if(err) return console.error(err.stack);
			res.send(result);
		});
	}else if(_sql == "getSummary"){
		var date1 = req.param("date1");
		var date2 = req.param("date2");
		var sql1 = "select sum(price) as sum from salary where date >='"+date1+"' and date <='"+date2+"'";
		mysql.query(sql1, function(err, result1) {
			if(err) return console.error(err.stack);
			//console.log(result1[0].sum);
			var sql2 = "select sum(price) as sum from carpooling where date >='"+date1+"' and date <='"+date2+"'";
			mysql.query(sql2, function(err, result2) {
				if(err) return console.error(err.stack);
				var sql3 = "select sum(price) as sum from bigdata where date >='"+date1+"' and date <='"+date2+"'";
				mysql.query(sql3, function(err, result3) {
					if(err) return console.error(err.stack);
					var sql4 = "select sum(price) as sum from other where date >='"+date1+"' and date <='"+date2+"'";
					mysql.query(sql4, function(err, result4) {
						if(err) return console.error(err.stack);
						var o = {
							salary:result1[0].sum,
							carpooling:result2[0].sum,
							bigdata:result3[0].sum,
							other:result4[0].sum
						}
						res.json(o);
					});
				});
			});
		});
	}
}

