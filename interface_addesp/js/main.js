const btnLogin = document.querySelector("#clickLogin");
const divError = document.querySelector("#divinvalidcredentials");

btnLogin.addEventListener('click', clickLogin);
divError.addEventListener('click', closeDivCredentials);

async function clickLogin() {
    const inputUser = document.querySelector("#inputLogin");
    const inputPassword = document.querySelector("#inputPassword");
    const spinner = document.querySelector(".spinner-border");

    const user = inputUser.value;
    const password = inputPassword.value;

    const camposValidos = user != '' && password != '';
    
    if(camposValidos) {
        showElement(btnLogin, false);
        showElement(spinner, true);

        const response = await fetch("http://127.0.0.1:8080/login/", {
            method: "POST",
            body: JSON.stringify({
                "login": user,
                "password": password
            }),
            headers: {'Content-Type': 'application/json'}
        })
        const content = await response.json();
        if(content.sucess) {
            if(content.data.length == 0) {
                
                showElement(btnLogin, true);
                showElement(spinner, false);
                
                if(divError.classList.contains('divError')) {
                    divError.classList.remove('divError');
                }
            }
            else {
                console.log(content.data.user_index);
            }
        }
        else {
            console.error(content);
        }
    }
}

function showElement(element, info) {
    if(info) {
        element.style.display = "";
    }
    else {
        element.style.display = "none";
    }
}

function closeDivCredentials() {
    if(!divError.classList.contains('divError')) {
        divError.classList.add('divError');
    }
}