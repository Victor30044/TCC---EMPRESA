class Produto {
    static ultimoCodigo = 0;
    constructor(nome) {
        Produto.ultimoCodigo += 1;
        this.cod_produto = Produto.ultimoCodigo;
        this.nome = nome;
        this.valor = 49.9;
        this.quantidade = JSON.parse(localStorage.getItem('carrinho'))[`produto${this.cod_produto}`] 
            ? JSON.parse(localStorage.getItem('carrinho'))[`produto${this.cod_produto}`].quantidade
            : 0;
        this.quantidade > 0 ? this.quantidade : this.quantidade = 0;
    }
    add() {
        this.quantidade++;
        console.log(this.quantidade);
    }
    menosQuantidade() {
        this.quantidade--;
        console.log(this.quantidade);
    }
    remove() {
        this.quantidade--;
        console.log(this.quantidade);
    }
}
class Usuario {
    static ultimoCodigo = 0;
    constructor(nome, senha, email, dadosRes) {
        Usuario.ultimoCodigo += 1;
        this.cod_usuario = Usuario.ultimoCodigo;
        this.nome = nome;
        this.senha = senha;
        this.email = email;
        this.dadosRes = dadosRes;
    }

    static registraCEP(conteudo) {
        if (!("erro" in conteudo)) {
            //Atualiza os campos com os valores.
            let rua = conteudo.logradouro;
            let bairro = conteudo.bairro;
            let cidade = conteudo.localidade;
            document.querySelector("input#ruaUsuario").value = rua;
            document.querySelector("input#bairroUsuario").value = bairro;
            document.querySelector("input#cidadeUsuario").value = cidade;
        } //end if.
        else {
            //CEP não Encontrado.
            alert("CEP não encontrado.");
            return null;
        }
    }
    
    static pesquisaCEP(valor) {
        //Nova variável "cep" somente com dígitos.
        var cep = valor.replace(/\D/g, '');

        //Verifica se campo cep possui valor informado.
        if (cep != "") {

            //Expressão regular para validar o CEP.
            var validacep = /^[0-9]{8}$/;

            //Valida o formato do CEP.
            if(validacep.test(cep)) {
                //Cria um elemento javascript.
                var script = document.createElement('script');

                //Sincroniza com o callback.
                script.src = 'https://viacep.com.br/ws/'+ cep + '/json/?callback=Usuario.registraCEP';

                //Insere script no documento e carrega o conteúdo.
                document.body.appendChild(script);
            } //end if.
            else {
                //cep é inválido.
                alert("Formato de CEP inválido.");
            }
        } //end if.
        else {
            //cep sem valor, limpa formulário.
        }
    }
}
let sabores = ["Muzarela", "Quatro Queijos", "Frango Catupiry", "Calabresa", "Bacon"];
let cardapio = [];

sabores.forEach(sabor => {
    cardapio.push(new Produto(sabor));
})

function carregarCadastro() {
    if (localStorage.getItem("usuarios") == null)
        localStorage.setItem("usuarios", JSON.stringify({}));
}
function atualizarProduto(cod) {
    console.log(`Funcao atualizarProduto${cod}`);
    produtoatual = cardapio.find(Produto => Produto.cod_produto == cod);
    let divprotudoatual = document.querySelector(`div#id_produto${produtoatual.cod_produto}`)
    divprotudoatual.innerHTML = "";
    if (produtoatual.quantidade > 0) {
        divprotudoatual.innerHTML += 
    `
    <div class="produto" id="id_produto${produtoatual.cod_produto}">
    <h2>${produtoatual.nome}</h2>
    <span>${produtoatual.valor} x ${produtoatual.quantidade} | <button onclick="addQuant(${produtoatual.cod_produto})">+</button> <button onclick="removeQuant(${produtoatual.cod_produto})">-</button></span>
    ${produtoatual.quantidade > 0 ? `<button onclick="removeTudo(${produtoatual.cod_produto})">REMOVER</button>` : ""}
    </div>
    `
    }
    
}
function add(cod) {
    console.log(`Funcao ADD${cod}`);
    produtoatual = cardapio.find(Produto => Produto.cod_produto == cod);
    produtoatual.add();
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};
    
    carrinho[`produto${cod}`] = produtoatual;
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}
function addQuant(cod) {
    add(cod);
    atualizarProduto(cod);
}
function removeQuant(cod) {
    console.log(`Funcao ADD${cod}`);
    produtoatual = cardapio.find(Produto => Produto.cod_produto == cod);
    produtoatual.menosQuantidade();
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};

    if (produtoatual.quantidade <= 0)
        delete carrinho[`produto${cod}`];
    else
        carrinho[`produto${cod}`] = produtoatual;

    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    atualizarProduto(cod);
}
function removeTudo(cod) {
    console.log(`Funcao remove${cod}`);
    produtoatual = cardapio.find(Produto => Produto.cod_produto == cod);
    produtoatual.quantidade = 0;
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};

    delete carrinho[`produto${produtoatual.cod_produto}`];
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    divprotudoatual = document.querySelector(`div#id_produto${cod}`); console.log(divprotudoatual);
    divprotudoatual.innerHTML = "";
}
function menosQuantidade(cod) {
    console.log(`Funcao MenosQuantidade${cod}`);
    produtoatual = objetos.find(Produto => Produto.cod_produto == cod);
    produtoatual.menosQuantidade();
}
function carregarCardapio() {
    if (localStorage.getItem("carrinho") == null)
        localStorage.setItem("carrinho", JSON.stringify({}));

    let main = document.querySelector('main#mainCardapio');

    for (i = 0; i < cardapio.length; i++) {
        main.innerHTML += 
        `
        <div class="produto" id="id_produto${cardapio[i].cod_produto}">
        <h2>${cardapio[i].nome}</h2>
        <p>${cardapio[i].valor}</p>
        <button onclick="add(${cardapio[i].cod_produto})">Acionar ao carrinho</button>
        </div>
        `
    }
}
function carregarCarrinho() {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};
    let carrinhoKeys = Object.keys(carrinho);
    let main = document.querySelector('main#mainCarrinho');
    for (i = 0; i < carrinhoKeys.length; i++) {
        produto = carrinho[carrinhoKeys[i]];
        if (produto.quantidade > 0) {
        main.innerHTML += 
        `
        <div class="produto" id="id_produto${produto.cod_produto}">
        <h2>${produto.nome}</h2>
        <span>${produto.valor} x ${produto.quantidade} | <button onclick="addQuant(${produto.cod_produto})">+</button> <button onclick="removeQuant(${produto.cod_produto})">-</button></span>
        ${produto.quantidade > 0 ? `<button onclick="removeTudo(${produto.cod_produto})">REMOVER</button>` : ""}
        </div>
        `;
        };
        let divfinalizarcompra = document.createElement('div'); divfinalizarcompra.setAttribute('id', 'finalizarcompra');
        
    }

}
function carregarCEP() {
    Usuario.pesquisaCEP(document.querySelector("input#cepUsuario").value);
}
function cadastrarUsuario(event) {
    event.preventDefault();
    let nome = document.querySelector('input#nomeUsuario').value;
    let senha = document.querySelector('input#senhaUsuario').value;
    let email = document.querySelector('input#emailUsuario').value;

    if (nome == null || nome.trim() == "") 
        return;
    if (email == null || email.trim() == "") 
        return;
    if (senha == null || senha.trim() == "") 
        return;
    Usuario.pesquisaCEP(document.querySelector("input#cepUsuario").value)

    let numero = document.querySelector('input#numUsuario').value;
    let complemento = document.querySelector('input#complementoUsuario').value;

    let endereco = [];

    if (numero == null || numero.trim() == "") 
        return;
    if (complemento == null || complemento.trim() == "") 
        return;

    let rua = document.querySelector('input#ruaUsuario').value
    let bairro = document.querySelector('input#bairroUsuario').value
    let cidade = document.querySelector('input#cidadeUsuario').value

    if (rua != null && rua.trim() != "")
        endereco.push(rua);
    if (bairro != null && bairro.trim() != "")
        endereco.push(bairro);
    if (cidade != null && cidade.trim() != "")
        endereco.push(cidade);

    if (endereco.length <= 0)
        return;

    let usuario = new Usuario(nome, senha, email, endereco);

    let usuarioBanco = JSON.parse(localStorage.getItem("usuarios")) || {};
    usuarioBanco[usuario.nome] = usuario;
    
    localStorage.setItem("usuarios", JSON.stringify(usuarioBanco));
}
