$(document).ready(() => {

    $("#clickLogin").click(() => {
        const user = $("#inputLogin")[0].value;
        const password = $("#inputPassword")[0].value;
        
        if(user != '' && password != '') {
            $(".spinner-border").show();
            $("#clickLogin").hide();

            //API
            $.ajax({
                method: 'POST',
                url: 'http://127.0.0.1:8080/login/',
                dataType: 'application/json',

                data: {
                    "user": user,
                    "password": password
                },

                

            })
        }
    })
    
})