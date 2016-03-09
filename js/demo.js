var pc = new particleChar();
var timer = null;
pc.queueCreate({
	text: "DEMO",
	fontColor: "#95f0c0",
	showNext: false,
	showOpen: false,
});

function showTime () {
	clearTimeout(timer);
	pc.queueClear();
	pc.setOption({fontSize: 160,dotRadius: 3,dotDistance:8, showOpen: false, showNext: false,showTypeBefore: 'nearby', fontFamily: "Razer Header Light"});
	pc.show("TIME");
	timer = setInterval(function function_name () {
		var my = new Date();
		pc.show(my.getHours() + ":" + ("0" + my.getMinutes()).slice(-2) + ":" + ("0"+my.getSeconds()).slice(-2));
	}, 1000);
}

function showQueue () {
	clearTimeout(timer);
	pc.queueClear();
	pc.setOption({fontSize:200, dotRadius: 5,dotDistance: 12, showTypeBefore: "spread", fontFamily: "微软雅黑",showOpen: true, showNext: true});
	pc.queueCreate({
		text: "particleChar.js",
		showTypeBefore: "nearby",
		showTypeAfter: "bottom",
	},{
		text: "这个是DEMO",
		showTypeBefore: "bottom",
		showTypeAfter: "nearby",
		showTime: 1200,
		v2: 0.4,
		fontColor: "#ff6268",
	},{
		text: "每个队列项目",
		showTypeBefore: "nearby",
		v1: 0.2,
		showOpen: false,
	},{
		text: "可以有自己的属性",
		backgroundColorRandom: true,
		showOpen: false,
	},{
		text: "而且不会互相影响",
		fontColorRandom: true,

	},{
		text: "同时可以在不同时间",
		showOpen: false,
	},{
		text: "添加回调函数",
		showOpen: false,
	},{
		text: "比如这样",
		callbackBefore: function  () {
			alert("开始前的回调");
		},
		callbackMiddle: function  () {
			alert("中间的回调");
		},
		callbackAfter: function  () {
			alert("结束时的回调");
		},
		queueLeave: true,
	});
}
document.getElementById('time').addEventListener("click", function  (e) {
	e.preventDefault();
	if(!e.target.classList.contains("selected")){
		e.target.classList.add("selected");
		document.getElementById('queue').classList.remove("selected");
		showTime();
	}
});
document.getElementById('queue').addEventListener("click", function  (e) {
	e.preventDefault();
	if(!e.target.classList.contains("selected")){
		e.target.classList.add("selected");
		document.getElementById('time').classList.remove("selected");
		showQueue();
	}
});
