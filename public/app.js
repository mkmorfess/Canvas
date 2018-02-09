$(document).ready(function(){

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

var canvas, ctx, line  = {
            x: 0,
            y: 0,
            color: '#000000',
            size: 1,
            down: false
        }, brush = {
            x: 0,
            y: 0,
            color: '#000000',
            size: 1,
            down: false
        }, strokes = [], currentStroke = {}, currentLine = {};

function redraw () {
    // console.log(strokes)
    canvas = $('#draw');
    ctx = canvas[0].getContext('2d');

    canvas[0].width = 1135
    canvas[0].height = 555

    

    ctx.clearRect(0, 0, canvas.width(), canvas.height());
            ctx.lineCap = 'round';

        for (var i = 0; i < strokes.length; i++) {
            var s = strokes[i];

            // if (s.color === null) {
            //    s.color = "#000000" 
            // }
            if (s.type === "brush") {

            // console.log(s.color)
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
    }

}
function init() {
    canvas = $('#draw');
    ctx = canvas[0].getContext('2d');

    canvas[0].width = 1135
    canvas[0].height = 555

    canvas.off().mouseup()
    canvas.off().mousedown()
    canvas.off().mousemove()

if ($("#line").attr("data-status") === "active") {
    console.log("this is line")
    
    currentStroke = {};
        
        var twoPoints = false
            // console.log(twoPoints)
        contWidth = $(".messageContainer").css("width")
        contHeight = $(".messageContainer").css("height")
        contHeight = contHeight.replace(/\px/g, '');
        contWidth = contWidth.replace(/\px/g, '');
       
        var pointX1, pointX2, pointY1, pointY2;
        

        canvas.mousedown(function(e){
                console.log(twoPoints)
            currentLine = {
                color: line.color,
                size: line.size,
                type: "line",
                points: [],
            };

                console.log("Current: " + currentStroke)
                console.log(strokes)

            if (twoPoints === false) {
                twoPoints = true;
                pointX1 = e.offsetX * canvas[0].width / contWidth
                pointY1 = e.offsetY * canvas[0].height / contHeight
                // console.log(pointX1)
                // console.log(pointY1)
            }
        }).mouseup(function(e){
                console.log(twoPoints)
             if (twoPoints === true) {

                twoPoints = false;
                pointX2 = e.offsetX * canvas[0].width / contWidth
                pointY2 = e.offsetY * canvas[0].height / contHeight
                // console.log(pointX2)
                // console.log(pointY2)
                
                ctx.beginPath();
                ctx.moveTo(pointX1,pointY1);
                ctx.lineTo(pointX2,pointY2);
                ctx.stroke();

                currentLine.points.push({x: pointX1, y: pointY1})
                currentLine.points.push({x: pointX2, y: pointY2})

                // console.log(currentLine)
                // console.log(currentStroke)
                strokes.push(currentLine);

                socket.emit("new line", currentLine, function(data){
                    // console.log(data);
                    
                })

                currentLine = null;
                

            }
        })

}

    

else if ($("#brush").attr("data-status") === "active") {
    
    currentLine = {};
    console.log("brush")
    
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
        
        // console.log(e)
        brush.down = true;

        currentStroke = {
            color: brush.color,
            size: brush.size,
            type: "brush",
            points: [],
        };

        strokes.push(currentStroke);

        // console.log("Current: " + currentStroke)
        // console.log(strokes)

        

        mouseEvent(e);
    }).mouseup(function (e) {
        
        socket.emit("new line", currentStroke, function(data){
            // console.log(data);
        })
        

        brush.down = false;

        mouseEvent(e);

        currentStroke = null;
    }).mousemove(function (e) {
        if (brush.down)
            mouseEvent(e);
    })

        
    }


        $('#save-btn').click(function () {
            var image = canvas[0].toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.

            window.open(image);
        });

        $('#undo-btn').off().on("click", function () {

            socket.emit("undo line", function(data){
                
            })
               
        });

        $('#clear-btn').click(function () {
            socket.emit("clear line", strokes, function(data){
                strokes = [];
                redraw();
            })
        });

        $('#color-picker').on('input', function () {
            brush.color = this.value;
            line.color = this.value;
        });

        $('#brush-size').on('input', function () {
            brush.size = this.value;
            line.color = this.value
        });
}


$(init);

    $(window).resize(function(){
        init()
        redraw();
    });

    $("#brush").on("click", function(){
        $(this).attr("data-status", "active")
        console.log("Brush: " + $("#brush").attr("data-status"))
        $("#line").attr("data-status", "inactive")
        console.log("Line: " + $("#line").attr("data-status"))
        init()
        redraw();
        
    })

    $("#line").on("click", function(){
        
            $(this).attr("data-status", "active")
            console.log("Line: " + $("#line").attr("data-status"))
            $("#brush").attr("data-status", "inactive")
            console.log("Brush: " + $("#brush").attr("data-status"))
            init()
            redraw();
       
        
    })


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

	userForm.submit(function(e){
		e.preventDefault();
		socket.emit("new user", username.val().trim(), function(data){
			
			if (data) {
				userFormArea.css("display", "none");
				messageArea.show("display", "block");
                $("#message").attr("data-name", username.val().trim())
			}

            socket.on("get drawing", function(data){

                for (var i = 0; i < data.line.length; i++) {
                     strokes.push(data.line[i])
                }

                redraw();

            })

		});
		// username.val("")
	})


	socket.on("new message", function(data){
		chat.prepend("<div class='well'>"+ data.msg + "</div>")
	})



	socket.on("get users", function(data){
        
		var html = ""
		for (var i = 0; i < data.length; i++) {
			html += "<li class='list-group-item'>" + data[i] + "</li>"
		}

		users.html(html)
	})

	socket.on("send line", function(data){

        strokes = [];
        
		for (var i = 0; i < data.line.length; i++) {
             var newStroke = data.line[i]
             strokes.push(newStroke)
             // console.log(strokes)
        }

		redraw();
        // console.log(strokes)


	})

	socket.on("cleared line", function(data){
		
		strokes = [];
		
		// console.log(data)
		// console.log(strokes)

		redraw();


	})

	

	
	



})