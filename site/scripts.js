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
        url: 'http://api-dados-climaticos.herokuapp.com/inserirdados/',
        contentType: "application/JSON",
        data: {
            "esp_id": esp_id,
            "umidade": umidade,
            "esta_chovendo": esta_chovendo,
            "temperatura": temperatura,
            "pressao_atmosferica": pressao_atmosferica,
            "latitude": latitude,
            "longitude": longitude
        },

        sucess: (response) => {
            console.log("sucesso");
            console.log(response);
        },
        error: (error) => {
            console.log("erro");
            console.log(error);
        }
    })
})