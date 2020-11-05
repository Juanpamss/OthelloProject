/*Functions*/

//Returns value associated
function getURLParameters (param){
    var pageURL = window.location.search.substring(1);
    var pageURLvariables = pageURL.split('&');

    for (var i = 0; i < pageURLvariables.length; i++){
        var parameterName = pageURLvariables[i].split('=');
        if(parameterName[0] == param){
            return parameterName[1];
        }
    }
}

$('#messages').append('<h4>'+getURLParameters('username')+'</h4>');