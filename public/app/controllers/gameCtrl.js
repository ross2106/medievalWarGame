angular.module('gameCtrl', [])
    .controller('gameController', function (Socket) {
        var canvas = document.getElementById('ctx');
        var ctx = canvas.getContext('2d');
        ctx.font = '15px Arial';
        ctx.fontStyle = 'bold';
        var map = new Image();
        var knight = new Image();
        Socket.connect();

        Socket.on('newPositions',function(data){
            ctx.clearRect(0,0,500,500);
            drawMap();
            for(var i = 0 ; i < data.length; i++) {
                ctx.fillText(data[i].username, data[i].x, data[i].y);
                ctx.drawImage(knight, data[i].x-30, data[i].y-20, 100, 100);
            }
        });

        var drawMap = function(){
            ctx.drawImage(map, 0,0);
        }
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
