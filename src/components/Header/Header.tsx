// components/header/Header.tsx
import { useLayoutEffect, useRef, useState } from "react";
import cls from "./Header.module.scss"
import LanguagePicker, { type LanguageCode } from "../LanguagePicker";


export interface HeaderProps {
    className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
    const ref = useRef<HTMLElement | null>(null);
    const [hh, setHh] = useState<number>(60);

    // высота шапки -> CSS-переменная
    useLayoutEffect(() => {
        if (!ref.current) return;
        const el = ref.current;
        const set = () => setHh(el.offsetHeight);
        set();
        const ro = new ResizeObserver(set);
        ro.observe(el);
        window.addEventListener("resize", set);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", set);
        };
    }, []);

    const [hidden, setHidden] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useLayoutEffect(() => {
        let lastY = Math.max(window.scrollY || 0, 0);
        let ticking = false;

        const onScroll = () => {
            const run = () => {
                const y = Math.max(window.scrollY || 0, 0);
                const delta = y - lastY;
                const threshold = 6; // отсечка мелких дерганий

                // тень после старта скролла
                setScrolled(y > 2);

                if (Math.abs(delta) > threshold) {
                    const goingDown = delta > 0;
                    // Прячем только когда идем вниз и уже ушли ниже высоты шапки,
                    // при скролле вверх — показываем.
                    if (goingDown && y > hh) {
                        setHidden(true);
                    } else {
                        setHidden(false);
                    }
                    lastY = y;
                }
                ticking = false;
            };

            if (!ticking) {
                ticking = true;
                requestAnimationFrame(run);
            }
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [hh]);

    const handleChange = (lang: LanguageCode) => {
        // тут ваша логика: сохранить в локалстор, i18n, API и т.п.
        console.log("Selected:", lang);
    };


    return (
        <>
            <header
                ref={ref}
                className={[
                    cls.header,
                    hidden ? cls.isHidden : "",
                    scrolled ? cls.withShadow : "",
                    className || "",
                ].join(" ")}
                style={{ ["--header-height" as any]: `${hh}px` }}
            >
                <nav className={cls.header__nav}>
                    <div className={cls.logo}>
                        <img src="/M_black.png" alt="logo-mira" className={cls.logo__img} />
                        <span className={cls.sl}>devices</span>
                    </div>
                    <div className={cls.f}>
                        <a href="/">Home</a>
                        <a href="/about">About</a>
                        <a href="/contact">Contact</a>

                        <LanguagePicker onChange={handleChange} defaultValue="en" />
                    </div>
                </nav>
            </header>
        </>
    );
};

export default Header;
