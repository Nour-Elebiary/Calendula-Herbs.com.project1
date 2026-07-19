const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

const LOCALES = ['ar','bg','de','el','es','fr','hi','it','ja','ko','nl','pt-BR','ru','tr','uk','zh-CN']

const NAMES = {
  'Lemongrass':               { ar:'عشبة الليمون', bg:'Лимонова трева', de:'Zitronengras', el:'Λεμονόχορτο', es:'Hierba de limón', fr:'Citronnelle', hi:'नींबू घास', it:'Citronella', ja:'レモングラス', ko:'레몬그라스', nl:'Citroengras', ptBR:'Capim-limão', ru:'Лемонграсс', tr:'Limon Otu', uk:'Лимонна трава', zhCN:'柠檬草' },
  'Alfalfa':                  { ar:'البرسيم', bg:'Люцерна', de:'Luzerne', el:'Μηδική', es:'Alfalfa', fr:'Luzerne', hi:'अल्फाल्फा', it:'Erba medica', ja:'アルファルファ', ko:'알팔파', nl:'Luzerne', ptBR:'Alfafa', ru:'Люцерна', tr:'Yonca', uk:'Люцерна', zhCN:'苜蓿' },
  'Basil':                    { ar:'الريحان', bg:'Босилек', de:'Basilikum', el:'Βασιλικός', es:'Albahaca', fr:'Basilic', hi:'तुलसी', it:'Basilico', ja:'バジル', ko:'바질', nl:'Basilicum', ptBR:'Manjericão', ru:'Базилик', tr:'Fesleğen', uk:'Базилік', zhCN:'罗勒' },
  'Calendula Flowers':        { ar:'أزهار الآذريون', bg:'Невен', de:'Ringelblumen', el:'Καλέντουλα', es:'Caléndula', fr:'Souci', hi:'कैलेंडुला', it:'Calendula', ja:'カレンデュラ', ko:'칼렌듈라', nl:'Goudsbloem', ptBR:'Calêndula', ru:'Календула', tr:'Aynısafa', uk:'Календула', zhCN:'金盏花' },
  'Chamomile Flowers':        { ar:'أزهار البابونج', bg:'Лайка', de:'Kamille', el:'Χαμομήλι', es:'Manzanilla', fr:'Camomille', hi:'कैमोमाइल', it:'Camomilla', ja:'カモミール', ko:'카모마일', nl:'Kamille', ptBR:'Camomila', ru:'Ромашка', tr:'Papatya', uk:'Ромашка', zhCN:'洋甘菊' },
  'Cilantro (Coriander Leaves)': { ar:'كزبرة', bg:'Кориандър (листа)', de:'Koriander (Blätter)', el:'Κολίανδρος (φύλλα)', es:'Cilantro', fr:'Coriandre (feuilles)', hi:'धनिया (पत्ते)', it:'Coriandolo (foglie)', ja:'コリアンダー（葉）', ko:'고수 (잎)', nl:'Koriander (blad)', ptBR:'Coentro (folhas)', ru:'Кинза (листья)', tr:'Kişniş (yaprak)', uk:'Кінза (листя)', zhCN:'香菜（叶）' },
  'Dill':                     { ar:'الشبت', bg:'Копър', de:'Dill', el:'Άνηθος', es:'Eneldo', fr:'Aneth', hi:'सोआ', it:'Aneto', ja:'ディル', ko:'딜', nl:'Dille', ptBR:'Endro', ru:'Укроп', tr:'Dereotu', uk:'Кріп', zhCN:'莳萝' },
  'Hibiscus':                 { ar:'الكركديه', bg:'Хибискус', de:'Hibiskus', el:'Ιβίσκος', es:'Hibisco', fr:'Hibiscus', hi:'गुड़हल', it:'Ibisco', ja:'ハイビスカス', ko:'히비스커스', nl:'Hibiscus', ptBR:'Hibisco', ru:'Гибискус', tr:'Hibiskus', uk:'Гібіскус', zhCN:'木槿' },
  'Molokhia':                 { ar:'الملوخية', bg:'Молохия', de:'Molochia', el:'Μολόχια', es:'Molokhia', fr:'Molokhia', hi:'मोलोखिया', it:'Molokhia', ja:'モロヘイヤ', ko:'몰로키아', nl:'Molokhia', ptBR:'Molokhia', ru:'Молохия', tr:'Molohiya', uk:'Молохія', zhCN:'埃及锦葵' },
  'Leek':                     { ar:'الكراث', bg:'Праз', de:'Lauch', el:'Πράσο', es:'Puerro', fr:'Poireau', hi:'हरा प्याज़', it:'Porro', ja:'リーキ', ko:'리크', nl:'Prei', ptBR:'Alho-poró', ru:'Лук-порей', tr:'Pırasa', uk:'Цибуля-порей', zhCN:'韭葱' },
  'Lemon Balm':               { ar:'ميليسا', bg:'Маточина', de:'Zitronenmelisse', el:'Μελισσόχορτο', es:'Melisa', fr:'Mélisse', hi:'लेमन बाम', it:'Melissa', ja:'レモンバーム', ko:'레몬밤', nl:'Citroenmelisse', ptBR:'Erva-cidreira', ru:'Мелисса', tr:'Oğul otu', uk:'Меліса', zhCN:'蜜蜂花' },
  'Lemon Verbena':            { ar:'لويزة', bg:'Върбинка', de:'Zitronenverbene', el:'Λουίζα', es:'Hierba luisa', fr:'Verveine citronnée', hi:'लेमन वरबीना', it:'Verbena odorosa', ja:'レモンバーベナ', ko:'레몬버베나', nl:'Citroenverbena', ptBR:'Lúcia-lima', ru:'Лимонная вербена', tr:'Limon mine', uk:'Лимонна вербена', zhCN:'柠檬马鞭草' },
  'Licorice':                 { ar:'عرق السوس', bg:'Сладък корен', de:'Süßholz', el:'Γλυκόριζα', es:'Regaliz', fr:'Réglisse', hi:'मुलेठी', it:'Liquirizia', ja:'甘草', ko:'감초', nl:'Zoethout', ptBR:'Alcaçuz', ru:'Солодка', tr:'Meyan kökü', uk:'Солодка', zhCN:'甘草' },
  'Marjoram':                 { ar:'البردقوش', bg:'Мащерка (риган)', de:'Majoran', el:'Μαντζουράνα', es:'Mejorana', fr:'Marjolaine', hi:'मार्जोरम', it:'Maggiorana', ja:'マジョラム', ko:'마조람', nl:'Marjolein', ptBR:'Manjerona', ru:'Майоран', tr:'Mercanköşk', uk:'Майоран', zhCN:'马郁兰' },
  'Mint Leaves - Peppermint': { ar:'نعناع فلفلي', bg:'Мента', de:'Pfefferminze', el:'Μέντα (δυόσμος)', es:'Menta piperita', fr:'Menthe poivrée', hi:'पुदीना', it:'Menta piperita', ja:'ペパーミント', ko:'페퍼민트', nl:'Pepermunt', ptBR:'Hortelã-pimenta', ru:'Мята перечная', tr:'Nane', uk:'М\u2019ята перцева', zhCN:'薄荷' },
  'Mint Leaves - Spearmint':  { ar:'نعناع مدبب', bg:'Джоджен', de:'Grüne Minze', el:'Δυόσμος', es:'Hierbabuena', fr:'Menthe verte', hi:'स्पीयरमिंट', it:'Menta verde', ja:'スペアミント', ko:'스피어민트', nl:'Munts', ptBR:'Hortelã-verde', ru:'Мята колосистая', tr:'Kıvırcık nane', uk:'М\u2019ята кучерява', zhCN:'绿薄荷' },
  'Moringa Leaves':           { ar:'أوراق المورينجا', bg:'Моринга', de:'Moringa-Blätter', el:'Μορίνγκα', es:'Moringa', fr:'Moringa', hi:'मोरिंगा', it:'Moringa', ja:'モリンガ', ko:'모링가', nl:'Moringa', ptBR:'Moringa', ru:'Моринга', tr:'Moringa', uk:'Моринга', zhCN:'辣木叶' },
  'Nettle Leaves':            { ar:'أوراق القراص', bg:'Коприва', de:'Brennnessel-Blätter', el:'Τσουκνίδα', es:'Ortiga', fr:'Ortie', hi:'बिच्छू बूटी', it:'Ortica', ja:'イラクサ', ko:'쐐기풀', nl:'Brandnetel', ptBR:'Urtiga', ru:'Крапива', tr:'Isırgan otu', uk:'Кропива', zhCN:'荨麻叶' },
  'Oregano':                  { ar:'الأوريجانو', bg:'Риган', de:'Oregano', el:'Ρίγανη', es:'Orégano', fr:'Origan', hi:'अजवायन', it:'Origano', ja:'オレガノ', ko:'오레가노', nl:'Oregano', ptBR:'Orégano', ru:'Орегано', tr:'Yabani kekik', uk:'Орегано', zhCN:'牛至' },
  'Rose':                     { ar:'الورد', bg:'Роза', de:'Rose', el:'Τριαντάφυλλο', es:'Rosa', fr:'Rose', hi:'गुलाब', it:'Rosa', ja:'ローズ', ko:'장미', nl:'Roos', ptBR:'Rosa', ru:'Роза', tr:'Gül', uk:'Троянда', zhCN:'玫瑰' },
  'Rosemary':                 { ar:'إكليل الجبل', bg:'Розмарин', de:'Rosmarin', el:'Δενδρολίβανο', es:'Romero', fr:'Romarin', hi:'रोज़मेरी', it:'Rosmarino', ja:'ローズマリー', ko:'로즈마리', nl:'Rozemarijn', ptBR:'Alecrim', ru:'Розмарин', tr:'Biberiye', uk:'Розмарин', zhCN:'迷迭香' },
  'Sage':                     { ar:'المريمية', bg:'Градински чай', de:'Salbei', el:'Φασκόμηλο', es:'Salvia', fr:'Sauge', hi:'ऋषि', it:'Salvia', ja:'セージ', ko:'세이지', nl:'Salie', ptBR:'Sálvia', ru:'Шалфей', tr:'Adaçayı', uk:'Шавлія', zhCN:'鼠尾草' },
  'Senna':                    { ar:'السنامكي', bg:'Сена', de:'Sennes', el:'Σέννα', es:'Sen', fr:'Séné', hi:'सेन्ना', it:'Sena', ja:'センナ', ko:'센나', nl:'Senna', ptBR:'Sene', ru:'Сенна', tr:'Sinameki', uk:'Сенна', zhCN:'番泻叶' },
  'Thyme':                    { ar:'الزعتر', bg:'Мащерка', de:'Thymian', el:'Θυμάρι', es:'Tomillo', fr:'Thym', hi:'थाइम', it:'Timo', ja:'タイム', ko:'타임', nl:'Tijm', ptBR:'Tomilho', ru:'Тимьян', tr:'Kekik', uk:'Чебрець', zhCN:'百里香' },
  'Aniseed':                  { ar:'اليانسون', bg:'Анасон', de:'Anis', el:'Γλυκάνισο', es:'Anís', fr:'Anis', hi:'अनीस', it:'Anice', ja:'アニス', ko:'아니스', nl:'Anijs', ptBR:'Anis', ru:'Анис', tr:'Anason', uk:'Аніс', zhCN:'八角' },
  'Caraway':                  { ar:'الكراوية', bg:'Ким', de:'Kümmel', el:'Κύμινο (καρό)', es:'Alcaravea', fr:'Carvi', hi:'शाही जीरा', it:'Carvi', ja:'キャラウェイ', ko:'캐러웨이', nl:'Karwij', ptBR:'Alcarávia', ru:'Тмин', tr:'Karaman kimyonu', uk:'Кмин', zhCN:'葛缕子' },
  'Coriander Seeds':          { ar:'بذور الكزبرة', bg:'Семена от кориандър', de:'Koriandersamen', el:'Σπόροι κολίανδρου', es:'Semillas de cilantro', fr:'Graines de coriandre', hi:'धनिया बीज', it:'Semi di coriandolo', ja:'コリアンダーシード', ko:'고수 씨앗', nl:'Korianderzaad', ptBR:'Sementes de coentro', ru:'Семена кориандра', tr:'Kişniş tohumu', uk:'Насіння кінзи', zhCN:'香菜籽' },
  'Cumin':                    { ar:'الكمون', bg:'Кимион', de:'Kreuzkümmel', el:'Κύμινο', es:'Comino', fr:'Cumin', hi:'जीरा', it:'Cumino', ja:'クミン', ko:'커민', nl:'Komijn', ptBR:'Cominho', ru:'Зира', tr:'Kimyon', uk:'Кмин (зіра)', zhCN:'孜然' },
  'Fennel':                   { ar:'الشمر', bg:'Резене', de:'Fenchel', el:'Μάραθο', es:'Hinojo', fr:'Fenouil', hi:'सौंफ', it:'Finocchio', ja:'フェンネル', ko:'회향', nl:'Venkel', ptBR:'Funcho', ru:'Фенхель', tr:'Rezene', uk:'Фенхель', zhCN:'茴香' },
  'Fenugreek':                { ar:'الحلبة', bg:'Сминдух', de:'Bockshornklee', el:'Τριγωνίσκη', es:'Fenogreco', fr:'Fenugrec', hi:'मेथी', it:'Fieno greco', ja:'フェヌグリーク', ko:'호로파', nl:'Fenegriek', ptBR:'Feno grego', ru:'Пажитник', tr:'Çemen otu', uk:'Пажитник', zhCN:'葫芦巴' },
  'Nigella':                  { ar:'حبة البركة', bg:'Черен кимион', de:'Schwarzkümmel', el:'Νιγκέλα', es:'Nigella', fr:'Nigelle', hi:'कालौंजी', it:'Nigella', ja:'ニゲラ', ko:'니겔라', nl:'Nigelle', ptBR:'Nigela', ru:'Чернушка', tr:'Çörek otu', uk:'Чорнушка', zhCN:'黑种草' },
  'Sesame':                   { ar:'السمسم', bg:'Сусам', de:'Sesam', el:'Σουσάμι', es:'Sésamo', fr:'Sésame', hi:'तिल', it:'Sesamo', ja:'ゴマ', ko:'참깨', nl:'Sesamzaad', ptBR:'Gergelim', ru:'Кунжут', tr:'Susam', uk:'Кунжут', zhCN:'芝麻' },
  'Flax':                     { ar:'الكتان', bg:'Лен', de:'Leinsamen', el:'Λινάρι', es:'Lino', fr:'Lin', hi:'अलसी', it:'Lino', ja:'亜麻', ko:'아마', nl:'Vlas', ptBR:'Linho', ru:'Лён', tr:'Keten', uk:'Льон', zhCN:'亚麻' },
  'Beet':                     { ar:'البنجر', bg:'Цвекло', de:'Rote Bete', el:'Παντζάρι', es:'Remolacha', fr:'Betterave', hi:'चुकंदर', it:'Barbabietola', ja:'ビーツ', ko:'비트', nl:'Biet', ptBR:'Beterraba', ru:'Свёкла', tr:'Pancar', uk:'Буряк', zhCN:'甜菜' },
  'Celery':                   { ar:'الكرفس', bg:'Целина', de:'Sellerie', el:'Σέλινο', es:'Apio', fr:'Céleri', hi:'अजवाइन', it:'Sedano', ja:'セロリ', ko:'셀러리', nl:'Selderij', ptBR:'Aipo', ru:'Сельдерей', tr:'Kereviz', uk:'Селера', zhCN:'芹菜' },
  'Chicory':                  { ar:'الهندباء', bg:'Цикория', de:'Zichorie', el:'Ραδίκι', es:'Achicoria', fr:'Chicorée', hi:'चिकोरी', it:'Cicoria', ja:'チコリ', ko:'치커리', nl:'Witlof', ptBR:'Chicória', ru:'Цикорий', tr:'Hindiba', uk:'Цикорій', zhCN:'菊苣' },
  'Chilli':                   { ar:'الشطة', bg:'Лют червен пипер', de:'Chili', el:'Τσίλι', es:'Chile', fr:'Piment', hi:'मिर्च', it:'Peperoncino', ja:'チリ', ko:'칠리', nl:'Chili', ptBR:'Pimenta', ru:'Чили', tr:'Kırmızı biber', uk:'Чилі', zhCN:'辣椒' },
  'Echinacea':                { ar:'إخناسيا', bg:'Ехинацея', de:'Sonnenhut', el:'Εχινάκεια', es:'Equinácea', fr:'Échinacée', hi:'इकिनेशिया', it:'Echinacea', ja:'エキナセア', ko:'에키네시아', nl:'Echinacea', ptBR:'Equinácea', ru:'Эхинацея', tr:'Ekinezya', uk:'Ехінацея', zhCN:'紫锥花' },
  'Garlic':                   { ar:'الثوم', bg:'Чесън', de:'Knoblauch', el:'Σκόρδο', es:'Ajo', fr:'Ail', hi:'लहसुन', it:'Aglio', ja:'ニンニク', ko:'마늘', nl:'Knoflook', ptBR:'Alho', ru:'Чеснок', tr:'Sarımsak', uk:'Часник', zhCN:'大蒜' },
  'Lemon':                    { ar:'الليمون', bg:'Лимон', de:'Zitrone', el:'Λεμόνι', es:'Limón', fr:'Citron', hi:'नींबू', it:'Limone', ja:'レモン', ko:'레몬', nl:'Citroen', ptBR:'Limão', ru:'Лимон', tr:'Limon', uk:'Лимон', zhCN:'柠檬' },
  'Olive Leaves':             { ar:'أوراق الزيتون', bg:'Маслинови листа', de:'Olivenblätter', el:'Φύλλα ελιάς', es:'Hojas de olivo', fr:'Feuilles d\'olivier', hi:'जैतून के पत्ते', it:'Foglie d\'olivo', ja:'オリーブの葉', ko:'올리브 잎', nl:'Olijfbladeren', ptBR:'Folhas de oliveira', ru:'Листья оливы', tr:'Zeytin yaprağı', uk:'Листя оливи', zhCN:'橄榄叶' },
  'Onion':                    { ar:'البصل', bg:'Лук', de:'Zwiebel', el:'Κρεμμύδι', es:'Cebolla', fr:'Oignon', hi:'प्याज़', it:'Cipolla', ja:'タマネギ', ko:'양파', nl:'Ui', ptBR:'Cebola', ru:'Лук', tr:'Soğan', uk:'Цибуля', zhCN:'洋葱' },
  'Orange Peel':              { ar:'قشر البرتقال', bg:'Портокалова кора', de:'Orangenschale', el:'Φλούδα πορτοκαλιού', es:'Cáscara de naranja', fr:'Écorce d\'orange', hi:'संतरे का छिलका', it:'Scorza d\'arancia', ja:'オレンジピール', ko:'오렌지 껍질', nl:'Sinaasappelschil', ptBR:'Casca de laranja', ru:'Апельсиновая корка', tr:'Portakal kabuğu', uk:'Апельсинова кірка', zhCN:'橙皮' },
  'Parsley':                  { ar:'البقدونس', bg:'Магданоз', de:'Petersilie', el:'Μαϊντανός', es:'Perejil', fr:'Persil', hi:'अजमोद', it:'Prezzemolo', ja:'パセリ', ko:'파슬리', nl:'Peterselie', ptBR:'Salsa', ru:'Петрушка', tr:'Maydanoz', uk:'Петрушка', zhCN:'欧芹' },
}

const CATEGORY_NAMES = {
  'Herbal Tea':   { ar:'شاي أعشاب', bg:'Билков чай', de:'Kräutertee', el:'Βότανο τσάι', es:'Té de hierbas', fr:'Tisane', hi:'हर्बल चाय', it:'Tisana', ja:'ハーブティー', ko:'허브차', nl:'Kruidenthee', ptBR:'Chá de ervas', ru:'Травяной чай', tr:'Bitki çayı', uk:'Трав\u2019яний чай', zhCN:'花草茶' },
  'Herbs':        { ar:'أعشاب', bg:'Билки', de:'Kräuter', el:'Βότανα', es:'Hierbas', fr:'Herbes', hi:'जड़ी-बूटियाँ', it:'Erbe', ja:'ハーブ', ko:'허브', nl:'Kruiden', ptBR:'Ervas', ru:'Травы', tr:'Otlar', uk:'Трави', zhCN:'草本' },
  'Spices':       { ar:'توابل', bg:'Подправки', de:'Gewürze', el:'Μπαχαρικά', es:'Especias', fr:'Épices', hi:'मसाले', it:'Spezie', ja:'スパイス', ko:'향신료', nl:'Specerijen', ptBR:'Especiarias', ru:'Специи', tr:'Baharatlar', uk:'Спеції', zhCN:'香料' },
  'Specialty':    { ar:'متخصص', bg:'Специални', de:'Spezialität', el:'Ειδικό', es:'Especialidad', fr:'Spécialité', hi:'विशेष', it:'Specialità', ja:'特産', ko:'스페셜티', nl:'Specialiteit', ptBR:'Especialidade', ru:'Специалитет', tr:'Özel', uk:'Спеціалітет', zhCN:'特產' },
  'Seeds':        { ar:'بذور', bg:'Семена', de:'Samen', el:'Σπόροι', es:'Semillas', fr:'Graines', hi:'बीज', it:'Semi', ja:'種子', ko:'씨앗', nl:'Zaden', ptBR:'Sementes', ru:'Семена', tr:'Tohumlar', uk:'Насіння', zhCN:'種子' },
}

const DESC_TEMPLATES = {
  en: { short: (n) => `Premium quality ${n} — grown in Egypt's fertile farms and processed to international standards.`, long: (n, s) => `Premium quality ${n} (${s}) sourced from Egypt's finest farms. Our ${n} is carefully cultivated, harvested at peak potency, and processed under strict quality controls to meet international standards. Available in conventional and organic variants. Custom cut sizes and packaging options available for B2B partners.` },
  ar: { short: (n) => `${n} عالية الجودة — تزرع في مزارع مصر الخصبة وتُعالج وفق المعايير الدولية.`, long: (n, s) => `${n} عالية الجودة (${s}) من أفضل مزارع مصر. تُزرع ${n} بعناية، وتُحصد في ذروة فعاليتها، وتُعالج تحت إشراف صارم لضمان الجودة وفق المعايير الدولية. متوفرة بأنواع تقليدية وعضوية. أحجام قطع وتغليف مخصصة للشركاء التجاريين.` },
  bg: { short: (n) => `Висококачествен ${n} — отгледан в плодородните ферми на Египет и обработен по международни стандарти.`, long: (n, s) => `Висококачествен ${n} (${s}) от най-добрите ферми в Египет. Нашият ${n} се отглежда внимателно, прибира се в пика на силата си и се обработва под строг контрол, за да отговаря на международните стандарти. Предлага се в конвенционални и био варианти. Възможни са персонализирани разфасовки и опаковки за B2B партньори.` },
  de: { short: (n) => `Premium-Qualität ${n} — angebaut auf Ägyptens fruchtbaren Farmen und nach internationalen Standards verarbeitet.`, long: (n, s) => `Premium-Qualität ${n} (${s}) von Ägyptens besten Farmen. Unser ${n} wird sorgfältig angebaut, zum Höhepunkt der Wirkkraft geerntet und unter strengen Qualitätskontrollen nach internationalen Standards verarbeitet. Erhältlich in konventionellen und Bio-Varianten. Kundenspezifische Schnittgrößen und Verpackungen für B2B-Partner.` },
  el: { short: (n) => `${n} ανώτερης ποιότητας — καλλιεργείται στα γόνιμα χωράφια της Αιγύπτου και επεξεργάζεται σύμφωνα με διεθνή πρότυπα.`, long: (n, s) => `${n} ανώτερης ποιότητας (${s}) από τα καλύτερα χωράφια της Αιγύπτου. Το ${n} μας καλλιεργείται προσεκτικά, συλλέγεται στη μέγιστη δραστικότητα και υφίσταται αυστηρούς ποιοτικούς ελέγχους πληρώντας τα διεθνή πρότυπα. Διατίθεται σε συμβατικές και βιολογικές ποικιλίες. Διαθέσιμες εξατομικευμένες κοπές και συσκευασίες για B2B συνεργάτες.` },
  es: { short: (n) => `${n} de calidad superior — cultivado en las fértiles tierras de Egipto y procesado según estándares internacionales.`, long: (n, s) => `${n} de calidad superior (${s}) obtenido de las mejores granjas de Egipto. Nuestro ${n} se cultiva cuidadosamente, se cosecha en su máximo potencial y se procesa bajo estrictos controles para cumplir con los estándares internacionales. Disponible en variedades convencionales y orgánicas. Cortes y empaques personalizados para socios B2B.` },
  fr: { short: (n) => `${n} de qualité supérieure — cultivé dans les fermes fertiles d'Égypte et transformé selon les normes internationales.`, long: (n, s) => `${n} de qualité supérieure (${s}) issu des meilleures fermes d'Égypte. Notre ${n} est soigneusement cultivé, récolté à son maximum de puissance et transformé sous des contrôles qualité stricts pour répondre aux normes internationales. Disponible en variétés conventionnelles et biologiques. Coupes et emballages personnalisés pour les partenaires B2B.` },
  hi: { short: (n) => `प्रीमियम गुणवत्ता वाला ${n} — मिस्र के उपजाऊ खेतों में उगाया गया और अंतरराष्ट्रीय मानकों पर संसाधित।`, long: (n, s) => `मिस्र के बेहतरीन खेतों से प्राप्त प्रीमियम गुणवत्ता वाला ${n} (${s})। हमारा ${n} सावधानीपूर्वक उगाया जाता है, अधिकतम क्षमता पर काटा जाता है, और अंतरराष्ट्रीय मानकों को पूरा करने के लिए सख्त गुणवत्ता नियंत्रण में संसाधित किया जाता है। पारंपरिक और जैविक किस्मों में उपलब्ध। B2B भागीदारों के लिए कस्टम कट और पैकेजिंग उपलब्ध।` },
  it: { short: (n) => `${n} di qualità premium — coltivato nelle fertili terre d'Egitto e lavorato secondo standard internazionali.`, long: (n, s) => `${n} di qualità premium (${s}) proveniente dalle migliori fattorie d'Egitto. Il nostro ${n} è coltivato con cura, raccolto al massimo della potenza e lavorato sotto severi controlli di qualità per soddisfare gli standard internazionali. Disponibile in varietà convenzionali e biologiche. Tagli e imballaggi personalizzati per partner B2B.` },
  ja: { short: (n) => `プレミアム品質の${n} — エジプトの肥沃な農場で栽培され、国際基準で加工されています。`, long: (n, s) => `エジプトの最高の農場から仕入れたプレミアム品質の${n}（${s}）。私たちの${n}は丁寧に栽培され、最大の効力で収穫され、国際基準を満たすよう厳格な品質管理の下で加工されています。従来種と有機種の両方をご用意。B2Bパートナー向けにカスタムカットと包装が可能です。` },
  ko: { short: (n) => `프리미엄 품질의 ${n} — 이집트 비옥한 농장에서 재배되어 국제 기준에 따라 가공되었습니다.`, long: (n, s) => `이집트 최고 농장에서 공급받은 프리미엄 품질의 ${n}(${s}). 당사의 ${n}은(는) 정성껏 재배되고, 최고 효능 시기에 수확되며, 국제 기준을 충족하도록 엄격한 품질 관리 하에 가공됩니다. 일반 및 유기농 변종으로 제공됩니다. B2B 파트너를 위한 맞춤형 절단 및 포장이 가능합니다.` },
  nl: { short: (n) => `Premium kwaliteit ${n} — geteeld op de vruchtbare boerderijen van Egypte en verwerkt volgens internationale normen.`, long: (n, s) => `Premium kwaliteit ${n} (${s}) afkomstig van de beste boerderijen van Egypte. Onze ${n} wordt zorgvuldig geteeld, geoogst op het hoogtepunt van potentie en verwerkt onder strikte kwaliteitscontroles om aan internationale normen te voldoen. Verkrijgbaar in conventionele en biologische varianten. Aangepaste sneden en verpakkingen beschikbaar voor B2B-partners.` },
  'pt-BR': { short: (n) => `${n} de qualidade premium — cultivado nas férteis fazendas do Egito e processado de acordo com os padrões internacionais.`, long: (n, s) => `${n} de qualidade premium (${s}) proveniente das melhores fazendas do Egito. Nosso ${n} é cuidadosamente cultivado, colhido no pico de potência e processado sob rigorosos controles de qualidade para atender aos padrões internacionais. Disponível em variedades convencionais e orgânicas. Cortes e embalagens personalizados para parceiros B2B.` },
  ru: { short: (n) => `${n} премиум-качества — выращен на плодородных фермах Египта и обработан по международным стандартам.`, long: (n, s) => `${n} премиум-качества (${s}) с лучших ферм Египта. Наш ${n} тщательно выращивается, собирается на пике активности и обрабатывается под строгим контролем качества в соответствии с международными стандартами. Доступен в обычных и органических вариантах. Возможны индивидуальные размеры и упаковка для B2B-партнёров.` },
  tr: { short: (n) => `Premium kalite ${n} — Mısır'ın verimli çiftliklerinde yetiştirilir ve uluslararası standartlarda işlenir.`, long: (n, s) => `Mısır'ın en iyi çiftliklerinden tedarik edilen premium kalite ${n} (${s}). ${n}imiz özenle yetiştirilir, en yüksek etki anında hasat edilir ve uluslararası standartları karşılamak için sıkı kalite kontrolleri altında işlenir. Geleneksel ve organik çeşitleri mevcuttur. B2B ortakları için özel kesim ve paketleme seçenekleri sunulmaktadır.` },
  uk: { short: (n) => `${n} преміум-якості — вирощений на родючих фермах Єгипту та оброблений за міжнародними стандартами.`, long: (n, s) => `${n} преміум-якості (${s}) з найкращих ферм Єгипту. Наш ${n} ретельно вирощується, збирається на піку активності та обробляється під суворим контролем якості відповідно до міжнародних стандартів. Доступний у звичайних та органічних варіантах. Індивідуальні нарізки та пакування для B2B-партнерів.` },
  'zh-CN': { short: (n) => `优质${n} — 在埃及肥沃的农场种植，按照国际标准加工。`, long: (n, s) => `来自埃及最优质农场的优质${n}（${s}）。我们的${n}经过精心栽培，在最佳效力期收获，并在严格的质量控制下按照国际标准加工。提供常规和有机品种。可为B2B合作伙伴提供定制切割尺寸和包装。` },
}

async function main() {
  const products = await db.product.findMany({ orderBy: { order: 'asc' } })
  console.log(`Found ${products.length} products`)

  const data = []
  for (const product of products) {
    const enName = product.name
    const sciName = product.scientificName || ''
    const nameData = NAMES[enName]
    if (!nameData) { console.warn(`Skip "${enName}" — no translations`); continue }

    for (const locale of LOCALES) {
      const locKey = locale.replace('-', '')
      const tName = nameData[locKey]
      if (!tName) { console.warn(`Skip ${locale} for "${enName}"`); continue }

      const tmpl = DESC_TEMPLATES[locale]
      data.push({
        productId: product.id,
        locale,
        name: tName,
        scientificName: sciName,
        commonName: tName,
        shortDescription: tmpl.short(tName),
        description: tmpl.long(tName, sciName),
      })
    }
  }

  console.log(`Generated ${data.length} translation records`)
  console.log('Deleting existing non-English translations...')
  const del = await db.productTranslation.deleteMany({ where: { locale: { not: 'en' } } })
  console.log(`Deleted ${del.count} existing records`)

  console.log('Bulk inserting translations...')
  const batchSize = 100
  let inserted = 0
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    await db.productTranslation.createMany({ data: batch })
    inserted += batch.length
    console.log(`  ${inserted}/${data.length}`)
  }

  console.log(`\nDone! ${inserted} translations inserted (${products.length} products x ${LOCALES.length} locales)`)

  // === Category translations ===
  const categories = await db.category.findMany()
  console.log(`\nFound ${categories.length} categories, seeding translations...`)

  const catData = []
  for (const cat of categories) {
    const nameData = CATEGORY_NAMES[cat.name]
    if (!nameData) { console.warn(`Skip category "${cat.name}" — no translations`); continue }

    for (const locale of LOCALES) {
      const locKey = locale.replace('-', '')
      const tName = nameData[locKey]
      if (!tName) { console.warn(`Skip ${locale} for category "${cat.name}"`); continue }
      catData.push({ categoryId: cat.id, locale, name: tName })
    }
  }

  if (catData.length > 0) {
    console.log(`Deleting existing non-English category translations...`)
    const delCats = await db.categoryTranslation.deleteMany({ where: { locale: { not: 'en' } } })
    console.log(`Deleted ${delCats.count} existing records`)

    console.log('Bulk inserting category translations...')
    let catInserted = 0
    for (let i = 0; i < catData.length; i += batchSize) {
      const batch = catData.slice(i, i + batchSize)
      await db.categoryTranslation.createMany({ data: batch })
      catInserted += batch.length
      console.log(`  ${catInserted}/${catData.length}`)
    }
    console.log(`\nDone! ${catInserted} category translations inserted (${categories.length} categories x ${LOCALES.length} locales)`)
  }
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
