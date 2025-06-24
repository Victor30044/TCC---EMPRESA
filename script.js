let pedido;
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
    constructor(nome, senha, email, dadosRes, telefone) {
        Usuario.ultimoCodigo += 1;
        this.cod_usuario = Usuario.ultimoCodigo;
        this.nome = nome;
        this.senha = senha;
        this.telefone = telefone;
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
            if (validacep.test(cep)) {
                //Cria um elemento javascript.
                var script = document.createElement('script');

                //Sincroniza com o callback.
                script.src = 'https://viacep.com.br/ws/' + cep + '/json/?callback=Usuario.registraCEP';

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
class Pedido {
    constructor(usuario, carrinho) {
        console.log(usuario);
        console.log(carrinho);
        this.nomeCliente = usuario["qualquermerda"].nome;   
        // Torna dadosRes seguro para uso com join
        if (Array.isArray(usuario["qualquermerda"].dadosRes)) {
            this.endereco = usuario["qualquermerda"].dadosRes.join(', ');
        } else if (typeof usuario["qualquermerda"].dadosRes === 'string') {
            this.endereco = usuario["qualquermerda"].dadosRes; // já é string
        } else {
            this.endereco = "Endereço não informado";
        }

        this.telefone = usuario["qualquermerda"].telefone;
        this.email = usuario["qualquermerda"].email;

        this.itens = [];
        this.total = 0;

        for (let chave in carrinho) {
            let produto = carrinho[chave];
            this.itens.push({
                nome: produto.nome,
                valor: produto.valor,
                quantidade: produto.quantidade,
                subtotal: produto.valor * produto.quantidade
            });
            this.total += produto.valor * produto.quantidade;
        }
    }

    print() {
        console.log(`Cliente: ${this.nomeCliente}`);
        console.log(`Endereço: ${this.endereco}`);
        console.log(`Telefone: ${this.telefone}`);
        console.log(`Email: ${this.email}`);
        console.log(`Total: R$ ${this.total.toFixed(2)}`);
        console.log(`Itens:`);
        this.itens.forEach(item => {
            console.log(`- ${item.nome}: R$${item.valor} x ${item.quantidade} = R$${item.subtotal.toFixed(2)}`);
        });
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
    let produtoatual = cardapio.find(p => p.cod_produto === cod);
    produtoatual.add();

    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};
    carrinho[`produto${cod}`] = produtoatual;

    localStorage.setItem("carrinho", JSON.stringify(carrinho));

    atualizarProduto(cod);
    carregarCarrinho();  // Atualiza total e exibição do carrinho
}

function removeQuant(cod) {
    let produtoatual = cardapio.find(p => p.cod_produto === cod);
    produtoatual.menosQuantidade();

    let carrinho = JSON.parse(localStorage.getItem("carrinho"));

    if (produtoatual.quantidade <= 0) {
        delete carrinho[`produto${cod}`];
    } else {
        carrinho[`produto${cod}`] = produtoatual;
    }

    localStorage.setItem("carrinho", JSON.stringify(carrinho));

    atualizarProduto(cod);
    carregarCarrinho();  // Atualiza total e exibição do carrinho
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
    carregarCarrinho();
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

    // Corrige duplicação de itens
    main.innerHTML = "";

    let total = 0;

    for (let i = 0; i < carrinhoKeys.length; i++) {
        let produto = carrinho[carrinhoKeys[i]];
        if (produto.quantidade > 0) {
            main.innerHTML += `
                <div class="produto" id="id_produto${produto.cod_produto}">
                    <h2>${produto.nome}</h2>
                    <span>${produto.valor} x ${produto.quantidade} | 
                        <button onclick="addQuant(${produto.cod_produto})">+</button> 
                        <button onclick="removeQuant(${produto.cod_produto})">-</button>
                    </span>
                    <button onclick="removeTudo(${produto.cod_produto})">REMOVER</button>
                </div>
            `;
            total += produto.valor * produto.quantidade;
        }
    }

    // Remove div antiga do total, se houver
    let antigoFinalizar = document.getElementById('finalizarcompra');
    if (antigoFinalizar) antigoFinalizar.remove();

    // Cria nova div do total
    let divfinalizarcompra = document.createElement('div');
    divfinalizarcompra.setAttribute('id', "finalizarcompra");
    divfinalizarcompra.innerHTML = `
    <p>Total: R$ ${total.toFixed(2)}</p>
    <button onclick="comprar()">Comprar</button>
    `;
    document.body.appendChild(divfinalizarcompra);
}

function comprar() {
    if (localStorage.getItem("pedido") == null)
        localStorage.setItem("pedido", JSON.stringify({}));
    let usuarioBanco = JSON.parse(localStorage.getItem("usuarios")) || {};
    pedido = new Pedido(JSON.parse(localStorage.getItem("usuarios")) || {}, JSON.parse(localStorage.getItem("carrinho")) || {}); console.log(pedido)
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
    usuarioBanco["qualquermerda"] = usuario;
    // colocar no banco de dados 
    localStorage.setItem("usuarios", JSON.stringify(usuarioBanco));
}
