import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Tangram', tr: 'Tangram', zh: '七巧板', trad: '七巧板', pinyin: 'qīqiǎobǎn' },
  en: {
    summary: 'Arrange seven flat pieces, cut from one square, to fill a silhouette exactly.',
    history: 'The tangram grew out of earlier Chinese furniture puzzles: in the Song dynasty Huang Bosi described "banquet tables" that could be arranged in many shapes, and in the Ming dynasty Ge Shan made a set of triangular tables in the same spirit. The seven-piece form appears in Chinese books by the early nineteenth century, and the first known tangram book, published in 1813, collected hundreds of figures. Trading ships carried it to Europe and America the same decade, where it became a craze.',
    culture: 'In Chinese it is "seven clever boards", and it is also called zhìhuì bǎn, "wisdom boards". Its pieces were traditionally made of wood, ivory or lacquer, and solving figures was a pastime for scholars and families alike. Many classic figures show people, animals, boats and buildings from everyday life, and some sets were used to compose Chinese characters. Teachers still use it worldwide to teach shapes, area and spatial thinking.',
    rules: [
      'Use all seven pieces: two large triangles, one medium triangle, two small triangles, a square and a parallelogram.',
      'Pieces may be moved, rotated and flipped, but must not overlap.',
      'The silhouette is filled when no gap is left and no piece sticks out.',
      'Tap a piece to rotate it by 45°. Flip the parallelogram with the Flip button. Drag to move; corners snap together when they come close.',
    ],
    basics: [
      'Place the two large triangles first. They cover half the area, and there are usually only a few places they can go.',
      'Look for sharp corners in the silhouette: a 45° point usually needs a triangle tip.',
      'The square and the parallelogram fit the odd steps and notches. Save them for last.',
    ],
    advanced: [
      'Two small triangles can replace the square, the parallelogram or the medium triangle, which helps when a shape almost fits.',
      'Edges come in two families: sides of 1, 2 and 4 units, and diagonal sides of √2 and 2√2. A gap with a √2 edge needs a piece with a √2 edge.',
      'Every silhouette here has at least one solution, but most have several. Any arrangement that fills it counts.',
    ],
    mistakes: ['Forcing a piece into a corner that it only nearly fits.', 'Forgetting that the parallelogram must sometimes be flipped.'],
  },
  zh: {
    summary: '用一块正方形切成的七块板，不重叠地拼满给定的剪影。',
    history: '七巧板源自更早的中国家具拼摆：宋代黄伯思在《燕几图》中描述了可以拼成多种形状的“燕几”，明代戈汕又按同样的思路设计了三角形的“蝶几”。到十九世纪初，七块板的形式已出现在中国书籍中，已知最早的七巧板图谱于1813年刊行，收录了数百幅图形。同一时期，商船把它带到欧洲和美洲，在那里掀起了一阵热潮。',
    culture: '七巧板也叫“智慧板”。传统的七巧板用木头、象牙或漆器制成，无论文人还是普通家庭都把拼图当作消遣。许多经典图形描绘的是日常生活中的人物、动物、船只和房屋，有些图谱还用它来拼汉字。今天世界各地的老师仍用它来教形状、面积和空间思维。',
    rules: [
      '七块全部用上：两个大三角形、一个中三角形、两个小三角形、一个正方形和一个平行四边形。',
      '板块可以移动、旋转和翻转，但不能重叠。',
      '没有空隙、也没有板块露出剪影时，就拼好了。',
      '点击板块旋转45°；用“翻转”按钮翻转平行四边形；拖动来移动，角靠近时会自动对齐。',
    ],
    basics: [
      '先放两个大三角形。它们占了一半面积，通常能放的位置也不多。',
      '找剪影里的尖角：45°的尖角通常需要三角形的顶点。',
      '正方形和平行四边形适合填台阶和缺口，留到最后放。',
    ],
    advanced: [
      '两个小三角形可以代替正方形、平行四边形或中三角形，形状差一点就能拼上时很有用。',
      '边长分两类：1、2、4个单位的直边，以及√2、2√2的斜边。有√2边的空缺，需要一块有√2边的板来填。',
      '这里每个剪影至少有一种解法，大多数有好几种。只要能拼满就算成功。',
    ],
    mistakes: ['把板块硬塞进只是“差不多”合适的角落。', '忘了平行四边形有时需要翻转。'],
  },
  tr: {
    summary: 'Tek bir kareden kesilmiş yedi düz parçayı bir silueti tam dolduracak şekilde yerleştir.',
    history: 'Tangram daha eski Çin mobilya bulmacalarından doğdu: Song hanedanlığında Huang Bosi birçok şekilde dizilebilen “ziyafet masaları” anlattı; Ming hanedanlığında Ge Shan aynı ruhla üçgen masalardan bir takım yaptı. Yedi parçalı biçim on dokuzuncu yüzyılın başında Çin kitaplarında görülür; bilinen ilk tangram kitabı 1813’te yayımlandı ve yüzlerce figür topladı. Ticaret gemileri onu aynı on yıl içinde Avrupa’ya ve Amerika’ya taşıdı ve orada bir çılgınlığa dönüştü.',
    culture: 'Çincede adı “yedi akıllı tahta”dır; zhìhuì bǎn, yani “bilgelik tahtaları” diye de anılır. Parçaları geleneksel olarak tahta, fildişi ya da lakeden yapılırdı; figür çözmek hem âlimlerin hem ailelerin eğlencesiydi. Klasik figürlerin çoğu gündelik hayattan insanları, hayvanları, tekneleri ve binaları gösterir; bazı takımlar Çince karakterler oluşturmak için kullanıldı. Öğretmenler onu bugün hâlâ bütün dünyada şekilleri, alanı ve uzamsal düşünmeyi öğretmek için kullanır.',
    rules: [
      'Yedi parçanın hepsini kullan: iki büyük üçgen, bir orta üçgen, iki küçük üçgen, bir kare ve bir paralelkenar.',
      'Parçalar taşınabilir, döndürülebilir ve çevrilebilir ama üst üste binemez.',
      'Hiç boşluk kalmayıp hiçbir parça taşmadığında siluet dolmuş olur.',
      'Bir parçayı 45° döndürmek için ona dokun. Paralelkenarı Çevir düğmesiyle çevir. Taşımak için sürükle; köşeler yaklaşınca birbirine oturur.',
    ],
    basics: [
      'Önce iki büyük üçgeni yerleştir. Alanın yarısını kaplarlar ve genellikle gidebilecekleri yalnızca birkaç yer vardır.',
      'Siluetteki sivri köşelere bak: 45°’lik bir uç genellikle bir üçgen ucu ister.',
      'Kare ve paralelkenar tuhaf basamaklara ve çentiklere uyar. Onları sona sakla.',
    ],
    advanced: [
      'İki küçük üçgen kare, paralelkenar ya da orta üçgenin yerini tutabilir; bir şekil neredeyse oturduğunda işe yarar.',
      'Kenarlar iki aileden gelir: 1, 2 ve 4 birimlik kenarlar ile √2 ve 2√2’lik çapraz kenarlar. √2 kenarlı bir boşluk √2 kenarlı bir parça ister.',
      'Buradaki her siluetin en az bir çözümü vardır ama çoğunun birkaç çözümü vardır. Onu dolduran her dizilim geçerlidir.',
    ],
    mistakes: ['Bir parçayı ancak neredeyse uyduğu bir köşeye zorlamak.', 'Paralelkenarın bazen çevrilmesi gerektiğini unutmak.'],
  },
};
