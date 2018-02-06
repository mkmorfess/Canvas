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

var canvas, ctx,
    brush = {
        x: 0,
        y: 0,
        color: '#000000',
        size: 1,
        down: false,
    },
    strokes = [],
    currentStroke = null;

function redraw () {
    console.log(strokes)

     if ($(window).width() > 1200) {

        canvas[0].width = 1135
        canvas[0].height = 555
        canvas[0].style.width = 1135    
        canvas[0].style.height = 555;

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

    else if ($(window).width() <= 1200 && $(window).width() > 991) {

        canvas[0].width = 935
        canvas[0].height = 400
        canvas[0].style.width = 935    
        canvas[0].style.height = 400;
        var theStrokes = [];

        if (strokes.length > 0) {
            for (var i = 0; i < strokes.length; i++) {
                theStrokes.push({"color": strokes[i].color, size: strokes[i].size, points: []})
                for (var j = 0; j < strokes[i].points.length; j++) {
                    theStrokes[i].points.push({x: strokes[i].points[j].x * canvas[0].width / 1135, y: strokes[i].points[j].y * canvas[0].height / 555})
                }
            }
            ctx.clearRect(0, 0, canvas.width(), canvas.height());
            ctx.lineCap = 'round';
        for (var i = 0; i < theStrokes.length; i++) {
            var s = theStrokes[i];
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
        
   
    }

    else if ($(window).width() <= 991 && $(window).width() > 767) {

        canvas[0].width = 720
        canvas[0].height = 355
        canvas[0].style.width = 720   
        canvas[0].style.height = 355;
        

    }

    else {
        
    }

    
}

function init () {
    canvas = $('#draw');
    ctx = canvas[0].getContext('2d');

    // if ($(window).width() > 1200) {

    //     canvas[0].width = 1135
    //     canvas[0].height = 555
    //     canvas[0].style.width = 1135    
    //     canvas[0].style.height = 555;
   
    // }

    // else if ($(window).width() <= 1200 && $(window).width() > 991) {

    //     canvas[0].width = 935
    //     canvas[0].height = 460
    //     canvas[0].style.width = 935    
    //     canvas[0].style.height = 460;
   
    // }

    // else if ($(window).width() <= 991) {

    //     canvas[0].width = 720
    //     canvas[0].height = 355
    //     canvas[0].style.width = 720   
    //     canvas[0].style.height = 355;

    // }


    // else {

    // }

        
    

    function mouseEvent (e) {
    	
        brush.x = e.offsetX;
        brush.y = e.offsetY;

        // console.log(brush.x)
        // console.log(brush.y)

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
            points: [],
        };

        strokes.push(currentStroke);

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

        // console.log(data.line[0])
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