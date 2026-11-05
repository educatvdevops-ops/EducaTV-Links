/* ==========================================================
   EDUCATV CAMPINAS - SCRIPT
   Índice:
   0. CONFIGURAÇÃO (é aqui que você edita destaques e calendário)
   1. Copiar texto
   2. Menu e telas
   3. Busca de links
   4. Carrossel de destaques
   5. Calendário
   6. Botão "copiar endereço" de cada link
   7. Botões "Copiar senha" (Wi-Fi)
   ========================================================== */

/* ---------- 0. CONFIGURAÇÃO ---------- */

// Agendas do calendário. Cada uma tem nome, ID e cor própria.
// Para adicionar outra, inclua uma linha. Para tirar, apague a linha.
//   nome : aparece nos botões coloridos acima do calendário
//   id   : ID da agenda (o mesmo que aparece no link do Google Agenda)
//   cor  : cor dos eventos dessa agenda (hexadecimal)
var AGENDAS = [
  { nome: 'EducaTV - Campinas',      id: 'educatv@educa.campinas.sp.gov.br',                                                     cor: '#009688' },
  { nome: 'Caiu na rede',            id: 'c_b1aa0562e71052b51f68b455e535c17e009200826cbaa1f8fff14104ddb71737@group.calendar.google.com', cor: '#4285F4' },
  { nome: 'E.V.E.N.T.O.S.',          id: 'c_b64bcad2d873c948051f2be7d8cf62cf117a878de730bc05a75972da22e894a1@group.calendar.google.com', cor: '#A79B8E' },
  { nome: 'Rio Brasil - Estúdio',    id: 'c_8833282d48e3607c15261804938412815227f6935dfae49f8b337721a8a155f7@group.calendar.google.com', cor: '#EF6C00' },
  { nome: 'Viaturas',                id: 'c_12650e8c58933a7b0eeec08ee83b25fa54df1972b13fd9a66ea725870583f27a@group.calendar.google.com', cor: '#D50000' },
  { nome: 'Feriados no Brasil',      id: 'pt-br.brazilian#holiday@group.v.calendar.google.com',                                  cor: '#0B8043' }
];

// Link do app do Google Agenda (botão "Abrir no Google Agenda"). Deixe '' para não mostrar o botão.
var CALENDARIO_APP = 'https://calendar.google.com/calendar/u/0/r';

// Tempo entre um destaque e outro, em milissegundos (6000 = 6 segundos)
var INTERVALO_MS = 6000;

// Destaques do carrossel. Para adicionar, copie uma linha { ... } e separe por vírgula.
//   tag    : etiqueta pequena no topo (ex.: Programação, Notícia, Aviso)
//   titulo : título grande
//   texto  : frase de apoio
//   link   : endereço do botão (deixe '' para não mostrar botão)
//   rotulo : texto do botão
//   imagem : nome de uma imagem de fundo na pasta do site (deixe '' para usar o fundo azul)
var DESTAQUES = [
  { tag: 'Ao vivo · JEM', titulo: 'Finais e Premiação do JEM: Finais do Handebol', texto: 'Jogos Escolares da Rede Municipal. Assista à transmissão das finais e da premiação.', link: 'https://www.youtube.com/live/x9oLxf8I_A4', rotulo: 'Assistir no YouTube', imagem: '' },
  { tag: 'Consciência Negra', titulo: 'Catálogo de Educação Antirracista', texto: 'Programas da EducaTV como Heróis de Campinas e Identidade Cultural, reunidos por tema, com link direto para cada episódio.', link: 'https://educa.campinas.sp.gov.br/sites/educa.campinas.sp.gov.br/files/2026-03/Educa%C3%A7%C3%A3o%20Antirracista%20Cat%C3%A1logo%20de%20Produ%C3%A7%C3%B5es%201%C2%BA%20Semestre%20-2024%20v2.pdf', rotulo: 'Abrir catálogo', imagem: '' },
  { tag: 'Catálogo', titulo: 'Catálogo de Produções EducaTV 2022–2025', texto: 'Todos os programas exibidos no canal 12.2, disponíveis no Educaflix e no YouTube, organizados por tema e programa.', link: 'https://educa.campinas.sp.gov.br/sites/educa.campinas.sp.gov.br/files/2025-07/Catalogo_EducaTV_2022_2025.pdf', rotulo: 'Ver catálogo', imagem: '' },
  { tag: 'Acessibilidade', titulo: 'Minuto Libras', texto: 'Programa da EducaTV com conteúdo em Libras. Veja a playlist completa no YouTube.', link: 'https://youtube.com/playlist?list=PLqxxv80407DYOrZGPB_NButcteS70svtM', rotulo: 'Ver playlist', imagem: '' },
  { tag: 'Educaflix', titulo: 'Assista quando quiser', texto: 'A programação da EducaTV (canal 12.2) também está no streaming Educaflix.', link: 'https://educaflix.showcase.com.br/', rotulo: 'Acessar Educaflix', imagem: '' }
];

/* ---------- 1. Copiar texto ---------- */
// Devolve uma Promise que resolve com true (copiou) ou false (não conseguiu)
function copiarTexto(texto) {
  // plano B para navegadores/arquivos que bloqueiam a área de transferência
  function antigo() {
    var t = document.createElement('textarea');
    t.value = texto; t.setAttribute('readonly', '');
    t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(t);
    return ok;
  }
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(texto).then(function () { return true; },
                                                     function () { return antigo(); });
  }
  return Promise.resolve(antigo());
}

/* ---------- 2. Menu e telas ---------- */
var TELAS = ['inicio', 'materiais', 'producao', 'sistemas', 'processos'];
var views = document.querySelectorAll('.view');
var navLinks = document.querySelectorAll('#menu a');
var filtro = document.getElementById('lk-filtro');

function telaAtual() {
  var h = (location.hash || '').replace('#', '');
  return TELAS.indexOf(h) > -1 ? h : 'inicio';
}

function mostrarTela() {
  var t = telaAtual();
  Array.prototype.forEach.call(views, function (v) { v.classList.toggle('on', v.dataset.view === t); });
  Array.prototype.forEach.call(navLinks, function (a) {
    if (a.getAttribute('href') === '#' + t) {
      a.setAttribute('aria-current', 'page');
      // no celular, rola o menu até o item ativo ficar à vista
      var nav = a.parentNode;
      nav.scrollLeft = a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2;
    } else a.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', function () { limparBusca(); mostrarTela(); });
mostrarTela();

/* ---------- 3. Busca de links ---------- */
var itens = document.querySelectorAll('.lk-list li');
var viewsLinks = document.querySelectorAll('.lk-view');
var vazio = document.getElementById('lk-vazio');
var resultado = document.getElementById('lk-resultado');

// tira acentos e maiúsculas para a busca ser tolerante
function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }

function limparBusca() {
  filtro.value = '';
  document.body.classList.remove('buscando');
  Array.prototype.forEach.call(itens, function (li) { li.hidden = false; });
  Array.prototype.forEach.call(viewsLinks, function (v) { v.hidden = false; });
  vazio.classList.remove('show');
  resultado.hidden = true;
}

filtro.addEventListener('input', function () {
  var q = norm(filtro.value.trim());
  if (!q) { limparBusca(); mostrarTela(); return; }
  document.body.classList.add('buscando');
  var total = 0;
  Array.prototype.forEach.call(itens, function (li) {
    li.hidden = norm(li.textContent).indexOf(q) === -1;
  });
  Array.prototype.forEach.call(viewsLinks, function (v) {
    var n = v.querySelectorAll('.lk-list li:not([hidden])').length;
    v.hidden = n === 0; total += n;
  });
  vazio.classList.toggle('show', total === 0);
  resultado.hidden = false;
  resultado.textContent = total === 1 ? '1 link encontrado' : total + ' links encontrados';
});

/* ---------- 4. Carrossel de destaques ---------- */
(function () {
  var track = document.getElementById('car-track');
  var dots = document.getElementById('car-dots');
  var car = track.closest('.car');
  var btnPausa = document.getElementById('car-pause');
  var ICONE_PAUSA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
  var ICONE_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  var atual = 0, timer = null, pausadoPeloUsuario = false;
  var reduzir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var slides = [];

  // monta os slides a partir da lista DESTAQUES
  DESTAQUES.forEach(function (d, i) {
    var s = document.createElement('article');
    s.className = 'slide g' + (i % 3);
    s.setAttribute('role', 'group'); s.setAttribute('aria-roledescription', 'slide');
    s.setAttribute('aria-label', (i + 1) + ' de ' + DESTAQUES.length);
    if (d.imagem) { s.classList.add('tem-img'); s.style.backgroundImage = 'url("' + d.imagem + '")'; }
    if (d.tag) { var tg = document.createElement('span'); tg.className = 'tag'; tg.textContent = d.tag; s.appendChild(tg); }
    var h = document.createElement('h2'); h.textContent = d.titulo; s.appendChild(h);
    if (d.texto) { var p = document.createElement('p'); p.textContent = d.texto; s.appendChild(p); }
    if (d.link) {
      var a = document.createElement('a'); a.className = 'btn'; a.href = d.link; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.textContent = d.rotulo || 'Saiba mais'; s.appendChild(a);
    }
    track.appendChild(s); slides.push(s);

    var b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', 'Ir para o destaque ' + (i + 1));
    b.addEventListener('click', function () { ir(i); reiniciar(); });
    dots.appendChild(b);
  });

  if (slides.length < 2) car.classList.add('unico');

  function ir(i) {
    atual = (i + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + (atual * 100) + '%)';
    slides.forEach(function (s, n) {
      var ativo = n === atual;
      s.setAttribute('aria-hidden', ativo ? 'false' : 'true');
      Array.prototype.forEach.call(s.querySelectorAll('a'), function (a) { a.tabIndex = ativo ? 0 : -1; });
    });
    Array.prototype.forEach.call(dots.children, function (b, n) { b.setAttribute('aria-current', n === atual ? 'true' : 'false'); });
  }

  function parar() { if (timer) { clearInterval(timer); timer = null; } }
  function iniciar() { parar(); if (slides.length > 1 && !pausadoPeloUsuario) timer = setInterval(function () { ir(atual + 1); }, INTERVALO_MS); }
  function reiniciar() { iniciar(); }

  document.getElementById('car-prev').addEventListener('click', function () { ir(atual - 1); reiniciar(); });
  document.getElementById('car-next').addEventListener('click', function () { ir(atual + 1); reiniciar(); });

  function atualizarBotaoPausa() {
    btnPausa.innerHTML = pausadoPeloUsuario ? ICONE_PLAY : ICONE_PAUSA;
    btnPausa.setAttribute('aria-label', pausadoPeloUsuario ? 'Retomar destaques automáticos' : 'Pausar destaques automáticos');
  }
  btnPausa.addEventListener('click', function () { pausadoPeloUsuario = !pausadoPeloUsuario; atualizarBotaoPausa(); iniciar(); });

  // pausa enquanto o mouse ou o foco estiverem no carrossel
  car.addEventListener('mouseenter', parar);
  car.addEventListener('mouseleave', iniciar);
  car.addEventListener('focusin', parar);
  car.addEventListener('focusout', iniciar);
  document.addEventListener('visibilitychange', function () { if (document.hidden) parar(); else iniciar(); });

  // setas do teclado
  car.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { ir(atual + 1); reiniciar(); }
    if (e.key === 'ArrowLeft') { ir(atual - 1); reiniciar(); }
  });

  // arrastar com o dedo no celular
  var x0 = null;
  car.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  car.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 45) { ir(atual + (dx < 0 ? 1 : -1)); reiniciar(); }
  });

  if (reduzir) pausadoPeloUsuario = true;   // quem pede menos movimento não recebe troca automática
  atualizarBotaoPausa(); ir(0); iniciar();
})();

/* ---------- 5. Calendário ---------- */
(function () {
  var box = document.getElementById('agenda');
  var MODOS = [['MONTH', 'Mês'], ['WEEK', 'Semana'], ['AGENDA', 'Lista']];
  var ativas = AGENDAS.map(function () { return true; });
  var celular = window.matchMedia('(max-width: 720px)');
  var escolheu = false;
  var modo = celular.matches ? 'AGENDA' : 'MONTH';   // no celular começa em lista, mais legível

  var iframe = document.createElement('iframe');
  iframe.title = 'Calendário da EducaTV (Google Agenda)'; iframe.loading = 'lazy';
  var vazia = document.createElement('div'); vazia.className = 'agenda-vazia';
  vazia.innerHTML = '<strong>Nenhuma agenda selecionada</strong><p>Toque em um dos botões coloridos para mostrar os eventos.</p>';
  vazia.hidden = true;

  function montarUrl() {
    var partes = [];
    AGENDAS.forEach(function (a, i) {
      if (ativas[i]) partes.push('src=' + encodeURIComponent(a.id) + '&color=' + encodeURIComponent(a.cor));
    });
    if (!partes.length) return '';
    return 'https://calendar.google.com/calendar/embed?' + partes.join('&') +
      '&ctz=America%2FSao_Paulo&hl=pt_BR&mode=' + modo +
      '&wkst=1&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0&bgcolor=%23ffffff';
  }

  function atualizar() {
    var url = montarUrl();
    iframe.hidden = !url; vazia.hidden = !!url;
    if (url && iframe.getAttribute('src') !== url) iframe.src = url;
  }

  // barra: modos de visualização + legenda de cores (clicar liga/desliga a agenda)
  var barra = document.createElement('div'); barra.className = 'agenda-bar';

  var grupoModos = document.createElement('div');
  grupoModos.className = 'agenda-modos'; grupoModos.setAttribute('role', 'group'); grupoModos.setAttribute('aria-label', 'Modo de exibição');
  var botoesModo = MODOS.map(function (m) {
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = m[1];
    b.addEventListener('click', function () { modo = m[0]; escolheu = true; marcarModo(); atualizar(); });
    grupoModos.appendChild(b);
    return b;
  });
  function marcarModo() {
    botoesModo.forEach(function (b, i) { b.setAttribute('aria-pressed', MODOS[i][0] === modo ? 'true' : 'false'); });
  }

  var legenda = document.createElement('div');
  legenda.className = 'agenda-legenda'; legenda.setAttribute('role', 'group'); legenda.setAttribute('aria-label', 'Agendas');
  AGENDAS.forEach(function (a, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'ag-chip'; b.style.setProperty('--cor', a.cor);
    b.setAttribute('aria-pressed', 'true');
    b.innerHTML = '<i aria-hidden="true"></i><span></span>';
    b.querySelector('span').textContent = a.nome;
    b.addEventListener('click', function () {
      ativas[i] = !ativas[i];
      b.setAttribute('aria-pressed', ativas[i] ? 'true' : 'false');
      atualizar();
    });
    legenda.appendChild(b);
  });

  barra.appendChild(grupoModos); barra.appendChild(legenda);
  box.parentNode.insertBefore(barra, box);
  box.appendChild(iframe); box.appendChild(vazia);

  // se a pessoa girar o celular ou redimensionar a janela e ainda não escolheu um modo, ajusta sozinho
  function aoMudarTela() { if (!escolheu) { modo = celular.matches ? 'AGENDA' : 'MONTH'; marcarModo(); atualizar(); } }
  if (celular.addEventListener) celular.addEventListener('change', aoMudarTela); else celular.addListener(aoMudarTela);

  if (CALENDARIO_APP) {
    var a = document.createElement('a');
    a.className = 'lk-btn agenda-abrir'; a.href = CALENDARIO_APP;
    a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.textContent = 'Abrir no Google Agenda';
    box.parentNode.appendChild(a);
  }

  marcarModo(); atualizar();
})();

/* ---------- 6. Copiar o endereço de cada link ---------- */
(function () {
  var ICONE_COPIAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6a2 2 0 012-2h9"/></svg>';
  var ICONE_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  // aviso para leitores de tela
  var aviso = document.createElement('div');
  aviso.className = 'sr'; aviso.setAttribute('role', 'status'); aviso.setAttribute('aria-live', 'polite');
  document.body.appendChild(aviso);

  // cria um botão para cada link que já tem endereço (ignora os que ainda são "#")
  Array.prototype.forEach.call(document.querySelectorAll('.lk-list li'), function (li) {
    var a = li.querySelector('a');
    if (!a || a.getAttribute('href') === '#') return;
    var nome = a.querySelector('.lk-name').firstChild.textContent.trim();
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'lk-copy';
    b.title = 'Copiar endereço';
    b.setAttribute('aria-label', 'Copiar endereço de ' + nome);
    b.innerHTML = ICONE_COPIAR;
    b.addEventListener('click', function () {
      copiarTexto(a.href).then(function (ok) {
        b.innerHTML = ok ? ICONE_OK : ICONE_COPIAR;
        b.classList.toggle('ok', ok);
        aviso.textContent = ok ? 'Endereço de ' + nome + ' copiado.' : 'Não foi possível copiar o endereço.';
        setTimeout(function () { b.innerHTML = ICONE_COPIAR; b.classList.remove('ok'); aviso.textContent = ''; }, 1600);
      });
    });
    li.appendChild(b);
  });
})();

/* ---------- 7. Copiar senha do Wi-Fi ---------- */
(function () {
  var status = document.getElementById('wf-status');

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.wf-copy');
    if (!btn) return;
    var original = btn.dataset.rotulo || btn.textContent;
    btn.dataset.rotulo = original;
    copiarTexto(btn.dataset.copy).then(function (ok) {
      btn.textContent = ok ? 'Senha copiada!' : 'Não foi possível copiar';
      btn.classList.toggle('ok', ok);
      status.textContent = ok ? 'Senha copiada para a área de transferência.' : 'Copie a senha manualmente.';
      setTimeout(function () { btn.textContent = original; btn.classList.remove('ok'); status.textContent = ''; }, 2000);
    });
  });
})();