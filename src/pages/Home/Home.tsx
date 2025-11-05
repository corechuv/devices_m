// src/pages/Home/Home.tsx
import "react";
import cls from "./Home.module.scss";
import Carousel from "../../components/UI/Carousel";
import BeautyCarousel from "../../components/BeautyCarousel";

export type CarouselItem = {
    id: string;
    src: string;
    alt: string;
    width: number;
    height: number;
};

export const items: CarouselItem[] = [
    {
        id: "1",
        src: "https://picsum.photos/id/1015/1600/900",
        alt: "Горы и озеро на рассвете",
        width: 1600,
        height: 900,
    },
    {
        id: "2",
        src: "https://picsum.photos/id/1016/1600/900",
        alt: "Скалистый утёс у океана",
        width: 1600,
        height: 900,
    },
    {
        id: "3",
        src: "https://picsum.photos/id/1025/1600/900",
        alt: "Собака в траве",
        width: 1600,
        height: 900,
    },
    {
        id: "4",
        src: "https://picsum.photos/id/1036/1600/900",
        alt: "Пин-лес в тумане",
        width: 1600,
        height: 900,
    },
    {
        id: "5",
        src: "https://picsum.photos/id/1043/1600/900",
        alt: "Тропинка среди холмов",
        width: 1600,
        height: 900,
    },
    {
        id: "6",
        src: "https://picsum.photos/id/1050/1600/900",
        alt: "Городской закат у воды",
        width: 1600,
        height: 900,
    },
    {
        id: "7",
        src: "https://picsum.photos/id/1057/1600/900",
        alt: "Дорога в пустыне",
        width: 1600,
        height: 900,
    },
    {
        id: "8",
        src: "https://picsum.photos/id/1069/1600/900",
        alt: "Зелёные холмы и облака",
        width: 1600,
        height: 900,
    },
];

export default function Home() {
    return (
        <div className={cls.content}>
            <div style={{ display: "none" }}>
                <Carousel
                    breakpoints={[
                        { minWidth: 640, slidesPerView: 2 },
                        { minWidth: 960, slidesPerView: 3 },
                    ]}
                    gap={16}
                    autoplay={{ delay: 3000, pauseOnHover: true, pauseOnInteraction: true }}
                    align="start"
                    showArrows
                    showDots
                >
                    {items.map((it) => (
                        <img
                            key={it.id}
                            src={it.src}
                            alt={it.alt}
                            width={it.width}
                            height={it.height}
                            loading="lazy"
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }}
                        />
                    ))}
                </Carousel>
            </div>
            <BeautyCarousel />
            <section className={cls.sh}>
                <h2 className={cls.sh__title}>Our partners</h2>
                <section className={cls.sh__content}>
                    <div className={cls.grid}>
                        <div className={cls.grid__item}>
                            <div className={cls.grid__w}>
                                <img src="./3___.png" alt="" className={cls.grid__im} />
                            </div>
                            <h4 className={cls.grid__ti}>MiRA</h4>
                            <p className={cls.grid__sti}>Your beauty is your confidence</p>
                        </div>
                        <div className={cls.grid__item}>
                            <div className={cls.grid__w}>
                                <img src="./2___.png" alt="" className={cls.grid__im} />
                            </div>
                            <h4 className={cls.grid__ti}>Get Smart Akademie​</h4>
                            <p className={cls.grid__sti}>NiSV Schulung</p>
                        </div>
                        <div className={cls.grid__item}>
                            <div className={cls.grid__w}>
                                <img src="./1___.png" alt="" className={cls.grid__im} />
                            </div>
                            <h4 className={cls.grid__ti}>Iryna Marinina</h4>
                            <p className={cls.grid__sti}>Expert in hardware cosmetology. Doctor, cosmetologist.</p>
                        </div>
                        <div className={cls.grid__item}>
                            <div className={cls.grid__w}>
                                <img src="./4___.png" alt="" className={cls.grid__im} />
                            </div>
                            <h4 className={cls.grid__ti}>INFA</h4>
                            <p className={cls.grid__sti}>Belgian Federation of Cosmetologists</p>
                        </div>
                    </div>
                </section>
            </section>
        </div>
    );
}
