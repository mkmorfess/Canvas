$(document).ready(function(){
//Global variables set
var socket = io.connect();
var messageForm = $("#messageForm")
var message = $("#message")
var chat = $("#chat")
var userForm = $("#userForm")
var userFormArea = $("#userFormArea")
var messageArea = $("#messageArea")
var users = $("#users")
var username = $("#username")
var contHeight;
var contWidth;
var canvas, ctx
var line  = {
            x: 0,
            y: 0,
            color: '#000000',
            size: 1,
            down: false
        }
var brush = {
            x: 0,
            y: 0,
            color: '#000000',
            size: 1,
            down: false
        }
var strokes = [], currentStroke = {}, currentLine = {}, currentCircle = {};

//Initiates the canvas
init();



//Save Button
$('#save-btn').click(function () {
    var image = canvas[0].toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.

    window.open(image);
});

//Undo Button

$('#undo-btn').off().on("click", function () {

    $.ajax({
        url: "/undo",
        type: "DELETE"
    }).done(function(response){
        console.log(response)
    })

    socket.emit("undo line", function(data){    
    })

});

//Clear Button

$('#clear-btn').click(function () {
    socket.emit("clear line", strokes, function(data){
        strokes = [];
        redraw();
    })
});

//Color Picker

$('#color-picker').on('input', function () {
    brush.color = this.value;
    line.color = this.value;
});

//Brush Size

$('#brush-size').on('input', function () {
    brush.size = this.value;
    line.size = this.value
});


//Rescales the canvas with init and redraw on window resize
$(window).resize(function(){
    init()
    redraw();
});

//Brush Button

$("#brush").on("click", function(){

    $(this).attr("data-status", "active")
    
    $("#line").attr("data-status", "inactive")
    $("#circle").attr("data-status", "inactive")
    
    init()
    redraw();  
})

//Line Button

$("#line").on("click", function(){

    $(this).attr("data-status", "active")
    
    $("#brush").attr("data-status", "inactive")
    $("#circle").attr("data-status", "inactive")
    
    init()
    redraw();

})

$("#circle").on("click", function(){

    $(this).attr("data-status", "active")

    $("#brush").attr("data-status", "inactive")
    $("#line").attr("data-status", "inactive")

    init()
    redraw();

})

//Sending a message on submit
messageForm.submit(function(e){
    e.preventDefault();

    if (message.val().trim() === "") {
        message.val("")
    } else {
      socket.emit("send message", $("#message").attr("data-name") + ": " + message.val().trim(), function(data){
            
      });


      message.val("")
      
    }
})


//User Form on Submit to take in a new user on the app
userForm.submit(function(e){
    e.preventDefault();
    socket.emit("new user", username.val().trim(), function(data){
        
        if (data) {
            userFormArea.css("display", "none");
            messageArea.css("display", "block");
            $("#message").attr("data-name", username.val().trim())
        }

        socket.on("get drawing", function(data){

            for (var i = 0; i < data.line.length; i++) {
                 strokes.push(data.line[i])
            }

            redraw();

        })

        $.ajax({
            url: "/",
            type: "PUT"
        }).done(function(response){
            console.log(response)
            for (var i = 0; i < response.length; i++) {
                var dbStrokes = {
                    color: response[i].color,
                    size: response[i].size,
                    type: response[i].type,
                    points: []
                }
                if (response[i].type === "line" || response[i].type === "brush") {

                    for (var j = 0; j < response[i].points.length; j++) {
                        dbStrokes.points.push({x: response[i].points[j].x, y: response[i].points[j].y})
                    }

                }

                if (response[i].type === "circle") {
                    for (var j = 0; j < response[i].points.length; j++) {
                        dbStrokes.points.push({x: response[i].points[j].x, y: response[i].points[j].y, r: response[i].points[j].r})
                    }
                }
       
                strokes.push(dbStrokes)
            }

            console.log(strokes)
            redraw();

        })

    });
})

//Web socket receives new message from the user from the server and prepends the message
socket.on("new message", function(data){
    chat.prepend("<div class='well'>"+ data.msg + "</div>")
})


//Anytime a new user joins, web socket retrieves the list of users from the server and displays them
socket.on("get users", function(data){
    
    var html = ""
    for (var i = 0; i < data.length; i++) {
        html += "<li class='list-group-item'>" + data[i] + "</li>"
    }

    users.html(html)
})


//This gets the array of strokes from the server and displays them on the canvas
socket.on("send line", function(data){
    
    for (var i = 0; i < data.line.length; i++) {
         var newStroke = data.line[i]
         strokes.push(newStroke)
    }

    redraw();
})

//Web socket getting a response from the server that all the strokes have been cleared and to redraw a blank canvas

socket.on("cleared line", function(data){
    
    strokes = [];

    $.ajax({
        url: "/delete",
        type: "DELETE"
    }).done(function(response){
        console.log(response)
    })

    redraw();




})

    

    


function redraw () {
    
    canvas = $('#draw');
    ctx = canvas[0].getContext('2d');

    canvas[0].width = 1135
    canvas[0].height = 555

    

    ctx.clearRect(0, 0, canvas.width(), canvas.height());
    ctx.lineCap = 'round';

    //Goes through the array of strokes and displays them on the canvas

    for (var i = 0; i < strokes.length; i++) {
        var s = strokes[i];

        
        if (s.type === "brush") {

            ctx.strokeStyle = s.color;
            ctx.lineWidth = s.size;
            ctx.beginPath();
            ctx.moveTo(s.points[0].x, s.points[0].y);

            for (var j = 0; j < s.points.length; j++) {

                var p = s.points[j];
                ctx.lineTo(p.x, p.y);

            }

            ctx.stroke();
        }

        if (s.type === "line") {

            ctx.strokeStyle = s.color;
            ctx.lineWidth = s.size;
            ctx.beginPath();
            ctx.moveTo(s.points[0].x, s.points[0].y);
            ctx.lineTo(s.points[1].x, s.points[1].y);
            ctx.stroke();
            
        }

        if (s.type === "circle") {
            ctx.strokeStyle = s.color;
            ctx.lineWidth = s.size;
            ctx.beginPath();
            ctx.arc(s.points[0].x, s.points[0].y, s.points[0].r, 0, 2 * Math.PI);
            ctx.stroke()

        }
    }
}


function init() {

    canvas = $('#draw');
    ctx = canvas[0].getContext('2d');

    canvas[0].width = 1135
    canvas[0].height = 555
    //Unbinds the previous mouse events
    canvas.off().mouseup()
    canvas.off().mousedown()
    canvas.off().mousemove()

    if ($("#line").attr("data-status") === "active") {
        
        currentStroke = {};
        currentCircle = {};
            
        var twoPoints = false
            
        contWidth = $(".messageContainer").css("width")
        contHeight = $(".messageContainer").css("height")
        contHeight = contHeight.replace(/\px/g, '');
        contWidth = contWidth.replace(/\px/g, '');
       
        var pointX1, pointX2, pointY1, pointY2;
            

        canvas.mousedown(function(e){
            
            currentLine = {
                color: line.color,
                size: line.size,
                type: "line",
                points: [],
            };

            if (twoPoints === false) {
                twoPoints = true;
                pointX1 = e.offsetX * canvas[0].width / contWidth
                pointY1 = e.offsetY * canvas[0].height / contHeight
                
            }

        }).mouseup(function(e){
                
             if (twoPoints === true) {

                twoPoints = false;
                pointX2 = e.offsetX * canvas[0].width / contWidth
                pointY2 = e.offsetY * canvas[0].height / contHeight
                
                
                ctx.beginPath();
                ctx.moveTo(pointX1,pointY1);
                ctx.lineTo(pointX2,pointY2);
                ctx.stroke();

                currentLine.points.push({x: pointX1, y: pointY1})
                currentLine.points.push({x: pointX2, y: pointY2})

                
                strokes.push(currentLine);

                $.ajax({
                    url: "/",
                    type: "POST",
                    data: currentLine
               }).done(function(response){

                 console.log(response)
                 
                 
               })  

                socket.emit("new line", currentLine, function(data){
                    
                    
                })

                currentLine = {};
                

            }
        }).mousemove(function(e){

            var tempX = e.offsetX * canvas[0].width / contWidth
            var tempY = e.offsetY * canvas[0].height / contHeight

            if (twoPoints) {

                ctx.clearRect(0, 0, contWidth, contHeight)
                redraw()
                ctx.beginPath();
                ctx.moveTo(pointX1,pointY1);
                ctx.lineTo(tempX,tempY);
                ctx.stroke();
                
            }
        })
    }

    

    else if ($("#brush").attr("data-status") === "active") {
        
        
        currentLine = {};
        currentCircle = {};
        
        function mouseEvent (e) {
            
            
            contWidth = $(".messageContainer").css("width")
            contHeight = $(".messageContainer").css("height")
            contHeight = contHeight.replace(/\px/g, '');
            contWidth = contWidth.replace(/\px/g, '');
           

            brush.x = e.offsetX  * canvas[0].width / contWidth;
            brush.y = e.offsetY * canvas[0].height / contHeight;
            
       
           

            currentStroke.points.push({
                x: brush.x,
                y: brush.y,
            });

            

            redraw();
        }

        canvas.mousedown(function (e) {
            
            
            brush.down = true;

            currentStroke = {
                color: brush.color,
                size: brush.size,
                type: "brush",
                points: [],
            };

            strokes.push(currentStroke);

            mouseEvent(e);
        }).mouseup(function (e) {

            console.log(currentStroke)


              $.ajax({
                url: "/",
                type: "POST",
                data: currentStroke
               }).done(function(response){

                 console.log(response)
                
                 
               })  
            
            socket.emit("new line", currentStroke, function(data){
                
            })

            brush.down = false;

            mouseEvent(e);
            
            currentStroke = {};
            
        }).mousemove(function (e) {
            if (brush.down)
                mouseEvent(e);
        }) 
    }

    else if ($("#circle").attr("data-status") === "active") {
        
        currentStroke = {};
        currentLine = {};
            
        var twoPoints = false
            
        contWidth = $(".messageContainer").css("width")
        contHeight = $(".messageContainer").css("height")
        contHeight = contHeight.replace(/\px/g, '');
        contWidth = contWidth.replace(/\px/g, '');
       
        var pointX1, pointX2, pointY1, pointY2, radius;
            

        canvas.mousedown(function(e){

            currentCircle = {
                color: line.color,
                size: line.size,
                type: "circle",
                points: [],
            };

            if (twoPoints === false) {
                twoPoints = true;
                pointX1 = e.offsetX * canvas[0].width / contWidth
                pointY1 = e.offsetY * canvas[0].height / contHeight
                
            }

        }).mouseup(function(e){

            if (twoPoints === true) {

                twoPoints = false;
                pointX2 = e.offsetX * canvas[0].width / contWidth
                pointY2 = e.offsetY * canvas[0].height / contHeight
                radius = Math.abs(pointX1 - pointX2)
                
                
                
                ctx.beginPath();
                ctx.arc(pointX1, pointY1, radius, 0, 2 * Math.PI);
                ctx.stroke()

                currentCircle.points.push({x: pointX1, y: pointY1, r: radius})
                // currentCircle.points.push({x: pointX2, y: pointY2})

                
                strokes.push(currentCircle);

                $.ajax({
                    url: "/",
                    type: "POST",
                    data: currentCircle
                }).done(function(response){

                 console.log(response)
                 
                 
               })  

                socket.emit("new line", currentCircle, function(data){
                    
                    
                })

                currentCircle = {};
                

            }
                
        }).mousemove(function(e){

            var tempX = e.offsetX * canvas[0].width / contWidth
            var tempY = e.offsetY * canvas[0].height / contHeight
            var tempRadius = Math.abs(pointX1 - tempX)

            if (twoPoints) {

                ctx.clearRect(0, 0, contWidth, contHeight)
                redraw()
                ctx.beginPath();
                ctx.arc(pointX1, pointY1, tempRadius, 0, 2 * Math.PI);
                ctx.stroke();
                
            }

        })
    }

    else {
        throw Error("Something went wrong")
    }

}

})