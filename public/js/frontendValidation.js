let myInput = document.getElementById("password");
let letter = document.getElementById("letter");
let capital = document.getElementById("capital");
let number = document.getElementById("number");
let length = document.getElementById("length");
let special = document.getElementById("special");


// When the user clicks on the password field, show the message box
myInput.onfocus = function() {
    document.getElementById("message").style.display = "block";
}

// When the user starts to type something inside the password field
myInput.onkeyup = function() {
    // Validate lowercase letters
    let lowerCaseLetters = /[a-z]/g;
    if(myInput.value.match(lowerCaseLetters)) {
        letter.classList.remove("invalid");
        letter.classList.add("valid");
    } else {
        letter.classList.remove("valid");
        letter.classList.add("invalid");
    }

    // Validate capital letters
    let upperCaseLetters = /[A-Z]/g;
    if(myInput.value.match(upperCaseLetters)) {
        capital.classList.remove("invalid");
        capital.classList.add("valid");
    } else {
        capital.classList.remove("valid");
        capital.classList.add("invalid");
    }

    // Validate numbers
    let numbers = /[0-9]/g;
    if(myInput.value.match(numbers)) {
        number.classList.remove("invalid");
        number.classList.add("valid");
    } else {
        number.classList.remove("valid");
        number.classList.add("invalid");
    }

    // Validate special characters
    let specialCharacters = /[@$!%*?&]/g;
    if(myInput.value.match(specialCharacters)) {
        special.classList.remove("invalid");
        special.classList.add("valid");
    } else {
        special.classList.remove("valid");
        special.classList.add("invalid");
    }

    // Validate length
    if(myInput.value.length >= 8 && myInput.value.length <= 50) {
        length.classList.remove("invalid");
        length.classList.add("valid");
    } else {
        length.classList.remove("valid");
        length.classList.add("invalid");
    }
}

/*Handle errors*/
function getURLParameters(parameterName){
    let pageURL = window.location.search.substring(1)
    let pageURLVariables = pageURL.split('&')
    for (let i = 0; i < pageURLVariables.length; i++){
        let parameter = pageURLVariables[i].split('=')
        if(parameter[0] == parameterName){
            return parameter[1]
        }
    }
}

let errorMessage = getURLParameters('fail');

if(errorMessage){
    let errorDiv = document.getElementById('errorMessage')
    errorDiv.style.display = 'block'
}