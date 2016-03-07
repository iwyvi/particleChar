var tempFontSize = 200,
	tempDotRadius = 4,
	tempDotDistance = 10;
function getProperFont (length) {
	var windowWidth = getWindowWidth();
	var windowHeight = getWindowHeight();
	tempFontSize = (windowWidth)/(length-6) >= 200 ? 200 : (windowWidth)/(length-6);
	if(tempFontSize < 80){
		tempDotRadius = 1;
	}else if(tempFontSize < 100){
		tempDotRadius = 2;
	}else if(tempFontSize < 150){
		tempDotRadius = 3;
	}else{
		tempDotRadius = 4;
	}
	tempDotDistance = tempDotRadius*2+2;

}
function getWindowWidth () {
	return document.body.clientWidth;
}
function getWindowHeight () {
	return document.body.clientHeight;
}
getProperFont(14);
var pc = new particleChar({fontColor:"#76A4D4",fontSize:tempFontSize,dotRadius:tempDotRadius,dotDistance:tempDotDistance});
pc.queueCreate({
	text:"particleChar.js",
	showTypeAfter: "top",
	showTime: 1800,
	v1: 0.15,
	waitTime: 0,
	callbackBefore: function  () {
		document.body.scrollTop = 0;
	},
},{
	text: "IwYvI",
	showTypeBefore: "top",
	showOpen: false,
	fontColor: "#95f0c0",
	showTime: 1200,
	callbackAfter: function  () {
		document.getElementById('container').style.top = "-" + getWindowHeight()/2 + "px";
	}
},{
	text: "particleChar.js",
	showOpen: false,
	fontColor: "#ff6268",
	yOffset: -0.5,
	showNext: false,
	showTypeBefore: "nearby",
	callbackBefore: function  () {
		document.body.style.overflow = "auto";
	}
});
window.onresize = function  () {
	getProperFont(pc.getText().length);
	pc.setOption({fontSize:tempFontSize,dotRadius:tempDotRadius,dotDistance:tempDotDistance});
	pc.repaint();
	if(document.body.style.overflow == "auto"){
		document.getElementById('container').style.top = "-" + getWindowHeight()/2 + "px";
	}
};
