# API Grupo Vegeta
Essa API tem como função principal o envio de dados climáticos coletados pelos sensores dos ESP's para o servidor e a consulta desses dados pelo cliente(aplicativo). 
 
# Endereço da API

https://api-dados-climaticos.herokuapp.com/

# Metodos permitidos:

- POST: /inserirdados/ (Faz a inserção dos dados no banco de dados)
- GET: /coletardados/{key_auth} (Coleta o registro de um único ESP)
- GET: /coletardadostodos/ (Coleta os registros de todos os ESP's)
- GET: /coletardadosmax/ (Coleta o ultimo registro de cada ESP)

# Exemplo de JSON para fazer a inserção de dados

```
{
   "esp_key":"authentication_key",
   "sensors":
   {
      "umidade": value,
      "temperatura": value,
      "luminosidade": value,
      "pressao": value,
      "altitude": value,
      "chuva": value
   }
}

