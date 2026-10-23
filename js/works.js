/* =========================================================
   ПОРТФОЛИО И ОТЗЫВЫ
   ---------------------------------------------------------
   Как добавить работу:
   1. Положите фото в папку  img/works/        (большое, до 1600 px)
      и уменьшенную копию в  img/works/thumb/  (около 720 px).
      Имена файлов — латиницей, без пробелов: kitchen-07.jpg
   2. Добавьте строку в список ниже, по образцу.
      cat  — раздел:  'kitchens'  — кухни
                      'wardrobes' — шкафы, гардеробные, прихожие
                      'kids'      — детские и рабочие зоны
      wide — поставьте  wide: true,  если фото горизонтальное.
             Такие фото сайт может показать на двойную ширину,
             чтобы в сетке не оставалось пустых мест.
   ========================================================= */
window.WORKS = [
  { file: 'kitchen-01.jpg',  cat: 'kitchens',  title: 'Кухня с островом' },
  { file: 'kitchen-06.jpg',  cat: 'kitchens',  title: 'Кухня с витриной-подсветкой и шкаф с рельефными фасадами', wide: true },
  { file: 'wardrobe-01.jpg', cat: 'wardrobes', title: 'Угловой шкаф с реечными фасадами' },
  { file: 'kitchen-03.jpg',  cat: 'kitchens',  title: 'Кухня цвета кашемир с барной стойкой' },
  { file: 'kids-01.jpg',     cat: 'kids',      title: 'Рабочая зона у окна и шкафы для хранения', wide: true },
  { file: 'kitchen-02.jpg',  cat: 'kitchens',  title: 'Белая кухня с витринами в чёрной раме' },
  { file: 'hall-01.jpg',     cat: 'wardrobes', title: 'Прихожая с зеркалами и подсветкой', wide: true },
  { file: 'kitchen-04.jpg',  cat: 'kitchens',  title: 'Светлая кухня с барной стойкой' },
  { file: 'wardrobe-02.jpg', cat: 'wardrobes', title: 'Шкаф на всю стену с классическими фасадами', wide: true },
  { file: 'kids-02.jpg',     cat: 'kids',      title: 'Стол вдоль окна и шкаф в детской' },
  { file: 'kitchen-05.jpg',  cat: 'kitchens',  title: 'Кухня с подсвеченными витринами' },
  { file: 'tv-01.jpg',       cat: 'wardrobes', title: 'Стенка с нишей под телевизор', wide: true },
  { file: 'walkin-01.jpg',   cat: 'wardrobes', title: 'Гардеробная система с ящиками' },
  { file: 'kids-03.jpg',     cat: 'kids',      title: 'Шкаф и рабочее место у окна' },
  { file: 'wardrobe-03.jpg', cat: 'wardrobes', title: 'Шкаф-купе с открытыми полками', wide: true },
];

/* Отзывы — скриншоты. Положите картинки в папку img/reviews/
   и перечислите их ниже, например:
   window.REVIEWS = ['review-01.jpg', 'review-02.jpg'];
   Пока список пуст, блок «Отзывы» на сайте не показывается. */
window.REVIEWS = [];
