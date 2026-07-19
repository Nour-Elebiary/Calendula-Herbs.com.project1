import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const messagesDir = join(__dirname, '..', 'src', 'messages');

const GALLERY_KEYS = {
  scrollLeft: { ar: 'التمرير لليسار', bg: 'Превъртете наляво', de: 'Nach links scrollen', el: 'Κύλιση αριστερά', es: 'Desplazar a la izquierda', fr: 'Défiler vers la gauche', hi: 'बाएँ स्क्रॉल करें', it: 'Scorri a sinistra', ja: '左にスクロール', ko: '왼쪽으로 스크롤', nl: 'Naar links scrollen', 'pt-BR': 'Rolar para a esquerda', ru: 'Прокрутить влево', tr: 'Sola kaydır', uk: 'Прокрутити вліво', 'zh-CN': '向左滚动' },
  scrollRight: { ar: 'التمرير لليمين', bg: 'Превъртете надясно', de: 'Nach rechts scrollen', el: 'Κύλιση δεξιά', es: 'Desplazar a la derecha', fr: 'Défiler vers la droite', hi: 'दाएँ स्क्रॉल करें', it: 'Scorri a destra', ja: '右にスクロール', ko: '오른쪽으로 스크롤', nl: 'Naar rechts scrollen', 'pt-BR': 'Rolar para a direita', ru: 'Прокрутить вправо', tr: 'Sağa kaydır', uk: 'Прокрутити вправо', 'zh-CN': '向右滚动' },
  closeLightbox: { ar: 'إغلاق النافذة', bg: 'Затваряне на светлинната кутия', de: 'Lightbox schließen', el: 'Κλείσιμο φωτεινού πλαισίου', es: 'Cerrar lightbox', fr: 'Fermer la visionneuse', hi: 'लाइटबॉक्स बंद करें', it: 'Chiudi lightbox', ja: 'ライトボックスを閉じる', ko: '라이트박스 닫기', nl: 'Lightbox sluiten', 'pt-BR': 'Fechar lightbox', ru: 'Закрыть лайтбокс', tr: 'Işık kutusunu kapat', uk: 'Закрити лайтбокс', 'zh-CN': '关闭灯箱' },
  previousImage: { ar: 'الصورة السابقة', bg: 'Предишно изображение', de: 'Vorheriges Bild', el: 'Προηγούμενη εικόνα', es: 'Imagen anterior', fr: 'Image précédente', hi: 'पिछली छवि', it: 'Immagine precedente', ja: '前の画像', ko: '이전 이미지', nl: 'Vorige afbeelding', 'pt-BR': 'Imagem anterior', ru: 'Предыдущее изображение', tr: 'Önceki görsel', uk: 'Попереднє зображення', 'zh-CN': '上一张图片' },
  nextImage: { ar: 'الصورة التالية', bg: 'Следващо изображение', de: 'Nächstes Bild', el: 'Επόμενη εικόνα', es: 'Siguiente imagen', fr: 'Image suivante', hi: 'अगली छवि', it: 'Immagine successiva', ja: '次の画像', ko: '다음 이미지', nl: 'Volgende afbeelding', 'pt-BR': 'Próxima imagem', ru: 'Следующее изображение', tr: 'Sonraki görsel', uk: 'Наступне зображення', 'zh-CN': '下一张图片' },
  galleryItemLabel: { ar: 'عنصر المعرض {index}', bg: 'Елемент от галерията {index}', de: 'Galerieeintrag {index}', el: 'Στοιχείο συλλογής {index}', es: 'Elemento de galería {index}', fr: 'Élément de galerie {index}', hi: 'गैलरी आइटम {index}', it: 'Elemento galleria {index}', ja: 'ギャラリー項目 {index}', ko: '갤러리 항목 {index}', nl: 'Galerij-item {index}', 'pt-BR': 'Item da galeria {index}', ru: 'Элемент галереи {index}', tr: 'Galeri öğesi {index}', uk: 'Елемент галереї {index}', 'zh-CN': '画廊项目 {index}' },
};

function jsonStringify(obj, indent = 2) {
  return JSON.stringify(obj, null, indent);
}

function addGalleryKeys(locale, content) {
  const parsed = JSON.parse(content);

  if (!parsed.galleries) {
    console.log(`⚠️  ${locale}: no "galleries" key, skipping`);
    return null;
  }

  const en = JSON.parse(readFileSync(join(messagesDir, 'en.json'), 'utf-8'));
  const enGalleryKeys = Object.keys(en.galleries).filter(k => k !== 'sections' && k !== 'heroTitle' && k !== 'heroDesc' && k !== 'heroMetadataTitle' && k !== 'heroMetadataDesc' && k !== 'empty' && k !== 'emptyDesc');

  let changed = false;
  for (const key of enGalleryKeys) {
    if (parsed.galleries[key] === undefined) {
      const translation = GALLERY_KEYS[key]?.[locale];
      if (translation) {
        parsed.galleries[key] = translation;
        changed = true;
        console.log(`  ✅ ${locale}: added galleries.${key}`);
      } else {
        console.log(`  ❌ ${locale}: no translation for galleries.${key}`);
      }
    }
  }

  if (!changed) {
    console.log(`  ℹ️  ${locale}: no missing keys`);
    return null;
  }

  return JSON.stringify(parsed, null, 2) + '\n';
}

function main() {
  const files = readdirSync(messagesDir).filter(f => f.endsWith('.json') && f !== 'en.json');

  for (const file of files) {
    const locale = file.replace('.json', '');
    console.log(`\n📁 ${file} (${locale}):`);
    const content = readFileSync(join(messagesDir, file), 'utf-8');
    const result = addGalleryKeys(locale, content);
    if (result) {
      writeFileSync(join(messagesDir, file), result, 'utf-8');
      console.log(`  ✅ Wrote ${file}`);
    }
  }

  console.log('\n✅ Done adding gallery keys');
}

main();
