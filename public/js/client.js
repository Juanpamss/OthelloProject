let username = getURLParameters('username');
let chat_room = getURLParameters('game_id');
let rejoin = getURLParameters('rejoin');

if('undefined' == typeof chat_room || !chat_room){
    chat_room = 'lobby'
}

/*Connect to the socket server*/
const socket = io.connect();

/*Execute this function everytime a client connects to the server*/
$(function (){
    let payload = {}
    payload.room = sanitizeInput(chat_room)
    payload.username = sanitizeInput(username)
    payload.isRejoin = rejoin != undefined ? sanitizeInput(rejoin) : rejoin
    socket.emit('join_room', payload)
    $('#quit').append('<a href="lobby.html?username='+sanitizeInput(username)+'" class="btn btn-danger btn-lg active" role="button" aria-pressed="true">Quit Game</a>')
})

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
    let dom_elements = $('.socket_'+payload.socket_id);

    if(dom_elements.length ==  0){
        const nodeA = $('<div></div>');
        nodeA.addClass('socket_'+payload.socket_id);

        const nodeB = $('<div></div>');
        nodeB.addClass('socket_'+payload.socket_id);

        const nodeC = $('<div></div>');
        nodeC.addClass('socket_'+payload.socket_id);

        nodeA.addClass('w-100');

        nodeB.addClass('col-9 text-right');
        nodeB.append('<h4>'+payload.username+'</h4>');

        nodeC.addClass('col-3 text-left');
        const buttonC = makeInviteButton(payload.socket_id);
        nodeC.append(buttonC);

        nodeA.hide();
        nodeB.hide();
        nodeC.hide();
        $('#players').append(nodeA,nodeB,nodeC);
        nodeA.slideDown(1000);
        nodeB.slideDown(1000);
        nodeC.slideDown(1000);
    }
    /* if we have seen the person who just joined */
    else{
        uninvite(payload.socket_id);
        let buttonC = makeInviteButton(payload.socket_id);
        $('.socket_'+payload.socket_id+' button').replaceWith(buttonC)
        dom_elements.slideDown(1000);
    }
    /**/

    /*Chat messages*/
    const newHTML = '<p>' + payload.username + ' just entered the lobby</p>';
    const newNode = $(newHTML);
    newNode.hide();
    $('#messages').prepend(newNode);
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
    const newNode = makePlayButton(payload.socket_id)
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

/*Send a game start message to the server*/
function game_start(who){
    let payload = {};
    payload.requested_user = who
    console.log('Client log message: \'game_start\' payload: ' + JSON.stringify(payload))
    socket.emit('game_start', payload)
}
/* handle a notification that we have been engaged */
socket.on('game_start_response', function (payload){
    if(payload.result == 'fail'){
        alert(payload.message);
        return
    }
    const newNode = makeEngagedButton(payload.socket_id)
    $('.socket_' + payload.socket_id + ' button').replaceWith(newNode)

    /* jump to a new page */
    window.location.replace('game.html?username='+sanitizeInput(username)+'&game_id='+payload.game_id)
})

/*Game Rejoin*/
/*Send a game start message to the server*/
function game_rejoin(gameId, gameInfo){
    let payload = {};
    payload.gameIdToRejoin = gameId
    payload.gameInfo = gameInfo
    console.log('Client log message: \'game_rejoin\' payload: ' + JSON.stringify(payload))
    socket.emit('game_rejoin', payload)
}

/* handle a notification that we have been engaged */
socket.on('game_rejoin_response', function (payload){

    console.log("Response: " + JSON.stringify(payload))

    if(payload.result == 'fail'){
        alert(payload.message);
        return
    }

    /* jump to a new page */
    window.location.replace('game.html?username='+sanitizeInput(username)+'&game_id='+payload.game_id+'&rejoin='+true)
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
    let dom_elements = $('.socket_'+payload.socket_id);

    if(dom_elements.length !=  0){
        dom_elements.slideUp(1000);
    }

    /*Chat messages*/
    let newHTML = '<p>' + payload.username + ' left the lobby</p>';
    let newNode = $(newHTML);
    newNode.hide();
    $('#messages').prepend(newNode);
    newNode.slideDown(1000);
    /**/
    console.log("User left the room: " + payload.username)
});

/*Handle game updates*/
let old_board = [
    ['?','?','?','?','?','?','?','?'],
    ['?','?','?','?','?','?','?','?'],
    ['?','?','?','?','?','?','?','?'],
    ['?','?','?','?','?','?','?','?'],
    ['?','?','?','?','?','?','?','?'],
    ['?','?','?','?','?','?','?','?'],
    ['?','?','?','?','?','?','?','?'],
    ['?','?','?','?','?','?','?','?']
]
let my_color = ' '
/*Handle time elapse*/
let interval_timer;
let gameTimedout = false;

socket.on('game_update', function (payload){
    console.log('*** Client log message: \'game_update\'\n\tpayload: ' + JSON.stringify(payload))
    /*Check for a board update*/
    if(payload.result == 'fail'){
        console.log(payload.message)
        /*Send the user back to the lobby if error occurs*/
        window.location.replace('lobby.html?username='+sanitizeInput(username))
        return
    }
    /*Check for board in the payload*/
    let board = payload.game.board
    if('undefined' == typeof board || !board){
        console.log('Internal error: received a malformed board update from the server')
        return
    }
    /*Update color*/
    if(socket.id == payload.game.player_white.socket){
        my_color = 'white'
    }else if (socket.id == payload.game.player_black.socket){
        my_color = 'black'
    }else{
        /*In case, unauthorized players are in*/
        window.location.replace('lobby.html?username='+sanitizeInput(username))
        return
    }
    //$('#my_color').html('<h3 id="my_color">I am '+my_color+'</h3>')
    //$('#my_color').html('<h4>It is ' + payload.game.whose_turn+'\'s turn</h4>')

    /*Update players usernames*/
    $('#whiteUser').html(`<i class="fa fa-2x fa-user "></i>  ${payload.game.player_white.username}`)
    $('#blackUser').html(`<i class="fa fa-2x fa-user "></i>  ${payload.game.player_black.username}`)
    //$('#my_color').html('<h3 id="my_color">I am '+my_color+'</h3>')
    $('#my_color').html('<h4>It is ' + payload.game.whose_turn+'\'s turn. Elapsed time <span id="elapsed"></span></h4>')

    clearInterval(interval_timer);
    interval_timer = setInterval(function(last_time){
            return function(){
                /*update UI*/
                let d = new Date();
                let elapsedmilli = d.getTime() - last_time;
                let timeoutSetting = 60;

                /*Game over if one player takes more than timeout setting to play a token*/
                if(Math.floor(elapsedmilli/1000) > timeoutSetting && payload.game.whose_turn == my_color){
                    /*disable play token for frontend*/
                    for (let timeoutRow = 0; timeoutRow < 8; timeoutRow++) {
                        for (let timeoutColumn = 0; timeoutColumn < 8; timeoutColumn++) {
                            $('#' + timeoutRow + '_' + timeoutColumn).off('click')
                            $('#' + timeoutRow + '_' + timeoutColumn).removeClass('hovered_over')
                        }
                    }

                    if(gameTimedout != true){
                        socket.emit('timeout', my_color);
                        gameTimedout = true;

                    }
                    else{
                        /*game reached time limit, stop action*/
                    }

                }

                let minutes = Math.floor(elapsedmilli / (60 * 1000));
                let seconds = Math.floor((elapsedmilli % (60 * 1000)) / 1000);
                if(seconds < 10){
                    $('#elapsed').html(minutes + ':0' + seconds);
                }
                else{
                    $('#elapsed').html(minutes + ':' + seconds);
                }
            }
        }(payload.game.last_move_time)
        , 1000);

    /*Animate changes to the board*/
    let blacksum = 0
    let whitesum = 0
    let row, column
    for (row = 0; row < 8; row++){
        for (column = 0; column < 8; column++){
            if(board[row][column] == 'b'){
                blacksum++
            }
            if(board[row][column] == 'w'){
                whitesum++
            }
            /*If a board space has changed*/
            if(old_board[row][column] != board[row][column]) {
                if (old_board[row][column] == '?' && board[row][column] == ' ') {
                    $('#' + row + '_' + column).html('<img src="assets/images/empty.png" alt="empty square">')
                } else if (old_board[row][column] == '?' && board[row][column] == 'w') {
                    $('#' + row + '_' + column).html('<img src="assets/images/empty_to_white.png" alt="white square">')
                } else if (old_board[row][column] == '?' && board[row][column] == 'b') {
                    $('#' + row + '_' + column).html('<img src="assets/images/empty_to_black.png" alt="black square">')
                } else if (old_board[row][column] == ' ' && board[row][column] == 'w') {
                    $('#' + row + '_' + column).html('<img src="assets/images/empty_to_white.png" alt="white square">')
                } else if (old_board[row][column] == ' ' && board[row][column] == 'b') {
                    $('#' + row + '_' + column).html('<img src="assets/images/empty_to_black.png" alt="black square">')
                } else if (old_board[row][column] == 'w' && board[row][column] == ' ') {
                    $('#' + row + '_' + column).html('<img src="assets/images/empty.png" alt="empty square">')
                } else if (old_board[row][column] == 'b' && board[row][column] == ' ') {
                    $('#' + row + '_' + column).html('<img src="assets/images/empty.png" alt="empty square">')
                } else if (old_board[row][column] == 'w' && board[row][column] == 'b') {
                    $('#' + row + '_' + column).html('<img src="assets/images/empty_to_black.png" alt="black square">')
                } else if (old_board[row][column] == 'b' && board[row][column] == 'w') {
                    $('#' + row + '_' + column).html('<img src="assets/images/empty_to_white.png" alt="white square">')
                } else {
                    $('#' + row + '_' + column).html('<img src="assets/images/error.png" alt="error">')
                }
            }

            /*Set up interactivity*/
            $('#'+row+'_'+column).off('click')
            $('#'+row+'_'+column).removeClass('hovered_over')

            if(payload.game.whose_turn == my_color){
                if(payload.game.legal_moves[row][column] === my_color.substr(0,1)){
                    $('#'+row+'_'+column).addClass('hovered_over')
                    $('#'+row+'_'+column).click(function (r,c){
                        return function (){
                            let payload = {}
                            payload.row = r
                            payload.column = c
                            payload.color = my_color
                            console.log('*** Client Log Message:\'play_token\' payload: ' + JSON.stringify(payload))
                            socket.emit('play_token',payload)
                        }
                    }(row,column))
                }
            }
        }
    }
    $('#blacksum').html(blacksum)
    $('#whitesum').html(whitesum)
    old_board = board
})
socket.on('play_token_response', function (payload) {
    //console.log('*** Client log message: \'play_token_response\'\n\tpayload: ' + JSON.stringify(payload))
    /*Check for token response*/
    if (payload.result == 'fail') {
        console.log(payload.message)
        alert(payload.message)
        return
    }
})
socket.on('game_over', function (payload) {
    //console.log('*** Client log message: \'game_over\'\n\tpayload: ' + JSON.stringify(payload))
    /*Check for token response*/
    if (payload.result == 'fail') {
        console.log(payload.message)
        alert(payload.message)
        return
    }
    /*Jump to a new page*/
    $('#game_over').html('<h1>Game Over</h1><h2>'+payload.who_won+' won!</h2>')
    //This line was detected as a security issue by OWASP, note this on the report
    //$('#game_over').append('<a href="lobby.html?username='+username+'" class="btn btn-success btn-lg active" role="button" aria-pressed="true">Return to the lobby</a>')
    $('#return_lobby').html('<a href="lobby.html?username='+sanitizeInput(username)+'" class="btn btn-success btn-lg active" role="button" aria-pressed="true">Return to the lobby</a>')
})

function getURLParameters(parameterName){
    let pageURL = window.location.search.substring(1)
    let pageURLVariables = pageURL.split('&')
    for (let i = 0; i < pageURLVariables.length; i++){
        let parameter = pageURLVariables[i].split('=')
        if(parameter[0] == parameterName){
            return sanitizeInput(parameter[1])
        }
    }
}
function makeInviteButton(socket_id){
    let newHTML = '<button type=\'button\' class=\'btn btn-outline-primary\'>Invite</button>'
    let newNode = $(newHTML)
    newNode.click(function (){
        invite(socket_id)
    })
    return newNode
}
function makeInvitedButton(socket_id){
    let newHTML = '<button type=\'button\' class=\'btn btn-primary\'>Invited</button>'
    let newNode = $(newHTML)
    newNode.click(function (){
        uninvite(socket_id)
    })
    return newNode
}
function makePlayButton(socket_id){
    let newHTML = '<button type=\'button\' class=\'btn btn-success\'>Play</button>'
    let newNode = $(newHTML)
    newNode.click(function (){
        game_start(socket_id)
    })
    return newNode
}
function makeEngagedButton(){
    let newHTML = '<button type=\'button\' class=\'btn btn-danger\'>Engage</button>'
    let newNode = $(newHTML)
    return newNode
}

function sanitizeInput(input){
    const regex = /[^0-9a-zA-Z._-]/g
    /*Sanitize the input prior to send it to the server. On the server side, this process is redone to ensure
            no harmful data reaches the server*/
    let sanitizedString = input.replace(regex, '')
    return sanitizedString
}