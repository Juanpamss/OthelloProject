var chat_room = getURLParameters('game_id');
if('undefined' == typeof chat_room || !chat_room){
    chat_room = 'lobby'
}

/*Connect to the socket server*/
var socket = io.connect();

/*Receive log messages from server*/
socket.on('log', function (array){
    console.log.apply(console,array);
})

/*Response from server when someone joins*/
socket.on('join_room_response', function (payload){
    if(payload.result == 'fail'){
        alert(payload.message)
        return
    }
    if(payload.socket_id == socket.id){
        return;
    }

    /*When someone joins the room*/
    var dom_elements = $('.socket_'+payload.socket_id);

    if(dom_elements.length ==  0){
        var nodeA = $('<div></div>');
        nodeA.addClass('socket_'+payload.socket_id);

        var nodeB = $('<div></div>');
        nodeB.addClass('socket_'+payload.socket_id);

        var nodeC = $('<div></div>');
        nodeC.addClass('socket_'+payload.socket_id);

        nodeA.addClass('w-100');

        nodeB.addClass('col-9 text-right');
        nodeB.append('<h4>'+payload.username+'</h4>');

        nodeC.addClass('col-3 text-left');
        var buttonC = makeInviteButton();
        nodeC.append(buttonC);

        nodeA.hide();
        nodeB.hide();
        nodeC.hide();
        $('players').append(nodeA,nodeB,nodeC);
        nodeA.slideDown(1000);
        nodeB.slideDown(1000);
        nodeC.slideDown(1000);
    }else{
        var buttonC = makeInviteButton();
        $('.socket_'+payload.socket_id+' button').replaceWith(buttonC)
        dom_elements.slideDown(1000);
    }
    /**/

    /*Chat messages*/
    var newHTML = '<p>' + payload.username + 'just entered the lobby</p>';
    var newNode = $(newHTML);
    newNode.hide();
    $('#messages').append(newNode);
    newNode.slideDown(1000);
    /**/
    console.log("New user joined the room: " + payload.username)
});

/*Response from server when someone leaves*/
socket.on('player_disconnected', function (payload){
    if(payload.result == 'fail'){
        alert(payload.message)
        return
    }
    if(payload.socket_id == socket.id){
        return;
    }

    /*When someone joins the room*/
    var dom_elements = $('.socket_'+payload.socket_id);

    if(dom_elements.length !=  0){

        dom_elements.slideUp(1000);
    }

    /*Chat messages*/
    var newHTML = '<p>' + payload.username + 'left the lobby</p>';
    var newNode = $(newHTML);
    newNode.hide();
    $('#messages').append(newNode);
    newNode.slideDown(1000);
    /**/
    console.log("User left the room: " + payload.username)
});

$(function (){
    var payload = {};
    payload.room = chat_room;
    payload.username = document.getElementById("username").innerHTML;;
    console.log('*** Client log message: \'join_room\' payload: ' + JSON.stringify(payload));
    socket.emit('join_room', payload);
})

function makeInviteButton(){
    var newHTML = '<button type=\'button\' class=\'btn btn-outline-primary\'>Invite</button>';
    var newNode = $(newHTML);
    return newNode;
}

function getURLParameters(parameterName){
    var pageURL = window.location.search.substring(1);
    var pageURLVariables = pageURL.split('&');
    for (var i = 0; i < pageURLVariables.length; i++){
        var parameter = pageURLVariables[i].split('=');
        if(parameter[0] == parameterName){
            return parameter[1]
        }
    }
}


