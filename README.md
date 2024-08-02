Deployment Link:

https://password-reset-task-1.onrender.com

Task Details:

Design Forgot password page, where user enter there email id
Check if the user Exists in DB
If user not present send error msg
If the user is found generate the random string adn send a link with that random string to there email
Store the random string in DB for later verification
When user enters the link retrive the string and pass it to DB
Check if the Random string matches
Store the updated password and clear the radnom string in DB once the user submited the form
If the string dose not match, send an error to user

BACK-END END-POINTS:

    /api/test --> To validate the API Creation
    /api/user  --> To register new User. [ Required : email, password ]
    /api/authenticate --> to create a token. [ Required : email, password ]
    /api/data --> To get details of the token generated [ Required : Bearer token ]
    /api/reset-password --> To verify user email and send reset password link. [ Required : email ]
    api/reset-password/:token --> To verify resetPassToken and create updated password for user. [ Required : newPassword ]
