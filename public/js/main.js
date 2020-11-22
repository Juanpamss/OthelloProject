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
        $('#players').append(nodeA,nodeB,nodeC);
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
    var newHTML = '<p>' + payload.username + ' just entered the lobby</p>';
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

/* code from Xiarong Xu 11/21/2020 */

var old_board = [
                    ['?','?','?','?','?','?','?','?'],
                    ['?','?','?','?','?','?','?','?'],
                    ['?','?','?','?','?','?','?','?'],
                    ['?','?','?','?','?','?','?','?'],
                    ['?','?','?','?','?','?','?','?'],
                    ['?','?','?','?','?','?','?','?'],
                    ['?','?','?','?','?','?','?','?'],
                    ['?','?','?','?','?','?','?','?']
];

socket.on('game_update', function(payload){

    console.log('*** Client Log Message: \'game_update\'\n\tpayload: '+JSON.stringify(payload));
    /* check for a good board update */
    if(payload.result == 'fail'){
        console.log(payload.message);
        window.location.href = 'lobby.html?username='+username;
        return;
    }

    /* check for a good board in the payload */
    var board = payload.game.board;
    if('undefined' == typeof board || !board){
        console.log('Internal error: received a malformed board update from the server');
        return;
    }

    /* update my color */

    /* animate changes to the board */

    var row, column;
    for (row = 0; row < 8; row++){
        for (column = 0; column < 8; column++){
            /* if a board space has changed */
            if(old_board[row][column] != board[row][column]){
                if(old_board[row][column] == '?' && board[row][column] == ' '){
                    $('#'+row+'_'+column).html('<img src="assets/images/empty.png" alt="empty square" style="width:50px;height:50px;"/>');
                }
                else if(old_board[row][column] == '?' && board[row][column] == 'w'){
                    $('#'+row+'_'+column).html('<img src="assets/images/white_stone.png" alt="white square" style="width:50px;height:50px;"/>');
                }
                else if(old_board[row][column] == '?' && board[row][column] == 'b'){
                    $('#'+row+'_'+column).html('<img src="assets/images/black_stone.png" alt="black square" style="width:50px;height:50px;"/>');
                }
                else if(old_board[row][column] == ' ' && board[row][column] == 'w'){
                    $('#'+row+'_'+column).html('<img src="assets/images/white_stone.png" alt="white square" style="width:50px;height:50px;"/>');
                }
                else if(old_board[row][column] == ' ' && board[row][column] == 'b'){
                    $('#'+row+'_'+column).html('<img src="assets/images/black_stone.png" alt="black square" style="width:50px;height:50px;"/>');
                }
                else if(old_board[row][column] == 'w' && board[row][column] == ' '){
                    $('#'+row+'_'+column).html('<img src="assets/images/empty.png" alt="empty square" style="width:50px;height:50px;"/>');
                }
                else if(old_board[row][column] == 'b' && board[row][column] == ' '){
                    $('#'+row+'_'+column).html('<img src="assets/images/empty.png" alt="empty square" style="width:50px;height:50px;"/>');
                }
                else if(old_board[row][column] == 'w' && board[row][column] == 'b'){
                    $('#'+row+'_'+column).html('<img src="assets/images/black_stone.png" alt="black square" style="width:50px;height:50px;"/>');
                }
                else if(old_board[row][column] == 'b' && board[row][column] == 'w'){
                    $('#'+row+'_'+column).html('<img src="assets/images/white_stone.png" alt="white square" style="width:50px;height:50px;"/>');
                }
                else{
                    $('#'+row+'_'+column).html('<img src="assets/images/error.gif" alt="error"/>');
                }
            }
        }
    }

    old_board = board;

});
