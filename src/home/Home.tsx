import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionValueEvent,
  useInView,
  useReducedMotion,
  animate,
  type MotionValue,
  type Variants,
} from "framer-motion";
import { UseTheme } from "../contexts/ThemeContext";
import "./home.css";

/* ============================================================
   CONFIG — reemplazá videos y fotos por los definitivos
   ============================================================ */
const HERO_VIDEO = "https://res.cloudinary.com/dhqzn8gwi/video/upload/v1793991628/zegfy8j4xu8hcdrfhlit.mp4"; 
const HERO_POSTER =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2000&q=80";

const IMG = {
  statement:
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=80",
  service1:
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1400&q=80",
  service2:
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1400&q=80",
  service3:
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80",
  sede1:
    "https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?auto=format&fit=crop&w=1400&q=80",
  sede2:
    "https://images.unsplash.com/photo-1590644365607-1c5a4c0b5f72?auto=format&fit=crop&w=1400&q=80",
};

const CONTACT = {
  whatsapp: "https://api.whatsapp.com/send?phone=5491126973540",
  whatsappLabel: "+54 9 11 2697 3540",
  tel1: "tel:+541143014323",
  tel1Label: "+54 11 4301 4323",
  tel2: "tel:+541143012976",
  tel2Label: "+54 11 4301 2976",
  mapsHurlingham:
    "https://www.google.com/maps/search/?api=1&query=Parque+Industrial+Hurlingham+Camino+del+Buen+Ayre+Km+17",
  mapsNeuquen: "https://www.google.com/maps/place/KEISER+Sucursal+Neuqu%C3%A9n/@-38.7424651,-68.2015103,17z/data=!4m10!1m2!2m1!1sKEISER+Sucursal+hurlingham!3m6!1s0x960bb38d5fd34813:0xc88c9ed549e9bef2!8m2!3d-38.7424646!4d-68.1967459!15sChpLRUlTRVIgU3VjdXJzYWwgaHVybGluZ2hhbVocIhprZWlzZXIgc3VjdXJzYWwgaHVybGluZ2hhbZIBG2NvbnN0cnVjdGlvbl9tYWNoaW5lX2RlYWxlcpoBRENpOURRVWxSUVVOdlpFTm9kSGxqUmpsdlQyNVNhRlZYU21aYVdHaFZWbGRHZEZGdFdtRlNWVzkzVlhwb2RVOUlZeEFC4AEA-gEECAAQQA!16s%2Fg%2F11mcywh7cx?entry=ttu&g_ep=EgoyMDI2MTEwMy4wIKXMDSoASAFQAw%3D%3D",
};

const MAX_HEIGHT = 32; // metros que recorre el altímetro de arriba a abajo

type Range = "todas" | "baja" | "media" | "alta";

type Machine = {
  id: string;
  brand: string;
  model: string;
  type: string;
  height: number; // altura de trabajo en metros
  load: number; // carga en kg
  power: string;
  range: Exclude<Range, "todas">;
  img: string;
};

/* Specs de referencia: reemplazar por la ficha real de cada equipo */
const FLEET: Machine[] = [
  {
    id: "m1",
    brand: "HAULOTTE",
    model: "Optimum 8",
    type: "Tijera eléctrica",
    height: 8,
    load: 350,
    power: "Eléctrica",
    range: "baja",
    img: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "m2",
    brand: "HAULOTTE",
    model: "Compact 12",
    type: "Tijera eléctrica",
    height: 12,
    load: 450,
    power: "Eléctrica",
    range: "baja",
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "m3",
    brand: "HAULOTTE",
    model: "HA16 RTJ",
    type: "Articulada diésel",
    height: 16,
    load: 230,
    power: "Diésel 4x4",
    range: "media",
    img: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "m4",
    brand: "GENIE",
    model: "Z-60/37",
    type: "Articulada diésel",
    height: 20,
    load: 227,
    power: "Diésel 4x4",
    range: "media",
    img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "m5",
    brand: "HAULOTTE",
    model: "HT23 RTJ",
    type: "Telescópica diésel",
    height: 23,
    load: 350,
    power: "Diésel 4x4",
    range: "alta",
    img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "m6",
    brand: "JLG",
    model: "1350SJP",
    type: "Telescópica diésel",
    height: 43,
    load: 230,
    power: "Diésel 4x4",
    range: "alta",
    img: "https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?auto=format&fit=crop&w=1200&q=80",
  },
];

const RANGES: { key: Range; label: string; detail: string }[] = [
  { key: "todas", label: "Toda la flota", detail: "0 — 43 M" },
  { key: "baja", label: "Baja altura", detail: "Hasta 12 M" },
  { key: "media", label: "Media altura", detail: "12 — 20 M" },
  { key: "alta", label: "Gran altura", detail: "+20 M" },
];

const SERVICES = [
  {
    n: "01",
    title: "Mantenimiento de flota",
    text: "Un grupo técnico altamente calificado que optimiza el tiempo de diagnóstico y solución, para no prolongar el paro de máquinas.",
    tag: "Flota Keiser",
    img: IMG.service1,
  },
  {
    n: "02",
    title: "Repuestos propios",
    text: "Stock permanente de repuestos originales: el 100% de los componentes con disponibilidad inmediata.",
    tag: "Stock permanente",
    img: IMG.service2,
  },
  {
    n: "03",
    title: "Máquinas externas",
    text: "Mantenimiento y reparación de la línea HAULOTTE, en la que nos especializamos, y de JLG, GENIE, MANITOU, SNORKEL, SKYJACK, UPRIGHT, TEREX, SKYTRAK y GROVE, entre otras.",
    tag: "Multimarca",
    img: IMG.service3,
  },
];

const BRANDS = [
  "HAULOTTE",
  "JLG",
  "GENIE",
  "MANITOU",
  "UPRIGHT",
  "SNORKEL",
  "SKYJACK",
  "SKYTRAK",
  "TEREX",
  "GROVE",
];

const STATEMENT =
  "Elevamos la productividad de la industria con flota propia, repuestos originales y un servicio técnico que no deja ninguna máquina parada.";

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ============================================================
   HELPERS
   ============================================================ */
const useIsMobile = (bp = 900) => {
  const [m, setM] = useState(
    typeof window !== "undefined" ? window.innerWidth < bp : false
  );
  useEffect(() => {
    const on = () => setM(window.innerWidth < bp);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [bp]);
  return m;
};

const pad = (n: number) => String(n).padStart(2, "0");

const hideOnError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.opacity = "0";
};

const reveal: Variants = {
  hidden: { y: "105%" },
  show: (i: number = 0) => ({
    y: "0%",
    transition: { duration: 1.1, ease: EASE_OUT, delay: i * 0.08 },
  }),
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE_OUT, delay: i * 0.1 },
  }),
};

/* Línea de texto que sube desde una máscara.
   El que observa el viewport es el contenedor (siempre visible),
   no el texto, que arranca oculto debajo de la máscara. */
const MaskLine = ({
  children,
  i = 0,
  className = "",
}: {
  children: React.ReactNode;
  i?: number;
  className?: string;
}) => (
  <motion.span
    className={`kh-mask ${className}`}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.3 }}
  >
    <motion.span className="kh-mask-inner" variants={reveal} custom={i}>
      {children}
    </motion.span>
  </motion.span>
);

/* Etiqueta técnica tipo placa de máquina */
const Level = ({ m, label }: { m: number; label: string }) => (
  <motion.div
    className="kh-level"
    variants={fadeUp}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.8 }}
  >
    <span className="kh-level-dot" />
    <span className="kh-level-m">NIVEL {pad(m)} M</span>
    <span className="kh-level-sep" />
    <span className="kh-level-label">{label}</span>
  </motion.div>
);

/* Franja amarilla de transición entre secciones */
const HazardWipe = () => (
  <div className="kh-wipe" aria-hidden="true">
    <motion.div
      className="kh-wipe-bar"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 1 }}
      transition={{ duration: 1.2, ease: EASE }}
    />
  </div>
);

/* Palabra del statement que se enciende con el scroll */
const Word = ({
  word,
  progress,
  range,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}) => {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [12, 0]);
  return (
    <motion.span className="kh-word" style={{ opacity, y }}>
      {word}&nbsp;
    </motion.span>
  );
};

/* Contador animado */
const Counter = ({ to, suffix = "" }: { to: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, to, {
      duration: 2.2,
      ease: EASE_OUT,
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => ctrl.stop();
  }, [inView, to]);
  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
};

/* ============================================================
   HOME
   ============================================================ */
const Home = () => {
  const { theme } = UseTheme();
  const reduce = useReducedMotion();
  const isMobile = useIsMobile();

  /* ---------- Altímetro global ---------- */
  const { scrollYProgress } = useScroll();
  const meters = useTransform(scrollYProgress, [0, 1], [0, MAX_HEIGHT]);
  const altFill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const [alt, setAlt] = useState(0);
  useMotionValueEvent(meters, "change", (v) => setAlt(Math.round(v)));

  /* ---------- Cursor mira ---------- */
  const cx = useMotionValue(-100);
  const cy = useMotionValue(-100);
  const sx = useSpring(cx, { stiffness: 500, damping: 40 });
  const sy = useSpring(cy, { stiffness: 500, damping: 40 });
  const [hovering, setHovering] = useState(false);
  const [cursorOn, setCursorOn] = useState(false);

  useEffect(() => {
    if (isMobile || reduce) return;
    const move = (e: MouseEvent) => {
      cx.set(e.clientX);
      cy.set(e.clientY);
      const t = e.target as HTMLElement;
      setHovering(!!t.closest("a, button, [data-cursor]"));
      setCursorOn(true);
    };
    const leave = () => setCursorOn(false);
    window.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
    };
  }, [isMobile, reduce, cx, cy]);

  /* ---------- Hero parallax ---------- */
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroP } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroScale = useTransform(heroP, [0, 1], [1, 1.18]);
  const heroTitleY = useTransform(heroP, [0, 1], [0, -160]);
  const heroFade = useTransform(heroP, [0, 0.7], [1, 0]);

  /* ---------- Statement ---------- */
  const stRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: stP } = useScroll({
    target: stRef,
    offset: ["start 0.85", "end 0.4"],
  });
  const words = STATEMENT.split(" ");
  const stImgY = useTransform(stP, [0, 1], ["-12%", "12%"]);

  /* ---------- Flota ---------- */
  const [range, setRange] = useState<Range>("todas");
  const fleet = range === "todas" ? FLEET : FLEET.filter((m) => m.range === range);

  /* ---------- Servicio horizontal ---------- */
  const svRef = useRef<HTMLElement>(null);
  const { scrollYProgress: svP } = useScroll({
    target: svRef,
    offset: ["start start", "end end"],
  });
  const svX = useTransform(svP, [0, 1], ["0%", "-66.6667%"]);
  const svBar = useTransform(svP, [0, 1], [0, 1]);

  /* ---------- Sedes: línea que se dibuja ---------- */
  const sdRef = useRef<HTMLElement>(null);
  const { scrollYProgress: sdP } = useScroll({
    target: sdRef,
    offset: ["start 0.8", "center 0.5"],
  });
  const linePath = useSpring(sdP, { stiffness: 80, damping: 25 });

  return (
    <main className={`kh-root ${theme} ${!isMobile && !reduce ? "has-cursor" : ""}`}>
      {/* ================= CURSOR ================= */}
      {!isMobile && !reduce && (
        <motion.div
          className={`kh-cursor ${hovering ? "is-hover" : ""} ${cursorOn ? "is-on" : ""}`}
          style={{ x: sx, y: sy }}
          aria-hidden="true"
        >
          <span className="kh-cursor-h" />
          <span className="kh-cursor-v" />
          <span className="kh-cursor-ring" />
        </motion.div>
      )}

      {/* ================= ALTÍMETRO ================= */}
      <aside className="kh-alt" aria-hidden="true">
        <span className="kh-alt-top">{MAX_HEIGHT} M</span>
        <div className="kh-alt-track">
          <motion.div className="kh-alt-fill" style={{ scaleY: altFill }} />
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="kh-alt-tick" style={{ top: `${i * 12.5}%` }} />
          ))}
        </div>
        <span className="kh-alt-value">
          <strong>{pad(alt)}</strong> M
        </span>
        <span className="kh-alt-label">ALTURA</span>
      </aside>

      {/* ================= HERO ================= */}
      <section className="kh-hero" ref={heroRef}>
        <motion.div className="kh-hero-media" style={{ scale: reduce ? 1 : heroScale }}>
          <img
            className="kh-hero-poster"
            src={HERO_POSTER}
            alt=""
            onError={hideOnError}
          />
          <video
            className="kh-hero-video"
            src={HERO_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
          <div className="kh-hero-shade" />
          <div className="kh-hero-grid" />
        </motion.div>

        <motion.div className="kh-hero-top" style={{ opacity: heroFade }}>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
          >
            34°34′S — 58°39′W
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            HURLINGHAM · NEUQUÉN
          </motion.span>
        </motion.div>

        <motion.div
          className="kh-hero-content"
          style={{ y: reduce ? 0 : heroTitleY, opacity: heroFade }}
        >
          <div className="kh-hero-eyebrow">
            <motion.span
              className="kh-hero-eyebrow-line"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, ease: EASE, delay: 0.9 }}
            />
            <span className="kh-mask">
              <motion.span
                className="kh-mask-inner"
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, ease: EASE_OUT, delay: 1 }}
              >
                Plataformas de elevación · Alquiler · Servicio técnico
              </motion.span>
            </span>
          </div>

          <h1 className="kh-hero-title" aria-label="Keiser">
            {"KEISER-GROUP".split("").map((l, i) => (
              <span className="kh-hero-letter-wrap" key={i}>
                <motion.span
                  className="kh-hero-letter"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.3, ease: EASE_OUT, delay: 0.25 + i * 0.07 }}
                >
                  {l}
                </motion.span>
              </span>
            ))}
          </h1>

          <div className="kh-hero-bottom">
            <motion.p
              className="kh-hero-lead"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE_OUT, delay: 1.2 }}
            >
              Elevamos la industria. Flota propia de equipos de altura, repuestos
              originales y soporte técnico para que tu obra nunca se detenga.
            </motion.p>

            <motion.div
              className="kh-hero-ctas"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE_OUT, delay: 1.35 }}
            >
              <a href="#flota" className="kh-btn kh-btn-primary">
                <span>Ver flota</span>
                <span className="kh-btn-arrow">→</span>
              </a>
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="kh-btn kh-btn-ghost"
              >
                <span>Cotizar equipo</span>
              </a>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="kh-hero-scroll"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <span>SUBÍ</span>
          <span className="kh-hero-scroll-line">
            <span />
          </span>
        </motion.div>
      </section>

      {/* ================= STATEMENT ================= */}
      <section className="kh-statement">
        <div className="kh-container">
          <Level m={4} label="QUIÉNES SOMOS" />
          <div className="kh-statement-grid">
            <div className="kh-statement-text" ref={stRef}>
              <p>
                {words.map((w, i) => (
                  <Word
                    key={i}
                    word={w}
                    progress={stP}
                    range={[i / words.length, (i + 1) / words.length]}
                  />
                ))}
              </p>
            </div>
            <div className="kh-statement-media" data-cursor>
              <motion.img
                src={IMG.statement}
                alt="Equipo de elevación Keiser en obra"
                style={{ y: reduce ? 0 : stImgY }}
                onError={hideOnError}
              />
              <span className="kh-photo-tag">FOTO REF. 01</span>
            </div>
          </div>

          <div className="kh-stats">
            {[
              { v: 100, s: "%", l: "Repuestos con disponibilidad inmediata" },
              { v: 2, s: "", l: "Bases operativas: Buenos Aires y Neuquén" },
              { v: 10, s: "+", l: "Marcas que reparamos y mantenemos" },
            ].map((st, i) => (
              <motion.div
                className="kh-stat"
                key={st.l}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.6 }}
                custom={i}
              >
                <span className="kh-stat-value">
                  <Counter to={st.v} suffix={st.s} />
                </span>
                <span className="kh-stat-label">{st.l}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <HazardWipe />

      {/* ================= FLOTA ================= */}
      <section className="kh-fleet" id="flota">
        <div className="kh-container">
          <Level m={12} label="FLOTA" />
          <div className="kh-fleet-head">
            <h2 className="kh-h2">
              <MaskLine>Elegí tu</MaskLine>
              <MaskLine i={1} className="kh-accent">altura.</MaskLine>
            </h2>
            <div className="kh-fleet-filter" role="tablist" aria-label="Filtrar por altura">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  role="tab"
                  aria-selected={range === r.key}
                  className={`kh-filter-btn ${range === r.key ? "is-active" : ""}`}
                  onClick={() => setRange(r.key)}
                >
                  {range === r.key && (
                    <motion.span
                      layoutId="kh-filter-pill"
                      className="kh-filter-pill"
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    />
                  )}
                  <span className="kh-filter-label">{r.label}</span>
                  <span className="kh-filter-detail">{r.detail}</span>
                </button>
              ))}
            </div>
          </div>

          <motion.div className="kh-fleet-grid" layout>
            <AnimatePresence mode="popLayout">
              {fleet.map((m, i) => (
                <motion.article
                  key={m.id}
                  className="kh-plate"
                  layout
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT, delay: i * 0.06 } }}
                  exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.3 } }}
                  data-cursor
                >
                  <div className="kh-plate-media">
                    <img src={m.img} alt={`${m.brand} ${m.model}`} loading="lazy" onError={hideOnError} />
                    <span className="kh-plate-height">
                      {m.height}
                      <small>M</small>
                    </span>
                  </div>
                  <div className="kh-plate-body">
                    <div className="kh-plate-row kh-plate-title">
                      <span className="kh-plate-brand">{m.brand}</span>
                      <span className="kh-plate-id">REF·{m.id.toUpperCase()}</span>
                    </div>
                    <h3 className="kh-plate-model">{m.model}</h3>
                    <span className="kh-plate-type">{m.type}</span>
                    <dl className="kh-plate-specs">
                      <div>
                        <dt>Altura de trabajo</dt>
                        <dd>{m.height} m</dd>
                      </div>
                      <div>
                        <dt>Carga</dt>
                        <dd>{m.load} kg</dd>
                      </div>
                      <div>
                        <dt>Motor</dt>
                        <dd>{m.power}</dd>
                      </div>
                    </dl>
                    <a
                      href={`${CONTACT.whatsapp}&text=${encodeURIComponent(
                        `Hola Keiser, quiero cotizar el equipo ${m.brand} ${m.model}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="kh-plate-cta"
                    >
                      <span>Consultar disponibilidad</span>
                      {/* <span className="kh-plate-cta-arrow">x</span> */}
                    </a>
                  </div>
                  <span className="kh-plate-bar" />
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ================= SERVICIO (scroll horizontal) ================= */}
      <section className="kh-service" ref={svRef}>
        <div className="kh-service-sticky">
          <div className="kh-container kh-service-head">
            <Level m={20} label="SERVICIO Y SOPORTE TÉCNICO" />
            <h2 className="kh-h2 kh-service-title">
              <MaskLine>Ninguna máquina</MaskLine>
              <MaskLine i={1} className="kh-accent">se queda abajo.</MaskLine>
            </h2>
            <div className="kh-service-progress">
              <motion.span style={{ scaleX: svBar }} />
            </div>
          </div>

          <motion.div
            className="kh-service-track"
            style={{ x: isMobile || reduce ? 0 : svX }}
          >
            {SERVICES.map((s) => (
              <article className="kh-service-panel" key={s.n} data-cursor>
                <div className="kh-service-media">
                  <img src={s.img} alt={s.title} loading="lazy" onError={hideOnError} />
                  <span className="kh-photo-tag">FOTO REF. {s.n}</span>
                </div>
                <div className="kh-service-info">
                  <span className="kh-service-n">{s.n}</span>
                  <span className="kh-service-tag">{s.tag}</span>
                  <h3 className="kh-service-name">{s.title}</h3>
                  <p className="kh-service-text">{s.text}</p>
                </div>
              </article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================= MARCAS ================= */}
      <section className="kh-brands">
        <div className="kh-container">
          <Level m={24} label="MARCAS CON LAS QUE TRABAJAMOS" />
        </div>
        <div className="kh-marquee">
          <div className="kh-marquee-track">
            {[...BRANDS, ...BRANDS].map((b, i) => (
              <span className="kh-brand" key={`a-${i}`} data-cursor>
                {b}
                <span className="kh-brand-dot" />
              </span>
            ))}
          </div>
        </div>
        <div className="kh-marquee kh-marquee-rev">
          <div className="kh-marquee-track">
            {[...BRANDS.slice().reverse(), ...BRANDS.slice().reverse()].map((b, i) => (
              <span className="kh-brand kh-brand-outline" key={`b-${i}`} data-cursor>
                {b}
                <span className="kh-brand-dot" />
              </span>
            ))}
          </div>
        </div>
        <motion.p
          className="kh-brands-note"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          Especialistas en la línea <strong>HAULOTTE</strong>. Servicio técnico
          multimarca para equipos propios y de terceros.
        </motion.p>
      </section>

      <HazardWipe />

      {/* ================= SEDES ================= */}
      <section className="kh-sites" ref={sdRef}>
        <div className="kh-container">
          <Level m={28} label="DÓNDE ESTAMOS" />
          <h2 className="kh-h2">
            <MaskLine>De Buenos Aires</MaskLine>
            <MaskLine i={1} className="kh-accent">a la Patagonia.</MaskLine>
          </h2>

          <div className="kh-sites-grid">
            <svg
              className="kh-sites-line"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <motion.path
                d="M 22 18 C 40 60, 60 40, 78 82"
                fill="none"
                strokeWidth="0.5"
                vectorEffect="non-scaling-stroke"
                style={{ pathLength: reduce ? 1 : linePath }}
              />
            </svg>

            {[
              {
                tag: "CASA CENTRAL",
                city: "Hurlingham",
                coord: "34°34′S — 58°39′W",
                lines: ["Parque Industrial Hurlingham", "Camino del Buen Ayre Km 17", "Buenos Aires, Argentina"],
                map: CONTACT.mapsHurlingham,
                img: IMG.sede1,
              },
              {
                tag: "SUCURSAL",
                city: "Neuquén",
                coord: "38°44′S — 68°11′W",
                lines: ["Base operativa Patagonia", "Neuquén, Argentina"],
                map: CONTACT.mapsNeuquen,
                img: IMG.sede2,
              },
            ].map((s, i) => (
              <motion.article
                className={`kh-site kh-site-${i + 1}`}
                key={s.city}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.4 }}
                custom={i}
                data-cursor
              >
                <div className="kh-site-media">
                  <img src={s.img} alt={`Sede ${s.city}`} loading="lazy" onError={hideOnError} />
                  <span className="kh-site-pin" />
                </div>
                <div className="kh-site-body">
                  <span className="kh-site-tag">{s.tag}</span>
                  <h3 className="kh-site-city">{s.city}</h3>
                  <span className="kh-site-coord">{s.coord}</span>
                  <address className="kh-site-address">
                    {s.lines.map((l) => (
                      <span key={l}>{l}</span>
                    ))}
                  </address>
                  <a href={s.map} target="_blank" rel="noopener noreferrer" className="kh-link">
                    Cómo llegar {/* <span>↗</span> */}
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CIMA / CTA FINAL ================= */}
      <section className="kh-summit">
        <div className="kh-summit-bg" aria-hidden="true">
          <span>{MAX_HEIGHT}M</span>
        </div>
        <div className="kh-container kh-summit-inner">
          <Level m={MAX_HEIGHT} label="CIMA" />
          <h2 className="kh-summit-title">
            <MaskLine>Llegaste a lo</MaskLine>
            <MaskLine i={1}>más alto.</MaskLine>
            <MaskLine i={2} className="kh-accent">Hablemos.</MaskLine>
          </h2>

          <div className="kh-summit-contacts">
            <motion.a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="kh-summit-wa"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <span className="kh-summit-wa-label">WhatsApp</span>
              <span className="kh-summit-wa-number">{CONTACT.whatsappLabel}</span>
              <span className="kh-summit-wa-arrow">→</span>
            </motion.a>

            <motion.div
              className="kh-summit-phones"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={1}
            >
              <a href={CONTACT.tel1}>
                <span>TEL.</span> {CONTACT.tel1Label}
              </a>
              <a href={CONTACT.tel2}>
                <span>TEL.</span> {CONTACT.tel2Label}
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;