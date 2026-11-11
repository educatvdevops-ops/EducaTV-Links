/* ==========================================================
   EDUCATV - CRIA O BANCO DE NOVIDADES AUTOMATICAMENTE
   Cola este código em script.google.com e executa "criarTudo" uma vez.
   Ele cria na sua conta do Google:
     - pasta "EducaTV - Novidades"
     - subpasta "Imagens" (já liberada para o site mostrar as fotos)
     - planilha "Novidades EducaTV" com as colunas e 3 exemplos
   E o doGet() abaixo entrega a planilha para o site (não precisa "Publicar na Web").
   ========================================================== */

var NOME_PASTA = 'EducaTV - Novidades';
var NOME_ABA = 'Novidades';
var CABECALHO = ['data', 'categoria', 'titulo', 'texto', 'detalhe', 'link', 'rotulo', 'imagem', 'carrossel'];

// Novidades da Educação de Campinas (novembro/2026). Colunas: data, categoria, titulo, texto, detalhe, link, rotulo, imagem, carrossel
function linhasNovidades() {
  return [
    [new Date(2026, 10, 11), 'EducaTV', 'Notícias da Secretaria de Educação', 'Acompanhe no portal oficial as novidades, comunicados e ações da Secretaria Municipal de Educação de Campinas.', 'Portal Educa Campinas', 'https://educa.campinas.sp.gov.br/noticias', 'Ver notícias', '', 'sim'],
    [new Date(2026, 10, 10), 'Educação', 'Enem registra aumento na participação de alunos da rede pública', 'Cerca de 65% dos concluintes da rede pública compareceram ao exame no domingo, segundo o balanço do Ministério da Educação.', 'Enem 2026 · balanço da primeira aplicação', 'https://diariodocomercio.com.br/variedades/enem-aumento-alunos-rede-publica/', 'Ler matéria', '', 'sim'],
    [new Date(2026, 10, 9), 'Prefeitura', 'EGDS abre inscrições para curso sobre uso excessivo de tecnologia, jogos e apostas', 'A EGDS, da Prefeitura de Campinas, abriu inscrições para curso sobre o uso excessivo de tecnologia, jogos e apostas.', 'Nota da Prefeitura de Campinas · 09/11', 'https://www.campinas.sp.gov.br/noticias', 'Ver nota', '', 'sim'],
    [new Date(2026, 10, 9), 'Educação', 'Educação de Campinas formaliza política para as relações étnico-raciais', 'A Secretaria Municipal de Educação criou a Política de Educação para as Relações Étnico-Raciais, na perspectiva antirracista, com diretrizes, princípios e indicadores para articular e avaliar as ações educativas.', 'Portaria publicada no Diário Oficial de 5 de novembro', 'https://diariocampineiro.com.br/campinas-formaliza-politica-de-educacao-para-as-relacoes-etnico-raciais/', 'Ler matéria', '', 'sim'],
    [new Date(2026, 10, 6), 'Educação', 'Campinas recebe evento global sobre inteligência artificial e o futuro da educação', 'O encontro reuniu gestores de escolas e secretários de educação da região para discutir o uso seguro da inteligência artificial no ambiente escolar.', 'Hotel Royal Palm Plaza · 9 de novembro', 'https://horacampinas.com.br/campinas-recebe-evento-global-sobre-inteligencia-artificial-e-o-futuro-da-educacao/', 'Ler matéria', '', 'sim']
  ];
}

// ▶ JÁ CRIOU A PLANILHA ANTES? Execute esta função: ela apaga as linhas antigas (exemplos)
//   e coloca as novidades de novembro/2026. Não mexe no cabeçalho nem nas pastas.
function atualizarNovidades() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!id) { Logger.log('Execute criarTudo primeiro.'); return; }
  var sh = SpreadsheetApp.openById(id).getSheetByName(NOME_ABA);
  var linhas = linhasNovidades();
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, CABECALHO.length).clearContent();
  sh.getRange(2, 1, linhas.length, CABECALHO.length).setValues(linhas);
  sh.getRange('A2:A1000').setNumberFormat('dd/MM/yyyy');
  Logger.log('Novidades atualizadas: ' + linhas.length + ' linhas.');
}

// ▶ Execute esta função UMA vez (botão "Executar"). Pode rodar de novo sem medo: não cria duplicado.
function criarTudo() {
  var props = PropertiesService.getScriptProperties();
  var idExistente = props.getProperty('SHEET_ID');
  if (idExistente) {
    Logger.log('Já criado. Planilha: ' + SpreadsheetApp.openById(idExistente).getUrl());
    return;
  }

  // Pastas
  var pasta = DriveApp.createFolder(NOME_PASTA);
  var imagens = pasta.createFolder('Imagens');
  imagens.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  // Planilha
  var ss = SpreadsheetApp.create('Novidades EducaTV');
  ss.setSpreadsheetLocale('pt_BR');
  ss.setSpreadsheetTimeZone('America/Sao_Paulo');
  DriveApp.getFileById(ss.getId()).moveTo(pasta);

  var sh = ss.getSheets()[0];
  sh.setName(NOME_ABA);
  sh.getRange(1, 1, 1, CABECALHO.length).setValues([CABECALHO])
    .setFontWeight('bold').setBackground('#0a3fbd').setFontColor('#ffffff');
  sh.setFrozenRows(1);

  var exemplos = linhasNovidades();
  sh.getRange(2, 1, exemplos.length, CABECALHO.length).setValues(exemplos);

  // Formatação e listas de escolha
  sh.getRange('A2:A1000').setNumberFormat('dd/MM/yyyy');
  sh.getRange('D2:D1000').setWrap(true);
  sh.getRange('B2:B1000').setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(['Podcast', 'Meio ambiente', 'Prefeitura', 'Educação', 'EducaTV'], true)
    .setAllowInvalid(true).build());
  sh.getRange('I2:I1000').setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(['sim', 'nao'], true).build());
  var larguras = [95, 120, 240, 380, 240, 260, 120, 260, 90];
  larguras.forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });

  // Aba de instruções
  var ajuda = ss.insertSheet('Como usar');
  ajuda.getRange('A1:A8').setValues([
    ['COMO USAR'],
    ['1. Cada linha da aba "Novidades" é uma novidade. Para atualizar, adicione uma linha nova.'],
    ['2. O carrossel mostra as mais recentes (por data). Tudo fica guardado na aba Histórico do site.'],
    ['3. Imagem: coloque a foto na pasta "Imagens" (link abaixo), clique com o botão direito > Compartilhar > Copiar link e cole na coluna "imagem".'],
    ['4. carrossel = "nao" tira a novidade do carrossel, mas ela continua no Histórico.'],
    ['5. Link e rotulo (texto do botão) são opcionais. Sem link, o slide não abre nada.'],
    ['Pasta de imagens: ' + imagens.getUrl()],
    ['Pasta geral: ' + pasta.getUrl()]
  ]);
  ajuda.getRange('A1').setFontWeight('bold');
  ajuda.setColumnWidth(1, 760);
  ss.setActiveSheet(sh);

  props.setProperty('SHEET_ID', ss.getId());
  Logger.log('Pronto! Planilha: ' + ss.getUrl());
  Logger.log('Pasta de imagens: ' + imagens.getUrl());
}

// Entrega a planilha ao site em formato CSV (o site lê este endereço)
function doGet() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!id) return ContentService.createTextOutput('Execute criarTudo primeiro.');
  var valores = SpreadsheetApp.openById(id).getSheetByName(NOME_ABA).getDataRange().getDisplayValues();
  var csv = valores.map(function (linha) {
    return linha.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(',');
  }).join('\n');
  return ContentService.createTextOutput(csv).setMimeType(ContentService.MimeType.CSV);
}