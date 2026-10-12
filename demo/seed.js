// Dados 100% FICTÍCIOS para a versão de demonstração (empresas, motoristas, placas e pesos inventados).
// Roda depois que o painel carrega; as datas são sempre relativas a "hoje", então a demonstração nunca fica velha.
(function () {
  let s = 12345;
  const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

  const nomes = ['Carlos Menezes', 'João Pedro Lima', 'Anderson Faria', 'Marcos Tavares', 'Rafael Duarte', 'Eduardo Bastos',
    'Luciano Prado', 'Rogério Campos', 'Felipe Andrade', 'Gustavo Moreira', 'Sérgio Nogueira', 'Paulo Henrique Dias',
    'Diego Carvalho', 'Fábio Teixeira', 'Renato Siqueira', 'Valdir Monteiro', 'Wagner Pacheco', 'Thiago Ribeiro',
    'Cláudio Barros', 'Mateus Figueiredo', 'Ricardo Salles', 'Alexandre Neves', 'Leandro Cordeiro', 'Vinícius Araújo'];
  const emps = [
    { e: 'Agrícola Horizonte', legal: 'AGRICOLA HORIZONTE LTDA', p: 'SOJA EM GRAOS A GRANEL', pt: 'SOJA', lote: '71001', n: 8 },
    { e: 'Cooperativa Vale Verde', legal: 'COOPERATIVA VALE VERDE AGROINDUSTRIAL', p: 'MILHO EM GRAOS', pt: 'MILHO', lote: '71002', n: 6 },
    { e: 'Armazéns Rio Claro', legal: 'ARMAZENS RIO CLARO SERVICOS E ARMAZENAMENTO S/A', p: 'FARELO DE SOJA HI PRO', pt: 'FARELO', lote: '71003', n: 6 },
    { e: 'Terra Forte Bioenergia', legal: 'TERRA FORTE BIOENERGIA S/A', p: 'GLICERINA BRUTA', pt: 'GLICERINA', lote: '71004', n: 3 },
  ];

  // hoje + os 4 dias úteis anteriores (sem domingo)
  const hoje = todayIso();
  const dias = [];
  for (let d = 0; dias.length < 5; d--) {
    const iso = addDays(hoje, d);
    const [y, m, dd] = iso.split('-').map(Number);
    if (new Date(y, m - 1, dd).getDay() !== 0) dias.unshift(iso);
  }

  const manual = {}, xml = {};
  let id = 0, seq = 100;
  dias.forEach((d, di) => {
    emps.forEach((E, ei) => {
      const n = Math.max(2, E.n + Math.round((rnd() - 0.5) * 4) - (d === hoje ? 1 : 0));
      for (let i = 0; i < n; i++) {
        const nome = nomes[(di * 5 + ei * 7 + i * 3) % nomes.length];
        manual['m' + id++] = { d, e: E.e, l: E.lote, p: E.pt, m: nome };
        if (rnd() < 0.9) {
          const kg = Math.round((27 + rnd() * 11) * 1000) + 40;
          const chave = '4126' + String(1000000000 + id).padStart(10, '0') + '0'.repeat(30);
          (xml[d] = xml[d] || {})[chave] = { t: 'nfe', n: String(++seq), s: '1', d, e: E.legal, p: 'CLIENTE EXEMPLO LTDA', tr: 'TRANSPORTADORA EXEMPLO',
            pl: 'ABC' + (1000 + id), kg, kl: kg - 700, m: nome.toUpperCase(), i: Date.now(), pr: E.p };
        }
      }
    });
  });

  const porMes = {};
  Object.entries(manual).forEach(([k, v]) => ((porMes['manual-' + v.d.slice(0, 7)] = porMes['manual-' + v.d.slice(0, 7)] || {})[k] = v));
  Object.entries(porMes).forEach(([doc, o]) => kvSetMany(doc, o));
  Object.entries(xml).forEach(([d, o]) => kvSetMany('xml-' + d, o));

  state.view = 'hoje'; state.dataFiltro = hoje;
  refreshFromSaved();

  // alguns "CT-e feito" (amarelo na planilha), dois "carregado sem CT-e" e algumas observações
  const feito = (x, i) => (x.date < hoje && (i * 7) % 10 < 7) || (x.date === hoje && i % 3 === 0);
  const ontem = dias[dias.length - 2];
  state.items.filter((x, i) => !feito(x, i) && x.date === ontem).slice(0, 2)
    .forEach((x) => kvSet('situacao-' + monthOf(noteKey(x)), encKey(noteKey(x)), 'carregado'));
  state.items.forEach((x, i) => {
    if (x.date === hoje && i % 3 === 1) kvSet('obs-' + monthOf(noteKey(x)), encKey(noteKey(x)), ['Chegou 07:30', 'Aguardando CT-e', 'Lote 2'][i % 3]);
  });
  refreshFromSaved();
  state.items.forEach((x, i) => { if (feito(x, i)) x.concluded = true; });
  render();

  $('updated').textContent = 'Versão de demonstração · dados fictícios · alterações não são salvas';
  $('cloudStatus').textContent = '';
  const css = document.createElement('style');
  css.textContent = '.tag.manual{display:none!important} header .sub:nth-of-type(3){display:none}';
  document.head.appendChild(css);
})();
