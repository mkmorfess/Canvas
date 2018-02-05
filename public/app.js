$(document).ready(function(){
var canvas, ctx,
    brush = {
        x: 0,
        y: 0,
        color: '#000000',
        size: 10,
        down: false,
    },
    strokes = [],
    currentStroke = null;

function redraw () {
    ctx.clearRect(0, 0, canvas.width(), canvas.height());
    ctx.lineCap = 'round';
    for (var i = 0; i < strokes.length; i++) {
        var s = strokes[i];
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
}

function init () {
    canvas = $('#draw');
    ctx = canvas[0].getContext('2d');
    canvas[0].width = 800
    canvas[0].height = 200
    canvas[0].style.width = 800
    canvas[0].style.height = 200;

    function mouseEvent (e) {
    	
        brush.x = e.offsetX;
        brush.y = e.offsetY;

        console.log(brush.x)
        console.log(brush.y)

        currentStroke.points.push({
            x: brush.x,
            y: brush.y,
        });

        

        redraw();
    }

    canvas.mousedown(function (e) {
        console.log(e)
        brush.down = true;

        currentStroke = {
            color: brush.color,
            size: brush.size,
            points: [],
        };

        strokes.push(currentStroke);

        // console.log(strokes)

        

        mouseEvent(e);
    }).mouseup(function (e) {

    	socket.emit("new line", currentStroke, function(data){
			console.log(data);
		})
    	

        brush.down = false;

        mouseEvent(e);

        currentStroke = null;
    }).mousemove(function (e) {
        if (brush.down)
            mouseEvent(e);
    });

    $('#save-btn').click(function () {
        window.open(canvas[0].toDataURL());
    });

    $('#undo-btn').click(function () {
        strokes.pop();
        redraw();
    });

    $('#clear-btn').click(function () {
    	socket.emit("clear line", strokes, function(data){
    		strokes = [];
        	redraw();
    	})
    });

    $('#color-picker').on('input', function () {
        brush.color = this.value;
    });

    $('#brush-size').on('input', function () {
        brush.size = this.value;
    });
}

$(init);


	
	var socket = io.connect();
	var messageForm = $("#messageForm")
	var message = $("#message")
	var chat = $("#chat")
	var userForm = $("#userForm")
	var userFormArea = $("#userFormArea")
	var messageArea = $("#messageArea")
	var users = $("#users")
	var username = $("#username")

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

        console.log(data.line[0])
		for (var i = 0; i < data.line.length; i++) {
             var newStroke = data.line[i]
             strokes.push(newStroke)
             console.log(strokes)
        }

		redraw();
        console.log(strokes)


	})

	socket.on("cleared line", function(data){
		
		strokes = [];
		
		// console.log(data)
		console.log(strokes)

		redraw();


	})

	

	
	



})