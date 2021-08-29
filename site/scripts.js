$(document).ready(function(){
	$("#enviar").submit(function(event){
        $("#send").attr('disabled', 'disabled');
    });
});

$("#enviar").on("click", () => {
    const esp_id = $("#espname")[0].value;
    const umidade = $("#umidade")[0].value;
    const esta_chovendo = $("#temperatura")[0].value;
    const temperatura = $("#pressao_atmosferica")[0].value;
    const pressao_atmosferica = $("#latitude")[0].value;
    const latitude = $("#longitude")[0].value;
    const longitude = $("#chovendo")[0].value;
    
    if(esp_id == "")
        alert("Você precisa definir o nome do ESP");
    else if(umidade == "")
        alert("Você precisa definir a umidade");
    else if(esta_chovendo == "")
        alert("Você precisa definir a temperatura");
    else if(temperatura == "")
        alert("Você precisa definir a pressão atmosférica");
    else if(pressao_atmosferica == "")
        alert("Você precisa definir a pressão atmosférica");
    else if(latitude == "")
        alert("Você precisa definir a pressão atmosférica");
    else if(longitude == -1)
        alert("Você precisa dizer se está chovendo");

    $.ajax({
        method: 'POST',
        url: 'https://api-dados-climaticos.herokuapp.com/inserirdados',
        dataType: "application/JSON",
        data: {
            "esp_id": esp_id,
            "umidade": umidade,
            "esta_chovendo": esta_chovendo,
            "temperatura": temperatura,
            "pressao_atmosferica": pressao_atmosferica,
            "latitude": latitude,
            "longitude": longitude
        },

        error: (response) => {
            if(response.status == 200) {
                alert("Inserido com sucesso! Codigo do registro: " + response.responseText);   
            }
        },
    })
})
$("#searchone").on("click", () => {
    const esp_id = $("#espnameone")[0].value;
    if(esp_id == "") {
        alert("Você precisa definir qual ESP você deseja procurar");
    }
    else {
        $.ajax({
            method: "GET",
            url: "https://api-dados-climaticos.herokuapp.com/coletardados/"+esp_id,

            success: (data) => {
                montarTabela(data);
            },
            error: (err) => {
                console.log(err);
            }
        })
    }
})
$("#searchmax").on("click", () => {
    $.ajax({
        method: "GET",
        url: "https://api-dados-climaticos.herokuapp.com/coletardadosmax",

        success: (data) => {
            montarTabela(data);
        },
        error: (err) => {
            console.log(err);
        }
    })
})
$("#searchall").on("click", () => {
    $.ajax({
        method: "GET",
        url: "https://api-dados-climaticos.herokuapp.com/coletardadostodos",

        success: (data) => {
            montarTabela(data);
        },
        error: (err) => {
            console.log(err);
        }
    })
})

function montarTabela(dados) {
    const tabelaExistente = $("table > tbody > tr");
    tabelaExistente.each((index, element) => {
        console.log(element.remove());
    })
    
    const tabela = $("table > tbody")[0];
    let tr_element;
    let td;
    dados.forEach((index) => {
        console.log(index);

        tr_element = document.createElement("tr");
        tabela.appendChild(tr_element);

        //ID
        td = document.createElement("th");
        tr_element.appendChild(td);
        td.textContent = index.id;

        //Data
        td = document.createElement("td");
        tr_element.appendChild(td);
        td.textContent = index.datadoregistro;

        //Nome
        td = document.createElement("td");
        tr_element.appendChild(td);
        td.textContent = index.esp_id;

        //Umidade
        td = document.createElement("td");
        tr_element.appendChild(td);
        td.textContent = index.umidade;

        //Temperatura
        td = document.createElement("td");
        tr_element.appendChild(td);
        td.textContent = index.temperatura;

        //Pressão atmosférica
        td = document.createElement("td");
        tr_element.appendChild(td);
        td.textContent = index.pressao_atmosferica;

        //Latitude
        td = document.createElement("td");
        tr_element.appendChild(td);
        td.textContent = index.latitude;

        //Latitude
        td = document.createElement("td");
        tr_element.appendChild(td);
        td.textContent = index.longitude;
    })
    

}