/**
 * Invented clubs and players for the 7-0 Challenge: no real club, player, badge or league.
 * Every club has several seasons, each generated from name pools with a fixed seed, so a
 * club-season always has the same players.
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

const SHAPE: Role[] = ['GK', 'RB', 'CB', 'CB', 'CB', 'LB', 'DM', 'CM', 'CM', 'AM', 'RW', 'LW', 'ST', 'ST'];
const P: Record<string, string[]> = {
  trF: 'Ahmet Mehmet Emre Burak Kaan Can Arda Oğuz Serkan Hakan Yusuf Mert Efe Barış Taylan Onur Umut Furkan Berk Alper Cenk Doruk Eren Gökhan Koray Levent Murat Ozan Selim Tolga Volkan Yiğit Batuhan Enes Halil Recep Sinan Tarık'.split(' '),
  trL: 'Yılmaz Kaya Demir Şahin Çelik Yıldız Aydın Öztürk Arslan Doğan Kılıç Aslan Koç Kurt Özdemir Polat Erdem Güneş Tekin Bulut Avcı Taş Uçar Akın Bozkurt Karaca Sezer Toprak Ergin Sevim Korkmaz Altun Keskin Duman'.split(' '),
  xF: 'Lucas Mateo Ivan Marko Samuel Moussa João Diego Nikola Bruno Andrei Kevin Theo Youssef Ibrahim Emil Tomas Pablo Oliver Stefan Rafael Aleks Victor Jonas'.split(' '),
  xL: 'Silvo Costas Petrovski Dialla Traoro Mensa Novik Kovac Mendez Rochas Olsson Bergman Popescul Nkosa Barroso Sowe Vargo Horvath Lindqvis Okafo Ramires Duarto Janssen Kowalsky'.split(' '),
  br: 'Wellerson Renatão Tiaguinho Alandro Mateusão Fabrício_R. Paulão_M. Leandrinho Robsinho Edvaldo_J. Marquinho Duduca Jadielson Gilsão Wilsinho Tchelo'.split(' ').map(x => x.replace('_', ' ')),
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
  C('rma', 'Castelmar CF', 'CSM', ['#2e6f95', '#f2c14e'], [
    G('2024/25', 85, 'es', 901),
    G('2016/17', 86, 'es', 902),
    G('2001/02', 85, 'es', 903),
  ]),
  C('bar', 'Bellavista CF', 'BLV', ['#7a3b69', '#f4f1ea'], [
    G('2024/25', 83, 'es', 904),
    G('2014/15', 86, 'es', 905),
    G('2008/09', 86, 'es', 906),
  ]),
  C('bay', 'Hohenwald FC', 'HHW', ['#3b7a57', '#e9c46a'], [
    G('2024/25', 83, 'de', 907),
    G('2019/20', 85, 'de', 908),
    G('2012/13', 85, 'de', 909),
  ]),
  C('mci', 'Ashborough City', 'ASH', ['#d1495b', '#00798c'], [
    G('2024/25', 85, 'en', 910),
    G('2022/23', 86, 'en', 911),
    G('2011/12', 83, 'en', 912),
  ]),
  C('liv', 'Rivermouth Athletic', 'RVM', ['#edae49', '#30638e'], [
    G('2024/25', 84, 'en', 913),
    G('2018/19', 85, 'en', 914),
    G('2004/05', 81, 'en', 915),
  ]),
  C('psg', 'Saint-Aubert FC', 'SAU', ['#003d5b', '#d1495b'], [
    G('2024/25', 84, 'fr', 916),
    G('2019/20', 84, 'fr', 917),
  ]),
  C('int', 'Varenna Calcio', 'VAR', ['#8d6a9f', '#ffd166'], [
    G('2024/25', 83, 'it', 918),
    G('2009/10', 85, 'it', 919),
  ]),
  C('acm', 'Montelago AC', 'MTL', ['#264653', '#e76f51'], [
    G('2024/25', 81, 'it', 920),
    G('2006/07', 85, 'it', 921),
    G('2002/03', 85, 'it', 922),
  ]),
  C('juv', 'Torrevecchia', 'TRV', ['#6a4c93', '#8ac926'], [
    G('2024/25', 81, 'it', 923),
    G('2014/15', 84, 'it', 924),
    G('1995/96', 83, 'it', 925),
  ]),
  C('bvb', 'Westerfeld 09', 'WSF', ['#1982c4', '#ff595e'], [
    G('2024/25', 80, 'de', 926),
    G('2012/13', 83, 'de', 927),
  ]),
  C('atm', 'Sierra Alta CF', 'SAL', ['#5f0f40', '#fb8b24'], [
    G('2024/25', 81, 'es', 928),
    G('2013/14', 83, 'es', 929),
  ]),
  C('ars', 'Kingsgate FC', 'KGT', ['#0f4c5c', '#e36414'], [
    G('2024/25', 84, 'en', 930),
    G('2003/04', 85, 'en', 931),
  ]),
  C('che', 'Westbridge FC', 'WBR', ['#9a031e', '#f7b801'], [
    G('2024/25', 81, 'en', 932),
    G('2011/12', 83, 'en', 933),
  ]),
  C('mun', 'Ironvale United', 'IRV', ['#386641', '#f2e8cf'], [
    G('2024/25', 80, 'en', 934),
    G('2007/08', 85, 'en', 935),
    G('1998/99', 85, 'en', 936),
  ]),
  C('ajx', 'Lindenhof Stars', 'LDH', ['#bc4749', '#a7c957'], [
    G('2024/25', 75, 'nl', 937),
    G('2018/19', 81, 'nl', 938),
    G('1994/95', 83, 'nl', 939),
  ]),
  C('ben', 'Atlântico SC', 'ATL', ['#3d405b', '#f2cc8f'], [
    G('2024/25', 79, 'pt', 940),
    G('1961/62', 81, 'pt', 941),
  ]),
  C('por', 'Ribeira FC', 'RIB', ['#81b29a', '#3d405b'], [G('2024/25', 79, 'pt', 301),
    G('2003/04', 82, 'pt', 942)]),
  C('lev', 'Steinau 04', 'STN', ['#e07a5f', '#3d405b'], [
    G('2023/24', 82, 'de', 943),
    G('2001/02', 81, 'de', 944)]),
  C('lei', 'Elsterburg SV', 'ELS', ['#2a9d8f', '#264653'], [G('2024/25', 79, 'de', 302), G('2019/20', 80, 'de', 303)]),
  C('nap', 'Golfo Azzurro', 'GAZ', ['#f4a261', '#2a9d8f'], [
    G('2022/23', 82, 'it', 945),
    G('1989/90', 81, 'it', 946)]),
  C('rom', 'Valtorre FC', 'VTR', ['#4361ee', '#f72585'], [G('2024/25', 78, 'it', 304),
    G('2000/01', 83, 'it', 947)]),
  C('tot', 'Highcross FC', 'HCR', ['#7209b7', '#4cc9f0'], [G('2024/25', 80, 'en', 305),
    G('2018/19', 82, 'en', 948)]),
  C('new', 'Northmoor FC', 'NMR', ['#3a0ca3', '#ffbe0b'], [G('2024/25', 80, 'en', 306),
    G('2002/03', 80, 'en', 990)]),
  C('sev', 'Guadalvega CF', 'GDV', ['#fb5607', '#3a86ff'], [G('2024/25', 76, 'es', 307),
    G('2006/07', 81, 'es', 949)]),
  C('val', 'Marenza CF', 'MRZ', ['#ff006e', '#8338ec'], [G('2024/25', 75, 'es', 308),
    G('2003/04', 82, 'es', 950)]),
  C('cel', 'Lochmore FC', 'LCH', ['#588157', '#dad7cd'], [G('2024/25', 76, 'sc', 309),
    G('1966/67', 81, 'sc', 951)]),
  C('psv', 'Veldmark SV', 'VLD', ['#a3b18a', '#344e41'], [G('2024/25', 77, 'nl', 310),
    G('1987/88', 80, 'nl', 952)]),
  C('fey', 'Havenstad FC', 'HVN', ['#6d597a', '#e56b6f'], [G('2024/25', 76, 'nl', 311), G('2001/02', 77, 'nl', 312)]),
  C('om', 'Port-Soleil FC', 'PSO', ['#355070', '#eaac8b'], [G('2024/25', 77, 'fr', 313),
    G('1992/93', 83, 'fr', 953)]),
  C('mon', 'Côte Bleue AS', 'CBL', ['#b56576', '#355070'], [G('2024/25', 77, 'fr', 314),
    G('2016/17', 82, 'fr', 954)]),
  C('ata', 'Valcastello', 'VCS', ['#22577a', '#80ed99'], [G('2015/16', 76, 'it', 315),
    G('2023/24', 80, 'it', 955)]),
  C('vil', 'Naranjal CF', 'NRJ', ['#38a3a5', '#22577a'], [G('2024/25', 77, 'es', 316),
    G('2005/06', 80, 'es', 956)]),
];
const TR: Club[] = [
  C('gal', 'Yelkenkaya SK', 'YLK', ['#c44536', '#197278'], [
    G('2024/25', 79, 'tr', 957),
    G('2012/13', 81, 'tr', 958),
    G('1999/00', 82, 'tr', 959),
  ]),
  C('fen', 'Mavikoru FK', 'MVK', ['#283d3b', '#edddd4'], [
    G('2024/25', 78, 'tr', 960),
    G('2007/08', 81, 'tr', 961),
    G('2013/14', 79, 'tr', 962),
  ]),
  C('bjk', 'Akçaburun JK', 'AKB', ['#2e6f95', '#f2c14e'], [
    G('2024/25', 76, 'tr', 963),
    G('2016/17', 80, 'tr', 964),
    G('2002/03', 79, 'tr', 965),
  ]),
  C('tra', 'Dalgakıran SK', 'DLG', ['#7a3b69', '#f4f1ea'], [
    G('2024/25', 74, 'tr', 966),
    G('2021/22', 79, 'tr', 967),
    G('1983/84', 77, 'tr', 968),
  ]),
  C('bas', 'Çınarlı FK', 'CNR', ['#3b7a57', '#e9c46a'], [G('2024/25', 77, 'tr', 101),
    G('2019/20', 78, 'tr', 969)]),
  C('bur', 'Yeşilova SK', 'YSO', ['#d1495b', '#00798c'], [G('2024/25', 70, 'tr', 109),
    G('2009/10', 76, 'tr', 970)]),
  C('sam', 'Kızılkum SK', 'KZK', ['#edae49', '#30638e'], [G('2024/25', 75, 'tr', 102), G('1989/90', 73, 'tr', 122)]),
  C('goz', 'Altınkoy SK', 'ALK', ['#003d5b', '#d1495b'], [G('2024/25', 74, 'tr', 103), G('1969/70', 73, 'tr', 123)]),
  C('kas', 'Taşhan FK', 'TSH', ['#8d6a9f', '#ffd166'], [G('2024/25', 73, 'tr', 104), G('2014/15', 72, 'tr', 124)]),
  C('ant', 'Portakalbahçe SK', 'PRB', ['#264653', '#e76f51'], [G('2024/25', 72, 'tr', 105), G('2016/17', 74, 'tr', 125)]),
  C('kon', 'Bozkır Gençlik', 'BZG', ['#6a4c93', '#8ac926'], [G('2024/25', 72, 'tr', 106), G('2016/17', 74, 'tr', 126)]),
  C('kay', 'Karlıdağ SK', 'KRD', ['#1982c4', '#ff595e'], [G('2024/25', 71, 'tr', 107), G('2007/08', 73, 'tr', 127)]),
  C('siv', 'Yaylabaşı SK', 'YYL', ['#5f0f40', '#fb8b24'], [G('2024/25', 71, 'tr', 108), G('2008/09', 75, 'tr', 128)]),
  C('esk', 'Ilgınlı SK', 'ILG', ['#0f4c5c', '#e36414'], [G('2010/11', 74, 'tr', 110), G('1969/70', 72, 'tr', 130)]),
  C('ank', 'Bozdoğan Gücü', 'BZD', ['#9a031e', '#f7b801'], [G('2022/23', 70, 'tr', 111), G('1980/81', 71, 'tr', 131)]),
  C('riz', 'Çayırbağı SK', 'CYB', ['#386641', '#f2e8cf'], [G('2024/25', 71, 'tr', 112), G('2016/17', 70, 'tr', 132)]),
  C('gaz', 'Fıstıklı FK', 'FST', ['#bc4749', '#a7c957'], [G('2024/25', 71, 'tr', 113), G('2010/11', 73, 'tr', 133)]),
  C('ala', 'Güneşkent SK', 'GNK', ['#3d405b', '#f2cc8f'], [G('2024/25', 71, 'tr', 114), G('2020/21', 73, 'tr', 134)]),
];
const CN: Club[] = [
  C('shp', 'Lotus Bay', 'LTB', ['#81b29a', '#3d405b'], [
    G('2024', 73, 'cn', 971),
    G('2018', 77, 'cn', 972),
  ], '莲湾'),
  C('sdt', 'Jade Peak', 'JDP', ['#e07a5f', '#3d405b'], [
    G('2024', 71, 'cn', 973),
    G('2021', 75, 'cn', 974),
  ], '玉峰'),
  C('shs', 'Blue River', 'BLR', ['#2a9d8f', '#264653'], [
    G('2024', 72, 'cn', 975),
    G('2003', 73, 'cn', 976),
  ], '蓝河'),
  C('cdr', 'Bamboo Grove', 'BMG', ['#f4a261', '#2a9d8f'], [
    G('2024', 70, 'cn', 977),
    G('2011', 65, 'cn', 206),
  ], '竹林'),
  C('bjg', 'North Gate', 'NTG', ['#4361ee', '#f72585'], [
    G('2024', 70, 'cn', 978),
    G('2009', 73, 'cn', 979),
  ], '北门'),
  C('gze', 'Southwind', 'STW', ['#7209b7', '#4cc9f0'], [
    G('2013', 77, 'cn', 980),
    G('2015', 79, 'cn', 981),
    G('2024', 62, 'cn', 207),
  ], '南风'),
  C('dlp', 'Seaside Stars', 'SSS', ['#3a0ca3', '#ffbe0b'], [
    G('2002', 74, 'cn', 982),
    G('2024', 63, 'cn', 208),
  ], '海星'),
  C('jss', 'Morning Sun', 'MNS', ['#fb5607', '#3a86ff'], [
    G('2020', 74, 'cn', 983),
    G('2016', 70, 'cn', 209),
  ], '朝阳'),
  C('hbf', 'Golden Field', 'GLF', ['#ff006e', '#8338ec'], [
    G('2017', 74, 'cn', 984),
    G('2022', 60, 'cn', 210),
  ], '金田'),
  C('tjt', 'Iron Bridge', 'IRB', ['#588157', '#dad7cd'], [G('2024', 67, 'cn', 201), G('2018', 70, 'cn', 211)], '铁桥'),
  C('wht', 'Crane Tower', 'CRT', ['#a3b18a', '#344e41'], [G('2024', 68, 'cn', 202), G('2022', 72, 'cn', 212)], '鹤楼'),
  C('zjg', 'Silk Road', 'SLR', ['#6d597a', '#e56b6f'], [G('2024', 67, 'cn', 203), G('2010', 66, 'cn', 213)], '丝路'),
  C('hns', 'Yellow River', 'YLR', ['#355070', '#eaac8b'], [G('2024', 66, 'cn', 204), G('2009', 67, 'cn', 214)], '黄河'),
  C('ccy', 'Snow Pine', 'SNP', ['#b56576', '#355070'], [G('2024', 65, 'cn', 205), G('2007', 70, 'cn', 215)], '雪松'),
  C('qdb', 'Harbour Lights', 'HBL', ['#22577a', '#80ed99'], [G('2024', 65, 'cn', 216), G('2012', 64, 'cn', 217)], '港灯'),
  C('mzk', 'Hakka Hills', 'HKH', ['#38a3a5', '#22577a'], [G('2024', 65, 'cn', 218), G('2021', 64, 'cn', 219)], '客山'),
  C('ntc', 'Cloud Gate', 'CLG', ['#c44536', '#197278'], [G('2024', 64, 'cn', 220), G('2020', 62, 'cn', 221)], '云门'),
  C('szr', 'Ruby Coast', 'RBC', ['#283d3b', '#edddd4'], [G('2004', 69, 'cn', 222), G('2019', 66, 'cn', 223)], '红岸'),
];

export const LEAGUES: Record<LeagueId, { name: [string, string, string]; cup: [string, string, string]; clubs: Club[] }> = {
  giants: { ...LEAGUE_NAMES.giants, clubs: GIANTS },
  tr: { ...LEAGUE_NAMES.tr, clubs: TR },
  cn: { ...LEAGUE_NAMES.cn, clubs: CN },
};
/** A drawn team is a club in one season: "rma@1" is that club's second season. */
export interface Team { club: Club; season: Season; key: string }
export function teamOf(key: string): Team | undefined {
  const [id, k] = key.split('@');
  for (const l of Object.values(LEAGUES)) { const c = l.clubs.find(x => x.id === id); if (c) return { club: c, season: c.seasons[+k] ?? c.seasons[0], key }; }
  return undefined;
}
export const teamsOf = (league: LeagueId): string[] => LEAGUES[league].clubs.flatMap(c => c.seasons.map((_, k) => `${c.id}@${k}`));
