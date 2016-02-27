/**
 * particleChar
 * 一个生成粒子化效果文字的js插件
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
		text: "particleChar",
		fontFamily: "微软雅黑",//字体
		fontSize: 200,//字号
		fontColor: {
			r: 118,
			g: 164,
			b: 212,
		},//字体颜色
		dotRadius: 5,//点半径
		dotDistance: 12,//采样距离
		focalLength: 250,//焦距
		xOffset: 0,//x偏移
		yOffset: 0,//y偏移
	    v1: 0.1,//组成速度
	    v2: 0.1,//散开速度
	    showTime: 700,//展示时间
	    sleepTime: 0,//队列间等待时间
	    fontColorRandom: false,//是否随机文字颜色
	    backgroundColor: "#333",//背景颜色
	    backgroundColorRandom: false,//是否随机背景颜色
	    showTypeBefore: "spread",//开始之前的样式
	    showTypeAfter: "spread",//开始之后的样式
	    container: "container",
	};

	//主要类内容
	var particleChar = function  (option) {
		this.init(option);
	};
	particleChar.prototype = {
		/**
		 * 私有 初始化
		 * @param  {obj} option 整体配置属性什么的
		 * @return {null}
		 */
		init: function  (option) {
			this.Sketch = null;//维护动画的Sketch对象
			this.option = defaultOption;//对象自身的属性
			this.dots = [];//维护每个点的数组
			this.queue = [];//信息队列
			this.tempOption = [];//样式栈
			this.status = {
				process: true,//过程，true为从乱序到文字，false为从文字到乱序
				actionFinish: false,//当前动作是否完成
				queueTimer: null,//空队列状态的计时器
				queueTimerProcess: false,//判断是否进入空队列的切换状态
				queueLoop: true,//判断队列是否循环
				showOpen: true,//是否展开
				pause: false,//是否暂停
				thisTime: null,//判断展示时间的计时器
				lastTime: null,//同上
				phase_1: false,//合并阶段是否完成
				phase_2: false,//散开阶段是否完成
			};
			this.setOption(option);
			this.initSketch();
			this.queueClear();
		},
		/**
		 * 私有 初始化Sketch
		 * @return {null}
		 */
		initSketch: function  () {
			var obj = this;
			this.Sketch = Sketch.create({
			    autopause: false,
			    autoclear: false,
			    container: document.getElementById( this.option.container )
			});
			this.Sketch.setup = function  (linkObj) {
				return function  () {
					linkObj.Sketch.spawn();
				};
			}(obj);
			this.Sketch.spawn = function  (linkObj) {
				return function  () {
					linkObj.dots = getimgData(linkObj.option, linkObj.Sketch);
				    for(var i = 0; i < linkObj.dots.length; i++){
				        linkObj.dots[i].init(linkObj.Sketch, linkObj.option.showTypeBefore,linkObj.option.showTypeAfter,linkObj.option.fontColorRandom, linkObj.option.fontColor);
				        linkObj.dots[i].paint(linkObj.Sketch);
				    }
				};
			}(obj);
			this.Sketch.update = function  (linkObj) {
				return function  () {
					linkObj.queueExecute();
				    linkObj.status.thisTime = +new Date();
				    if(!linkObj.status.pause){
				    	//忘了为什么要有这个if判断了
					    if (linkObj.option.dotRadius === 0) {
					        linkObj.status.process = false;
					    }
					    var dotStatus = {
					    	phase_1: false,
					    	phase_2: false,
					    	finish: false,
					    };
					    for(var i = 0; i < linkObj.dots.length; i++){
					        linkObj.dots[i].move(linkObj.status.process,linkObj.option.v1, linkObj.option.v2);
					        dotStatus.phase_1 = (dotStatus.phase_1 ===  false) ? linkObj.dots[i].status.phase_1 : true;
					        dotStatus.phase_2 = (dotStatus.phase_2 === false) ? linkObj.dots[i].status.phase_2 : true;
					        dotStatus.finish = (dotStatus.finish === false) ? linkObj.dots[i].status.finish : true;
					    }
					    //点事件处理
					    if(linkObj.status.process){
					    	if(dotStatus.phase_1){
					    		linkObj.status.phase_1 = true;
					    		if(linkObj.status.showOpen){
					    			if(linkObj.status.thisTime - linkObj.status.lastTime > linkObj.option.showTime){
					    				linkObj.status.process = false;
					    			}
					    		}
					    	}else{
					    		linkObj.status.phase_1 = false;
				    			linkObj.status.lastTime = +new Date();
				    		}
					    }else{
					    	linkObj.status.phase_2 = true;
					    	if(dotStatus.phase_2){
					    		if(linkObj.status.thisTime - linkObj.status.lastTime > linkObj.option.sleepTime){
				    				linkObj.status.actionFinish = true;
				    			}
					    	}else{
					    		linkObj.status.phase_2 = false;
					    		linkObj.status.actionFinish = false;
					    		linkObj.status.lastTime = +new Date();
					    	}
					    }
					}
				};
			}(obj);
			this.Sketch.draw = function  (linkObj) {
				return function  () {
					if(!linkObj.status.pause){
				        if(!linkObj.status.actionFinish){
				            linkObj.Sketch.clear();
				            for(var i = 0; i < linkObj.dots.length; i++){
				                linkObj.dots[i].paint(linkObj.Sketch);
				            }
				        }
				    }
				    // showFPS();
				};
			}(obj);
		},
		/**
		 * 修改设置
		 * @param {obj} option 设置内容
		 */
		setOption: function  (option) {
			for(var key in option){
		    	if(typeof(this.option[key]) !== undefined){
		    		this.option[key] = option[key];
		    	}
		    }
		},
		/**
		 * 直接展示某个值
		 * @param  {string} arguments[0] 可选值，若有则展示这个值
		 * @return {null}
		 */
		show: function  () {
			this.status.process = true;
			this.status.actionFinish = false;
			this.queue.length = 0;
			this.status.queueTimerProcess = false;
			clearTimeout(this.status.queueTimer);
			this.optionRestore();
			if(arguments[0]){
				this.option.text = arguments[0];
			}
			this.backgroundColorChange();
			this.Sketch.spawn();
		},
		/**
		 * 暂停和恢复
		 * @return {null}
		 */
		pause: function  () {
			this.status.pause = !this.status.pause;
		    this.status.queueTimerProcess = false;
		    clearTimeout(this.status.queueTimer);
		},
		/**
		 * 调制是否展开
		 * @return {null}
		 */
		showToggle: function  () {
			this.status.showOpen = !this.status.showOpen;
		},
		/**
		 * 还在试验中的移动
		 * @param  {double} x x偏移量
		 * @param  {double} y y偏移量
		 * @param  {double} z z偏移量
		 * @return {null}
		 */
		moveBy: function  (x, y, z) {
			if(this.status.showOpen === false){
				for(var i = 0; i < this.dots.length; i++){
	                this.dots[i].setPosition("d", this.dots[i].dx + x, this.dots[i].dy + y, this.dots[i].dz + z);
	            }
			}
		},
		/**
		 * 创建队列
		 * 参数为对象或者字符串
		 * @return {null}
		 */
		queueCreate: function  () {
			if (arguments[0]) {
		        for(var i = 0; i < arguments.length ; i++){
		            this.queue.push(arguments[i]);
		        }
		        this.status.queueTimerProcess = false;
		        clearTimeout(this.status.queueTimer);
		    }
		},
		/**
		 * 私有 队列事件处理
		 * @return {null}
		 */
		queueExecute: function  () {
			if(this.status.actionFinish){
		        if(this.queue.length > 0){
		            clearTimeout(this.status.queueTimer);
		            this.status.queueTimerProcess = false;
		            this.optionRestore();
		            if (!this.status.queueLoop) {
		                this.queueAnylize(this.queue.shift());
		            }else{
		                this.queueAnylize(this.queue[0]);
		                this.queue.push(this.queue.shift());
		            }
		            this.status.process=true;
		            this.status.actionFinish = false;
		            this.backgroundColorChange();
		            this.Sketch.spawn();
		        }else{
		            if(!this.status.pause){
		                if(!this.status.queueTimerProcess){
		                    this.status.queueTimerProcess = true;
		                    var obj = this;
		                    this.status.queueTimer = setTimeout(function(linkObj) {
		                    	return function  () {
		                    		linkObj.status.queueTimerProcess = false;
			                        linkObj.backgroundColorChange();
			                        linkObj.Sketch.spawn();
		                    	};
		                   }(obj), 4000);
		                }
		            }
		        }
		    }
		},
		/**
		 * 私有 队列内容分析
		 * @param  {obj} obj 队列内容
		 * @return {null}
		 */
		queueAnylize: function  (obj) {
			var type = typeof(obj);
		    switch (type){
		        case "number" :
		            obj = obj.toString();
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
		            this.setOption(obj);
		            break;
		        default:
		            break;
		    }
		},
		/**
		 * 队列清空
		 * @return {null}
		 */
		queueClear: function  () {
			this.status.process = false;
		    this.status.actionFinish = true;
		    this.queue.length = 0;
		    this.status.queueTimerProcess = false;
		    clearTimeout(this.status.queueTimer);
		},
		/**
		 * 背景色修改
		 * @return {null}
		 */
		backgroundColorChange: function  () {
			if(this.option.backgroundColorRandom){
		        this.option.backgroundColor = 'rgb(' + Math.floor(Math.random()*255) +','+ Math.floor(Math.random()*255) + ',' + Math.floor(Math.random()*255) + ')';
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
		}

	};

	/**
	 * dot类
	 * @param {int} centerX 有序态位置
	 * @param {int} centerY 有序态位置
	 * @param {int} centerZ 有序态位置
	 * @param {int} radius 点半径
	 * @param {int} focalLength 焦距（没什么卵用）
	 */
	var Dot = function(centerX , centerY , centerZ , radius, focalLength){
	    this.dx = centerX;
	    this.dy = centerY;
	    this.dz = centerZ;//有序状态下的坐标
	    this.tx = 0;
	    this.ty = 0;
	    this.tz = 0;//无序状态下的坐标
	    this.x = centerX;
	    this.y = centerY;
	    this.z = centerZ;//当前坐标
	    this.radius = radius;
	    this.focalLength = focalLength;
	    this.status = {
	    	ready: false,
	    	phase_1: false,
	    	phase_2: false,
	    	finish: false,
	    };
	    this.color = {
	        r: 118,
	        g: 164,
	        b: 212,
	    };
	};
	Dot.prototype = {
		/**
	     * 点的初始化
	     * @param {obj} canvas 绘图canvas
	     * @param  {string} methodBefore 之前扩散的方式
	     * @param  {string} methodAfter  之后扩散的方式
	     * @param {obj} color 文字颜色
	     * @return {null}
	     */
	    init: function  (canvas, methodBefore,methodAfter,fontColorRandom,color) {
	        switch(methodBefore){
	            default :
	            case 'spread' :
	                this.setPosition("n", Math.random()*canvas.width,Math.random()*canvas.height,Math.random()*this.focalLength*2 - this.focalLength);
	                break;
	            case 'top' :
	                this.setPosition("n", Math.random()*canvas.width,0,Math.random()*this.focalLength*2 - this.focalLength);
	                break;
	            case 'bottom' :
	            	this.setPosition("n", Math.random()*canvas.width, canvas.height, Math.random()*this.focalLength*2 - this.focalLength);
	                break;
	        }
	        switch(methodAfter){
	            default :
	            case 'spread' :
	            	this.setPosition("t", Math.random()*canvas.width, Math.random()*canvas.height, Math.random()*this.focalLength*2 - this.focalLength);
	                break;
	            case 'top' :
	            	this.setPosition("t", Math.random()*canvas.width, 0,Math.random()*this.focalLength*2 - this.focalLength);
	                break;
	            case 'bottom' :
	            	this.setPosition("t", Math.random()*canvas.width, canvas.height, Math.random()*this.focalLength*2 - this.focalLength);
	        }
	        if(fontColorRandom){
	            this.color.r = Math.random()*255;
	            this.color.g = Math.random()*255;
	            this.color.b = Math.random()*255;
	        }else{
	            this.color.r = color.r;
	            this.color.g = color.g;
	            this.color.b = color.b;
	        }
	        this.status.ready = true;
	    },
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
		 * [getColor 获取点的颜色值]
		 * @param {float} alpha 透明度
		 * @return {string} 返回rgba颜色值
		 */
	    getColor: function(alpha){
	        // if(this.color.r<0||this.color.g<0||this.color.b<0||this.color.r>255||this.color.g>255||this.color.b>255){
	        //     return "rgba(" + this.option.fontColor.r +"," + this.option.fontColor.g +"," + this.option.fontColor.b + "," + alpha + ")";
	        // }
	        return "rgba(" + Math.floor(this.color.r) + "," + Math.floor(this.color.g) + "," + Math.floor(this.color.b) + "," + alpha + ")";
	    },
	    /**
	     * 点的绘图事件
	     * @param  {obj} context canvas绘图centext
	     * @return {null}
	     */
	    paint:function(context){
	        context.save();
	        context.beginPath();
	        var scale = this.focalLength/(this.focalLength - this.z );//实际控制透明度
	        context.arc(context.width/2 + (this.x-context.width/2)*scale , context.height/2 + (this.y-context.height/2) * scale, this.radius*scale , 0 , 2*Math.PI);
	        context.fillStyle = this.getColor(scale);//获取颜色
	        context.fill();
	        context.closePath();
	        context.restore();
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
	 * @param  {obj} option
	 * @param  {obj} context canvas绘图context
	 * @return {array} dot对象的数组
	 */
	var getimgData = function (option, context){
		context.clear();
	    drawText(option,context);
	    var imgData = context.getImageData(0,0,context.width , context.height);
	    context.clear();
	    var dots = [];
	    for(var x = 0; x < imgData.width; x +=  option.dotDistance ){
	        for(var y = 0; y < imgData.height; y += option.dotDistance ){
	            var i = (y*imgData.width + x)*4;//getImageData的数据结构rgba
	            if(imgData.data[i] >= 128){
	                var dot = new Dot(x + option.xOffset , y +option.yOffset , 0 , option.dotRadius, option.focalLength);
	                dots.push(dot);
	            }
	        }
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
	    context.fillStyle = "rgba(168,168,168,1)";
	    context.textAlign = "center";
	    context.textBaseline = "middle";
	    context.fillText(option.text , context.width/2 , context.height/2);
	    context.restore();
	};

	/**
	 * 网上的深拷贝
	 * @param  {obj} source 源对象
	 * @return {obj}        拷贝后的对象
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
