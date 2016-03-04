var tempFontSize = 200,
	tempDotRadius = 4,
	tempDotDistance = 10;
function getProperFont (length) {
	var windowWidth = getWindowWidth();
	var windowHeight = getWindowHeight();
	tempFontSize = (windowWidth)/(length-2) >= 200 ? 200 : (windowWidth)/(length-2);
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
getProperFont(10);
var pc = new particleChar({fontColor:"#1a98ff",fontSize:tempFontSize,dotRadius:tempDotRadius,dotDistance:tempDotDistance});
pc.queueCreate({
	text:"particleChar.js",
	showTypeAfter: "top",
},{
	text: "IwYvI",
	showTypeBefore: "top",
	showOpen: false,
	yOffset: -100,
	callbackAfter: function  () {
		document.getElementById('container').style.top = "-" + getWindowHeight()/2 + "px";
	}
},{
	text: "particleChar.js",
	showOpen: false,
	yOffset: -200,
	showNext: false,
	showTypeBefore: "nearby",
	callbackAfter: function  () {
		document.body.style.overflow = "auto";
	}
});
window.onresize = function  () {
	getProperFont(pc.getText().length);
	pc.setOption({fontSize:tempFontSize,dotRadius:tempDotRadius,dotDistance:tempDotDistance});
	pc.repaint();
	document.getElementById('container').style.top = "-" + getWindowHeight()/2 + "px";
};
