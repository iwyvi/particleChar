var pc = new particleChar();
var changeParameter = function  () {
    pc.option.text = document.getElementById('index').value || "无内容";
    pc.option.fontFamily = document.getElementById('fontfamily').value || "宋体";
    pc.option.fontSize = document.getElementById('fontsize').value || 0;
    // pc.font_color.r = document.getElementById('fontcolorr').value || 118;
    // pc.font_color.g = document.getElementById('fontcolorg').value || 164;
    // pc.font_color.b = document.getElementById('fontcolorb').value || 212;
    pc.option.dotRadius = parseInt(document.getElementById('dotradius').value);
    if (pc.option.dotRadius<0 || isNaN(pc.option.dotRadius)) {pc.option.dotRadius = 0;};
    pc.option.dotDistance = parseInt(document.getElementById('dotdistance').value);
    if(pc.option.dotDistance<=0 || isNaN(pc.option.dotDistance)){pc.option.dotDistance = 12;pc.option.dotRadius = 0;};
    // pc.focallength = parseInt(document.getElementById('focallength').value);
    // pc.x_offset = parseInt(document.getElementById('xoffset').value);
    // pc.y_offset = parseInt(document.getElementById('yoffset').value);
    // pc.v1 = parseInt(document.getElementById('v1').value);
    // pc.v2 = parseInt(document.getElementById('v2').value);
    // pc.pause_time = parseInt(document.getElementById('pausetime').value);
};
var submitbtn = document.getElementById('submit');
submitbtn.addEventListener("click",function  (e) {
    e.preventDefault();
    pc.optionRestore();
    changeParameter();
    pc.show();
});
var tips = document.querySelectorAll(".tip");
var controlTimer;
document.getElementById('control').addEventListener("mouseover",function  (e) {
    clearTimeout(controlTimer);
    control.style.marginLeft = "0";
    for (var i = tips.length - 1; i >= 0; i--) {
        tips[i].style.display = "block";
    }
});
control.addEventListener("mouseout",function (e) {
    controlTimer = setTimeout(function() {
        control.style.marginLeft = "-230px";
        for (var i = tips.length - 1; i >= 0; i--) {
            tips[i].style.display = "none";
        }
    }, 800);
});
document.getElementById('pausebtn').addEventListener("click",function (e){
        pc.pause();
});
document.getElementById('colorrandom').addEventListener("click",function  (e) {
    if(this.checked)
    {
        pc.option.fontColorRandom = true;
    }else{
        pc.option.fontColorRandom = false;
    }
});
document.getElementById('backgroundcolorrandom').addEventListener("click",function  (e) {
    if(this.checked)
    {
        pc.option.backgroundColorRandom = true;
    }else{
        pc.option.backgroundColorRandom = false;
    }
});
document.getElementById('openshowbtn').addEventListener("click",function  (e) {
    pc.showToggle();
});
document.getElementById('queueloopbtn').addEventListener("click",function  (e) {
    if(this.checked)
    {
        pc.status.queueLoop = true;
    }else{
        pc.status.queueLoop = false;
    }
});
var queueAddbtn = document.getElementById('queueAdd');
queueAddbtn.addEventListener("click",function  (e) {
    e.preventDefault();
    pc.queueCreate(document.getElementById('queueIndex').value);
    document.getElementById('queueIndex').value = "";
});
document.getElementById('queueClear').addEventListener("click",function  (e) {
    e.preventDefault();
    pc.queueClear();
});

pc.queueCreate({
    text: "particleChar",
    fontSize: 250,
    fontColor: {
        r: 49,
        g:59,
        b: 34,
    },
    backgroundColor: "#B1B8ED",
    dotDistance: 14,
    showTime: 1500,
},{
    text: "IwYvI",
    fontFamily: "Razer Header Light",
    fontColor: {
        r: 238,
        g:159,
        b: 134,
    },
    showTypeAfter:"bottom",
    dotDistance: 10,
    dotRadius: 2,
    showTime: 1500,
},{
    text: "https://github.com/IwYvI",
    fontSize: 160,
    dotDistance: 6,
    dotRadius: 3,
    fontFamily: "Times New Roman",
    fontColor: {
        r: 109,
        g:159,
        b: 234,
    },
    backgroundColor: "#B1493F",
    showTime: 3500,
    showTypeBefore:"bottom",
});
