angular.module('gameCtrl', [])
    .controller('gameController', function (Socket) {
        var canvas = document.getElementById('ctx');
        var ctx = canvas.getContext('2d');
        ctx.font = '15px Arial';
        ctx.fontStyle = 'bold';
        var map = new Image();
        var knight = new Image();
        var gold = new Image();

        Socket.connect();

        Socket.on('newPositions',function(data){
            ctx.clearRect(0,0,500,500);
            drawMap();
            drawGold(80, 80);
            drawGold(80, 130);
            drawGold(130, 80);
            drawGold(130, 130);
            for(var i = 0 ; i < data.length; i++) {
                ctx.fillText(data[i].username, data[i].x, data[i].y);
                ctx.drawImage(knight, data[i].x-30, data[i].y-20, 100, 100);
            }
        });

        var drawMap = function(){
            ctx.drawImage(map, 0,0);
        }
        var drawGold = function(x, y){
            ctx.drawImage(gold, x, y, 50, 50);
        }
        var drawFood = function(){

        }
        var drawWood = function(){

        }
        gold.src = "/assets/img/Gold.png"
        knight.src = "/assets/img/knight.png";
        map.src = "/assets/img/Grass.png";

        document.onkeydown = function(event){
            if(event.keyCode === 68)    //d
                Socket.emit('keyPress',{inputId:'right',state:true});
            else if(event.keyCode === 83)   //s
                Socket.emit('keyPress',{inputId:'down',state:true});
            else if(event.keyCode === 65) //a
                Socket.emit('keyPress',{inputId:'left',state:true});
            else if(event.keyCode === 87) // w
                Socket.emit('keyPress',{inputId:'up',state:true});

        };

        document.onkeyup = function(event){
            if(event.keyCode === 68)    //d
                Socket.emit('keyPress',{inputId:'right',state:false});
            else if(event.keyCode === 83)   //s
                Socket.emit('keyPress',{inputId:'down',state:false});
            else if(event.keyCode === 65) //a
                Socket.emit('keyPress',{inputId:'left',state:false});
            else if(event.keyCode === 87) // w
                Socket.emit('keyPress',{inputId:'up',state:false});
        };
    });
