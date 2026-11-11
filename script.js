/* ==========================================================
   EDUCATV CAMPINAS - SCRIPT
   Índice:
   0. CONFIGURAÇÃO (é aqui que você liga a planilha e o calendário)
   1. Copiar texto
   2. Menu e telas
   3. Busca de links
   4. Novidades: leitura da planilha na nuvem
   5. Carrossel de destaques
   6. Histórico de novidades
   7. Calendário
   8. Botão "copiar endereço" de cada link
   9. Botões "Copiar senha" (Wi-Fi)
   ========================================================== */

/* ---------- 0. CONFIGURAÇÃO ---------- */

// PLANILHA DE NOVIDADES (o "banco de dados" na nuvem)
// Cole aqui o endereço do "App da Web" gerado pelo criar-banco-educatv.gs
// (termina em /exec). Também funciona com o link CSV de uma planilha publicada na web.
// Colunas da planilha: data, categoria, titulo, texto, detalhe, link, rotulo, imagem, carrossel
// Enquanto estiver vazio, o site mostra os exemplos de EXEMPLOS lá embaixo.
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

// Novidades de novembro/2026 usadas enquanto a planilha não estiver ligada (ou está fora do ar e não há cópia salva).
// Têm as mesmas colunas da planilha: data, categoria, titulo, texto, detalhe, link, rotulo, imagem, carrossel
var EXEMPLOS = [
  { data: '2026-11-11', categoria: 'EducaTV', titulo: 'Notícias da Secretaria de Educação', texto: 'Acompanhe no portal oficial as novidades, comunicados e ações da Secretaria Municipal de Educação de Campinas.', detalhe: 'Portal Educa Campinas', link: 'https://educa.campinas.sp.gov.br/noticias', rotulo: 'Ver notícias', imagem: '', carrossel: 'sim' },
  { data: '2026-11-10', categoria: 'Educação', titulo: 'Enem registra aumento na participação de alunos da rede pública', texto: 'Cerca de 65% dos concluintes da rede pública compareceram ao exame no domingo, segundo o balanço do Ministério da Educação.', detalhe: 'Enem 2026 · balanço da primeira aplicação', link: 'https://diariodocomercio.com.br/variedades/enem-aumento-alunos-rede-publica/', rotulo: 'Ler matéria', imagem: '', carrossel: 'sim' },
  { data: '2026-11-09', categoria: 'Prefeitura', titulo: 'EGDS abre inscrições para curso sobre uso excessivo de tecnologia, jogos e apostas', texto: 'A EGDS, da Prefeitura de Campinas, abriu inscrições para curso sobre o uso excessivo de tecnologia, jogos e apostas.', detalhe: 'Nota da Prefeitura de Campinas · 09/11', link: 'https://www.campinas.sp.gov.br/noticias', rotulo: 'Ver nota', imagem: '', carrossel: 'sim' },
  { data: '2026-11-09', categoria: 'Educação', titulo: 'Educação de Campinas formaliza política para as relações étnico-raciais', texto: 'A Secretaria Municipal de Educação criou a Política de Educação para as Relações Étnico-Raciais, na perspectiva antirracista, com diretrizes, princípios e indicadores para articular e avaliar as ações educativas.', detalhe: 'Portaria publicada no Diário Oficial de 5 de novembro', link: 'https://diariocampineiro.com.br/campinas-formaliza-politica-de-educacao-para-as-relacoes-etnico-raciais/', rotulo: 'Ler matéria', imagem: '', carrossel: 'sim' },
  { data: '2026-11-06', categoria: 'Educação', titulo: 'Campinas recebe evento global sobre inteligência artificial e o futuro da educação', texto: 'O encontro reuniu gestores de escolas e secretários de educação da região para discutir o uso seguro da inteligência artificial no ambiente escolar.', detalhe: 'Hotel Royal Palm Plaza · 9 de novembro', link: 'https://horacampinas.com.br/campinas-recebe-evento-global-sobre-inteligencia-artificial-e-o-futuro-da-educacao/', rotulo: 'Ler matéria', imagem: '', carrossel: 'sim' }
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

/* ---------- 3. Busca de links ---------- */
var itens = document.querySelectorAll('.lk-list li');
var viewsLinks = document.querySelectorAll('.lk-view');
var vazio = document.getElementById('lk-vazio');
var resultado = document.getElementById('lk-resultado');

// tira acentos e maiúsculas para a busca ser tolerante
function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }

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

function dadosExemplo() { return EXEMPLOS.map(normalizar); }

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

      if (d.categoria || d.data) {
        var meta = el('div', 'slide-meta');
        if (d.categoria) meta.appendChild(el('span', 'tag cat-' + slug(d.categoria), d.categoria));
        if (d.data) meta.appendChild(el('span', 'data', dataLonga(d.data)));
        if (ehNovo(d)) meta.appendChild(el('span', 'novo', 'Novo'));
        s.appendChild(meta);
      }
      s.appendChild(el('h2', '', d.titulo));
      if (d.texto) s.appendChild(el('p', '', d.texto));
      if (d.detalhe) s.appendChild(el('div', 'slide-det', d.detalhe));
      if (d.link) {
        var a = el('a', 'btn', d.rotulo);
        a.href = d.link; a.target = '_blank'; a.rel = 'noopener noreferrer';
        s.appendChild(a);
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
    if (d.imagem) {
      var im = document.createElement('img');
      im.src = d.imagem; im.alt = ''; im.loading = 'lazy';
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