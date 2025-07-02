document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.getElementById("btnLogin");
  const userName = document.getElementById("userName");
  const btnLogout = document.getElementById("btnLogout");

  // Pega o usuário  do localStorage (esperando objeto com 'nome')
  const usuarioStr = localStorage.getItem("usuarioLogado");
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;

  if (usuario && usuario.nome) {
    // Esconde botão login
    btnLogin.style.display = "none";

    // Mostra nome do usuário
    userName.textContent = `Olá, ${usuario.nome}`;
    userName.classList.remove("d-none");

    // Mostra botão logout
    btnLogout.classList.remove("d-none");
  } else {
    // Mostra botão login
    btnLogin.style.display = "inline-block";

    // Esconde nome do usuário e logout
    userName.classList.add("d-none");
    btnLogout.classList.add("d-none");
  }

  // Evento para logout: limpa localStorage e atualiza a página
  btnLogout.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("usuario");
    location.reload();
  });
});
