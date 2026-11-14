/**
 * Unlicensed clubs and players for the 7-0 Challenge. Every club has several seasons: famous
 * past squads are hand-written with look-alike names; other seasons are generated from name
 * pools with a fixed seed, so a club-season always has the same players.
 */
import { mulberry32 } from '../../core/rng';

export type Role = 'GK' | 'RB' | 'CB' | 'LB' | 'DM' | 'CM' | 'AM' | 'RW' | 'LW' | 'ST';
export interface Player { id: string; name: string; role: Role; rating: number; club: string; season: string }
export interface Season { label: string; squad: Player[] }
export interface Club { id: string; name: string; zh?: string; short: string; colors: [string, string]; seasons: Season[] }
import { LEAGUE_NAMES, type LeagueId } from './leagues';
export type { LeagueId };
type Kind = 'tr' | 'cn' | 'en' | 'es' | 'it' | 'de' | 'fr' | 'pt' | 'nl' | 'sc';
type SeasonDef = (club: string) => Season;

const S = (label: string, s: string): SeasonDef => club => ({
  label, squad: s.split(';').map(x => x.trim()).filter(Boolean).map((x, k) => {
    const [name, role, r] = x.split(':');
    return { id: `${club}-${label}-${k}`, name, role: role as Role, rating: +r, club, season: label };
  }),
});
const SHAPE: Role[] = ['GK', 'RB', 'CB', 'CB', 'CB', 'LB', 'DM', 'CM', 'CM', 'AM', 'RW', 'LW', 'ST', 'ST'];
const P: Record<string, string[]> = {
  trF: 'Ahmet Mehmet Emre Burak Kaan Can Arda Oğuz Serkan Hakan Yusuf Mert Efe Barış Taylan Onur Umut Furkan Berk Alper Cenk Doruk Eren Gökhan Koray Levent Murat Ozan Selim Tolga Volkan Yiğit Batuhan Enes Halil Recep Sinan Tarık'.split(' '),
  trL: 'Yılmaz Kaya Demir Şahin Çelik Yıldız Aydın Öztürk Arslan Doğan Kılıç Aslan Koç Kurt Özdemir Polat Erdem Güneş Tekin Bulut Avcı Taş Uçar Akın Bozkurt Karaca Sezer Toprak Ergin Sevim Korkmaz Altun Keskin Duman'.split(' '),
  xF: 'Lucas Mateo Ivan Marko Samuel Moussa João Diego Nikola Bruno Andrei Kevin Theo Youssef Ibrahim Emil Tomas Pablo Oliver Stefan Rafael Aleks Victor Jonas'.split(' '),
  xL: 'Silvo Costas Petrovski Dialla Traoro Mensa Novik Kovac Mendez Rochas Olsson Bergman Popescul Nkosa Barroso Sowe Vargo Horvath Lindqvis Okafo Ramires Duarto Janssen Kowalsky'.split(' '),
  br: 'Wellington Renan Thiagão Alanzinho Matheuzinho Fabinho_R. Paulinho_M. Leandrão Robsão Elkeson_J. Marcão Dudu_R. Jadsão Gilsinho Willian_M. Tchê_Tchê'.split(' ').map(x => x.replace('_', ' ')),
  cnS: 'Wang Li Zhang Liu Chen Yang Huang Zhao Wu Zhou Xu Sun Ma Zhu Hu Guo He Gao Lin Luo Zheng Liang Xie Song Tang Han Feng Deng Cao Peng'.split(' '),
  cnG: 'Wei Jun Hao Lei Peng Tao Yu Jie Bo Chen Xiang Kai Long Ming Rui Zhen Hong Bin Fan Qiang Shuai Yi Haoran Zihao Yuxuan Jiahao Tianyu Junjie Wenbo Zhiyuan Mingyang Shengjie'.split(' '),
  enF: 'Jack Harry James Tom Callum Ben Luke Ryan Josh Connor Kieran Sam Dan Mason Reece Aaron Lewis Jordan'.split(' '),
  enL: 'Whitby Harlow Crane Ashworth Pendle Brookes Fenwick Garrity Hollis Kenyon Marsh Oakley Prescott Rowntree Sutcliffe Thorne Walsham Yardley'.split(' '),
  esF: 'Álvaro Sergio Iker Pablo Dani Adrián Raúl Javi Rubén Marcos Hugo Unai Borja Mikel Íñigo Óscar'.split(' '),
  esL: 'Garmendia Robledo Castaño Iturralde Peralta Montoya Salcedo Vidaurre Echeverri Navarrete Olmedo Quintana Zubieta Arrieta Bustos Cañete'.split(' '),
  itF: 'Lorenzo Matteo Davide Andrea Federico Alessandro Simone Nicolò Giacomo Luca Tommaso Riccardo Marco Gianluca'.split(' '),
  itL: 'Bellandi Castrogiovanni Ferraresi Gallinari Loddo Mancuso Pellegatti Rinaldini Sartoretti Tagliaferri Vannucchi Zanardelli Orsolini Pacitti'.split(' '),
  deF: 'Lukas Jonas Felix Leon Maximilian Niklas Tim Jan Florian Moritz Tobias Julian Kai Benedikt'.split(' '),
  deL: 'Brandauer Hollmann Kessler Lindemann Mertesacker Oberdorf Pfannkuch Reinholz Schwarzer Trautmann Vogelsang Wendler Zieglar Ackermann'.split(' '),
  frF: 'Hugo Lucas Théo Maxime Antoine Kylian Nathan Romain Clément Yanis Bastien Loïc Mathis Jules'.split(' '),
  frL: 'Ardouin Beaumel Chevrier Delorme Fontanel Garnier Lacombe Marchand Peyrol Rouvière Sabatier Thibault Vasseur Dumoulin'.split(' '),
  ptF: 'João Tiago Rúben Diogo Gonçalo Rafael Pedro André Nuno Bernardo Vitinho Francisco'.split(' '),
  ptL: 'Carvalheira Fontoura Gouveia Loureiro Magalhães Pimentel Quaresmo Seixas Valadares Brandão Moutinha Cerqueira'.split(' '),
  nlF: 'Daan Sem Thijs Bram Luuk Jesse Stijn Niels Ruben Joey Kees Wout'.split(' '),
  nlL: 'van Dalen de Graaff Hoekstra Jansma Kuipers Molenaar Prins Smeets Terpstra Veenstra de Wit Brouwer'.split(' '),
  scF: 'Callum Ewan Fraser Jamie Lewis Craig Ross Kyle Scott Grant Blair Ally'.split(' '),
  scL: 'MacAuley Fergusson Kinnear Lennoxx McGlinn Rennie Strachen Tullock Wallis Dunbar Kerrigan McKinley'.split(' '),
};
const LOCAL: Record<Kind, [string, string]> = { tr: ['trF', 'trL'], cn: ['cnS', 'cnG'], en: ['enF', 'enL'], es: ['esF', 'esL'], it: ['itF', 'itL'], de: ['deF', 'deL'], fr: ['frF', 'frL'], pt: ['ptF', 'ptL'], nl: ['nlF', 'nlL'], sc: ['scF', 'scL'] };
const G = (label: string, base: number, kind: Kind, seed: number): SeasonDef => club => {
  const rng = mulberry32(seed), pick = <T,>(a: T[]) => a[Math.floor(rng() * a.length)], used = new Set<string>();
  const squad = SHAPE.map((role, k) => {
    let name = '';
    for (let t = 0; t < 30 && (!name || used.has(name)); t++) {
      const foreign = rng() < (kind === 'cn' ? 0.22 : 0.33);
      if (kind === 'cn' && foreign) name = rng() < 0.6 ? pick(P.br) : `${pick(P.xF)[0]}. ${pick(P.xL)}`;
      else if (kind === 'cn') name = `${pick(P.cnS)} ${pick(P.cnG)}`;
      else if (foreign) name = `${pick(P.xF)[0]}. ${pick(P.xL)}`;
      else { const [f, l] = LOCAL[kind]; name = `${pick(P[f])[0]}. ${pick(P[l])}`; }
    }
    used.add(name);
    const boost = kind === 'cn' && /^[A-Z][a-zãéêôç]+(?: [A-Z]\.)?$|^[A-Z]\. /.test(name) && !P.cnS.includes(name.split(' ')[0]) ? 3 : 0;
    const rating = Math.round(base + (role === 'GK' || role === 'ST' || role === 'AM' ? 1 : 0) + (rng() * 8 - 4) + boost - (k >= 12 ? 1 : 0));
    return { id: `${club}-${label}-${k}`, name, role, rating: Math.max(50, Math.min(92, rating)), club, season: label };
  });
  return { label, squad };
};
const C = (id: string, name: string, short: string, colors: [string, string], seasons: SeasonDef[], zh?: string): Club =>
  ({ id, name, short, colors, zh, seasons: seasons.map(f => f(id)) });

const GIANTS: Club[] = [
  C('rma', 'Real Madrigal', 'RMA', ['#f4f1ea', '#5b3f8c'], [
    S('2024/25', 'T. Kurtova:GK:89;D. Carvajol:RB:84;A. Rüdigar:CB:86;E. Militar:CB:84;F. Mendo:LB:82;A. Chouamenu:DM:84;F. Valverdo:CM:88;L. Modrik:CM:85;J. Bellinghem:AM:90;Rodrigo G.:RW:85;Vinisius Jr:LW:90;K. Mbapo:ST:92;E. Kamavinga:CM:83;B. Dias:RW:80'),
    S('2016/17', 'K. Navaz:GK:87;D. Carvajol:RB:84;S. Ramoz:CB:89;R. Varanne:CB:87;Marcelu:LB:87;Casemiru:DM:87;L. Modrik:CM:90;T. Kross:CM:89;Iskó:AM:85;G. Baile:RW:88;C. Ronaldu:LW:94;K. Benzemá:ST:88;M. Asensia:RW:83;Nachó:CB:80'),
    S('2001/02', 'I. Casiyas:GK:88;M. Salgada:RB:83;F. Hierra:CB:87;I. Helgera:CB:84;R. Karlos:LB:89;C. Makelele:DM:87;Z. Zidann:AM:94;L. Figu:RW:91;S. Solary:LW:82;Raúl G.:ST:91;F. Morientez:ST:85;S. McManamann:CM:82;Gutí:CM:83;F. Pavon:CB:78'),
  ]),
  C('bar', 'FC Barcelonia', 'BAR', ['#1d3f8f', '#a3233b'], [
    S('2024/25', 'M. ter Steger:GK:87;J. Kounda:RB:84;R. Araújoz:CB:84;P. Cubarsa:CB:82;A. Baldi:LB:81;M. Casada:DM:79;F. de Jongh:CM:86;Pedrí:CM:88;D. Olmos:AM:84;L. Yamel:RW:89;Rafinha:LW:87;R. Lewandowsko:ST:88;Gavy:CM:83;I. Martines:CB:80'),
    S('2014/15', 'C. Bravó:GK:84;D. Alvez:RB:86;G. Piquet:CB:87;J. Mascherana:CB:85;J. Alva:LB:85;S. Busketz:DM:88;I. Rakitik:CM:86;A. Inyesta:CM:89;L. Messy:RW:95;Neimar:LW:91;L. Suarés:ST:92;Xavy:CM:85;Pedró:RW:83;J. Matthieu:CB:80'),
    S('2008/09', 'V. Valdez:GK:85;D. Alvez:RB:88;C. Puyól:CB:88;G. Piquet:CB:85;E. Abidall:LB:84;S. Busketz:DM:84;Y. Touray:DM:86;Xavy:CM:91;A. Inyesta:CM:91;L. Messy:RW:94;T. Henri:LW:88;S. Eto:ST:89;S. Keyta:CM:82;Bojann:ST:77'),
  ]),
  C('bay', 'Bavaria Munchen', 'BAV', ['#c8102e', '#f4f1ea'], [
    S('2024/25', 'M. Noyer:GK:87;J. Kimmick:DM:86;D. Upamekano:CB:83;Kim Min-jun:CB:84;A. Davis:LB:84;J. Palinha:DM:84;L. Goretska:CM:82;J. Musiola:AM:89;M. Olize:RW:86;L. Sanné:LW:84;H. Kayn:ST:91;K. Komen:LW:82;T. Müllner:AM:82;R. Guerrero:LB:79'),
    S('2019/20', 'M. Noyer:GK:90;B. Pavart:RB:82;J. Boateg:CB:83;D. Alabba:CB:85;A. Davis:LB:84;J. Kimmick:DM:89;Thiagu:CM:88;L. Goretska:CM:84;T. Müllner:AM:87;S. Gnabri:RW:85;K. Komen:LW:84;R. Lewandowsko:ST:93;I. Perisik:LW:82;P. Coutinyo:AM:82'),
    S('2012/13', 'M. Noyer:GK:91;P. Lahn:RB:89;J. Boateg:CB:85;Dantê:CB:84;D. Alabba:LB:85;B. Schweinsteigar:CM:89;J. Martines:DM:85;T. Kross:CM:85;T. Müllner:AM:87;A. Robbin:RW:90;F. Ribery:LW:90;M. Mandzukik:ST:85;M. Gomes:ST:84;X. Shakiri:RW:78'),
  ]),
  C('mci', 'Manchester Skyblues', 'MSB', ['#6cabdd', '#1c2c5b'], [
    S('2024/25', 'Edersen:GK:88;K. Walkar:RB:83;R. Diaz:CB:88;M. Akanyi:CB:84;J. Gvardiul:LB:86;Rodry:DM:91;B. Silvo:CM:87;M. Kovacik:CM:83;K. De Bruyn:AM:89;P. Fodden:RW:87;J. Dokku:LW:83;E. Haland:ST:92;I. Gündoan:CM:84;Savinyo:RW:81'),
    S('2022/23', 'Edersen:GK:89;K. Walkar:RB:84;R. Diaz:CB:88;M. Akanyi:CB:84;N. Aké:LB:82;Rodry:DM:90;J. Stons:CM:85;K. De Bruyn:AM:92;I. Gündoan:CM:87;B. Silvo:RW:88;J. Grealishh:LW:84;E. Haland:ST:93;P. Fodden:LW:86;J. Alvarés:ST:83'),
    S('2011/12', 'J. Hartt:GK:84;P. Zabaleda:RB:81;V. Kompanny:CB:88;J. Lescot:CB:81;G. Clichi:LB:81;Y. Touray:DM:88;G. Barri:DM:82;D. Silvo:AM:88;S. Nasry:LW:83;J. Milnar:RW:81;S. Agüera:ST:90;E. Džeko:ST:84;C. Tevéz:ST:85;M. Balotely:ST:82'),
  ]),
  C('liv', 'Merseyside Reds', 'MER', ['#c8102e', '#00b2a9'], [
    S('2024/25', 'Alison B.:GK:89;T. Alexandre-Arnolt:RB:86;V. van Dyke:CB:89;I. Konatey:CB:85;A. Robertsen:LB:84;R. Gravenberg:DM:84;A. MacAlistair:CM:86;C. Jonas:CM:81;D. Soboszlai:AM:84;M. Saleh:RW:90;L. Dias:LW:85;D. Nunes:ST:82;C. Gakpa:LW:84;D. Yota:ST:83'),
    S('2018/19', 'Alison B.:GK:90;T. Alexandre-Arnolt:RB:86;V. van Dyke:CB:92;J. Matipp:CB:84;A. Robertsen:LB:87;Fabinyo:DM:86;J. Hendersen:CM:84;G. Wijnaldun:CM:85;M. Saleh:RW:91;S. Manné:LW:90;R. Firminu:ST:88;J. Milnar:CM:82;D. Origy:ST:78;X. Shakiri:RW:80'),
    S('2004/05', 'J. Dudak:GK:82;S. Finan:RB:80;J. Caragher:CB:85;S. Hyypia:CB:85;D. Traorê:LB:76;X. Alonzo:CM:86;S. Gerard:CM:91;D. Hamman:DM:83;J. A. Riisa:LB:81;L. Garcia:RW:83;M. Barosh:ST:81;H. Kewel:LW:81;V. Smicer:AM:79;D. Cissa:ST:80'),
  ]),
  C('psg', 'Paris Saint-Germont', 'PSG', ['#0d1e45', '#d0101e'], [
    S('2024/25', 'G. Donnaruma:GK:88;A. Hakimy:RB:86;Marquinyos:CB:86;W. Pacha:CB:83;N. Mendez:LB:85;Vitinya:DM:86;J. Nevez:CM:84;F. Ruis:CM:83;D. Duey:AM:83;O. Dembéla:RW:89;K. Kvaratskelia:LW:87;G. Ramoz:ST:80;B. Barkola:LW:83;L. Hernandes:CB:82'),
    S('2019/20', 'K. Navaz:GK:87;T. Kehrar:RB:79;T. Silvá:CB:88;P. Kimpembé:CB:84;J. Bernatt:LB:80;Marquinyos:DM:87;L. Paredez:DM:82;M. Veratti:CM:87;A. Di Mario:RW:88;Neimar:LW:92;K. Mbapo:ST:91;M. Ikardí:ST:84;A. Herrera:CM:80;E. Cavanni:ST:83'),
  ]),
  C('int', 'Inter Milanello', 'INT', ['#1e3f8a', '#111111'], [
    S('2024/25', 'Y. Somer:GK:86;D. Dumfrees:RB:83;A. Bastone:CB:87;F. Acerbo:CB:82;S. de Vrey:CB:81;F. Dimarko:LB:85;H. Çalanoğlu:DM:86;N. Barela:CM:87;H. Mkhitarian:CM:82;P. Zielinsky:AM:81;D. Fratesi:CM:81;L. Martines:ST:89;M. Turam:ST:85;C. Augusta:LB:79'),
    S('2009/10', 'J. Cesar:GK:89;Maikon:RB:88;Lucío:CB:87;W. Samuél:CB:86;J. Zanettí:LB:86;E. Cambiasa:DM:86;T. Motta:CM:83;D. Stankovik:CM:83;W. Sneyder:AM:91;S. Eto:RW:89;D. Milita:ST:90;G. Pandevv:LW:81;C. Chivú:CB:81;M. Balotely:ST:79'),
  ]),
  C('acm', 'Rossoneri Milano', 'RSN', ['#c8102e', '#111111'], [
    S('2024/25', 'M. Maignon:GK:87;E. Royale:RB:78;F. Tomory:CB:82;M. Gabia:CB:80;T. Hernandes:LB:84;Y. Fofanah:DM:82;T. Reijners:CM:84;R. Loftus-Cheeks:CM:80;Y. Musa:CM:78;C. Pulisik:RW:85;R. Leon:LW:86;S. Jiménez:ST:82;A. Moratta:ST:80;S. Chukwuezi:RW:78'),
    S('2006/07', 'Dyda:GK:86;M. Oda:RB:82;A. Nesta:CB:89;P. Maldiní:CB:88;M. Jankulovsky:LB:81;G. Gatuso:DM:87;A. Pirla:CM:91;C. Seedorff:CM:87;Kakà:AM:95;F. Inzagi:ST:86;A. Gilardinho:ST:83;M. Ambrosiny:CM:80;K. Kaladzé:CB:82;Ronaldú:ST:85'),
    S('2002/03', 'Dyda:GK:87;A. Costacurtta:RB:83;A. Nesta:CB:91;P. Maldiní:CB:92;K. Kaladzé:LB:82;G. Gatuso:DM:86;A. Pirla:CM:90;C. Seedorff:CM:88;R. Costta:AM:88;A. Shevchenka:ST:92;F. Inzagi:ST:88;M. Ambrosiny:CM:79;Rivaldó:LW:85;Sergynho:LB:80'),
  ]),
  C('juv', 'Juventina', 'JVT', ['#f4f1ea', '#111111'], [
    S('2024/25', 'M. Di Gregori:GK:84;T. Wea:RB:78;Bremmer:CB:85;P. Kalula:CB:80;Danilio:CB:80;A. Cambiasso:LB:82;M. Locatello:DM:82;K. Turam:CM:81;D. Luis:CM:81;T. Koopmeyners:AM:83;F. Conceiçao:RW:81;K. Yıldızhan:LW:84;D. Vlahovik:ST:84;N. Gonzales:RW:80'),
    S('2014/15', 'G. Bufon:GK:90;S. Lichtsteinar:RB:84;L. Bonuci:CB:87;G. Kiellini:CB:88;P. Evrá:LB:82;A. Pirla:DM:86;C. Marchizio:CM:86;P. Pogbá:CM:87;A. Vidall:CM:87;C. Tevéz:ST:88;A. Moratta:ST:82;A. Barzagly:CB:85;R. Pereira:AM:78;F. Llorenti:ST:80'),
    S('1995/96', 'A. Peruzi:GK:88;M. Toricelli:RB:80;C. Ferrarra:CB:85;P. Vierchowood:CB:84;G. Pessoto:LB:79;D. Deschamp:DM:86;A. Contte:CM:83;P. Souza:CM:85;A. Del Pierro:AM:89;G. Vialy:ST:88;F. Ravanely:ST:86;A. Di Livia:RW:80;V. Jugovik:CM:82;M. Padovana:LW:78'),
  ]),
  C('bvb', 'Borussia Dortmond', 'BVD', ['#fde100', '#111111'], [
    S('2024/25', 'G. Kobell:GK:86;J. Ryersen:RB:79;N. Schlotterberg:CB:84;W. Antón:CB:81;R. Bensebaina:LB:79;E. Cann:DM:79;M. Sabitzar:CM:80;P. Gross:CM:80;J. Brant:AM:83;D. Mahlen:RW:81;K. Adeyemy:LW:80;S. Guirasi:ST:85;F. Nmekha:CM:79;J. Gitens:LW:80'),
    S('2012/13', 'R. Weidenfellar:GK:84;L. Piszczik:RB:84;N. Subotik:CB:83;M. Hummells:CB:87;M. Schmelzar:LB:80;S. Bendar:DM:82;I. Gündoan:CM:86;M. Götza:AM:87;J. Błaszczykowsky:RW:84;M. Royce:LW:87;R. Lewandowsko:ST:89;K. Grosskreuz:LW:79;S. Kehll:DM:79;N. Şahinn:CM:81'),
  ]),
  C('atm', 'Atlético Madrigal', 'ATM', ['#cb3524', '#262f61'], [
    S('2024/25', 'J. Oblek:GK:88;N. Molino:RB:80;J. Jiménez:CB:83;R. Le Normant:CB:82;J. Galano:LB:79;Kokke:DM:82;R. De Pol:CM:84;P. Barrio:CM:82;C. Gallager:CM:82;A. Griezman:AM:87;G. Simeoni:RW:79;S. Lina:LW:79;J. Álvares:ST:86;A. Sorlot:ST:82'),
    S('2013/14', 'T. Kurtova:GK:86;Juanfrán:RB:83;Mirandá:CB:84;D. Godinn:CB:87;F. Luiz:LB:84;Gaby:DM:83;Tiagu M.:CM:82;Kokke:CM:85;A. Turann:LW:85;R. Garsía:AM:81;D. Kosta:ST:88;D. Viya:ST:83;Adriann:RW:78;T. Alderweirelt:CB:80'),
  ]),
  C('ars', 'Arsenale', 'ARS', ['#db0007', '#f4f1ea'], [
    S('2024/25', 'D. Raja:GK:86;B. Whyte:RB:84;W. Saliva:CB:88;Gabriell:CB:86;J. Timberr:LB:82;T. Parteyi:DM:82;D. Rise:CM:87;M. Merinho:CM:83;M. Odegard:AM:88;B. Sakka:RW:89;G. Martineli:LW:84;K. Haverts:ST:84;L. Trosard:LW:82;R. Calafiore:LB:81'),
    S('2003/04', 'J. Lehman:GK:85;Laurén:RB:83;S. Campbel:CB:87;K. Touray:CB:85;A. Kole:LB:87;P. Viera:DM:91;G. Silvà:DM:84;R. Pirés:LW:89;F. Ljungberk:RW:84;D. Bergkampf:AM:89;T. Henri:ST:94;J. A. Reyez:LW:80;Edú:CM:80;S. Wiltorde:ST:81'),
  ]),
  C('che', 'Chelsey', 'CHL', ['#034694', '#f4f1ea'], [
    S('2024/25', 'R. Sanches:GK:79;R. Jamez:RB:84;L. Colwil:CB:81;W. Fofanna:CB:81;M. Cucurela:LB:82;M. Caisedo:DM:86;R. Lavía:DM:79;E. Fernandes:CM:85;C. Palmar:AM:88;N. Maduekeh:RW:81;P. Netto:LW:82;N. Jaxon:ST:82;J. Sanchio:LW:80;J. Pedró:ST:81'),
    S('2011/12', 'P. Chech:GK:88;B. Ivanovik:RB:84;G. Cahil:CB:83;J. Terri:CB:87;A. Kole:LB:86;J. O. Mikell:DM:80;F. Lampardd:CM:88;Ramirés:CM:82;J. Matta:AM:87;D. Drogbá:ST:89;S. Kalú:RW:79;F. Torrez:ST:82;R. Meireless:CM:80;D. Luís:CB:83'),
  ]),
  C('mun', 'Manchester Redcoats', 'MRC', ['#da291c', '#fbe122'], [
    S('2024/25', 'A. Onanah:GK:82;D. Dalott:RB:81;Li. Martines:CB:84;M. de Licht:CB:82;L. Shah:LB:79;M. Ugartte:DM:80;Casemiru:DM:80;K. Mainu:CM:81;B. Fernandez:AM:87;M. Mounte:AM:79;A. Diallou:RW:81;A. Garnaccio:LW:82;R. Hojlunt:ST:79;J. Zirkzi:ST:78'),
    S('2007/08', 'E. van der Sarr:GK:88;W. Brownn:RB:80;R. Ferdinandd:CB:89;N. Vidik:CB:89;P. Evrá:LB:86;M. Carik:DM:86;P. Scholez:CM:86;O. Hargreavs:DM:82;C. Ronaldu:RW:95;W. Rooni:ST:89;C. Tevéz:ST:87;R. Giggz:LW:84;Nanni:LW:82;Andersonn:CM:80'),
    S('1998/99', 'P. Schmeikel:GK:90;G. Nevil:RB:84;J. Stamm:CB:88;R. Johnsenn:CB:81;D. Irvin:LB:84;R. Kean:DM:90;P. Scholez:CM:87;D. Beckam:RW:89;R. Giggz:LW:88;D. Yorkey:ST:86;Andi Kole:ST:85;N. Butte:CM:80;O. G. Solskjar:ST:83;T. Sheringam:ST:82'),
  ]),
  C('ajx', 'Ajacks', 'AJK', ['#d2122e', '#f4f1ea'], [
    S('2024/25', 'R. Pasvier:GK:74;D. Rench:RB:76;J. Sutalo:CB:77;Y. Baass:CB:75;J. Hatto:LB:79;J. Hendersen:DM:77;K. Tayler:CM:78;D. Klaasen:CM:77;K. Fitzjim:AM:74;S. Berghuys:RW:78;M. Gotts:LW:76;B. Broby:ST:77;W. Weghorts:ST:75;A. Gaei:RB:74'),
    S('2018/19', 'A. Onanah:GK:82;N. Mazrawi:RB:80;M. de Licht:CB:85;D. Blindd:CB:82;N. Tagliafica:LB:81;L. Schöné:DM:79;F. de Jongh:CM:87;D. van de Beck:CM:84;H. Ziyesh:RW:85;D. Tadik:ST:87;D. Neress:LW:83;K. Huntelar:ST:78;K. Dolbergg:ST:77;J. Veltmann:RB:77'),
    S('1994/95', 'E. van der Sarr:GK:85;M. Reizigar:RB:82;F. de Boerr:CB:86;D. Blindd:CB:85;W. Bogardi:LB:79;F. Rijkardd:DM:88;C. Seedorff:CM:84;E. Davidz:CM:85;J. Litmanenn:AM:89;F. George:RW:84;M. Overmarz:LW:87;P. Kluivertt:ST:84;N. Kanú:ST:80;R. de Boerr:AM:84'),
  ]),
  C('ben', 'Benfika', 'BNF', ['#e83030', '#f4f1ea'], [
    S('2024/25', 'A. Trubyn:GK:82;A. Baah:RB:78;A. Silvas:CB:83;N. Otamendy:CB:80;T. Araujó:CB:78;A. Carrera:LB:82;F. Aursness:DM:80;O. Kökcü:CM:83;L. Barreira:CM:77;A. Di Mario:RW:82;K. Aktürk:LW:82;V. Pavlides:ST:81;A. Schjeldrup:LW:78;Z. Amduni:ST:76'),
    S('1961/62', 'C. Pereyra:GK:80;M. João:RB:77;Germanó:CB:82;Cruzz:CB:79;Ângello:LB:78;M. Colunna:CM:88;Netto:DM:78;Santanna:AM:80;J. Augustó:RW:83;D. Cavém:LW:82;Eusébia:ST:94;J. Águass:ST:85;A. Simões:LW:84;Raúl M.:CB:77'),
  ]),
  C('por', 'FC Portu', 'POR', ['#0a4ea2', '#f4f1ea'], [G('2024/25', 79, 'pt', 301),
    S('2003/04', 'V. Baia:GK:85;P. Ferreyra:RB:83;J. Costta:CB:83;R. Carvalyo:CB:87;N. Valentte:LB:80;Costinyo:DM:83;Manichi:CM:85;P. Mendez:CM:81;Decô:AM:90;D. Alenichevv:LW:80;Derley:ST:83;B. McCarthi:ST:83;C. Albertto:RW:80;R. Costa F.:CB:78')]),
  C('lev', 'Bayer Leverkuz', 'B04', ['#e32221', '#111111'], [
    S('2023/24', 'L. Hradecki:GK:84;J. Frimpongg:RB:85;J. Tahh:CB:85;E. Tapsobba:CB:83;P. Hincapy:LB:82;G. Xhakka:DM:85;R. Andrikh:DM:81;E. Palacioz:CM:82;F. Wirz:AM:89;A. Grimaldu:LB:86;J. Hofman:RW:81;V. Bonifase:ST:83;P. Schik:ST:81;A. Adly:AM:80'),
    S('2001/02', 'H. Butt J.:GK:82;Zé Robertu:LB:84;L. Lúcioo:CB:86;J. Nowotni:CB:82;B. Schneidar:RB:84;C. Ramelowe:DM:82;M. Ballackk:CM:89;Y. Bastürkk:AM:84;O. Neuvillé:LW:84;D. Berbatoff:ST:84;U. Kirstan:ST:82;Z. Zivkovik:RB:78;C. Placenti:LB:77;T. Brdarik:ST:76')]),
  C('lei', 'Lipsia RB', 'RBL', ['#dd0741', '#f4f1ea'], [G('2024/25', 79, 'de', 302), G('2019/20', 80, 'de', 303)]),
  C('nap', 'SSC Napule', 'NAP', ['#12a0d7', '#f4f1ea'], [
    S('2022/23', 'A. Merett:GK:82;G. Di Lorenza:RB:85;Kim Min-jun:CB:86;A. Rrahmany:CB:81;M. Ruí:LB:79;S. Lobotká:DM:85;A. Anguisa:CM:83;P. Zielinsky:CM:84;K. Kvaratskelia:LW:88;M. Politana:RW:82;V. Osimhan:ST:89;G. Raspadory:ST:80;E. Elmaz:CM:78;M. Olivero:LB:78'),
    S('1989/90', 'G. Giulianni:GK:82;G. Bigonn:RB:78;C. Ferrarra:CB:84;A. Renicca:CB:81;G. Francini:LB:80;Alemão:DM:84;F. De Napolli:CM:82;M. Crippá:CM:80;D. Maradonna:AM:96;Careka:ST:89;A. Carnevalle:ST:81;M. Fuzi:RW:78;G. Corradinni:CB:77;G. Zolla:AM:82')]),
  C('rom', 'Lupi Roma', 'ROM', ['#8e1f2f', '#f0bc42'], [G('2024/25', 78, 'it', 304),
    S('2000/01', 'F. Antoniolly:GK:80;Kafú:RB:88;W. Samuél:CB:84;A. Zebinna:CB:79;V. Candella:LB:80;D. Tommazi:DM:81;Emersson:CM:85;C. Zanety:CM:80;F. Tottí:AM:91;G. Batistuta:ST:89;V. Montella:ST:85;M. Delvecchia:ST:81;H. Nakatta:AM:82;Aldaír:CB:84')]),
  C('tot', 'North London Lilywhites', 'NLL', ['#f4f1ea', '#132257'], [G('2024/25', 80, 'en', 305),
    S('2018/19', 'H. Lori:GK:86;K. Tripier:RB:81;T. Alderweirelt:CB:86;J. Vertongen:CB:85;D. Rosé:LB:79;M. Sisoko:CM:81;H. Wincks:CM:79;C. Eriksenn:AM:87;D. Ally:AM:83;Son Heung-mun:LW:88;H. Kayn:ST:90;L. Mora:RW:81;E. Dyer:DM:79;B. Daviez:LB:78')]),
  C('new', 'Tyneside Magpies', 'TYN', ['#111111', '#f4f1ea'], [G('2024/25', 80, 'en', 306),
    S('2002/03', 'S. Givenn:GK:84;A. Griffinn:RB:76;J. Woodgatte:CB:84;T. O\'Brienn:CB:77;O. Bernardd:LB:77;G. Speedd:CM:81;J. Jenass:CM:80;H. Vianna:CM:76;K. Dyar:RW:82;L. Robertt:LW:82;N. Solanó:RW:81;C. Bellami:ST:84;A. Shearrer:ST:88;A. Hughez:CB:77')]),
  C('sev', 'Sevillistas', 'SEV', ['#d6001c', '#f4f1ea'], [G('2024/25', 76, 'es', 307),
    S('2006/07', 'A. Palopp:GK:82;D. Alvez:RB:87;J. Escudé:CB:81;J. Navarra:CB:80;A. Puertta:LB:82;C. Martý:DM:81;C. Poulsenn:DM:81;Renató:CM:80;J. Navass:RW:85;A. Adriano C.:LW:81;F. Kanouthé:ST:86;L. Fabianno:ST:85;A. Kerzhakoff:ST:80;E. Maresca:CM:79')]),
  C('val', 'Valensia CF', 'VCF', ['#f4f1ea', '#ee3524'], [G('2024/25', 75, 'es', 308),
    S('2003/04', 'S. Cañizarez:GK:86;C. Torrez:RB:78;R. Ayalla:CB:88;C. Marchenna:CB:83;A. Carbony:LB:79;D. Albelda:DM:84;R. Baraja:CM:86;P. Aymar:AM:88;F. Rufette:RW:81;Vicentte:LW:86;Mysta:ST:83;J. Angulló:RW:79;M. Sissokko:CM:78;J. Oliveyra:CB:77')]),
  C('cel', 'Glasgow Hoops', 'GLH', ['#018749', '#f4f1ea'], [G('2024/25', 76, 'sc', 309),
    S('1966/67', 'R. Simpsonn:GK:82;J. Craigg:RB:80;T. Gemmel:LB:84;B. McNeil:CB:86;J. Clarkk:CB:81;B. Murdok:CM:84;B. Aulde:CM:83;C. Gallagh:AM:79;J. Johnstonn:RW:88;B. Lenoxx:LW:85;W. Wallas:ST:83;S. Chalmerz:ST:84;J. McBridd:ST:80;J. Fallonn:GK:72')]),
  C('psv', 'Eindhoven Lampen', 'EIN', ['#ed1c24', '#f4f1ea'], [G('2024/25', 77, 'nl', 310),
    S('1987/88', 'H. van Breukelenn:GK:84;E. Geretz:RB:84;R. Koemann:CB:88;B. van Aerlee:CB:80;I. Nielsenn:CB:79;J. Heintzee:LB:78;G. Vanenburgg:CM:81;S. Lerbyy:CM:83;E. Linskenss:CM:77;F. Arnesenn:AM:82;W. Kieftt:ST:84;H. Gillhauss:LW:80;B. Janssenn:RW:76;H. Koott:CB:76')]),
  C('fey', 'Rotterdam Stadion', 'ROT', ['#e41b17', '#f4f1ea'], [G('2024/25', 76, 'nl', 311), G('2001/02', 77, 'nl', 312)]),
  C('om', 'Massalia OM', 'OMM', ['#2faee0', '#f4f1ea'], [G('2024/25', 77, 'fr', 313),
    S('1992/93', 'F. Barthés:GK:86;J. Anglomma:RB:82;B. Bolli:CB:84;M. Desaily:CB:88;J. Casonni:CB:80;E. Di Mecco:LB:81;D. Deschamp:DM:86;F. Sauzéé:CM:84;J. Eydeliée:CM:80;A. Pelé:AM:88;J. Durandd:LW:80;A. Boksik:ST:87;R. Völlar:ST:86;B. Pardoo:CM:79')]),
  C('mon', 'AS Monako', 'ASM', ['#e51b22', '#f4f1ea'], [G('2024/25', 77, 'fr', 314),
    S('2016/17', 'D. Subasik:GK:83;D. Sidibey:RB:80;K. Glikk:CB:83;Jemersonn:CB:80;B. Mendi:LB:82;Fabinyo:DM:84;T. Bakayokko:CM:82;J. Moutinyo:CM:84;T. Lemarr:LW:84;B. Silvo:RW:86;R. Falkao:ST:88;K. Mbapo:ST:86;V. Germánn:ST:80;A. Touré M.:CB:77')]),
  C('ata', 'Bergamo Dea', 'BDE', ['#1e71b8', '#111111'], [G('2015/16', 76, 'it', 315),
    S('2023/24', 'J. Musso:GK:79;D. Zappacosa:RB:80;I. Hienn:CB:81;B. Djimsity:CB:80;S. Kolasinack:CB:79;M. de Roone:DM:81;Éderson J.:CM:84;T. Koopmeyners:CM:85;M. Ruggerri:LB:78;C. De Ketelaer:AM:84;A. Lookmann:LW:85;G. Scamaka:ST:83;M. Pašalik:AM:80;E. Holmm:RB:77')]),
  C('vil', 'Villarreales', 'VIL', ['#ffe114', '#005187'], [G('2024/25', 77, 'es', 316),
    S('2005/06', 'M. Vieraa:GK:82;J. Ventta:RB:77;G. Rodrigues:CB:79;Q. Alvares:CB:78;J. Sorínn:LB:81;M. Sennaa:DM:83;Josicó:CM:79;A. Tacchinardy:DM:79;J. R. Riquelmé:AM:90;R. Kromkampf:RB:76;S. Cazorlla:LW:80;D. Forlánn:ST:87;J. Josémarí:ST:79;G. Francco:ST:80')]),
];
const TR: Club[] = [
  C('gal', 'Galata SK', 'GAL', ['#a90432', '#fdb912'], [
    S('2024/25', 'F. Muslara:GK:82;R. Salai:RB:78;D. Sanchés:CB:80;A. Bardaklı:CB:78;I. Jakops:LB:77;L. Torreyra:DM:81;G. Sarra:CM:80;K. Demirbağ:CM:77;D. Mertenz:AM:79;B. Alper Yılmazer:RW:80;Y. Akgünlü:LW:78;V. Osimhan:ST:87;M. İkardi:ST:85;E. Elmalıoğlu:LB:75'),
    S('2012/13', 'F. Muslara:GK:85;E. Eboa:RB:80;S. Kayacı:CB:79;D. Nounkeo:CB:78;H. Baltacı:LB:78;F. Melló:DM:84;S. İnanç:CM:83;H. Altıntepe:CM:82;W. Sneyder:AM:88;N. Amrabatt:RW:80;A. Riera:LW:79;B. Yılmazer:ST:86;D. Drogbá:ST:87;U. Bulutlu:ST:79'),
    S('1999/00', 'C. Taffarell:GK:85;F. Akyelli:RB:80;B. Korkmazer:CB:82;G. Popescú:CB:84;E. Penbeoğlu:LB:81;S. Kayalı:DM:80;Ü. Davalı:CM:82;E. Belözlü:CM:80;G. Hagy:AM:91;O. Buruklu:RW:83;H. Şaşmaz:LW:83;A. Erdemli:ST:82;H. Şükrü:ST:89;Capón:CB:78'),
  ]),
  C('fen', 'Kadıköy Kanaryaları', 'KAN', ['#fde100', '#163962'], [
    S('2024/25', 'D. Livakoviç:GK:81;M. Mülder:RB:76;M. Djikü:CB:79;Ç. Söyünç:CB:78;J. Oosterwolt:LB:77;S. Amrabat:DM:80;Fredd:CM:81;M. Hakan Yandaşlı:CM:76;S. Szymansky:AM:80;İ. Kahvecioğlu:RW:80;D. Tadiç:LW:81;Y. En-Nesyry:ST:82;E. Dzekko:ST:81;O. Kostiç:LW:78'),
    S('2007/08', 'V. Demirkol:GK:84;Ö. Turacılı:RB:78;D. Luganó:CB:85;E. Dracenna:CB:82;R. Karlos:LB:87;M. Aurelyo:DM:82;S. Şahinler:CM:78;Alex d. S.:AM:90;Wedersonn:RW:79;U. Boralı:LW:80;D. de Souzza:ST:83;M. Kezmann:ST:82;S. Şentürkler:ST:82;Ü. Özatlı:LB:78'),
    S('2013/14', 'V. Demirkol:GK:83;G. Gönüllü:RB:80;B. Alvez:CB:81;E. Korkmazer:CB:78;H. Kadıoğlan:LB:76;M. Topallı:DM:80;R. Meireless:CM:80;E. Belözlü:CM:82;D. Kuytt:RW:82;M. Sowe:ST:83;E. Emenikke:ST:82;S. Ekiciler:LW:78;C. Baroni:CM:77;A. Şenkaya:CB:75'),
  ]),
  C('bjk', 'Kara Kartal JK', 'KRT', ['#111111', '#f4f1ea'], [
    S('2024/25', 'M. Günokay:GK:77;J. Svensen:RB:75;G. Paulistta:CB:78;F. Uduokhay:CB:75;A. Masuakku:LB:74;O. Hadzic:DM:74;G. Fernandez:CM:80;S. Uçar:CM:77;R. Silvia:AM:81;M. Rashika:RW:77;E. Muçy:LW:77;C. İmmobilo:ST:82;T. Abrahams:ST:80;S. Kılıçsu:ST:76'),
    S('2016/17', 'Fabrí:GK:82;G. Gönüllü:RB:79;Marceló G.:CB:81;D. Tosik:CB:80;A. Correa:LB:78;A. Hutchinsonn:DM:80;O. Özyakuplu:CM:82;G. İnlerli:CM:79;A. Taliska:AM:84;R. Quaresmá:RW:86;R. Babell:LW:81;V. Aboubakarr:ST:83;C. Tosunlu:ST:82;C. Erkinci:LB:78'),
    S('2002/03', 'Ó. Córdobba:GK:82;S. Kaplanlı:RB:76;R. Guiaru:CB:80;İ. Toramanlı:CB:78;İ. Üzülmezli:LB:79;T. Metinli:CM:80;Y. Sülünlü:CM:79;S. Yalçıner:AM:85;D. Pancú:RW:83;Z. Ronaldo:LW:79;A. Dursunlu:ST:82;F. Özkoçlu:ST:76;M. Özdilekli:RW:78;A. Yozgatlı:CB:76'),
  ]),
  C('tra', 'Trabzon Fırtına', 'TRF', ['#7b1b38', '#4a9fd8'], [
    S('2024/25', 'U. Çakırbaş:GK:80;S. Larsen:RB:73;S. Batagov:CB:74;M. Denswil:CB:73;E. Kerimoğlu:LB:72;B. Özcanlı:DM:74;O. Zubkovski:CM:74;A. Ömürlü:AM:76;E. Bardi:AM:76;E. Viska:RW:75;Trezegey:LW:78;P. Onuaçu:ST:80;M. Chamm:RW:74;E. Doğancı:CB:71'),
    S('2021/22', 'U. Çakırbaş:GK:83;B. Pereza:RB:78;V. Hugó:CB:80;E. Iéé:CB:78;E. Elmalıoğlu:LB:77;M. Siopiss:DM:79;M. Hamsick:CM:82;A. Bakasetass:AM:82;E. Viska:RW:80;A. Nwakaemé:LW:82;Djaniniy:ST:80;A. Corneliuss:ST:80;A. Ömürlü:AM:79;Gervinyo:LW:79'),
    S('1983/84', 'Ş. Şenolcu:GK:85;T. Kaplanoğlu:RB:76;C. Tunçlu:CB:79;N. Yamaklı:CB:77;H. Sağlamer:LB:77;N. Bayraklı:DM:78;O. Tüzünlü:CM:79;N. Alpaslanlı:CM:78;O. Gürayer:AM:80;Ş. Yeşilyurtlu:RW:78;H. Sağlam:LW:76;N. Çakıroğlu:ST:79;H. Erdenli:ST:77;K. Kuyuoğlu:CB:75'),
  ]),
  C('bas', 'Başakköy FK', 'BAK', ['#e8590c', '#1c2b4a'], [G('2024/25', 77, 'tr', 101),
    S('2019/20', 'M. Günokay:GK:80;J. Kaiçara:RB:77;C. Ponckk:CB:76;A. Epureanú:CB:78;G. Clichi:LB:79;M. Topallı:DM:79;İ. Kahvecioğlu:CM:81;D. Aleksik:AM:78;Robinyo:AM:80;E. Viska:RW:82;D. Türüçlü:LW:78;D. Bá:ST:82;E. Crivelly:ST:79;F. Gulbrandsenn:LW:76')]),
  C('bur', 'Bursa Timsah SK', 'BTS', ['#007a3d', '#f4f1ea'], [G('2024/25', 70, 'tr', 109),
    S('2009/10', 'D. Ivankoff:GK:80;A. Tandoğanlı:RB:75;Ö. Erdoğanlı:CB:77;İ. Öztürker:CB:76;G. Vedersonn:LB:76;H. Çimşirli:DM:77;M. Keçelli:CM:74;E. Sezgin:CM:73;P. Batallá:AM:82;O. İpekçi:RW:79;V. Şenol:LW:80;S. Yıldırımlı:ST:79;T. Bahadırlı:ST:78;Y. Bayraktar:GK:70')]),
  C('sam', 'Samsun Yıldız', 'SAM', ['#d6001c', '#f4f1ea'], [G('2024/25', 75, 'tr', 102), G('1989/90', 73, 'tr', 122)]),
  C('goz', 'İzmir Göz SK', 'IZG', ['#f2c200', '#c8102e'], [G('2024/25', 74, 'tr', 103), G('1969/70', 73, 'tr', 123)]),
  C('kas', 'Kasımköy', 'KSM', ['#1b3d80', '#f4f1ea'], [G('2024/25', 73, 'tr', 104), G('2014/15', 72, 'tr', 124)]),
  C('ant', 'Antalya Akrep', 'AKR', ['#d40000', '#f4f1ea'], [G('2024/25', 72, 'tr', 105), G('2016/17', 74, 'tr', 125)]),
  C('kon', 'Konya Kartalı', 'KNK', ['#0c7a3e', '#f4f1ea'], [G('2024/25', 72, 'tr', 106), G('2016/17', 74, 'tr', 126)]),
  C('kay', 'Kayseri Yiğitleri', 'KAY', ['#e30613', '#fdd000'], [G('2024/25', 71, 'tr', 107), G('2007/08', 73, 'tr', 127)]),
  C('siv', 'Sivas Yiğidolar', 'SIV', ['#d0021b', '#f4f1ea'], [G('2024/25', 71, 'tr', 108), G('2008/09', 75, 'tr', 128)]),
  C('esk', 'Eskişehir Şimşek', 'ESK', ['#c8102e', '#111111'], [G('2010/11', 74, 'tr', 110), G('1969/70', 72, 'tr', 130)]),
  C('ank', 'Ankara Gücü', 'ANK', ['#1b3b8a', '#fdd000'], [G('2022/23', 70, 'tr', 111), G('1980/81', 71, 'tr', 131)]),
  C('riz', 'Rize Çaycıları', 'RIZ', ['#0b7a3e', '#1b3b8a'], [G('2024/25', 71, 'tr', 112), G('2016/17', 70, 'tr', 132)]),
  C('gaz', 'Gaziantep Şahinleri', 'GAZ', ['#c8102e', '#111111'], [G('2024/25', 71, 'tr', 113), G('2010/11', 73, 'tr', 133)]),
  C('ala', 'Alanya Güneşi', 'ALA', ['#f28c00', '#0b7a3e'], [G('2024/25', 71, 'tr', 114), G('2020/21', 73, 'tr', 134)]),
];
const CN: Club[] = [
  C('shp', 'Shanghai Harbour', 'SHH', ['#c8102e', '#f4f1ea'], [
    S('2024', 'Yan Junlin:GK:76;Zhang Linpen:RB:72;Jiang Guangtei:CB:72;Li Shuang:CB:71;Fu Huang:LB:70;Cai Huikan:DM:72;Xu Xing:CM:72;M. Jussá:CM:75;Oskar:AM:82;Lü Wenjin:RW:72;Leonardu:LW:77;Gustav:ST:78;Wu Lai:ST:76;Wang Shencao:CB:69'),
    S('2018', 'Yan Junlin:GK:78;Zhang Wai:RB:72;Shi Ke:CB:75;He Guan:CB:73;Wang Shencao:LB:74;O. Akhmedoff:DM:80;Cai Huikan:CM:74;Oskar:AM:87;Hulque:RW:88;Wu Lai:LW:82;Elkesón:ST:84;Lü Wenjin:RW:74;Wei Zhen:CB:72;Fu Huang:CB:73'),
  ], '上海海湾'),
  C('sdt', 'Shandong Mountain', 'SDM', ['#f39800', '#f4f1ea'], [
    S('2024', 'Wang Dalai:GK:75;Wu Xinhan:RB:69;Zheng Zhen:CB:71;Gao Zhunyu:CB:72;Liu Yan:LB:70;Li Yuanyu:DM:71;Huang Zhenyu:CM:71;Peng Xinlin:CM:69;Moisés L.:AM:78;Xie Wenning:RW:71;Liu Binbing:LW:70;Crysam:ST:79;Guo Tianyi:ST:70;Jadsão:CB:74'),
    S('2021', 'Wang Dalai:GK:77;Wang Tong:RB:72;Zheng Zhen:CB:74;Jadsão:CB:77;Liu Yan:LB:73;Wu Xinhan:DM:73;M. Fellainy:CM:84;Moisés L.:AM:82;Jin Jingdao:RW:74;Leonardu:LW:81;Song Long:LW:72;Guo Tianyi:ST:76;Duan Liuyu:ST:73;Liu Binbing:RW:73'),
  ], '山东泰峰'),
  C('shs', 'Shanghai Shenhuo', 'SSH', ['#004ea2', '#f4f1ea'], [
    S('2024', 'Bao Yaxion:GK:73;Yang Zexian:RB:70;Jiang Shenlong:CB:73;Zhu Chenji:CB:72;W. Manafa:LB:74;I. Amadu:DM:74;Wu Xiu:CM:72;Xu Haoyan:CM:70;J. Teixera:AM:79;Yu Hanchou:RW:71;Cao Yundin:LW:71;Andrei Luis:ST:78;Wang Haijin:CM:70;Saulo M.:ST:74'),
    S('2003', 'Liu Yunfai:GK:74;Sun Xiang:RB:70;Du Wai:CB:76;Fan Zhiyai:CB:78;Li Weifang:LB:74;Wu Chengyin:DM:73;Shen Si:CM:75;Qi Hong:CM:76;Xie Hui:ST:77;Zhang Yuning:ST:72;Jörg Albertz:AM:79;Gao Hao:RW:71;Li Gang:LW:71;Song Hao:CB:70'),
  ], '上海申火'),
  C('cdr', 'Chengdu Hibiscus', 'CDH', ['#8b1c3a', '#fdd000'], [
    S('2024', 'Jian Tau:GK:72;Hu Hetao:RB:68;Tang Miao:CB:70;Yang Mingyan:CB:69;Hu Ruibao:LB:68;T. Chou:DM:70;Gan Chao:CM:69;Romulu:AM:77;Wei Shihau:RW:73;Zhou Dingyan:CM:69;Ming Tian:LW:68;Felipé:ST:80;Mutallip:ST:70;Ma Zhen:CB:68'),
    G('2011', 65, 'cn', 206),
  ], '成都蓉花'),
  C('bjg', 'Beijing Capital', 'BJC', ['#007a3d', '#f4f1ea'], [
    S('2024', 'Han Jiaqing:GK:73;Wang Gan:RB:70;M. Ngadeo:CB:74;Bai Yang:CB:68;Li Lai:LB:70;Chi Zhongguang:DM:70;Zhang Xizhi:AM:73;Lin Liangmin:LW:71;S. Adegbenru:RW:75;F. Abreo:ST:77;Zhang Yunin:ST:71;Wang Ziming:ST:69;Li Ke:DM:69;Gao Tianyu:CM:68'),
    S('2009', 'Yang Zhi:GK:77;Zhang Shuai:RB:71;Xu Yunlong:CB:76;Yang Pu:CB:73;Zhou Ting:LB:72;Tiagó:DM:76;Huang Bowan:CM:76;Wang Changqin:CM:75;Lu Jiang:CM:73;Yan Xiangchuan:RW:72;R. Griffitts:LW:76;J. Griffitts:ST:81;Du Wenhui:ST:72;Zhang Xinxin:CB:71'),
  ], '北京首都'),
  C('gze', 'Guangzhou Evergreen', 'GZE', ['#c8102e', '#fdd000'], [
    S('2013', 'Zeng Chen:GK:78;Zhang Linpen:RB:76;Kim Young-gyu:CB:78;Feng Xiaotin:CB:76;Sun Xian:LB:74;Zheng Zhi:DM:80;Huang Bowan:CM:77;Zhao Xuri:CM:74;D. Concá:AM:88;Liu Jian:RW:72;Muriquí:LW:86;Elkesón:ST:85;Gao Lyn:ST:79;Rong Hau:CM:73'),
    S('2015', 'Zeng Chen:GK:78;Zhang Linpen:RB:78;Kim Young-gyu:CB:78;Feng Xiaotin:CB:77;Li Xuepen:LB:74;Zheng Zhi:DM:79;Paulinyo:CM:86;Huang Bowan:CM:76;R. Goulartt:AM:87;Alann C.:LW:84;Robinyo:AM:80;Elkesón:ST:85;Gao Lyn:ST:78;Zou Zhen:CB:74'),
    G('2024', 62, 'cn', 207),
  ], '广州常青'),
  C('dlp', 'Dalian Pearl', 'DLP', ['#1d4f91', '#f4f1ea'], [
    S('2002', 'Chen Don:GK:74;Zou Jai:RB:74;Zhang Yaokun:CB:76;Zhang Enhwa:CB:76;Ji Mingyu:LB:74;Li Min:DM:77;Yan Son:CM:73;Wang Shen:CM:72;Quan Lai:AM:73;Wang Pen:RW:75;Li Yau:LW:72;Hao Haidon:ST:83;M. Jankovicc:ST:79;Zhu Tin:ST:72'),
    G('2024', 63, 'cn', 208),
  ], '大连明珠'),
  C('jss', 'Jiangsu Sunrise', 'JSS', ['#0b5ea8', '#f4f1ea'], [
    S('2020', 'Gu Chau:GK:74;Yang Xiaotien:RB:71;Li Ang:CB:74;Mirandá S.:CB:82;Ji Xian:LB:72;Tian Yinon:DM:71;Wu Xiu:CM:76;Gao Tianyi:CM:72;A. Teixera:AM:84;Huang Zichan:RW:74;Xie Pengfai:LW:73;Eder C.:ST:82;I. Santinni:ST:79;Zhang Xiaobin:CM:71'),
    G('2016', 70, 'cn', 209),
  ], '江苏日出'),
  C('hbf', 'Hebei Fortune', 'HBF', ['#c8102e', '#f4f1ea'], [
    S('2017', 'Gong Wai:GK:72;Ren Han:RB:74;E. Gülümm:CB:78;Chen Tau:CB:71;Zhao Yuhau:LB:72;J. Mascherana:DM:84;Hernanez:CM:82;Yin Hongbu:CM:72;Zhang Chengdon:RW:72;Gervinyo:LW:83;Bai Yuefen:CM:70;E. Lavezy:ST:84;Dong Xuesen:ST:72;Xu Tao:CB:70'),
    G('2022', 60, 'cn', 210),
  ], '河北福运'),
  C('tjt', 'Tianjin Tigers', 'TJT', ['#0057a8', '#f4f1ea'], [G('2024', 67, 'cn', 201), G('2018', 70, 'cn', 211)], '天津猛虎'),
  C('wht', 'Wuhan Three Towers', 'WTT', ['#1d4f91', '#f4f1ea'], [G('2024', 68, 'cn', 202), G('2022', 72, 'cn', 212)], '武汉三塔'),
  C('zjg', 'Hangzhou Greenwood', 'HZG', ['#006b3f', '#f4f1ea'], [G('2024', 67, 'cn', 203), G('2010', 66, 'cn', 213)], '杭州绿林'),
  C('hns', 'Henan Songhe', 'HNS', ['#e60012', '#f4f1ea'], [G('2024', 66, 'cn', 204), G('2009', 67, 'cn', 214)], '河南嵩河'),
  C('ccy', 'Changchun Asia', 'CCA', ['#00a0e9', '#f4f1ea'], [G('2024', 65, 'cn', 205), G('2007', 70, 'cn', 215)], '长春亚洲'),
  C('qdb', 'Qingdao Bulls', 'QDB', ['#c8102e', '#f4f1ea'], [G('2024', 65, 'cn', 216), G('2012', 64, 'cn', 217)], '青岛海牛'),
  C('mzk', 'Meizhou Kejia', 'MZK', ['#e60012', '#fdd000'], [G('2024', 65, 'cn', 218), G('2021', 64, 'cn', 219)], '梅州客家'),
  C('ntc', 'Nantong Cloud', 'NTC', ['#0b5ea8', '#00a0e9'], [G('2024', 64, 'cn', 220), G('2020', 62, 'cn', 221)], '南通云帆'),
  C('szr', 'Shenzhen Ruby', 'SZR', ['#c8102e', '#111111'], [G('2004', 69, 'cn', 222), G('2019', 66, 'cn', 223)], '深圳红宝石'),
];

export const LEAGUES: Record<LeagueId, { name: [string, string, string]; cup: [string, string, string]; clubs: Club[] }> = {
  giants: { ...LEAGUE_NAMES.giants, clubs: GIANTS },
  tr: { ...LEAGUE_NAMES.tr, clubs: TR },
  cn: { ...LEAGUE_NAMES.cn, clubs: CN },
};
/** A drawn team is a club in one season: "rma@1" is Real Madrigal's second season. */
export interface Team { club: Club; season: Season; key: string }
export function teamOf(key: string): Team | undefined {
  const [id, k] = key.split('@');
  for (const l of Object.values(LEAGUES)) { const c = l.clubs.find(x => x.id === id); if (c) return { club: c, season: c.seasons[+k] ?? c.seasons[0], key }; }
  return undefined;
}
export const teamsOf = (league: LeagueId): string[] => LEAGUES[league].clubs.flatMap(c => c.seasons.map((_, k) => `${c.id}@${k}`));
