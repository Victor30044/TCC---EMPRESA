let pedido;

class Produto {
    static ultimoCodigo = 0;

    // Construtor inicializa produto com nome, preco fixo, código incremental e quantidade do localStorage
    constructor(nome) {
        Produto.ultimoCodigo += 1;
        this.id = Produto.ultimoCodigo;
        this.nome = nome;
        this.preco = 49.9;

        // Busca quantidade no carrinho do localStorage, se não existir inicializa 0
        const carrinhoLS = JSON.parse(localStorage.getItem('carrinho')) || {};
        this.quantidade = carrinhoLS[`produto${this.cod_produto}`]
            ? carrinhoLS[`produto${this.cod_produto}`].quantidade
            : 0;

        if (this.quantidade < 0) this.quantidade = 0;
    }

    // Incrementa quantidade do produto
    add() {
        this.quantidade++;
        console.log(`Quantidade após adicionar: ${this.quantidade}`);
    }

    // Decrementa quantidade do produto (mínimo 0)
    menosQuantidade() {
        if (this.quantidade > 0) this.quantidade--;
        console.log(`Quantidade após remover: ${this.quantidade}`);
    }

    // Remove um item (mesmo que menosQuantidade, mantém por compatibilidade)
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
    static pesquisaCEP(preco) {
        var cep = preco.replace(/\D/g, '');

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
                preco: produto.preco,
                quantidade: produto.quantidade,
                subtotal: produto.preco * produto.quantidade
            });
            this.total += produto.preco * produto.quantidade;
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
            console.log(`- ${item.nome}: R$${item.preco} x ${item.quantidade} = R$${item.subtotal.toFixed(2)}`);
        });
    }
}
function carregarCadastro() {
    if (localStorage.getItem("usuario") == null)
        localStorage.setItem("usuario", JSON.stringify({}));
}
function atualizarProduto(cod) {
  console.log(`Função atualizarProduto ${cod}`);

  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};
  const produtoatual = carrinho[`produto${cod}`];

  const divProdutoAtual = document.querySelector(`div#id_produto${cod}`);

  if (!divProdutoAtual) {
    console.warn(`Div do produto ${cod} não encontrada no DOM.`);
    return;
  }

  // Limpa o conteúdo da div antes de atualizar
  divProdutoAtual.innerHTML = "";

  if (produtoatual && produtoatual.quantidade > 0) {
    divProdutoAtual.innerHTML = `
      <div class="produto" id="id_produto${cod}">
        <h2>${produtoatual.nome}</h2>
        <span>${produtoatual.preco.toFixed(2)} x ${produtoatual.quantidade} 
          | <button onclick="addQuant(${cod})">+</button> 
          <button onclick="removeQuant(${cod})">-</button>
        </span>
        <button onclick="removeTudo(${cod})">REMOVER</button>
      </div>
    `;
  } else {
    // Se produto não existe ou quantidade é 0, pode limpar ou esconder a div
    divProdutoAtual.innerHTML = ""; // opcional: ou divProdutoAtual.style.display = 'none';
  }
}

async function add(cod) {
  console.log(`Função ADD ${cod}`);

  try {
    // Busca o produto do backend pelo id
    const response = await fetch(`http://localhost:3000/produtos/${cod}`);
    if (!response.ok) {
      console.error('Produto não encontrado no backend');
      return;
    }

    const produtoatual = await response.json();

    // Obtem carrinho do localStorage (objeto)
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};

    // Se o produto já existe no carrinho, incrementa a quantidade
    if (carrinho[`produto${cod}`]) {
      carrinho[`produto${cod}`].quantidade += 1;
    } else {
      // Caso não exista, adiciona com quantidade = 1
      carrinho[`produto${cod}`] = {
        id: produtoatual.id,
        nome: produtoatual.nome,
        descricao: produtoatual.descricao,
        preco: produtoatual.preco,
        quantidade: 1
      };
    }

    // Salva o carrinho atualizado no localStorage
    localStorage.setItem("carrinho", JSON.stringify(carrinho));

    console.log('Produto adicionado ao carrinho:', carrinho[`produto${cod}`]);

  } catch (error) {
    console.error('Erro ao buscar produto:', error);
  }
}

function addQuant(cod) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};

  // Verifica se o produto existe no carrinho
  if (carrinho[`produto${cod}`]) {
    carrinho[`produto${cod}`].quantidade += 1; // adiciona 1
  } else {
    // Caso não exista, opcional: buscar produto no backend e adicionar com quantidade 1
    // Aqui deixo só um aviso para adaptar conforme seu fluxo
    console.warn(`Produto ${cod} não encontrado no carrinho.`);
    return;
  }

  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  atualizarProduto(cod);
  carregarCarrinho();
}

function removeQuant(cod) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};

  if (!carrinho[`produto${cod}`]) {
    console.warn(`Produto ${cod} não encontrado no carrinho.`);
    return;
  }

  carrinho[`produto${cod}`].quantidade -= 1;

  if (carrinho[`produto${cod}`].quantidade <= 0) {
    delete carrinho[`produto${cod}`]; // remove do carrinho
  }

  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  atualizarProduto(cod);
  carregarCarrinho();
}

function removeTudo(cod) {
  console.log(`Função removeTudo ${cod}`);

  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};

  if (carrinho[`produto${cod}`]) {
    delete carrinho[`produto${cod}`];
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
  } else {
    console.warn(`Produto ${cod} não encontrado no carrinho.`);
  }

  // Remove a exibição do produto, se existir
  const divProdutoAtual = document.querySelector(`div#id_produto${cod}`);
  if (divProdutoAtual) divProdutoAtual.innerHTML = "";

  carregarCarrinho();
}


async function carregarCardapio() {
    console.log('carregarCardapio chamada');
    try {
        const res = await fetch('http://localhost:3000/produtos');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        let produtos = await res.json();
        const container = document.getElementById('mainCardapio');
        container.innerHTML = '';

        if (produtos.length === 0) {
            container.innerText = 'Nenhuma pizza cadastrada.';
            return;
        }

        // Adiciona categoria manualmente
        produtos = produtos.map(p => {
            const nome = p.nome.toLowerCase();
            let categoria = 'acompanhamento';

            if (nome.includes('brotinho') || [
                'calabresa', 'marguerita', 'frango', 'portuguesa', 'quatro', 'toscana', 'muçarela'
            ].some(c => nome.includes(c))) {
                categoria = 'salgada';
            } else if (['chocolate', 'prestígio', 'romeu', 'banana', 'oreo'].some(c => nome.includes(c))) {
                categoria = 'doce';
            } else if (['refrigerante', 'suco', 'água'].some(c => nome.includes(c))) {
                categoria = 'bebida';
            }

            return { ...p, categoria };
        });

        // Agrupa por categoria
        const categorias = {};
        produtos.forEach(produto => {
            const cat = produto.categoria;
            if (!categorias[cat]) categorias[cat] = [];
            categorias[cat].push(produto);
        });

        for (const categoria in categorias) {
            const secao = document.createElement('section');
            secao.className = 'categoria';

            const titulo = document.createElement('h2');
            titulo.textContent = categoria.toUpperCase();
            secao.appendChild(titulo);

            categorias[categoria].forEach(produto => {
                const div = document.createElement('div');
                div.className = 'produto';
                div.id = `id_produto${produto.id}`;
                div.innerHTML = `
                    <img src="../imagens/logo.jfif">
                    <h3>${produto.nome}</h3>
                    <p>R$ ${produto.preco.toFixed(2)}</p>
                    <button onclick="add(${produto.id})">Adicionar ao carrinho</button>
                `;

                secao.appendChild(div);
            });

            container.appendChild(secao);
        }
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
                <div class="produto" id="id_produto${produto.id}">
                    <h2>${produto.nome}</h2>
                    <span>R$${produto.preco} x ${produto.quantidade} | 
                        <button onclick="addQuant(${produto.id})">+</button> 
                        <button onclick="removeQuant(${produto.id})">-</button>
                    </span>
                    <button onclick="removeTudo(${produto.id})">REMOVER</button>
                </div>
            `;
            total += produto.preco * produto.quantidade;
        }
    }

    // Remove div antiga do total, se houver
    let antigoFinalizar = document.getElementById('finalizarcompra');
    if (antigoFinalizar) antigoFinalizar.remove();

    // Cria nova div do total
    exibirBotaoFinalizar()
}
// function carregarCarrinho() {
//     document.querySelector('main#mainCarrinho').innerHTML = `
//             <div class="produto" id="id_produto${produto.cod_produto}">
//                 <h2>${produto.nome}</h2>
//                 <span>${produto.preco} x ${produto.quantidade} |
//                     <button onclick="addQuant(${produto.cod_produto})">+</button>
//                     <button onclick="removeQuant(${produto.cod_produto})">-</button><br>
//                 </span>
//                 <button onclick="removeTudo(${produto.cod_produto})">REMOVER</button>
//             </div>
//     `
//     localStorage.setItem('Carrinho', JSON.stringify);
//     exibirBotaoFinalizar()
// }
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
    localStorage.setItem("usuario", JSON.stringify(usuarioBanco));

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
        const preco = input.value.trim();

        let valido = preco !== '';
        if (validacao && preco !== '') {
            valido = validacao(preco);
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
        btn.onclick = abrirResumoPedido;

        main.appendChild(btn);
    }
}
function abrirResumoPedido() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};
  if (Object.keys(carrinho).length === 0) {
    alert("Carrinho vazio.");
    return;
  }

  let total = 0;
  let listaHtml = "";

  for (let key in carrinho) {
    const produto = carrinho[key];
    const subtotal = produto.preco * produto.quantidade; 
    total += subtotal;

    listaHtml += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        ${produto.quantidade}x ${produto.nome}
        <span>R$ ${subtotal.toFixed(2)}</span>
      </li>
    `;
  }

  const frete = 5.00;
  const totalComFrete = total + frete;

  const modalResumoHtml = `
    <div class="modal fade" id="modalResumoPedido" tabindex="-1" aria-labelledby="modalResumoLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalResumoLabel">Resumo do Pedido</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body">
            <ul class="list-group">
              ${listaHtml}
              <li class="list-group-item d-flex justify-content-between">
                <strong>Frete</strong>
                <span>R$ ${frete.toFixed(2)}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <strong>Total</strong>
                <span><strong>R$ ${totalComFrete.toFixed(2)}</strong></span>
              </li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btnContinuarPagamento">Continuar para Pagamento</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalResumoHtml);

  const modalResumo = new bootstrap.Modal(document.getElementById("modalResumoPedido"));
  modalResumo.show();

  // Evento: continuar para pagamento
  document.getElementById("btnContinuarPagamento").addEventListener("click", () => {
    modalResumo.hide();
    abrirModalPagamento(); // abre o modal de pagamento original
  });

  // Remove o modal do DOM quando ele for fechado
  document.getElementById("modalResumoPedido").addEventListener('hidden.bs.modal', () => {
    document.getElementById("modalResumoPedido").remove();
  });
}

function abrirModalPagamento() {
  const modalHtml = `
    <div class="modal fade" id="modalPagamento" tabindex="-1" aria-labelledby="modalPagamentoLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <form id="formPagamento">
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
                <label for="numeroCartao">Número do Cartão</label>
                <input class="form-control" type="text" id="numeroCartao" required maxlength="19" placeholder="1234 5678 9012 3456">
                <label class="mt-2" for="validadeCartao">Validade</label>
                <input class="form-control" type="month" id="validadeCartao" required>
                <label class="mt-2" for="cvvCartao">CVV</label>
                <input class="form-control" type="text" id="cvvCartao" required maxlength="4" placeholder="123">
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

  // Insere modal no body
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  const modalElem = document.getElementById("modalPagamento");
  const modal = new bootstrap.Modal(modalElem);
  modal.show();

  // Controle para mostrar/ocultar campos do cartão
document.getElementById("credito").addEventListener("change", () => {
  const dadosCartao = document.getElementById("dadosCartao");
  dadosCartao.style.display = "block";

  // Habilita todos os inputs dentro de dadosCartao
  dadosCartao.querySelectorAll("input").forEach(input => input.disabled = false);
});

document.getElementById("entrega").addEventListener("change", () => {
  const dadosCartao = document.getElementById("dadosCartao");
  dadosCartao.style.display = "none";

  // Desabilita todos os inputs dentro de dadosCartao para evitar validação
  dadosCartao.querySelectorAll("input").forEach(input => input.disabled = true);
});


  // Evento submit do form
  document.getElementById("formPagamento").addEventListener("submit", (event) => {
    processarPagamento(event, modal);
  });

  // Ao fechar modal, remover do DOM para evitar duplicações futuras
  modalElem.addEventListener('hidden.bs.modal', () => {
    modalElem.remove();
  });
}


function processarPagamento(event, modal) {
  event.preventDefault();

  const tipo = document.querySelector('input[name="pagamento"]:checked').value;

  const numeroCartaoInput = document.getElementById("numeroCartao");
  const validadeCartaoInput = document.getElementById("validadeCartao");
  const cvvCartaoInput = document.getElementById("cvvCartao");

  if (tipo === "credito") {
    // Garante que required está ativo
    numeroCartaoInput.required = true;
    validadeCartaoInput.required = true;
    cvvCartaoInput.required = true;

    const numero = numeroCartaoInput.value.trim().replace(/\s+/g, "");
    const validade = validadeCartaoInput.value.trim();
    const cvv = cvvCartaoInput.value.trim();

    const bandeira = detectarBandeira(numero);

    if (!numero || !validade || !cvv || !bandeira) {
      alert("Cartão inválido ou campos incompletos.");
      return;
    }

    alert(`Pagamento com cartão ${bandeira} aprovado!`);
  } else {
    // Remove required dos inputs porque eles estão escondidos
    numeroCartaoInput.required = false;
    validadeCartaoInput.required = false;
    cvvCartaoInput.required = false;
  }

  // restante do código para criar pedido...
  if (tipo === "credito") {
  // ... validação do cartão ...

  alert(`Pagamento com cartão ${bandeira} aprovado!`);
} else {
  alert("Pagamento será feito na entrega.");
}

// Apenas fecha o modal de pagamento
modal.hide();  // Isso já ativa o listener para .remove()
// Pega os dados do carrinho e usuário
const carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};
const itens = Object.values(carrinho);
const frete = 5;

const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario || !usuario.id) {
  alert("Usuário não está logado.");
  return;
}
// Envia o pedido para o backend
// Supondo que 'itens' já esteja preenchido
itens.forEach(item => {
  item.preco = Number(item.preco);
  item.quantidade = Number(item.quantidade);
});

const total = itens.reduce((acc, item) => {
  const preco = Number(item.preco);
  const quantidade = Number(item.quantidade);
  if (isNaN(preco) || isNaN(quantidade)) return acc;
  return acc + preco * quantidade;
}, 0);

if (isNaN(total) || total <= 0) {
  alert("Erro: total inválido. Verifique os itens do pedido.");
  return;
}

fetch("http://localhost:3000/pedidos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    usuario_id: usuario.id,
    itens,
    total
  }),
})
.then(res => res.json())
.then(data => {
  console.log("Pedido salvo:", data);
  alert(`Pedido realizado com sucesso! Código do pedido: ${data.id_pedido}`);
})
.catch(err => {
  console.error("Erro ao enviar pedido:", err);
  alert("Erro ao salvar pedido no banco.");
});

localStorage.removeItem("carrinho");
carregarCarrinho()

}

// Detectar bandeira do cartão com regex
const cartoes = {
  Visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
  Mastercard: /^5[1-5][0-9]{14}$/,
  Amex: /^3[47][0-9]{13}$/,
  DinersClub: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
  Discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
  JCB: /^(?:2131|1800|35\d{3})\d{11}$/
};

function detectarBandeira(numeroCartao) {
  for (let bandeira in cartoes) {
    if (cartoes[bandeira].test(numeroCartao)) {
      return bandeira;
    }
  }
  return false;
}
