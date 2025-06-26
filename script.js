let pedido;
class Produto {
    static ultimoCodigo = 0;
    constructor(nome) {
        Produto.ultimoCodigo += 1;
        this.cod_produto = Produto.ultimoCodigo;
        this.nome = nome;
        this.valor = 49.9;
        // this.quantidade = JSON.parse(localStorage.getItem('carrinho'))[`produto${this.cod_produto}`]
        //     ? JSON.parse(localStorage.getItem('carrinho'))[`produto${this.cod_produto}`].quantidade
        //     : 0;
        // this.quantidade > 0 ? this.quantidade : this.quantidade = 0;
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
        Usuario.ultimoCodigo++;
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
    static ultimoCodigo = 0;
    constructor(usuario, carrinho) {
        Pedido.ultimoCodigo++;
        this.cod_pedido = Pedido.ultimoCodigo;
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
// function carregarCardapio() {
// if (localStorage.getItem("carrinho") == null)
//     localStorage.setItem("carrinho", JSON.stringify({}));

// let main = document.querySelector('main#mainCardapio');

// for (i = 0; i < cardapio.length; i++) {
//     main.innerHTML +=
//         `
//     <div class="produto" id="id_produto${cardapio[i].cod_produto}">
//     <h2>${cardapio[i].nome}</h2>
//     <p>${cardapio[i].valor}</p>
//     <button onclick="add(${cardapio[i].cod_produto})">Acionar ao carrinho</button>
//     </div>
//     `
async function carregarCardapio() {
    console.log('carregarCardapio chamada');
    try {
        const res = await fetch('http://localhost:3000/produtos');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const pizzas = await res.json();
        console.log('Pizzas carregadas:', pizzas);

        const container = document.getElementById('mainCardapio');
        container.innerHTML = ''; // limpa antes

        if (pizzas.length === 0) {
            container.innerText = 'Nenhuma pizza cadastrada.';
            return;
        }

        pizzas.forEach(pizza => {
            const div = document.createElement('div');
            div.className = 'pizza';

            div.innerHTML = `
        <div class="nome">${pizza.nome}</div>
        <div class="descricao">${pizza.descricao || ''}</div>
        <div class="preco">R$ ${pizza.preco.toFixed(2)}</div>
      `;

            container.appendChild(div);
        });
    } catch (error) {
        console.error('Erro ao carregar pizzas:', error);
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
    pedido = new Pedido(JSON.parse(localStorage.getItem("usuarios")) || {}, JSON.parse(localStorage.getItem("carrinho")) || {}); console.log(pedido);
    localStorage.setItem(`pedido${pedido.cod_pedido}`, JSON.stringify(pedido));
    window.confirm(`Deseja confirmar o pedido de: ${pedido.itens[0].quantidade} Pizza de ${pedido.itens[0].nome}`);
}
function carregarCEP() {
    Usuario.pesquisaCEP(document.querySelector("input#cepUsuario").value);
}
async function cadastrarUsuario(event) {
    event.preventDefault();

    let nome = document.querySelector('input#nomeUsuario').value;
    let senha = document.querySelector('input#senhaUsuario').value;
    let email = document.querySelector('input#emailUsuario').value;
    // se não tem, precisa adicionar no form

    if (!mostrarCamposFaltando()) return;


    Usuario.pesquisaCEP(document.querySelector("input#cepUsuario").value);

    let numero = document.querySelector('input#numUsuario').value;
    let complemento = document.querySelector('input#complementoUsuario').value;

    let endereco = [];

    if (!numero || !complemento) {
        alert('Número e complemento obrigatórios!');
        return;
    }

    let rua = document.querySelector('input#ruaUsuario').value;
    let bairro = document.querySelector('input#bairroUsuario').value;
    let cidade = document.querySelector('input#cidadeUsuario').value;
    if (validaCPF) { let cpf = document.querySelector('input#cpfUsuario').value; } else { return }
    let telefone = 40028922;

    if (rua) endereco.push(rua);
    if (bairro) endereco.push(bairro);
    if (cidade) endereco.push(cidade);

    if (endereco.length <= 0) {
        alert('Endereço inválido!');
        return;
    }

    // Monta string do endereço
    let enderecoStr = endereco.join(', ') + ', ' + numero + ' ' + complemento;

    let usuario = {
        nome,
        email,
        cpf,
        senha,
        telefone,
        endereco: enderecoStr
    };

    // salva no localStorage, se quiser manter
    let usuarioBanco = JSON.parse(localStorage.getItem("usuarios")) || {};
    usuarioBanco["qualquermerda"] = usuario;
    localStorage.setItem("usuarios", JSON.stringify(usuarioBanco));

    // envia para o backend
    try {
        let res = await fetch('http://localhost:3000/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuario)
        });

        if (!res.ok) {
            throw new Error('Erro ao cadastrar usuário');
        }

        alert('Usuário cadastrado com sucesso!');
        // opcional: redirecionar ou limpar formulário
    } catch (error) {
        console.error(error);
        alert('Falha ao cadastrar usuário');
    }
}
// validar cpf 
function validaCPF(cpf) {
    var Soma = 0
    var Resto

    var strCPF = String(cpf).replace(/[^\d]/g, '')

    if (strCPF.length !== 11)
        return false

    if ([
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999',
    ].indexOf(strCPF) !== -1)
        return false

    for (i = 1; i <= 9; i++)
        Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);

    Resto = (Soma * 10) % 11

    if ((Resto == 10) || (Resto == 11))
        Resto = 0

    if (Resto != parseInt(strCPF.substring(9, 10)))
        return false

    Soma = 0

    for (i = 1; i <= 10; i++)
        Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i)

    Resto = (Soma * 10) % 11

    if ((Resto == 10) || (Resto == 11))
        Resto = 0

    if (Resto != parseInt(strCPF.substring(10, 11)))
        return false

    return true
}
function mostrarCamposFaltando() {
    const camposFaltando = [];

    function checar(id, nomeCampo, validacao = null) {
        const input = document.querySelector(`#${id}`);
        const valor = input.value.trim();

        let valido = valor !== '';
        if (validacao && valor !== '') {
            valido = validacao(valor);
        }

        if (!valido) {
            camposFaltando.push(nomeCampo);
            input.classList.add('erro');
        } else {
            input.classList.remove('erro');
        }
    }

    checar('nomeUsuario', 'Nome');
    checar('emailUsuario', 'Email');
    checar('senhaUsuario', 'Senha');
    checar('cpfUsuario', 'CPF', validaCPF);
    checar('cepUsuario', 'CEP');
    checar('numUsuario', 'Número');
    checar('complementoUsuario', 'Complemento');

    // Endereço via CEP
    const rua = document.querySelector('#ruaUsuario');
    const bairro = document.querySelector('#bairroUsuario');
    const cidade = document.querySelector('#cidadeUsuario');

    if (!rua.value || !bairro.value || !cidade.value) {
        camposFaltando.push('Endereço (via CEP)');
        rua.classList.add('erro');
        bairro.classList.add('erro');
        cidade.classList.add('erro');
    } else {
        rua.classList.remove('erro');
        bairro.classList.remove('erro');
        cidade.classList.remove('erro');
    }

    if (camposFaltando.length > 0) {
        alert(`Preencha os seguintes campos corretamente:\n- ${camposFaltando.join('\n- ')}`);
        return false;
    }

    return true;
}
