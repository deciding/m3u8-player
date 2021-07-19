$(document).ready(function(){
    $("input#login").click(function(event) {
        event.preventDefault();
        var email = $("#login-email").val();
        var password = $("#login-password").val();

        $.ajax({
            type: 'POST',
            url: 'login',
            contentType: 'application/json',
            data: JSON.stringify({
                email, password
            })
        })
        .done(function(data) {
            // If the last task had a hiddenImage component, remove it
            window.location.href = '/user'
        })
        .fail(function(error) {
            alert(error.statusText);
        })
        .always(function() {
            // No longer sending response
        });
    });

    $("input#signup").click(function(event) {
        event.preventDefault();
        var email = $("#signup-email").val();
        var password = $("#signup-password").val();

        $.ajax({
            type: 'POST',
            url: 'signup',
            contentType: 'application/json',
            data: JSON.stringify({
                email, password, role: "basic" // TODO: only admin is allowed to change role !
            })
        })
        .done(function(data) {
            // If the last task had a hiddenImage component, remove it
            alert('Signed up!')
        })
        .fail(function(error) {
            alert(error.statusText);
        })
        .always(function() {
            // No longer sending response
        });
    });
});