import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Air Hockey', zh: '桌上冰球', tr: 'Hava Hokeyi', pinyin: 'zhuōshang bīngqiú' },
  en: {
    summary: 'A puck floats on a cushion of air; knock it into the other goal with your mallet. First to seven.',
    history: 'Air hockey was developed in the late 1960s by engineers at the Brunswick billiards company, who borrowed the idea of a table blowing air through tiny holes so a puck glides with almost no friction. Tables spread to arcades in the 1970s, and the game now has its own championships, where shots are faster than the eye can follow.',
    rules: ['Each player has a mallet and stays in their own half of the table.', 'Hit the puck into the slot at the far end to score a goal. First to seven goals wins.', 'After a goal the puck goes to the player who conceded.', 'The puck bounces off the side walls; the mallets give it speed when they hit it moving.'],
    basics: ['Keep your mallet between the puck and your goal when you are not attacking.', 'Hit the puck while your mallet is moving: a standing mallet only blocks.', 'Bank shots off the side walls are hard to read and harder to stop.'],
    advanced: ['Strike from behind the puck in a straight line through it towards where you want it to go.', 'Wait for the puck to slow on your side before attacking; a rushed shot is easy to block.', 'Against the stronger players here, change angles: a straight shot is what they defend first.'],
    mistakes: ['Chasing the puck into the corner and leaving the goal open.', 'Hitting every puck as hard as possible, so it comes straight back.'],
  },
  zh: {
    summary: '冰球浮在一层气垫上；用球拍把它打进对方球门。先进七球者胜。',
    history: '桌上冰球由布伦瑞克台球公司的工程师在20世纪60年代末研制出来：他们借用了让空气从小孔吹出的台面，使冰球几乎无摩擦地滑行。70年代球桌进入游戏厅，如今这项游戏已有自己的锦标赛，高手的击球快得肉眼难以看清。',
    rules: ['每人一个球拍，只能在自己的半场活动。', '把冰球打进对面尽头的球门即得一分，先进七球者胜。', '进球后，冰球交给失球的一方。', '冰球会从边墙反弹；球拍边移动边击球时会让冰球加速。'],
    basics: ['不进攻时，让球拍挡在冰球和自己的球门之间。', '球拍移动时击球：静止的球拍只能挡。', '借边墙反弹的球难以判断，更难拦截。'],
    advanced: ['从冰球后方沿直线穿过它，朝想去的方向击打。', '等冰球在自己半场慢下来再进攻；仓促的射门很容易被挡住。', '面对这里较强的对手要变换角度：直线球是他们最先防守的。'],
    mistakes: ['追着冰球跑到角落，把球门空了出来。', '每一球都用尽全力，结果球直接弹回来。'],
  },
  tr: {
    summary: 'Pul bir hava yastığının üstünde kayar; tokmağınla onu karşı kaleye sok. Yedi gole ilk ulaşan kazanır.',
    history: 'Hava hokeyi 1960’ların sonunda Brunswick bilardo şirketinin mühendisleri tarafından geliştirildi; küçük deliklerden hava üfleyen bir masa sayesinde pul neredeyse sürtünmesiz kayıyordu. Masalar 1970’lerde oyun salonlarına yayıldı; bugün oyunun, şutların gözle izlenemeyecek kadar hızlı olduğu kendi şampiyonaları var.',
    rules: ['Her oyuncunun bir tokmağı vardır ve kendi yarı sahasında kalır.', 'Pulu karşı uçtaki kaleye sokmak gol demektir. Yedi gole ilk ulaşan kazanır.', 'Golden sonra pul gol yiyen oyuncuya verilir.', 'Pul yan duvarlardan seker; tokmak hareket ederken vurursa pulu hızlandırır.'],
    basics: ['Hücum etmediğinde tokmağını pulla kalen arasında tut.', 'Tokmak hareket hâlindeyken vur: duran tokmak yalnızca keser.', 'Yan duvardan sektirilen şutları okumak zor, durdurmak daha da zordur.'],
    advanced: ['Pulun arkasından, onu gitmesini istediğin yöne doğru düz bir çizgide vur.', 'Hücumdan önce pulun senin yarında yavaşlamasını bekle; aceleyle atılan şut kolay kesilir.', 'Buradaki güçlü rakiplere karşı açı değiştir: ilk savundukları düz şuttur.'],
    mistakes: ['Pulu köşeye kadar kovalayıp kaleyi boş bırakmak.', 'Her pula olabildiğince sert vurmak; o zaman pul dosdoğru geri gelir.'],
  },
};
