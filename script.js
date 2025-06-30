let pedido;

class Produto {
    static ultimoCodigo = 0;

    constructor(nome) {
        Produto.ultimoCodigo += 1;
        this.cod_produto = Produto.ultimoCodigo;
        this.nome = nome;
        this.valor = 49.9;

        const carrinhoLS = JSON.parse(localStorage.getItem('carrinho')) || {};
        this.quantidade = carrinhoLS[`produto${this.cod_produto}`]
            ? carrinhoLS[`produto${this.cod_produto}`].quantidade
            : 0;

        if (this.quantidade < 0) this.quantidade = 0;
    }

    add() {
        this.quantidade++;
        console.log(`Quantidade após adicionar: ${this.quantidade}`);
    }

    menosQuantidade() {
        if (this.quantidade > 0) this.quantidade--;
        console.log(`Quantidade após remover: ${this.quantidade}`);
    }

    remove() {
        this.menosQuantidade();
    }
}

class Usuario {
    static ultimoCodigo = 0;

    // Construtor básico para o usuário
    constructor(nome, senha, email, dadosRes) {
        Usuario.ultimoCodigo++;
        this.cod_usuario = Usuario.ultimoCodigo;
        this.nome = nome;
        this.senha = senha;
        this.email = email;
        this.dadosRes = dadosRes;
    }

    // Callback para registrar CEP na UI a partir do retorno da API ViaCEP
    static registraCEP(conteudo) {
        if (!("erro" in conteudo)) {
            let rua = conteudo.logradouro;
            let bairro = conteudo.bairro;
            let cidade = conteudo.localidade;

            document.querySelector("input#ruaUsuario").value = rua;
            document.querySelector("input#bairroUsuario").value = bairro;
            document.querySelector("input#cidadeUsuario").value = cidade;
        } else {
            alert("CEP não encontrado.");
            return null;
        }
    }

    // Pesquisa CEP usando API ViaCEP e insere script para callback
    static pesquisaCEP(valor) {
        var cep = valor.replace(/\D/g, '');

        if (cep != "") {
            var validacep = /^[0-9]{8}$/;

            if (validacep.test(cep)) {
                var script = document.createElement('script');
                script.src = 'https://viacep.com.br/ws/' + cep + '/json/?callback=Usuario.registraCEP';
                document.body.appendChild(script);
            } else {
                alert("Formato de CEP inválido.");
            }
        }
    }
}

class Pedido {
    static ultimoCodigo = 0;

    // Construtor cria pedido a partir do usuário e do carrinho
    constructor(usuario, carrinho) {
        Pedido.ultimoCodigo++;
        this.cod_pedido = Pedido.ultimoCodigo;

        // Assumimos usuário salvo em "qualquermerda" na estrutura do localStorage
        this.nomeCliente = usuario["qualquermerda"].nome;

        // Garante que dadosRes pode ser array ou string para o endereço
        if (Array.isArray(usuario["qualquermerda"].dadosRes)) {
            this.endereco = usuario["qualquermerda"].dadosRes.join(', ');
        } else if (typeof usuario["qualquermerda"].dadosRes === 'string') {
            this.endereco = usuario["qualquermerda"].dadosRes;
        } else {
            this.endereco = "Endereço não informado";
        }

        this.email = usuario["qualquermerda"].email;

        this.itens = [];
        this.total = 0;

        // Para cada produto no carrinho, cria objeto de item e calcula total
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

    // Imprime informações detalhadas do pedido no console
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
    // produtoatual = cardapio.find(Produto => Produto.cod_produto == cod);
    const produtoatual = cardapio.find(p => p.cod_produto === cod);
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
    // let produtoatual = cardapio.find(p => p.cod_produto === cod);
    const produtoatual = cardapio.find(p => p.cod_produto === cod);
    produtoatual.add();

    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};
    carrinho[`produto${cod}`] = produtoatual;

    localStorage.setItem("carrinho", JSON.stringify(carrinho));

    atualizarProduto(cod);
    // carregarCarrinho()
    carregarCarrinhoTemporario();  // Atualiza total e exibição do carrinho
}

function removeQuant(cod) {
    // let produtoatual = cardapio.find(p => p.cod_produto === cod);
    produtoatual = produto
    produtoatual.menosQuantidade();

    let carrinho = JSON.parse(localStorage.getItem("carrinho"));

    if (produtoatual.quantidade <= 0) {
        delete carrinho[`produto${cod}`];
    } else {
        carrinho[`produto${cod}`] = produtoatual;
    }

    localStorage.setItem("carrinho", JSON.stringify(carrinho));

    atualizarProduto(cod);
    // carregarCarrinho()
    carregarCarrinhoTemporario();  // Atualiza total e exibição do carrinho
}

function removeTudo(cod) {
    console.log(`Funcao remove${cod}`);
    // produtoatual = cardapio.find(Produto => Produto.cod_produto == cod);
    const produtoatual = cardapio.find(p => p.cod_produto === cod);
    produtoatual.quantidade = 0;
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};

    delete carrinho[`produto${produtoatual.cod_produto}`];
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    divprotudoatual = document.querySelector(`div#id_produto${cod}`); console.log(divprotudoatual);
    divprotudoatual.innerHTML = "";
    // carregarCarrinho()
    carregarCarrinhoTemporario();  // Atualiza total e exibição do carrinho
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

        const produtos = await res.json(); // <- aqui você extrai os dados da resposta

        const container = document.getElementById('mainCardapio');
        container.innerHTML = ''; // limpa antes

        if (produtos.length === 0) {
            container.innerText = 'Nenhuma pizza cadastrada.';
            return;
        }

        produtos.forEach(pizza => {
            const div = document.createElement('div');
            div.className = 'pizza';

            div.innerHTML = `
                <div class="produto" id="id_produto${pizza.cod_produto}">
                    <h2>${pizza.nome}</h2>
                    <span>${pizza.valor} x ${pizza.quantidade} | 
                        <button onclick="addQuant(${pizza.cod_produto})">+</button>
                        <button onclick="removeQuant(${pizza.cod_produto})">-</button>
                    </span>
                    <button onclick="removeTudo(${pizza.cod_produto})">REMOVER</button>
                </div>
            `;

            container.appendChild(div);
        });
    } catch (error) {
        console.error('Erro ao carregar pizzas:', error);
    }
}


async function carregarCardapio() {
    console.log('carregarCardapio chamada');
    try {
        const res = await fetch('http://localhost:3000/produtos');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const produtos = await res.json();
        console.log('Produtos carregados:', produtos);

        const container = document.getElementById('mainCardapio');
        container.innerHTML = ''; // limpa antes

        if (produtos.length === 0) {
            container.innerText = 'Nenhum produto cadastrado.';
            return;
        }

        // Criar containers para cada categoria
        const categorias = {
            salgadas: document.createElement('section'),
            brotinho: document.createElement('section'),
            doces: document.createElement('section'),
            bebidas: document.createElement('section'),
            acompanhamentos: document.createElement('section'),
        };

        // Criar títulos para cada categoria
        categorias.salgadas.innerHTML = '<h1>Pizzas Salgadas</h1>';
        categorias.brotinho.innerHTML = '<h1>Brotinhos</h1>';
        categorias.doces.innerHTML = '<h1>Pizzas Doces</h1>';
        categorias.bebidas.innerHTML = '<h1>Bebidas</h1>';
        categorias.acompanhamentos.innerHTML = '<h1>Acompanhamentos</h1>';

        // Classificação de categorias por nome do produto
        function classificarCategoria(produto) {
            const nome = produto.nome.toLowerCase();

            if (nome.includes('brotinho')) return 'brotinho';
            if (nome.includes('chocolate') || nome.includes('prestígio') || nome.includes('banana') || nome.includes('romeu') || nome.includes('oreo')) return 'doces';
            if (nome.includes('refrigerante') || nome.includes('suco') || nome.includes('água')) return 'bebidas';
            if (nome.includes('batata') || nome.includes('molho') || nome.includes('borda')) return 'acompanhamentos';

            return 'salgadas'; // padrão
        }

        // Separar e inserir os produtos nas seções
        produtos.forEach(produto => {
            const categoria = classificarCategoria(produto);

            const divitem = document.createElement('div');
            divitem.className = 'produto';
            divitem.id = `id_produto${produto.id}`;
            divitem.innerHTML = `
                <img src="../imagens/logo.jfif" alt="${produto.nome}" />
                <h2>${produto.nome}</h2>
                <p>${produto.descricao || ''}</p>
                <p><strong>R$ ${produto.preco.toFixed(2)}</strong></p>
                <button onclick="add(${produto.id})">Adicionar ao carrinho</button>
            `;

            categorias[categoria].appendChild(divitem);
        });

        // Adiciona as seções ao container principal
        Object.values(categorias).forEach(section => container.appendChild(section));

    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
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
function exibirBotaoFinalizar() {
    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};
    const temItens = Object.values(carrinho).some(p => p.quantidade > 0);

    const main = document.getElementById("mainCarrinho");

    let botaoExistente = document.getElementById("btnFinalizarCompra");
    if (botaoExistente) botaoExistente.remove();

    if (temItens) {
        const btn = document.createElement("button");
        btn.innerText = "Finalizar Compra";
        btn.className = "btn btn-success mt-3";
        btn.id = "btnFinalizarCompra";
        btn.onclick = abrirModalPagamento;

        main.appendChild(btn);
    }
}

function abrirModalPagamento() {
    const modalHtml = `
    <div class="modal fade" id="modalPagamento" tabindex="-1" aria-labelledby="modalPagamentoLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <form onsubmit="processarPagamento(event)">
            <div class="modal-header">
              <h5 class="modal-title" id="modalPagamentoLabel">Forma de Pagamento</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
              <div class="form-check">
                <input class="form-check-input" type="radio" name="pagamento" id="credito" value="credito" checked>
                <label class="form-check-label" for="credito">Cartão de Crédito</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="pagamento" id="entrega" value="entrega">
                <label class="form-check-label" for="entrega">Pagar na Entrega</label>
              </div>

              <div id="dadosCartao" class="mt-3">
                <label>Número do Cartão</label>
                <input class="form-control" type="text" id="numeroCartao" required>
                <label class="mt-2">Validade</label>
                <input class="form-control" type="month" id="validadeCartao" required>
                <label class="mt-2">CVV</label>
                <input class="form-control" type="text" id="cvvCartao" required>
              </div>
            </div>
            <div class="modal-footer">
              <button type="submit" class="btn btn-primary">Confirmar Pagamento</button>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHtml);

    const modal = new bootstrap.Modal(document.getElementById("modalPagamento"));
    modal.show();

    // Oculta campos de cartão se usuário escolher "entrega"
    document.getElementById("credito").addEventListener("change", () => {
        document.getElementById("dadosCartao").style.display = "block";
    });
    document.getElementById("entrega").addEventListener("change", () => {
        document.getElementById("dadosCartao").style.display = "none";
    });
    document.getElementById('pagarCartao').addEventListener('click', () => {
        const numero = document.getElementById('numeroCartao').value.replace(/\s/g, '');

        const bandeira = detectarBandeira(numero);

        if (!bandeira) {
            alert('Número de cartão inválido!');
            return;
        }

        alert(`Pagamento aprovado com cartão ${bandeira}`);
        fecharModalPagamento();
    });

}

function processarPagamento(event) {
    event.preventDefault();

    const tipo = document.querySelector('input[name="pagamento"]:checked').value;

    if (tipo === "credito") {
        const numero = document.getElementById("numeroCartao").value.trim();
        const validade = document.getElementById("validadeCartao").value.trim();
        const cvv = document.getElementById("cvvCartao").value.trim();

        const bandeira = detectarBandeira(numero);

        if (!numero || !validade || !cvv || !bandeira) {
            alert("Cartão inválido ou campos incompletos.");
            return;
        }

        alert(`Pagamento com cartão ${bandeira} aprovado!`);
    } else {
        alert("Pagamento será feito na entrega.");
    }

    // Criar pedido apenas se o cartão foi validado ou for pagamento na entrega
    let usuarioBanco = JSON.parse(localStorage.getItem("usuarios")) || {};
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};

    const pedido = new Pedido(usuarioBanco, carrinho);
    localStorage.setItem(`pedido${pedido.cod_pedido}`, JSON.stringify(pedido));

    alert(`Pedido confirmado de ${pedido.itens[0].quantidade}x ${pedido.itens[0].nome}`);
    localStorage.removeItem("carrinho");
    location.reload();
}
// Detectar bandeira do cartão com regex
const cartoes = {
    Visa: /^4[0-9]{12}(?:[0-9]{3})$/,
    Mastercard: /^5[1-5][0-9]{14}$/,
    Amex: /^3[47][0-9]{13}$/,
    DinersClub: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
    Discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    JCB: /^(?:2131|1800|35\d{3})\d{11}$/
};

function detectarBandeira(numeroCartao) {
    for (let bandeira in cartoes) {
        if (numeroCartao.match(cartoes[bandeira])) {
            return bandeira;
        }
    }
    return false;
}
