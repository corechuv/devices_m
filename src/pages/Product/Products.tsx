// src/pages/Products/Products.tsx
import "react";
import cls from "./Products.module.scss";

type Product = {
  id: string;
  name: string;
  image: string;      // путь в /public
  price: number;      // текущая цена (EUR)
  oldPrice?: number;  // старая цена (EUR), если есть
};

const products: Product[] = [
  {
    id: "diode-808-pro",
    name: "Title",
    image: "/products/g.png",
    price: 1990,
    oldPrice: 2390,
  },
  {
    id: "co2-fractional",
    name: "Title",
    image: "/products/co2-fractional.jpg",
    price: 4990,
    oldPrice: 5990,
  },
  {
    id: "ndyag-1064-532",
    name: "Title",
    image: "/products/ndyag-1064-532.jpg",
    price: 3290,
    oldPrice: 3790,
  },
  {
    id: "alex-755",
    name: "Title",
    image: "/products/alex-755.jpg",
    price: 6900,
    oldPrice: 7900,
  },
  {
    id: "pico-ultimate",
    name: "Title",
    image: "/products/pico-ultimate.jpg",
    price: 9800,
    oldPrice: 11500,
  },
  {
    id: "ipl-expert",
    name: "Title",
    image: "/products/ipl-expert.jpg",
    price: 1790,
    oldPrice: 2190,
  },
  {
    id: "hybrid-diode-yag",
    name: "Title",
    image: "/products/hybrid-diode-yag.jpg",
    price: 5400,
    oldPrice: 6200,
  },
  {
    id: "diode-compact",
    name: "Title",
    image: "/products/diode-compact.jpg",
    price: 1490,
    oldPrice: 1790,
  },
];

const placeholderSvg =
  `data:image/svg+xml;utf8,` +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='#e9eef5'/>
          <stop offset='100%' stop-color='#f7f9fc'/>
        </linearGradient>
      </defs>
      <rect width='100%' height='100%' fill='url(#g)'/>
      <g fill='#9aa6b2' font-family='system-ui, -apple-system, Segoe UI, Roboto' text-anchor='middle'>
        <text x='50%' y='50%' font-size='24' font-weight='600'>Bild fehlt</text>
      </g>
    </svg>`
  );

// Форматирование по-немецки с символом EUR
function formatPrice(num: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    // maximumFractionDigits: 0, // убрать копейки, если не нужны
  }).format(num);
}

function discountPercent(price: number, oldPrice?: number) {
  if (!oldPrice || oldPrice <= price) return null;
  const p = Math.round(100 - (price / oldPrice) * 100);
  return p > 0 ? p : null;
}

export default function Products() {
  return (
    <div className={cls.content}>
      <h2 className={cls.content__title}>Catalog</h2>
      <ul className={cls.grid} role="list" aria-label="Список оборудования">
        {products.map((p) => {
          const d = discountPercent(p.price, p.oldPrice);
          return (
            <li key={p.id} className={cls.card} role="listitem" tabIndex={0}>
              <div className={cls.imageWrap}>
                {d && <span className={cls.discountBadge}>−{d}%</span>}
                <img
                  className={cls.image}
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.src = placeholderSvg;
                    img.onerror = null;
                  }}
                />
              </div>

              <div className={cls.body}>
                <h3 className={cls.title}>{p.name}</h3>

                <div className={cls.prices} aria-label="Preis">
                  <span className={cls.priceCurrent}>{formatPrice(p.price)}</span>
                  {p.oldPrice && p.oldPrice > p.price && (
                    <span className={cls.priceOld}>{formatPrice(p.oldPrice)}</span>
                  )}
                </div>

                {/* при желании можно показать пометку для DE:
                <div className={cls.note}>inkl. MwSt.</div>
                */}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
