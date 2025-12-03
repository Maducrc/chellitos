document.getElementById("gerarSabor").addEventListener("click", async () => {

    const gosto = document.getElementById("gosto").value;

    const resultado = document.getElementById("resultado");
    const loader = document.getElementById("loader");

    loader.classList.add("show");

    if (!gosto || gosto.trim() === "") {
        loader.classList.remove("show");
        resultado.innerHTML = '<div class="error">Por favor, descreva seu gosto para obter um resultado.</div>';
        return;
    }

    let conteudo;
    try {
        conteudo = await fetch("conteudo.json") 
        .then(res => res.json())
        .catch(err => {
            console.error("Erro ao carregar o arquivo JSON:", err);
            return [];
        });
    }
    catch (error) {
        loader.classList.remove("show");
        resultado.innerHTML = '<div class="error"> Ocorreu um erro ao  carregar os dados fornecinos, tente novamente mais tarde. </div>';
        return;
    }

    const prompt = `Você é Chesco, o assistente de recomendações da Chellitos. O usuário gosta do sabor: "${gosto}".
    Com base nisso, sugira 3 combinações de salgadinhos, considerando sabores, texturas, cores e formatos. 
    Explique as escolhas de forma clara e objetiva.
    . Dê o resultado em forma de lista organizada por dia. **USE Markdown** para formatar: use títulos (## ou ###) para os ingredientes e listas (*) ou (-) para os tópicos.
    Exemplo de formato:
    
    ## Opção 1: [Nome do Sabor]
    - Ingredientes: [Lista de ingredientes]
    - Justificativa: [Explicação das escolhas]
     ${JSON.stringify({ de_acordo_com_seu_gosto: gosto, as_sugestões_são: conteudo })}`;

    const API_KEY = "AIzaSyAuasjHIPFDJuiUphYkxl-W8DKhVzdzDE4"; 
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    try {
        const resultadoDaApi = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }, 
            body: JSON.stringify({
                contents: [
                    { role: "user", parts: [{text: prompt}] },
                ],
            }),
        });

        loader.classList.remove("show");

        if (!resultadoDaApi.ok) {
            throw new Error(`Erro na API: ${resultadoDaApi.statusText}`);
        }

        const data = await resultadoDaApi.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Não consegui gerar um novo sabor no momento";

        const htmlFormatado = marked.parse(text);
        resultado.innerHTML = htmlFormatado;
    }

    catch (error) {
        loader.classList.remove("show");
        resultado.innerHTML = `<div class="error">Ocorreu um erro ao gerar o sabor: ${error.message}</div>`;
        console.error("Erro ao chamar a API:", error);
    }
});
