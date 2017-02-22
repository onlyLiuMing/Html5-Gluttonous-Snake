//纯原生js实现,可改为jquery实现
//参数设置:Snack(游戏框的id,得分id,速度id,上下格子数目,左右格子数目)
var Snack = function (ele,scoreele,x,y) {
    this.cellWidth = 20;//每个格子的大小
    this.ele = document.getElementById(ele);//获取游戏框的主体
    this.cxt = this.ele.getContext("2d");//链接canvas内容
    this.x = x;//上下格子的数目
    this.y = y;//左右格子的数目
    this.scoreele = document.getElementById(scoreele);//获取显示  得分  的div

    this.timer = null;//循环函数
    this.coolPoint = [];//随机点

    //绑定方向事件
    this.changeDirection();
};

//定义在原型上的方法
//noinspection JSAnnotator
Snack.prototype = {
    //初始化方法
    init:function (_speed) {
        //初始化,重置,恢复js数据,和dom
        //清理定时器
        clearInterval(this.timer);
        this.direction = 1;//方向: 1右边  2下边  3左边  4上边
        this.nextDirection = "";//下一次的方向
        this.snackArr = [[0,parseInt(this.y/2)],[1,parseInt(this.y/2)]];//蛇身的数组
        this.speed = _speed;//速度
        this.score = 0;//得分
        //设置游戏框体的大小(重新绘制canvas大小,会覆盖之前的绘图渲染)
        this.ele.width = this.cellWidth * this.x;//设置游戏框  左右宽度
        this.ele.height = this.cellWidth * this.y;//设置游戏框  上下高度
        this.ele.style.border = "1px solid black";//显示游戏框的  边框


        this.cxt.fillStyle = "#000";//设置canvas的颜色 白色
        this.cxt.fillRect(0,0,this.cellWidth * this.x,this.cellwidth * this.y);//用canvas画出矩形游戏框,大小等于开始的设置
        this.scoreele.style.display = "inline-block";
        this.scoreele.innerHTML = "得分: 0";

        //开始渲染游戏主体
        //产生随机点
        this.createCoolPoint();
        //绘制初始单元格
        this.drawCell(this.coolPoint,2);
        //绘制初始小蛇
        this.drawSnack();
        //设置定时器,速度
        this.setTimer();
    },

    //设置时间函数
    setTimer:function(){
        var speedArr = [900,800,700,600,500,400,300,200,100];
        var speed = this.speed;
        if(speed > 8){
            speed = 8;
        };
        (function(theThis){
            var that = theThis;
            that.timer = setInterval(function(){
                that.moveSnack();
            },speedArr[speed])
        }(this))
    },

    //移动蛇的逻辑,数组处理
    moveSnack:function(){
        this.direction = this.nextDirection == ""? this.direction:this.nextDirection;//当前移动方向,和下一个移动方向,这样可以处理一个bug
        var dirction = this.direction;
        var snackArr = this.snackArr;
        var  snackHead = snackArr[snackArr.length - 1];
        switch(dirction){
            case 1://向右
             snackHead = [snackHead[0]+1,snackHead[1]];
             break;
            case 2://向下
            snackHead = [snackHead[0],snackHead[1]+1];
            break;
            case 3://向左
            snackHead = [snackHead[0]-1,snackHead[1]];
            break;
            case 4://向上
            snackHead = [snackHead[0],snackHead[1]-1];
            break;

        }
        //超界,或者装上自己,  结束,重置
        if(in_array(snackHead,snackArr) || snackHead[0] < 1 || snackHead[0] > this.x ||snackHead[1]<1||snackHead[1]>this.y){
            clearInterval(this.timer);//清理定时器,结束游戏
            alert("胜败乃兵家常事,大侠请重新来过.得分: "+this.score);
            //this.init();//初始化游戏
            return
        }
        //将蛇头放入蛇身数组
        snackArr.push(snackHead);

        this.drawCell(snackHead,1);
        if(snackHead.toString()!= this.coolPoint.toString()){
            var tail = snackArr.shift();//移除蛇尾
            this.drawCell(tail,0);
        }else{
            //撞到coolPoint
            this.createCoolPoint();
            this.drawCell(this.coolPoint,2);
            this.score = this.score + 10;
            this.scoreele.innerHTML = "得分"+ this.score;
            this.speed = Math.ceil((this.score + 1)/100);
        }

    },

    //随机生成coolPoint,不再代表snackArr的数组中
    createCoolPoint:function(){
        do{
            this.coolPoint = [getRandom(this.x),getRandom(this.y)];

        }while(in_array(this.coolPoint,this.snackArr));
    },

    //改变方向,下一步的移动方向
    changeDirection:function(){
        var that = this;
        document.onkeydown = function(e){
            var event = e||window.event;
            var direction = that.direction;
            var keyCord = event.keyCode;

            switch(keyCord){
                case 39://右
                    if(direction!=1&&direction!=3){
                        that.nextDirection = 1;
                    }
                    break;
                case 40://下
                    if(direction!=2&&direction!=4){
                        that.nextDirection = 2;
                    }
                    break;
                case 37://下
                    if(direction!=1&&direction!=3){
                        that.nextDirection = 3;
                    }
                    break;
                case 38://下
                    if(direction!=2&&direction!=4){
                        that.nextDirection = 4;
                    }
                    break;
                default:
                    break;

            }
        }
    },

    //绘制初始小蛇
    drawSnack:function(){
        var snackArr = this.snackArr;
        for(var i=0;i<snackArr.length;i++){
            this.drawCell(snackArr[i],1);
        }
    },

    //绘制canvas的单元格
    drawCell:function(pos,type){
        var colorArr = ["#fff","#000","red"];
        var cxt = this.cxt;
        var area;
        area = this.getCellArea(pos);
        cxt.fillStyle= colorArr[type];
        cxt.fillRect(area[0],area[1],this.cellWidth-1,this.cellWidth-1);
    },

    //返回一个格子左上角的像素坐标
    getCellArea:function(position){
        return [(position[0]-1)*this.cellWidth+1,(position[1]-1)*this.cellWidth+1]
    }
};


/*
* 游戏的通用函数
* */

//模拟in_array函数,用以检测数组中是否含有目标值
function in_array(str,arr){
    for(var i=0;i<arr.length;i++){
        if(str.toString() == arr[i].toString()){
            return true;
        }
    }
    return false;
}

//获取随机的值
function getRandom(num){
    var temp = Math.ceil(Math.random() * num) ;
    return temp;
}



/*设置监听事件(因为懒,所以用了jquery)*/
$(function(){
    var _speed = 6;
    $("#init").on("click","button",function(e){
        if (e.target.id == "easy"){_speed = 6}
        else if (e.target.id == "hard"){_speed = 7}
        else if (e.target.id == "very-hard"){_speed = 8}
        else if (e.target.id == "start"){
            snack.init(_speed);//初始化游戏
        }
    });
    var snack = new Snack("snack","score",61,30);
});