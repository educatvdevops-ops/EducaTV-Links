/* ==========================================================
   EDUCATV CAMPINAS - SCRIPT
   Índice:
   0. CONFIGURAÇÃO (é aqui que você liga a planilha e o calendário)
   1. Copiar texto
   2. Menu e telas
   2b. Links extras (entram no fim da lista de cada tela)
   3. Busca de links
   4. Novidades: leitura da planilha na nuvem
   5. Carrossel de destaques
   6. Histórico de novidades
   7. Calendário
   8. Botão "copiar endereço" de cada link
   9. Botões "Copiar senha" (Wi-Fi)
   10. Natal: neve, luzinhas, fundo decorativo e música
   ========================================================== */

/* ---------- 0. CONFIGURAÇÃO ---------- */

// PLANILHA DE NOVIDADES (o "banco de dados" na nuvem)
// Cole aqui o endereço do "App da Web" gerado pelo criar-banco-educatv.gs
// (termina em /exec). Também funciona com o link CSV de uma planilha publicada na web.
// Colunas da planilha: data, categoria, titulo, texto, detalhe, link, rotulo, imagem, carrossel
// Enquanto estiver vazio, o site mostra as novidades da lista EXEMPLOS lá embaixo.
var PLANILHA_CSV = '';

// Quantas novidades (as mais recentes) aparecem no carrossel
var MAX_CARROSSEL = 6;

// Tempo entre um destaque e outro, em milissegundos (7000 = 7 segundos)
var INTERVALO_MS = 7000;

// Calendários que aparecem juntos no quadro da agenda.
//   id  : o endereço do calendário (Google Agenda > Configurações > "Integrar agenda" > "ID da agenda")
//   cor : a cor dos eventos desse calendário
var CALENDARIOS = [
  { id: 'c_b1aa0562e71052b51f68b455e535c17e009200826cbaa1f8fff14104ddb71737@group.calendar.google.com', cor: '#039BE5' },
  { id: 'c_b64bcad2d873c948051f2be7d8cf62cf117a878de730bc05a75972da22e894a1@group.calendar.google.com', cor: '#8E24AA' },
  { id: 'educatv@educa.campinas.sp.gov.br', cor: '#F4511E' },
  { id: 'c_8833282d48e3607c15261804938412815227f6935dfae49f8b337721a8a155f7@group.calendar.google.com', cor: '#33B679' },
  { id: 'c_12650e8c58933a7b0eeec08ee83b25fa54df1972b13fd9a66ea725870583f27a@group.calendar.google.com', cor: '#E67C73' },
  { id: 'pt-br.brazilian#holiday@group.v.calendar.google.com', cor: '#0B8043' }   // feriados do Brasil
];

// Como o calendário abre: 'MONTH' (mês), 'WEEK' (semana) ou 'AGENDA' (lista de próximos eventos)
var CALENDARIO_MODO = 'MONTH';

// Natal: neve, luzinhas, fundo azul-noite com luzes vermelhas, árvore, coruja e música suave (sem botões).
// Liga/desliga em NATAL.
var NATAL = true;
var NATAL_ATE = '2027-01-06';            // depois dessa data o clima de Natal some sozinho (AAAA-MM-DD)
var CORUJA_NATAL = 'coruja-natal.png';   // imagem da coruja que aparece esmaecida no fundo (deixe na pasta do site). Vazio = sem coruja
var MUSICA_ARQUIVO = '';                 // opcional: nome de um .mp3 na pasta do site. Vazio = melodia gerada pelo navegador (não precisa de arquivo)
var MUSICA = true;                       // true = a música suave de Natal toca no primeiro clique/toque em qualquer lugar do site
var MUSICA_VOLUME = .12;                 // volume da música (0 a 1). Quanto menor, mais suave

// Novidades usadas enquanto a planilha não estiver ligada (ou estiver fora do ar e não houver cópia salva).
// Mesmas colunas da planilha: data, categoria, titulo, texto, detalhe, link, rotulo, imagem, carrossel
// Campo extra "arte": imagem que ocupa o slide inteiro (sem texto). Clique abre a imagem grande.
// Campo extra "poster": nome de uma imagem que aparece inteira ao lado do texto (ex.: cartazes e calendários).
var EXEMPLOS = [
  { data: '2026-11-17', categoria: 'EducaTV', titulo: 'Feliz Natal! Boas Festas 2026', texto: '', detalhe: '', link: 'natal-2026.jpg', rotulo: 'Ver imagem', imagem: '', arte: 'natal-2026.jpg', carrossel: 'sim' },
  { data: '2026-11-17', categoria: 'EducaTV', titulo: 'Calendário Geral: formações e reuniões da equipe', texto: '', detalhe: '', link: 'calendario-geral.jpg', rotulo: 'Ver calendário completo', imagem: '', poster: 'calendario-geral.jpg', carrossel: 'sim' },
  { data: '2026-11-16', categoria: 'EducaTV', titulo: 'Aniversário da EducaTV', texto: 'Confira os materiais e a identidade visual da EducaTV Campinas.', detalhe: '', link: 'https://educatvdevops-ops.github.io/EducaTV-Links/#materiais', rotulo: 'Saiba mais', imagem: '', carrossel: 'sim' },
  { data: '', categoria: 'Prefeitura', titulo: 'Projeto audiovisual da EducaTV resgata memória do antigo Ateneu e debate educação patrimonial em Campinas', texto: 'Matéria da Prefeitura de Campinas sobre o projeto audiovisual da EducaTV.', detalhe: 'Portal da Prefeitura de Campinas', link: 'https://campinas.sp.gov.br/noticias/153511', rotulo: 'Ler matéria', imagem: '', carrossel: 'sim' },
  { data: '', categoria: 'Educação', titulo: 'Práticas Restaurativas e Cultura de Paz: evento especial da SME Campinas', texto: 'Assista à transmissão do evento especial no canal da SME Campinas.', detalhe: 'YouTube · SME Campinas', link: 'https://www.youtube.com/live/IsbnOa2nDaY', rotulo: 'Assistir no YouTube', imagem: '', carrossel: 'sim' }
];

/* ---------- 1. Copiar texto ---------- */
// Devolve uma Promise que resolve com true (copiou) ou false (não conseguiu)
function copiarTexto(texto) {
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
var TELAS = ['inicio', 'materiais', 'producao', 'sistemas', 'processos', 'historico'];
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
      var nav = a.parentNode;   // no celular, rola o menu até o item ativo ficar à vista
      nav.scrollLeft = a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2;
    } else a.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', function () { limparBusca(); mostrarTela(); });
mostrarTela();

/* ---------- 2b. Links extras (entram no fim da lista de cada tela) ---------- */
// Para adicionar outro link no futuro, copie uma linha.  tela: materiais | producao | sistemas | processos
var LINKS_EXTRA = [
  { tela: 'materiais', tipo: 'PDF', nome: 'Catálogo de Produções: Eixo Equidade 2026', texto: 'Temas do eixo Equidade nas produções da EducaTV Campinas.', link: 'https://drive.google.com/file/d/14ZbMjOw6B-t-ONy_PAGfDvCHbtJEZ6x7/view' },
  { tela: 'materiais', tipo: 'PDF', nome: 'Catálogo EducaTV 2022–2025', texto: 'Catálogo com as produções da EducaTV de 2022 a 2025.', link: 'https://drive.google.com/file/d/1Cz7agcU-zxtIIULdTEW-SSJmvCNwM-wm/view' },
  { tela: 'materiais', tipo: 'Vídeo', nome: 'Vinheta EducaTV', texto: 'Abre a pasta Materiais de Edição, onde ficam as vinhetas.', link: 'https://drive.google.com/drive/folders/1NdvghebEC-JgZP_0xF7T-H1a_ByuJe2F' }
];
LINKS_EXTRA.forEach(function (x) {
  var ul = document.querySelector('#v-' + x.tela + ' .lk-list');
  if (!ul) return;
  var li = document.createElement('li'), a = document.createElement('a');
  a.href = x.link; a.target = '_blank'; a.rel = 'noopener noreferrer';
  a.innerHTML = '<span class="lk-side"><span class="lk-tag"></span><span class="lk-name"></span></span><span class="lk-text"></span>';
  a.querySelector('.lk-tag').textContent = x.tipo;
  a.querySelector('.lk-name').textContent = x.nome;
  a.querySelector('.lk-text').textContent = x.texto || '';
  li.appendChild(a); ul.appendChild(li);
});

/* ---------- 3. Busca de links ---------- */
var itens = document.querySelectorAll('.lk-list li');
var viewsLinks = document.querySelectorAll('.lk-view');
var vazio = document.getElementById('lk-vazio');
var resultado = document.getElementById('lk-resultado');

// tira acentos e maiúsculas para a busca ser tolerante
function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

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

/* ---------- 4. Novidades: leitura da planilha na nuvem ---------- */
var CACHE_CHAVE = 'educatv_novidades_csv';

// pequeno criador de elementos: el('div', 'classe', 'texto')
function el(tag, cls, txt) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt) e.textContent = txt;
  return e;
}

// transforma o texto CSV em uma lista de linhas (aceita aspas e vírgulas dentro do texto)
function lerCSV(t) {
  var linhas = [], lin = [], c = '', aspas = false, i, ch;
  for (i = 0; i < t.length; i++) {
    ch = t[i];
    if (aspas) {
      if (ch === '"') { if (t[i + 1] === '"') { c += '"'; i++; } else aspas = false; }
      else c += ch;
    } else if (ch === '"') aspas = true;
    else if (ch === ',') { lin.push(c); c = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && t[i + 1] === '\n') i++;
      lin.push(c); c = ''; linhas.push(lin); lin = [];
    } else c += ch;
  }
  if (c || lin.length) { lin.push(c); linhas.push(lin); }
  return linhas;
}

// aceita 10/11/2026 ou 2026-11-10
function lerData(s) {
  s = String(s || '').trim();
  var m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  return null;
}

// links de imagem do Google Drive viram endereço que funciona dentro de uma <img>/background
function urlImagem(u) {
  u = String(u || '').trim();
  if (!u) return '';
  if (/drive\.google\.com|docs\.google\.com/.test(u)) {
    var m = u.match(/\/d\/([\w-]{20,})/) || u.match(/[?&]id=([\w-]{20,})/);
    if (m) return 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w1600';
  }
  return u;
}

function normalizar(o) {
  var d = lerData(o.data);
  return {
    data: d,
    categoria: (o.categoria || '').trim(),
    titulo: (o.titulo || '').trim(),
    texto: (o.texto || '').trim(),
    detalhe: (o.detalhe || '').trim(),
    link: (o.link || '').trim(),
    rotulo: (o.rotulo || '').trim() || 'Saiba mais',
    imagem: urlImagem(o.imagem),
    poster: urlImagem(o.poster),
    arte: urlImagem(o.arte),
    carrossel: norm((o.carrossel || 'sim').trim()) !== 'nao'
  };
}

function paraItens(linhas) {
  if (!linhas.length) return [];
  var cab = linhas[0].map(function (h) { return norm(h.trim()); });
  var lista = [];
  linhas.slice(1).forEach(function (l) {
    var o = {};
    cab.forEach(function (k, i) { o[k] = l[i] || ''; });
    if (!String(o.titulo || '').trim()) return;   // ignora linhas vazias
    lista.push(normalizar(o));
  });
  // mais recentes primeiro; sem data vão para o fim
  lista.sort(function (a, b) { return (b.data ? b.data.getTime() : 0) - (a.data ? a.data.getTime() : 0); });
  return lista;
}

function dadosExemplo() {
  var l = EXEMPLOS.map(normalizar);
  l.sort(function (a, b) { return (b.data ? b.data.getTime() : 0) - (a.data ? a.data.getTime() : 0); });
  return l;
}

// Busca a planilha. Se falhar, usa a última cópia salva no navegador; se não houver, os exemplos.
function carregarNovidades() {
  if (!PLANILHA_CSV) return Promise.resolve(dadosExemplo());
  return fetch(PLANILHA_CSV)
    .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.text(); })
    .then(function (t) {
      var l = paraItens(lerCSV(t));
      try { localStorage.setItem(CACHE_CHAVE, t); } catch (e) {}
      return l;
    })
    .catch(function () {
      var t = null;
      try { t = localStorage.getItem(CACHE_CHAVE); } catch (e) {}
      var l = t ? paraItens(lerCSV(t)) : [];
      return l.length ? l : dadosExemplo();
    });
}

// "Novo" aparece nas novidades dos últimos 7 dias
function ehNovo(d) { return d.data && (Date.now() - d.data.getTime()) < 8 * 86400000 && d.data.getTime() <= Date.now() + 86400000; }
function slug(s) { return norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function dataLonga(d) { return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }); }
function dataCurta(d) { return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }); }

/* ---------- 5. Carrossel de destaques ---------- */
var Carrossel = (function () {
  var track = document.getElementById('car-track');
  var dots = document.getElementById('car-dots');
  var car = track.closest('.car');
  var btnPausa = document.getElementById('car-pause');
  var ICONE_PAUSA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
  var ICONE_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  var atual = 0, timer = null, pausadoPeloUsuario = false, slides = [];
  var reduzir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // monta (ou remonta) os slides a partir da lista de novidades
  function montar(lista) {
    parar();
    track.innerHTML = ''; dots.innerHTML = ''; slides = []; atual = 0;
    if (!lista.length) lista = [normalizar({ titulo: 'Sem novidades por enquanto', texto: 'Volte em breve: as atualizações da semana aparecem aqui.' })];
    car.classList.toggle('unico', lista.length < 2);

    lista.forEach(function (d, i) {
      var s = el('article', 'slide g' + (i % 3));
      s.setAttribute('role', 'group'); s.setAttribute('aria-roledescription', 'slide');
      s.setAttribute('aria-label', (i + 1) + ' de ' + lista.length);
      if (d.imagem) { s.classList.add('tem-img'); s.style.backgroundImage = 'url("' + d.imagem.replace(/"/g, '%22') + '")'; }
      var alvo = s, im = null;
      if (d.arte) {
        s.classList.add('com-arte');
        var fundo = el('img', 'arte-bg'); fundo.src = d.arte; fundo.alt = ''; fundo.setAttribute('aria-hidden', 'true');
        var arte = el('img', 'arte-img'); arte.src = d.arte; arte.alt = d.titulo; arte.decoding = 'async';
        s.appendChild(fundo); s.appendChild(arte);
        if (d.link) {
          var al = el('a', 'arte-link'); al.href = d.link; al.target = '_blank'; al.rel = 'noopener noreferrer';
          al.setAttribute('aria-label', 'Abrir imagem em tela cheia: ' + d.titulo); s.appendChild(al);
        }
      } else {
      if (d.poster) { s.classList.add('com-poster'); alvo = el('div', 'slide-txt'); im = el('img', 'slide-poster'); im.src = d.poster; im.alt = 'Imagem do destaque: ' + d.titulo; im.decoding = 'async'; im.addEventListener('error', function () { im.remove(); s.classList.remove('com-poster'); }); }

      if (d.categoria || d.data) {
        var meta = el('div', 'slide-meta');
        if (d.categoria) meta.appendChild(el('span', 'tag cat-' + slug(d.categoria), d.categoria));
        if (d.data) meta.appendChild(el('span', 'data', dataLonga(d.data)));
        if (ehNovo(d)) meta.appendChild(el('span', 'novo', 'Novo'));
        alvo.appendChild(meta);
      }
      alvo.appendChild(el('h2', '', d.titulo));
      if (d.texto) alvo.appendChild(el('p', '', d.texto));
      if (d.detalhe) alvo.appendChild(el('div', 'slide-det', d.detalhe));
      if (d.link) {
        var a = el('a', 'btn', d.rotulo);
        a.href = d.link; a.target = '_blank'; a.rel = 'noopener noreferrer';
        alvo.appendChild(a);
      }
      if (im) { s.appendChild(alvo); s.appendChild(im); }
      }
      track.appendChild(s); slides.push(s);

      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', 'Ir para o destaque ' + (i + 1));
      b.addEventListener('click', function () { ir(i); iniciar(); });
      dots.appendChild(b);
    });
    ir(0); iniciar();
  }

  function ir(i) {
    if (!slides.length) return;
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

  document.getElementById('car-prev').addEventListener('click', function () { ir(atual - 1); iniciar(); });
  document.getElementById('car-next').addEventListener('click', function () { ir(atual + 1); iniciar(); });

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

  car.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { ir(atual + 1); iniciar(); }
    if (e.key === 'ArrowLeft') { ir(atual - 1); iniciar(); }
  });

  // arrastar com o dedo no celular
  var x0 = null;
  car.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  car.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 45) { ir(atual + (dx < 0 ? 1 : -1)); iniciar(); }
  });

  if (reduzir) pausadoPeloUsuario = true;   // quem pede menos movimento não recebe troca automática
  atualizarBotaoPausa();
  return { montar: montar };
})();

/* ---------- 6. Histórico de novidades ---------- */
var Historico = (function () {
  var lista = document.getElementById('h-lista');
  var busca = document.getElementById('h-busca');
  var mes = document.getElementById('h-mes');
  var cont = document.getElementById('h-cont');
  var todos = [];

  function chaveMes(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2); }
  function rotuloMes(d) { var t = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }); return t.charAt(0).toUpperCase() + t.slice(1); }

  function cartao(d) {
    var c = el(d.link ? 'a' : 'div', 'h-card');
    if (d.link) { c.href = d.link; c.target = '_blank'; c.rel = 'noopener noreferrer'; }
    var img = el('div', 'h-img');
    var fonte = d.imagem || d.poster || d.arte;
    if (fonte) {
      var im = document.createElement('img');
      im.src = fonte; im.alt = ''; im.loading = 'lazy';
      im.addEventListener('error', function () { im.remove(); });
      img.appendChild(im);
    }
    c.appendChild(img);
    var corpo = el('div', 'h-body');
    var meta = el('div', 'h-meta');
    if (d.categoria) meta.appendChild(el('span', 'h-tag cat-' + slug(d.categoria), d.categoria));
    if (d.data) meta.appendChild(el('span', '', dataCurta(d.data)));
    corpo.appendChild(meta);
    corpo.appendChild(el('h3', '', d.titulo));
    if (d.texto) corpo.appendChild(el('p', '', d.texto));
    if (d.detalhe) corpo.appendChild(el('p', 'h-det', d.detalhe));
    if (d.link) corpo.appendChild(el('span', 'h-go', d.rotulo + ' →'));
    c.appendChild(corpo);
    return c;
  }

  function desenhar() {
    var q = norm(busca.value.trim()), m = mes.value;
    var vis = todos.filter(function (d) {
      if (m && (!d.data || chaveMes(d.data) !== m)) return false;
      if (!q) return true;
      var palheiro = [d.titulo, d.texto, d.detalhe, d.categoria, d.data ? dataLonga(d.data) + ' ' + dataCurta(d.data) : ''].join(' ');
      return norm(palheiro).indexOf(q) > -1;
    });
    lista.innerHTML = '';
    vis.forEach(function (d) { lista.appendChild(cartao(d)); });
    cont.textContent = vis.length === 0 ? 'Nenhuma novidade encontrada.' : vis.length === 1 ? '1 novidade' : vis.length + ' novidades';
  }

  function montar(itens) {
    todos = itens;
    var vistos = {};
    mes.innerHTML = '<option value="">Todos os meses</option>';
    itens.forEach(function (d) {
      if (!d.data) return;
      var k = chaveMes(d.data);
      if (vistos[k]) return;
      vistos[k] = true;
      var o = el('option', '', rotuloMes(d.data)); o.value = k; mes.appendChild(o);
    });
    desenhar();
  }

  busca.addEventListener('input', desenhar);
  mes.addEventListener('change', desenhar);
  cont.textContent = 'Carregando novidades…';
  return { montar: montar };
})();

// mostra algo já, depois troca pelos dados da planilha
Carrossel.montar([normalizar({ titulo: 'Carregando novidades…' })]);
carregarNovidades().then(function (todas) {
  Carrossel.montar(todas.filter(function (d) { return d.carrossel; }).slice(0, MAX_CARROSSEL));
  Historico.montar(todas);
});

/* ---------- 7. Calendário ---------- */
(function () {
  var box = document.getElementById('agenda');
  if (CALENDARIOS.length) {
    var partes = ['height=700', 'wkst=1', 'hl=pt_BR', 'ctz=America%2FSao_Paulo', 'showTitle=0', 'showPrint=0',
                  'showTz=0', 'showTabs=1', 'showCalendars=1', 'mode=' + CALENDARIO_MODO];
    CALENDARIOS.forEach(function (c) {
      partes.push('src=' + encodeURIComponent(c.id));
      if (c.cor) partes.push('color=' + encodeURIComponent(c.cor));
    });
    var f = document.createElement('iframe');
    f.src = 'https://calendar.google.com/calendar/embed?' + partes.join('&');
    f.title = 'Calendário da EducaTV (Google Agenda)'; f.loading = 'lazy';
    box.appendChild(f);
    return;
  }
  var v = el('div', 'agenda-vazia');
  v.appendChild(el('strong', '', 'Calendário ainda não conectado'));
  var p = document.createElement('p');
  p.innerHTML = 'Adicione os calendários em <code>CALENDARIOS</code>, no começo do <code>script.js</code>.';
  v.appendChild(p); box.appendChild(v);
})();

/* ---------- 8. Copiar o endereço de cada link ---------- */
(function () {
  var ICONE_COPIAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6a2 2 0 012-2h9"/></svg>';
  var ICONE_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  var aviso = el('div', 'sr');
  aviso.setAttribute('role', 'status'); aviso.setAttribute('aria-live', 'polite');
  document.body.appendChild(aviso);

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

/* ---------- 9. Copiar senha do Wi-Fi ---------- */
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

/* ---------- 10. Natal: neve, luzinhas, fundo decorativo e música ---------- */
(function () {
  if (!NATAL || (NATAL_ATE && new Date() > new Date(NATAL_ATE + 'T23:59:59'))) return;
  var html = document.documentElement, body = document.body;
  var reduzir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ligado = true;

  /* --- fundo decorativo: luzes vermelhas, bokeh, brilhos, árvore e coruja (tudo ATRÁS do conteúdo, sem cliques) --- */
  var fundo = document.createElement('div'); fundo.className = 'natal-fundo'; fundo.setAttribute('aria-hidden', 'true');

  ['g1', 'g2', 'g3', 'g4'].forEach(function (g) { fundo.appendChild(el('span', 'nf-glow ' + g)); });

  // luzes desfocadas (bokeh) que sobem devagar: vermelho, dourado e um pouco de azul
  var COR_BOKEH = ['rgba(255,60,70,.9)', 'rgba(255,200,90,.85)', 'rgba(255,90,90,.85)', 'rgba(255,255,255,.7)', 'rgba(230,30,60,.9)', 'rgba(110,180,255,.6)'];
  var QTD_BOKEH = window.innerWidth < 640 ? 9 : 18;
  for (var q = 0; q < QTD_BOKEH; q++) {
    var bk = el('span', 'nf-bokeh'), t = 38 + Math.random() * 110;
    bk.style.left = (Math.random() * 100) + '%';
    bk.style.width = bk.style.height = t + 'px';
    bk.style.setProperty('--c', COR_BOKEH[q % COR_BOKEH.length]);
    bk.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
    bk.style.animationDuration = (22 + Math.random() * 26) + 's';
    bk.style.animationDelay = (-Math.random() * 40) + 's';   // atraso negativo: já começam espalhados pela tela
    fundo.appendChild(bk);
  }

  // pontinhos que piscam (vermelho, dourado, azul, branco)
  var COR_BRILHO = ['#ff4d4d', '#ffd54a', '#ff6b6b', '#cfe6ff', '#ffffff', '#ff3b3b'];
  var QTD_BRILHOS = window.innerWidth < 640 ? 16 : 30;
  for (var k = 0; k < QTD_BRILHOS; k++) {
    var br = el('span', 'nf-brilho'), tam = 3 + Math.random() * 4;
    br.style.left = (Math.random() * 100) + '%';
    br.style.top = (Math.random() * 100) + '%';
    br.style.width = br.style.height = tam + 'px';
    br.style.setProperty('--c', COR_BRILHO[k % COR_BRILHO.length]);
    br.style.animationDelay = (Math.random() * 3.2) + 's';
    br.style.animationDuration = (2.2 + Math.random() * 2.6) + 's';
    fundo.appendChild(br);
  }

  // árvore de Natal com pisca-pisca, estrela e presentes (SVG desenhado no código: não precisa de arquivo)
  var arvore = el('div', 'nf-arvore');
  arvore.innerHTML =
    '<svg viewBox="0 0 260 340" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">' +
      '<g class="nf-estrela"><path d="M130 10l10 21 23 3-17 16 4 23-20-11-20 11 4-23-17-16 23-3z" fill="#ffd54a"/></g>' +
      '<path d="M130 52L76 134h108z" fill="#2f9e5b"/>' +
      '<path d="M130 96L60 196h140z" fill="#27894e"/>' +
      '<path d="M130 146L42 262h176z" fill="#1f7a43"/>' +
      '<path d="M130 52L104 134h26z M130 96L96 196h34z M130 146L84 262h46z" fill="#fff" opacity=".07"/>' +
      '<rect x="114" y="262" width="32" height="34" rx="4" fill="#8a5a2b"/>' +
      '<path d="M84 124q46 16 92 0M70 182q60 20 120 0M54 248q76 24 152 0" stroke="#ffd54a" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 9"/>' +
      '<circle class="nf-bola" cx="112" cy="112" r="6" fill="#ff4d4d"/>' +
      '<circle class="nf-bola" cx="146" cy="136" r="6" fill="#3fb6ff" style="animation-delay:.6s"/>' +
      '<circle class="nf-bola" cx="96" cy="174" r="7" fill="#ffd54a" style="animation-delay:1.1s"/>' +
      '<circle class="nf-bola" cx="160" cy="184" r="7" fill="#ff4d4d" style="animation-delay:.3s"/>' +
      '<circle class="nf-bola" cx="122" cy="214" r="7" fill="#3fb6ff" style="animation-delay:1.5s"/>' +
      '<circle class="nf-bola" cx="76" cy="240" r="8" fill="#ff4d4d" style="animation-delay:.9s"/>' +
      '<circle class="nf-bola" cx="172" cy="246" r="8" fill="#ffd54a" style="animation-delay:.2s"/>' +
      '<circle class="nf-bola" cx="130" cy="254" r="6" fill="#ff4d4d" style="animation-delay:1.3s"/>' +
      '<circle class="nf-bola" cx="130" cy="84" r="5" fill="#ffd54a" style="animation-delay:.4s"/>' +
      '<rect x="40" y="292" width="52" height="42" rx="4" fill="#d62839"/><rect x="62" y="292" width="8" height="42" fill="#ffd54a"/><rect x="40" y="308" width="52" height="8" fill="#ffd54a"/>' +
      '<rect x="168" y="304" width="46" height="30" rx="4" fill="#1a7cff"/><rect x="188" y="304" width="7" height="30" fill="#fff"/><rect x="168" y="315" width="46" height="7" fill="#fff"/>' +
      '<rect x="98" y="308" width="36" height="26" rx="4" fill="#2fb36b"/><rect x="113" y="308" width="6" height="26" fill="#ffd54a"/>' +
    '</svg>';
  fundo.appendChild(arvore);

  // coruja de Natal (imagem na pasta do site; se não existir, simplesmente não aparece)
  if (CORUJA_NATAL) {
    var coruja = el('img', 'nf-coruja');
    coruja.src = CORUJA_NATAL; coruja.alt = ''; coruja.decoding = 'async';
    coruja.addEventListener('error', function () { coruja.remove(); });
    fundo.appendChild(coruja);
  }
  fundo.appendChild(el('div', 'nf-veu'));   // véu fosco: protege o centro da tela onde ficam os textos
  body.insertBefore(fundo, body.firstChild);

  /* --- neve (canvas por cima da página, sem pegar cliques) --- */
  var cv = document.createElement('canvas'); cv.className = 'neve-canvas'; cv.setAttribute('aria-hidden', 'true');
  body.appendChild(cv);
  var cx = cv.getContext && cv.getContext('2d'), flocos = [], W = 0, H = 0, raf = null;
  function novoFloco(aleat) {
    return { x: Math.random() * W, y: aleat ? Math.random() * H : -8, r: 1 + Math.random() * 2.4, v: .35 + Math.random() * .9,
             a: Math.random() * 6.28, s: .004 + Math.random() * .012, o: .3 + Math.random() * .45 };
  }
  function medir() {
    if (!cx) return;
    var d = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0);
    var n = Math.round(Math.min(W / 16, 70));
    while (flocos.length < n) flocos.push(novoFloco(true));
    flocos.length = n;
  }
  function desenhar(mover) {
    if (!cx) return;
    cx.clearRect(0, 0, W, H);
    for (var i = 0; i < flocos.length; i++) {
      var f = flocos[i];
      if (mover) { f.y += f.v; f.a += f.s; f.x += Math.sin(f.a) * .6; if (f.y > H + 6) { flocos[i] = novoFloco(false); continue; } }
      cx.beginPath(); cx.fillStyle = 'rgba(255,255,255,' + f.o + ')'; cx.arc(f.x, f.y, f.r, 0, 6.283); cx.fill();
    }
  }
  function quadro() { desenhar(true); raf = requestAnimationFrame(quadro); }
  function pararNeve() { if (raf) { cancelAnimationFrame(raf); raf = null; } }
  function iniciarNeve() { pararNeve(); medir(); if (reduzir) desenhar(false); else if (cx && !document.hidden) raf = requestAnimationFrame(quadro); }
  document.addEventListener('visibilitychange', function () { if (ligado) { if (document.hidden) pararNeve(); else iniciarNeve(); } });

  /* --- pisca-pisca no topo da página --- */
  var luzes = document.createElement('div'); luzes.className = 'luzes'; luzes.setAttribute('aria-hidden', 'true');
  var conteudo = document.getElementById('conteudo');
  if (conteudo) conteudo.insertBefore(luzes, conteudo.firstChild);
  var CORES = ['#ff4d4d', '#ffd54a', '#3fb6ff', '#4cd964'];
  function montarLuzes() {
    luzes.innerHTML = '';
    var w = luzes.clientWidth || window.innerWidth, passo = w < 600 ? 30 : 42, n = Math.floor(w / passo);
    for (var i = 0; i < n; i++) {
      var b = document.createElement('i');
      b.style.left = (i * passo + passo / 2) + 'px';
      b.style.top = (3 + 9 * Math.abs(Math.sin(i * Math.PI / 4))) + 'px';
      b.style.setProperty('--c', CORES[i % 4]);
      b.style.animationDelay = ((i % 4) * .45) + 's';
      luzes.appendChild(b);
    }
  }

  /* --- música: melodia gerada no navegador (Jingle Bells e We Wish You a Merry Christmas, domínio público) --- */
  var Musica = (function () {
    var ctx = null, saida = null, timer = null, prox = 0, tocando = false, arq = null;
    var BATIDA = 60 / 100;   // andamento calmo
    var F = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, 'F#4': 369.99 };
    var A1 = 'E4:1 E4:1 E4:2 E4:1 E4:1 E4:2 E4:1 G4:1 C4:1.5 D4:.5 E4:4 ';
    var B1 = 'F4:1 F4:1 F4:1.5 F4:.5 F4:1 E4:1 E4:1 E4:.5 E4:.5 ';
    var TEXTO = A1 + B1 + 'E4:1 D4:1 D4:1 E4:1 D4:2 G4:2 ' + A1 + B1 + 'G4:1 G4:1 F4:1 D4:1 C4:4 R:2 ' +
      'D4:1 G4:1 G4:.5 A4:.5 G4:.5 F#4:.5 E4:1 E4:1 E4:1 A4:1 A4:.5 B4:.5 A4:.5 G4:.5 F#4:1 D4:1 D4:1 ' +
      'B4:1 B4:.5 C5:.5 B4:.5 A4:.5 G4:1 E4:1 D4:.5 D4:.5 E4:1 A4:1 F#4:1 G4:3 R:6';
    var SEQ = [], TOTAL = 0;
    TEXTO.trim().split(/\s+/).forEach(function (p) {
      var q = p.split(':'), d = parseFloat(q[1]);
      if (q[0] !== 'R') SEQ.push({ f: F[q[0]], t: TOTAL, d: d });
      TOTAL += d;
    });
    function nota(f, t, d) {
      var dur = Math.max(d, .6) * 2.2, g = ctx.createGain();
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(.5, t + .01);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      g.connect(saida);
      [[1, 1], [2, .28], [3, .1], [5.4, .04]].forEach(function (p) {
        var o = ctx.createOscillator(), gg = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f * p[0]; gg.gain.value = p[1];
        o.connect(gg); gg.connect(g); o.start(t); o.stop(t + dur + .1);
      });
    }
    function agendar() {
      SEQ.forEach(function (n) { nota(n.f, prox + n.t * BATIDA, n.d * BATIDA); });
      prox += TOTAL * BATIDA;
    }
    function vigiar() { if (ctx && ctx.currentTime > prox - 3) agendar(); }
    function ligar() {
      if (MUSICA_ARQUIVO) {
        if (!arq) { arq = new Audio(MUSICA_ARQUIVO); arq.loop = true; arq.volume = Math.min(1, MUSICA_VOLUME * 2.5); }
        arq.play(); tocando = true; return true;
      }
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      if (!ctx) {
        ctx = new AC();
        saida = ctx.createGain(); saida.gain.setValueAtTime(.0001, ctx.currentTime); saida.gain.linearRampToValueAtTime(MUSICA_VOLUME, ctx.currentTime + 3);   // entra aos poucos
        var atraso = ctx.createDelay(), fb = ctx.createGain();
        atraso.delayTime.value = .4; fb.gain.value = .38;   // eco suave, som de caixinha de música
        saida.connect(ctx.destination); saida.connect(atraso); atraso.connect(fb); fb.connect(atraso); atraso.connect(ctx.destination);
        prox = ctx.currentTime + .3; agendar();
      }
      ctx.resume();
      if (!timer) timer = setInterval(vigiar, 700);
      tocando = true; return true;
    }
    function pausar() {
      if (arq) arq.pause();
      if (ctx) ctx.suspend();
      if (timer) { clearInterval(timer); timer = null; }
      tocando = false;
    }
    return { ligar: ligar, pausar: pausar, tocando: function () { return tocando; } };
  })();

  /* --- música: começa sozinha no primeiro clique/toque em qualquer lugar do site (os navegadores não deixam tocar antes) --- */
  var musicaIniciada = false;
  if (MUSICA) {
    var EVENTOS = ['pointerdown', 'touchstart', 'keydown'];
    var primeiro = function () {
      if (musicaIniciada) return;
      if (Musica.ligar()) {
        musicaIniciada = true;
        EVENTOS.forEach(function (e) { document.removeEventListener(e, primeiro, true); });
      }
    };
    EVENTOS.forEach(function (e) { document.addEventListener(e, primeiro, true); });
    // pausa quando a aba fica escondida e volta quando a pessoa retorna
    document.addEventListener('visibilitychange', function () {
      if (!musicaIniciada) return;
      if (document.hidden) Musica.pausar(); else Musica.ligar();
    });
  }

  function aplicar() {
    body.classList.add('natal');
    html.setAttribute('data-theme', 'dark');
    iniciarNeve(); montarLuzes();
  }

  var rt = null;
  window.addEventListener('resize', function () {
    if (!ligado) return;
    medir(); if (reduzir) desenhar(false);
    clearTimeout(rt); rt = setTimeout(montarLuzes, 200);
  });
  aplicar();
})();
