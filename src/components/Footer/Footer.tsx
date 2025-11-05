import type { JSX } from "react";
import styles from "./Footer.module.scss";

export type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterProps = {
  brand?: string;
  year?: number;
  links?: FooterLink[];
};

export default function Footer({
  brand = "YourBrand",
  year = new Date().getFullYear(),
  links = [],
}: FooterProps): JSX.Element {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {links.length > 0 && (
          <nav className={styles.nav} aria-label="Footer navigation">
            {links.map((l) => (
              <a
                key={l.href + l.label}
                className={styles.link}
                href={l.href}
                target={l.external ? "_blank" : undefined}
                rel={l.external ? "noopener noreferrer" : undefined}
              >
                {l.label}
              </a>
            ))}
          </nav>
        )}

        <div className={styles.meta}>
          <span>
            © {year} {brand}
          </span>
        </div>
      </div>
    </footer>
  );
}
