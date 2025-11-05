// MainLayout.tsx
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Footer, { type FooterLink } from "../Footer/Footer";

const links: FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "", href: "https://github.com/yourorg", external: true },
];

export default function MainLayout() {
  return (
    <>
        <Header />
        <Outlet />
        <Footer brand="Mira" links={links} />
    </>
  );
}
