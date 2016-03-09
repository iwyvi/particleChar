/**
 * particleChar
 * 一个基于Sketch.js的生成粒子化效果文字的js插件
 * by IwYvI
 * https://github.com/IwYvI
 * 初版时间：2015.7
 * 整合时间：2016.2
 */
;(function(window, document, undefined) {

	"use strict";

	var NAME = "particleChar";

	/**
	 * 默认属性
	 * @type {obj}
	 */
	var defaultOption = {
		container: "particleChar",
		text: "particleChar",
		fontFamily: "微软雅黑",//字体
		fontSize: 200,//字号
		fontColor: "#76A4D4",//字体颜色
		fontColorRandom: false,//是否随机文字颜色
		dotRadius: 5,//点半径
		dotDistance: 12,//采样距离
		focalLength: 250,//焦距
		xOffset: 0,//x偏移
		yOffset: 0,//y偏移
		v1: 0.1,//组成速度
		v2: 0.1,//散开速度
		showTime: 1000,//展示时间
		showOpen: true,//是否展开
		showNext: true,//是否展示下一个
		waitTime: 0,//队列间等待时间
		backgroundColor: "transparent",//背景颜色
		backgroundColorRandom: false,//是否随机背景颜色
		showTypeBefore: "spread",//开始之前的样式
		showTypeAfter: "spread",//开始之后的样式
		queueLeave: false,//元素是否展示后离开队列
		callbackBefore: null,//开始时的回调
		callbackMiddle: null,//合并展示完成后的回调，在showOpen为true时才会被调用
		callbackAfter: null,//一个动作完成后的回调
	};

	//主要类内容
	var particleChar = function  (option) {
		this.init(option);
		return this.controller;
	};
	particleChar.prototype = {
		/**
		 * 整体初始化
		 * @param  {obj} option 整体配置属性什么的
		 * @return {null}
		 */
		init: function  (option) {
			this.Sketch = null;//维护动画的Sketch对象
			this.option = deepCopy(defaultOption);//对象自身的属性
			this.dots = [];//维护每个点的数组
			this.queue = [];//信息队列
			this.tempOption = [];//样式栈
			this.status = {
				process: true,//过程，true为从乱序到文字，false为从文字到乱序
				actionFinish: true,//当前动作是否完成
				queueTimer: null,//空队列状态的计时器
				queueTimerProcess: false,//判断是否进入空队列的切换状态
				queueLoop: true,//判断队列是否循环
				showOpen: true,//是否展开
				pause: false,//是否暂停
				thisTime: null,//判断展示时间的计时器
				lastTime: null,//同上
			};
			this.controller = {};//主控制器
			this.initController();
			this.controller.setOption(option);
			this.initSketch();
			this.controller.queueClear();
		},
		/**
		 * 初始化控制器
		 * @return {null}
		 */
		initController: function  () {
			/**
			 * 直接展示某个值
			 * @param  {string} arguments[0] 可选值，若有则展示这个值
			 * @return {obj} this
			 */
			this.controller.show =  function  (linkObj) {
				return function  () {
					linkObj.status.process = true;
					linkObj.status.actionFinish = false;
					linkObj.queue.length = 0;
					linkObj.status.queueTimerProcess = false;
					clearTimeout(linkObj.status.queueTimer);
					linkObj.optionRestore();
					if(arguments[0]){
						linkObj.option.text = arguments[0].toString();
					}
					linkObj.Sketch.spawn();
					return this;
				};
			}(this);
			/**
			 * 修改设置
			 * @param {obj} option 设置内容
			 * @return {obj} this
			 */
			this.controller.setOption = function  (linkObj) {
				return function  (option) {
					for(var key in option){
						if(typeof(linkObj.option[key]) !== undefined){
							linkObj.option[key] = option[key];
						}
					}
					return this;
				};
			}(this);
			/**
			 * 暂停和恢复
			 * @return {obj} this
			 */
			this.controller.pause = function  (linkObj) {
				return function () {
					linkObj.status.pause = !linkObj.status.pause;
					linkObj.status.queueTimerProcess = false;
					clearTimeout(linkObj.status.queueTimer);
					return this;
				};
			}(this);
			/**
			 * 还在试验中的移动
			 * @param  {double} x x偏移量
			 * @param  {double} y y偏移量
			 * @param  {double} z z偏移量
			 * @return {obj} this
			 */
			this.controller.moveBy = function (linkObj) {
				return function  (x, y, z, callback) {
					if(linkObj.option.showOpen === false && linkObj.option.showNext === false){
						for(var i = 0; i < linkObj.dots.length; i++){
							linkObj.dots[i].setPosition("d", linkObj.dots[i].dx + x, linkObj.dots[i].dy + y, linkObj.dots[i].dz + z);
							linkObj.option.callbackAfter = typeof(callback) == "function" ? callback : null;
						}
					}
					return this;
				};
			}(this);
			/**
			 * 创建队列
			 * 参数为对象或者字符串
			 * @return {obj} this
			 */
			this.controller.queueCreate = function  (linkObj) {
				return function  () {
					if (arguments[0]) {
						for(var i = 0; i < arguments.length ; i++){
							linkObj.queue.push(arguments[i]);
						}
						linkObj.status.queueTimerProcess = false;
						clearTimeout(linkObj.status.queueTimer);
					}
					return this;
				};
			}(this);
			/**
			 * 队列清空
			 * @return {obj} this
			 */
			this.controller.queueClear =function  (linkObj) {
				return function  () {
					linkObj.status.process = false;
					linkObj.status.actionFinish = true;
					linkObj.queue.length = 0;
					linkObj.status.queueTimerProcess = false;
					clearTimeout(linkObj.status.queueTimer);
					linkObj.optionRestore();
					return this;
				};
			}(this);
			/**
			 * 重绘
			 * @return {null}
			 */
			this.controller.repaint = function  (linkObj) {
				return function  () {
					linkObj.status.showOpen = false;
					var tempShowType = linkObj.option.showTypeBefore;
					linkObj.option.showTypeBefore = "nearby";
					linkObj.Sketch.spawn();
					linkObj.option.showTypeBefore = tempShowType;
					return this;
				};
			}(this);
			this.controller.getText = function  (linkObj) {
				return function  () {
					return linkObj.option.text;
				};
			}(this);
			// this.controller.debug = function  (linkObj) {
			// 	return function  () {
			// 		return linkObj;
			// 	};
			// }(this);
		},
		/**
		 * 初始化Sketch
		 * @return {null}
		 */
		initSketch: function  () {
			var obj = this;
			var ele = document.getElementById(this.option.container);
			this.Sketch = Sketch.create({
				autopause: false,
				autoclear: false,
				container: ele
			});
			var canvas = ele.getElementsByClassName("sketch")[0];
			canvas.style.width = "100%";
			canvas.style.height = "100%";
			this.Sketch.setup = function  (linkObj) {
				return function  () {
					linkObj.Sketch.spawn();
				};
			}(obj);
			this.Sketch.spawn = function  (linkObj) {
				return function  () {
					if(!linkObj.status.pause){
						if(typeof(linkObj.option.callbackBefore) == "function"){
							linkObj.option.callbackBefore(linkObj.controller);
							linkObj.option.callbackBefore = null;
						}
						linkObj.backgroundColorChange();
						if(linkObj.status.showOpen === false){
							linkObj.dots = getimgData(linkObj.Sketch, linkObj.option, linkObj.dots);
						}else{
							linkObj.dots = getimgData(linkObj.Sketch, linkObj.option);
						}
						linkObj.status.showOpen = linkObj.option.showOpen;
					}
				};
			}(obj);
			this.Sketch.update = function  (linkObj) {
				return function  () {
					if(!linkObj.status.pause){
						linkObj.queueExecute();
						linkObj.status.thisTime = +new Date();
						var dotStatus = {
							phase_1: true,
							phase_2: true,
							finish: true,
						};
						for(var i = 0; i < linkObj.dots.length; i++){
							linkObj.dots[i].move(linkObj.status.process,linkObj.option.v1, linkObj.option.v2);
							dotStatus.phase_1 = (dotStatus.phase_1 ===  true) ? linkObj.dots[i].status.phase_1 : false;
							dotStatus.phase_2 = (dotStatus.phase_2 === true) ? linkObj.dots[i].status.phase_2 : false;
							dotStatus.finish = (dotStatus.finish === true) ? linkObj.dots[i].status.finish : false;
						}
						//点事件处理
						if(linkObj.status.process){
							if(dotStatus.phase_1){
								if(linkObj.status.thisTime - linkObj.status.lastTime > linkObj.option.showTime){
									if(linkObj.option.showOpen){
										linkObj.status.process = false;
										if(typeof(linkObj.option.callbackMiddle) == "function"){
											linkObj.option.callbackMiddle(linkObj.controller);
											linkObj.option.callbackMiddle = null;
										}
									}else{
										if(linkObj.option.showNext){
											linkObj.status.actionFinish = true;
										}
										if(typeof(linkObj.option.callbackAfter) == "function"){
											linkObj.option.callbackAfter(linkObj.controller);
											linkObj.option.callbackAfter = null;
										}
									}
								}
							}else{
								linkObj.status.lastTime = +new Date();
							}
						}else{
							if(dotStatus.phase_2){
								if(linkObj.status.thisTime - linkObj.status.lastTime > linkObj.option.waitTime){
									if(linkObj.option.showNext){
										linkObj.status.actionFinish = true;
									}
									if(typeof(linkObj.option.callbackAfter) == "function"){
										linkObj.option.callbackAfter(linkObj.controller);
										linkObj.option.callbackAfter = null;
									}
								}
							}else{
								// linkObj.status.actionFinish = false;
								linkObj.status.lastTime = +new Date();
							}
						}
					}
				};
			}(obj);
			this.Sketch.draw = function  (linkObj) {
				return function  () {
					if(!linkObj.status.pause){
						linkObj.Sketch.clear();
						linkObj.Sketch.save();
						for(var i = 0; i < linkObj.dots.length; i++){
							linkObj.dots[i].paint(linkObj.Sketch);
						}
						linkObj.Sketch.restore();
					}
				};
			}(obj);
		},
		/**
		 * 队列事件处理
		 * @return {null}
		 */
		queueExecute: function  () {
			if(this.status.actionFinish){
				if(this.queue.length > 0){
					clearTimeout(this.status.queueTimer);
					this.status.queueTimerProcess = false;
					this.optionRestore();
					var tempQueueEle = this.queue.shift();
					this.queueAnylize(tempQueueEle);
					if (!this.option.queueLeave && this.status.queueLoop) {
						this.queue.push(tempQueueEle);
					}
					this.status.process=true;
					this.status.actionFinish = false;
					this.Sketch.spawn();
				}else{
					// if(!this.status.pause){
						if(!this.status.queueTimerProcess){
							this.status.queueTimerProcess = true;
							var obj = this;
							this.status.queueTimer = setTimeout(function(linkObj) {
								return function  () {
									linkObj.status.queueTimerProcess = false;
									linkObj.Sketch.spawn();
								};
						   }(obj), 4000);
						}
					// }
				}
			}
		},
		/**
		 * 队列内容分析
		 * @param  {obj} obj 队列内容
		 * @return {null}
		 */
		queueAnylize: function  (obj) {
			var type = typeof(obj);
			switch (type){
				case "number" :
					obj = obj.toString();
					this.option.text = obj;
					break;
				case "string" :
					this.option.text = obj;
					break;
				case "object" :
					var optionSaveStatus = false;
					for(var key in obj){
						if(key == 'optionSave' && obj[key] === true){
						  	optionSaveStatus = true;
						}
					}
					if(!optionSaveStatus){
						this.optionSave();
					}
					this.controller.setOption(obj);
					break;
				default:
					break;
			}
		},
		/**
		 * 背景色修改
		 * @return {null}
		 */
		backgroundColorChange: function  () {
			if(this.option.backgroundColorRandom){
				this.option.backgroundColor = 'rgb(' + Math.floor(Math.random()*255) +','+ Math.floor(Math.random()*255) + ',' + Math.floor(Math.random()*255) + ')';
			}else if(this.option.backgroundColor === "transparent"){
				this.Sketch.container.style.backgroundColor = "transparent";
			}
			this.Sketch.container.style.transition = 'background-color 0.5s ease';
			this.Sketch.container.style.backgroundColor = this.option.backgroundColor;
		},
		/**
		 * 样式设置栈
		 * @return {null}
		 */
		optionSave: function  () {
			this.tempOption.push(deepCopy(this.option));
		},
		/**
		 * 样式栈恢复
		 * @return {null}
		 */
		optionRestore: function  () {
			if(this.tempOption.length > 0){
				this.option = deepCopy(this.tempOption.pop());
			}
		},

	};

	/**
	 * dot类
	 * @param {int} centerX 有序态位置
	 * @param {int} centerY 有序态位置
	 * @param {int} centerZ 有序态位置
	 */
	var Dot = function(centerX , centerY , centerZ){
		this.dx = centerX;
		this.dy = centerY;
		this.dz = centerZ;//有序状态下的坐标
		this.tx = 0;
		this.ty = 0;
		this.tz = 0;//无序状态下的坐标
		this.x = centerX;
		this.y = centerY;
		this.z = centerZ;//当前坐标
		this.radius = 0;//点半径
		this.focalLength = 250;//焦距
		this.status = {
			ready: false,//点准备
			phase_1: false,//第一阶段（合并）
			phase_2: false,//第二阶段（散开）
			finish: false,//完成
		};
		this.color = "#76A4D4";
	};
	Dot.prototype = {
		/**
		 * 点的初始化
		 * @param  {bool} fontColorRandom 颜色随机
		 * @param  {string} color           颜色
		 * @param  {double} radius          半径
		 * @param  {double} focalLength     焦距
		 * @return {null}
		 */
		init: function  (fontColorRandom, color, radius, focalLength) {
			if(fontColorRandom){
				this.color = "#" + ("0" + Number(Math.floor(Math.random()*255)).toString(16)).slice(-2) + ( "0" + Number(Math.floor(Math.random()*255)).toString(16)).slice(-2) + ("0" + Number(Math.floor(Math.random()*255)).toString(16)).slice(-2);
			}else{
				this.color = color;
			}
			this.radius = radius;
			this.focalLength = focalLength;
			this.status.ready = true;
			this.status.phase_1 = false;
			this.status.phase_2 = false;
			this.status.finish = false;
		},
		/**
		 * 初始化展示样式
		 * @param {obj} canvas         绘图canvas
		 * @param {string} showTypeBefore 合并样式
		 * @param {string} showTypeAfter  散开样式
		 */
		setShowType: function  (canvas, showTypeBefore,showTypeAfter) {
			var width = canvas.width;
			var height = canvas.height;
			switch(showTypeBefore){
				default :
				case 'spread' :
					this.setPosition("n", Math.random()*width,Math.random()*height,Math.random()*this.focalLength*2 - this.focalLength);
					break;
				case 'top' :
					this.setPosition("n", Math.random()*width,0,Math.random()*this.focalLength*2 - this.focalLength);
					break;
				case 'bottom' :
					this.setPosition("n", Math.random()*width, height, Math.random()*this.focalLength*2 - this.focalLength);
					break;
				case 'nearby' :
					this.setPosition("n", this.dx + (0.5-Math.random())*300, this.dy + (0.5-Math.random())*300, 0);
					break;
				case 'none' :
					break;
			}
			switch(showTypeAfter){
				default :
				case 'spread' :
					this.setPosition("t", Math.random()*width, Math.random()*height, Math.random()*this.focalLength*2 - this.focalLength);
					break;
				case 'top' :
					this.setPosition("t", Math.random()*width, 0,Math.random()*this.focalLength*2 - this.focalLength);
					break;
				case 'bottom' :
					this.setPosition("t", Math.random()*width, height, Math.random()*this.focalLength*2 - this.focalLength);
					break;
				case 'nearby' :
					this.setPosition("t", this.dx + (0.5-Math.random())*300, this.dy + (0.5-Math.random())*300, 0);
					break;
				case 'none' :
					break;
			}
		},
		/**
		 * 设置点位置
		 * @param {string} type 点位置类型
		 * @param {double} x    x
		 * @param {double} y    y
		 * @param {double} z    z
		 */
		setPosition: function  (type, x, y, z) {
			switch(type){
				case "n":
					this.x = x;
					this.y = y;
					this.z = z;
					break;
				case "d":
					this.dx = x;
					this.dy = y;
					this.dz = z;
					break;
				case "t":
					this.tx = x;
					this.ty = y;
					this.tz = z;
					break;
				default:
					break;
			}
		},
		/**
		 * getColor 获取点的颜色值
		 * @param {double} alpha 透明度
		 * @return {string} 返回rgba颜色值
		 */
		getColor: function(alpha){
			var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
			var sColor = this.color;
			var tempA = arguments[0] || 1;
			if(reg.test(sColor)){
				var aNum = sColor.replace(/#/,"").split("");
				if(aNum.length === 3){
					for(var i=0; i<aNum.length; i+=1){
						sColor += (aNum[i].toString()+aNum[i].toString());
					}
				}
				var sColorChange = [];
				for(var j=1; j<7; j+=2 ){
					sColorChange.push(parseInt("0x" + sColor.slice(j,j+2)));
				}
				return "rgba(" + sColorChange.join(",") + "," + tempA + ")";
			}else{
				throw "error color";
			}
		},
		/**
		 * 点的绘图事件
		 * @param  {obj} context canvas绘图centext
		 * @return {null}
		 */
		paint:function(context){
			context.beginPath();
			var scale = this.focalLength/(this.focalLength - this.z );//实际控制透明度
			context.arc(context.width/2 + (this.x-context.width/2)*scale , context.height/2 + (this.y-context.height/2) * scale, this.radius*scale , 0 , 2*Math.PI);
			context.fillStyle = this.getColor(scale);//获取颜色
			context.fill();
			context.closePath();
		},
		/**
		 * 点的移动事件
		 * @param {bool} process 过程指示
		 * @param {double} v1 收回速度
		 * @param {double} v2 展开速度
		 * @return {null}
		 */
		move: function  (process, v1, v2) {
			if(process){
				if (Math.abs(this.dx - this.x) < 0.2 && Math.abs(this.dy - this.y) < 0.2 && Math.abs(this.dz - this.z)<0.2) {
					this.x = this.dx;
					this.y = this.dy;
					this.z = this.dz;
					this.status.phase_1 = true;
				} else {
					this.x = this.x + (this.dx - this.x) * v1;
					this.y = this.y + (this.dy - this.y) * v1;
					this.z = this.z + (this.dz - this.z) * v1;
				}
			}else{
				if (Math.abs(this.tx - this.x) < 0.2 && Math.abs(this.ty - this.y) < 0.2 && Math.abs(this.tz - this.z)<0.2) {
					this.x = this.tx;
					this.y = this.ty;
					this.z = this.tz;
					this.status.phase_2 = true;
					this.status.finish = true;
				} else {
					this.x = this.x + (this.tx - this.x) * v2;
					this.y = this.y + (this.ty - this.y) * v2;
					this.z = this.z + (this.tz - this.z) * v2;
				}
			}
		},
	};

	/**
	 * 获取canvas上的绘图数据
	 * @param  {obj} context canvas绘图context
	 * @param  {obj} option
	 * @return {array} dot对象的数组
	 */
	var getimgData = function (context, option ,oldDots){
		context.clear();
		drawText(option,context);
		var imgData = context.getImageData(0,0,context.width , context.height);
		context.clear();
		var dots = oldDots || [];
		var oldLength = dots.length;
		var count = 0;
		var xOffset = Math.abs(option.xOffset) > 1 ? option.xOffset : context.width/2 * option.xOffset;
		var yOffset = Math.abs(option.yOffset) > 1 ? option.yOffset : context.height/2 * option.yOffset;
		for(var x = 0; x < imgData.width; x +=  option.dotDistance ){
			for(var y = 0; y < imgData.height; y += option.dotDistance ){
				var i = (y*imgData.width + x)*4;//getImageData的数据结构rgba
				if(imgData.data[i] >= 128){
					if(count < oldLength){
						dots[count].setPosition("d", x + xOffset , y + yOffset , 0 );
						dots[count].init(option.fontColorRandom, option.fontColor, option.dotRadius, option.focalLength);
						dots[count].setShowType(context, "none",option.showTypeAfter);
						count++;
					}else{
						var dot = new Dot(x + xOffset , y + yOffset , 0);
						dot.init(option.fontColorRandom, option.fontColor, option.dotRadius, option.focalLength);
						dot.setShowType(context, option.showTypeBefore,option.showTypeAfter);
						dots.push(dot);
					}
				}
			}
		}
		if(oldDots && count < oldLength){
			dots.length = count;
		}
		return dots;
	};

	/**
	 * 向canvas画布上打印文字
	 * @param  {obj} option
	 * @param  {obj} context canvas绘图context
	 * @return {null}
	 */
	var drawText = function (option,context){
		context.save();
		context.font = option.fontSize + "px " + option.fontFamily;
		context.fillStyle = "rgb(168,168,168)";
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillText(option.text , context.width/2 , context.height/2);
		context.restore();
	};

	/**
	 * 网上的深拷贝
	 * @param  {obj} source 源对象
	 * @return {obj}		拷贝后的对象
	 */
	var deepCopy= function(source) {
		var result={};
		for (var key in source) {
			result[key] = typeof source[key]=== 'object' ? deepCopy(source[key]):source[key];
		}
		return result;
	};

	window[NAME] = particleChar;

})(window, document);
