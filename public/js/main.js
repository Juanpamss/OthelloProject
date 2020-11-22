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
        var buttonC = makeInviteButton(payload.socket_id);
        nodeC.append(buttonC);

        nodeA.hide();
        nodeB.hide();
        nodeC.hide();
        $('#players').append(nodeA,nodeB,nodeC);
        nodeA.slideDown(1000);
        nodeB.slideDown(1000);
        nodeC.slideDown(1000);
    }else{
        var buttonC = makeInviteButton(payload.socket_id);
        $('.socket_'+payload.socket_id+' button').replaceWith(buttonC)
        dom_elements.slideDown(1000);
    }
    /**/

    /*Chat messages*/
    var newHTML = '<p>' + payload.username + ' just entered the lobby</p>';
    var newNode = $(newHTML);
    newNode.hide();
    $('#messages').append(newNode);
    newNode.slideDown(1000);
    /**/
    console.log("New user joined the room: " + payload.username)
});


/*Send invite message to the server*/
function invite(who){
    const payload = {};
    payload.requested_user = who
    console.log('Client log message: \'invite\' payload: ' + JSON.stringify(payload))
    socket.emit('invite', payload)
}

socket.on('invite_response', function (payload){
    if(payload.result == 'fail'){
        alert(payload.message);
        return
    }
    const newNode = makeInvitedButton(payload.socket_id)
    $('.socket_' + payload.socket_id + ' button').replaceWith(newNode)
})

socket.on('invited', function (payload){
    if(payload.result == 'fail'){
        alert(payload.message);
        return
    }
    const newNode = makePlayButton()
    $('.socket_' + payload.socket_id + ' button').replaceWith(newNode)
})


/*Send uninvite message to the server*/
function uninvite(who){
    const payload = {};
    payload.requested_user = who
    console.log('Client log message: \'uninvite\' payload: ' + JSON.stringify(payload))
    socket.emit('uninvite', payload)
}

socket.on('uninvite_response', function (payload){
    if(payload.result == 'fail'){
        alert(payload.message);
        return
    }
    const newNode = makeInviteButton(payload.socket_id)
    $('.socket_' + payload.socket_id + ' button').replaceWith(newNode)
})

socket.on('uninvited', function (payload){
    if(payload.result == 'fail'){
        alert(payload.message);
        return
    }
    const newNode = makeInviteButton(payload.socket_id)
    $('.socket_' + payload.socket_id + ' button').replaceWith(newNode)
})



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
    var newHTML = '<p>' + payload.username + ' left the lobby</p>';
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
    //console.log('*** Client log message: \'join_room\' payload: ' + JSON.stringify(payload));
    socket.emit('join_room', payload);
})

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

function makeInviteButton(socket_id){
    var newHTML = '<button type=\'button\' class=\'btn btn-outline-primary\'>Invite</button>';
    var newNode = $(newHTML);
    newNode.click(function (){
        invite(socket_id)
    })

    return newNode;
}

function makeInvitedButton(socket_id){
    var newHTML = '<button type=\'button\' class=\'btn btn-primary\'>Invited</button>';
    var newNode = $(newHTML);
    newNode.click(function (){
        uninvite(socket_id)
    })
    return newNode;
}

function makePlayButton(){
    var newHTML = '<button type=\'button\' class=\'btn btn-success\'>Play</button>';
    var newNode = $(newHTML);
    return newNode;
}

function makeEngageButton(){
    var newHTML = '<button type=\'button\' class=\'btn btn-danger\'>Engage</button>';
    var newNode = $(newHTML);
    return newNode;
}