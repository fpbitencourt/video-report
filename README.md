
# Video Report

Este projeto tem como objetivo analisar e gerar relatórios informativos sobre dados de vídeos em um diretório. Ele analisa os metadados de vídeos extraídos de arquivos JSON e exibe informações como tamanho total, duração, resoluções, formatos, taxas de quadros (FPS) e distribuições gráficas dessas informações.

## Tecnologias

- **Python**: Linguagem de programação.
- **Flask**: Framework para desenvolvimento web em Python.
- **Chart.js**: Biblioteca para renderização de gráficos interativos no front-end.
- **Multiprocessing**: Para melhorar o desempenho ao processar múltiplos arquivos JSON simultaneamente.

## Estrutura do Projeto

A estrutura do projeto é organizada da seguinte forma:

```
/project-root
├── /static
│   ├── /style.css           # Estilo customizado da interface
│   ├── /script.js           # Funcionalidade do lado do cliente
├── /templates
│   ├── /index.html          # Interface principal do usuário
├── app.py                   # Aplicação Flask
├── requirements.txt         # Dependências do projeto
```

## Pré-requisitos

Certifique-se de ter o Python instalado em seu sistema.

## Instalação do projeto

1. Clone o repositório para sua máquina local:

    ```bash
    git clone <url-do-repositório>
    cd <diretório-do-repositório>
    ```
2. Crie um ambiente virtual e ative-o:

   - Para sistemas Unix/Linux:

     ```bash
     python3 -m venv myenv
     source myenv/bin/activate
     ```
3. Instale as dependências do projeto:

    ```bash
    pip install -r requirements.txt
    ```

4. Execute o servidor Flask:

    ```bash
    python app.py
    ```

## Como Usar

1. Abra a aplicação no seu navegador (geralmente em `http://127.0.0.1:5000/`).
2. Insira o nome desejado para o relatório.
3. Informe o diretório raiz onde os arquivos JSON com metadados dos vídeos estão localizados.
4. Clique no botão para gerar o relatório.
5. O relatório gerado será exibido com informações detalhadas sobre os vídeos, juntamente com gráficos estatísticos.

## Exemplo de Arquivo JSON

Cada arquivo JSON deve conter um array de vídeos, onde cada vídeo deve incluir um atributo `video_metadata` com informações relevantes sobre o vídeo. Abaixo está um exemplo de como o arquivo JSON deve ser estruturado:

```json
{
    "data": [
        {
            "attributes": {
                "video_metadata": {
                    "size": 123456789,
                    "duration": 120,
                    "resolution": "1920x1080",
                    "format": "mp4",
                    "fps": 60
                }
            }
        },
        {
            "attributes": {
                "video_metadata": {
                    "size": 987654321,
                    "duration": 60,
                    "resolution": "1280x720",
                    "format": "avi",
                    "fps": 30
                }
            }
        }
    ]
}
```

### Descrição dos Campos:

- **size**: Tamanho do vídeo em bytes.
- **duration**: Duração do vídeo em segundos.
- **resolution**: Resolução do vídeo, como "1920x1080".
- **format**: Formato do arquivo de vídeo, como "mp4", "avi", etc.
- **fps**: Frames por segundo (taxa de quadros do vídeo).

## Contribuições

Contribuições são bem-vindas! Se você tem sugestões ou melhorias, fique à vontade para abrir um pull request.

## Licença

Este projeto é licenciado sob a [MIT License](LICENSE).
