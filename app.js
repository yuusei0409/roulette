var Mode = {
    waiting: 0,
    acceleration: 1,
    constant: 2,
    deceleration: 3,
    result: 4
};
var mode = Mode.waiting;
var nameList = [];
var probabilityList = [];
var colorList = [];
var ratioSum = 0;
var speed = 0.0;
var theta = 0.0;
var deceleration_theta = 0.0;
var len = 0;
var resultDisplayed = false;
var stop_flag = false;
var NGwordList = [];
var targetWord = "";

const ACCEL = 0.01;
const DECEL = 0.001;
const MAX_SPEED = 0.3165;
const RADIUS = 100;
const COLOR_ADJ = 0.4;
const TRIANGLE_SIZE = 10;
const MARGIN = 10;
const DECEL_RAND_LEVEL = 10;
const DECEL_RAND_MAGNITUDE = 0.001;

var holding = false;

function getRandomInt(min, max) {
  return min+Math.floor(Math.random() * Math.floor(max-min));
}

function preload(){
    
}

function setup(){
    var canvas = createCanvas(600,400);
    canvas.parent('canvas');
    textSize(20);
    stroke(0,0,0);
    fill(0,0,0);
    background(255,255,255);
    dataFetch();
}

function mousePressed(){
    holding = true;
    
}

function mouseReleased() {
    holding = false;

}

function touchStarted(){
    mousePressed();
}

function touchEnded(){
    mouseReleased();
}

//set color indicator
function cssColorSet(){
    var counter = 0;
    $('.color-indicator').each(function(){
        push();
        colorMode(HSL, 255);
        var c = color(colorList[counter],255-COLOR_ADJ*colorList[counter],128);
        pop();
        var bgColor = "rgb("+c._getRed()+","+c._getGreen()+","+c._getBlue()+")";
        $(this).css('background-color', bgColor);

        var parent = $(this).closest('.item');
        var indicator_ = parent.find('.color-indicator_');
        if(indicator_.length){
            indicator_.css('background-color', bgColor);
        }

        counter++;
    });
}

//input to array
function dataFetch(){
    ratioSum = 0.0;
    $('.item').each(function(){
        var ratio = 1;
        ratioSum += ratio;
    });
    nameList = [];
    probabilityList = [];
    $('.item').each(function(){
        var name = $(this).find('.name').val();
        var ratio = 1;
        nameList.push(name);
        probabilityList.push(ratio/ratioSum);
    });
    //color
    var colors = [];
    len = nameList.length;
    for(var i=0;i<len;i++){
        colors.push(Math.floor(255/len*i));
    }
    colorList = [];
    if(len%2==0){
        for(var i=0;i<len;i+=2){
            colorList[i] = colors[Math.floor(i/2)];
        }
        for(var i=1;i<len;i+=2){
            colorList[i] = colors[Math.floor(i/2 + len/2)];
        }
    }else{
        for(var i=0;i<len;i+=2){
            colorList[i] = colors[Math.floor(i/2)];
        }
        for(var i=1;i<len;i+=2){
            colorList[i] = colors[Math.floor(i/2)+Math.floor(len/2)+1];
        }
    }
    cssColorSet();
}

function validation(){
    var badflag = false;
    $('.name').each(function(){
        if($(this).val()==""){
            badflag = true;
        }
    });
    if(badflag){
        alert('項目名と割合を正しく設定してください。');
        return 1;
    }
    return 0;
}

function calculateTargetAngle(index) {
    // 各項目の角度範囲をラジアンで計算
    var anglePerItem = 2 * PI / nameList.length; // 各項目の角度（ラジアン）
    var targetAngle = index * anglePerItem + PI / 2 + anglePerItem/2;

    return targetAngle;
}

function start(){
    if(mode==Mode.waiting){
        if(validation()==1){
            return;
        }
        dataFetch();

        if (targetWord != "") {
        }
        else if (NGwordList.length > 0) {
            var filteredList = nameList.filter(item => !NGwordList.includes(item));
            var randomIndex = Math.floor(Math.random() * filteredList.length);
            targetWord = filteredList[randomIndex];
        }
        else {
            var randomIndex = Math.floor(Math.random() * nameList.length);
            targetWord = nameList[randomIndex];
        }

        var targetIndex = nameList.indexOf(targetWord);
        window.targetAngle = calculateTargetAngle(targetIndex);

        $('#stop').css('display', 'inline-block');
        $('#start').css('display', 'none');
        dataFetch();
        mode = Mode.acceleration;
    }
}

function stop(){
    if(//mode==Mode.acceleration || //加速中でもストップボタンを効かせるにはコメントアウト
       mode==Mode.constant){
        $('#start').css('display', 'none');
        $('#stop').css('display', 'none');
        stop_flag = true;
    }
}

function reset(){
    $('#start').css('display', 'inline-block');
    $('#stop').css('display', 'none');
    theta = 0.0;
    speed = 0.0;
    mode = Mode.waiting;
    if(validation()==0){
        dataFetch();
    }
    $('#result').html('????');
    resultDisplayed = false;
    stop_flag = false;
    NGwordList = [];
    targetWord = "";
}

function drawRoulette(){
    var angleSum = 0.0;
    push();
    colorMode(HSL, 255);
    for(var i=0;i<len;i++){
        fill(colorList[i],255-COLOR_ADJ*colorList[i],128);
        arc(0,0,RADIUS*2,RADIUS*2,angleSum,angleSum+2*PI*probabilityList[i]);
        angleSum += probabilityList[i]*2*PI;
    }
    pop();
}

function draw(){
    fill(255,255,255);
    rect(0,0,width,height);
    translate(width/2, height/2);

    fill(255,0,0);
    push();
    translate(0, -RADIUS-MARGIN);
    triangle(0, 0, -TRIANGLE_SIZE/2, -TRIANGLE_SIZE, TRIANGLE_SIZE/2, -TRIANGLE_SIZE);
    pop();

    switch(mode){
    case Mode.waiting:
        break;
    case Mode.acceleration:
        if(speed<MAX_SPEED){
            speed += ACCEL;
        }else{
            speed = MAX_SPEED;
            mode = Mode.constant;
        }
        theta += speed;
        theta-=(Math.floor(theta/2/PI))*2*PI;
        rotate(theta);
        break;
    case Mode.constant:
        if (stop_flag) { //stopボタンが押された場合
            if(theta > 0+2*PI-targetAngle && theta < 0.01+2*PI-targetAngle) {
                mode = Mode.deceleration;
            }
        }
        theta += speed;
        theta-=(Math.floor(theta/2/PI))*2*PI;
        rotate(theta);
        break;
    case Mode.deceleration:
        if(speed>DECEL){
            speed -= DECEL;
        }else{
            speed = 0.0;
            mode = Mode.result;
        }
        theta += speed;
        theta-=(Math.floor(theta/2/PI))*2*PI;
        rotate(theta);
        break;
    case Mode.result:
        rotate(theta);
        if(!resultDisplayed){
            resultDisplayed = true;
            var angleSum = theta;
            var beforeAngleSum = theta;
            var result = 0;
            for(var i=0;i<len;i++){
                angleSum += probabilityList[i]*2*PI;
                if((angleSum>3/2*PI&&beforeAngleSum<3/2*PI) || (angleSum>7/2*PI&&beforeAngleSum<7/2*PI)){
                    result = i;
                    break;
                }
                beforeAngleSum = angleSum;
            }
            $('#result').html(nameList[result]);
        }
        break;
    }
    drawRoulette();
}