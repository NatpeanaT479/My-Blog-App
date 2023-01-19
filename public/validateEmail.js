//Creating a function to validate email addresses based on regex, common typos, disposable email blacklists, DNS records and SMTP server response.
const { validate } = require('deep-email-validator');

async function validateEmail (email){
    return validate(email)
}

module.exports={
    validateEmail
}