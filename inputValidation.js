/*configuration file for input validations*/

/*username:
1. Minimum 3 and maximum 50 characters
2. Only uppercase letters, lowercase letters and special characters [._-] allowed
3. Special characters are not allowed to be the first or last character, and cannot appear consecutively*/
const usernameValidation = new RegExp("^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){3,50}[a-zA-Z0-9]$");
/*password:
1. Minimum 8 and maximum 50 characters
2. At least one uppercase letter, one lowercase letter, one number and one special character: [@$!%*?&].*/
const passwordValidation = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,50}$");


module.exports = {usernameValidation, passwordValidation};