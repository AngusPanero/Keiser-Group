import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { UseTheme } from "../contexts/ThemeContext";
import "./catalog.css";

/**
 * Catalog — Keiser Group (ruta /catalog)
 * ---------------------------------------------------------
 * Catálogo de equipos en HTML (antes era un PDF).
 * Datos tomados del catálogo oficial de Keiser.
 *
 * Cada modelo tiene "Consultar", que lleva a:
 *   /contact?equipo=<slug>&modelo=<marca modelo>
 * y ContactCorporate lo recibe como "Consulta por equipo".
 *
 * Fotos: /public/catalog/*.webp · PDF original: /public/catalog/catalogo-keiser.pdf
 */

/* ============================================================
   TIPOS Y FORMATO
   ============================================================ */
type ColKind = "m" | "kg" | "dims" | "text";
type Column = { key: string; label: string; kind: ColKind };
type Row = Record<string, number | number[] | string | null> & { model: string };

type Category = {
  id: string;
  name: string;
  short: string;
  power: string;
  description: string;
  features: string[];
  image: string;
  focus: string; // object-position de la foto (qué parte se ve)
  icon: "scissor" | "boom" | "telehandler" | "forklift";
  primary: string; // columna que se muestra destacada en las cards
  columns: Column[];
  rows: Row[];
};

const nf = (n: number, d = 2) =>
  n.toLocaleString("es-AR", { minimumFractionDigits: d, maximumFractionDigits: d });

const formatValue = (value: Row[string], kind: ColKind): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (kind === "m" && typeof value === "number") return `${nf(value)} m`;
  if (kind === "kg" && typeof value === "number") return `${value.toLocaleString("es-AR")} kg`;
  if (kind === "dims" && Array.isArray(value)) return `${value.map((v) => nf(v)).join(" × ")} m`;
  return String(value);
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64);

const contactLink = (model: string) =>
  `/contact?equipo=${encodeURIComponent(slugify(model))}&modelo=${encodeURIComponent(model)}`;

/* ============================================================
   DATOS DEL CATÁLOGO
   ============================================================ */
const COLS = {
  workHeight: { key: "workHeight", label: "Altura de trabajo", kind: "m" as const },
  platHeight: { key: "platHeight", label: "Altura de plataforma", kind: "m" as const },
  articulation: { key: "articulation", label: "Punto de articulación", kind: "m" as const },
  reach: { key: "reach", label: "Alcance máximo", kind: "m" as const },
  capacity: { key: "capacity", label: "Capacidad de carga", kind: "kg" as const },
  maxLoad: { key: "capacity", label: "Capacidad máx. de carga", kind: "kg" as const },
  liftHeight: { key: "liftHeight", label: "Altura máx. de elevación", kind: "m" as const },
  mast: { key: "mast", label: "Altura mástil replegado", kind: "m" as const },
  dims: { key: "dims", label: "Dimensiones (L × A × H)", kind: "dims" as const },
  weight: { key: "weight", label: "Peso", kind: "kg" as const },
};

const CATEGORIES: Category[] = [
  {
    id: "tijeras-electricas",
    name: "Tijeras eléctricas",
    short: "Tijeras eléctricas",
    power: "Eléctrica",
    description:
      "Plataformas de elevación vertical para trabajos en interiores: silenciosas, sin emisiones y con gran superficie de trabajo.",
    features: ["Rodados no marcantes", "Mandos proporcionales", "Ideales para interiores"],
    image: "/fotos/catalog-tijeras-electricas.webp",
    focus: "center 35%",
    icon: "scissor",
    primary: "workHeight",
    columns: [COLS.workHeight, COLS.platHeight, COLS.capacity, COLS.dims, COLS.weight],
    rows: [
      { model: "Optimum 8", workHeight: 7.8, platHeight: 5.8, capacity: 230, dims: [1.9, 0.79, 1.13], weight: 1520 },
      { model: "Compact 8", workHeight: 8.2, platHeight: 6.2, capacity: 320, dims: [2.5, 0.81, 1.13], weight: 1655 },
      { model: "Compact 10N", workHeight: 10, platHeight: 8, capacity: 230, dims: [2.5, 0.81, 1.32], weight: 2190 },
      { model: "Compact 10", workHeight: 10.15, platHeight: 8.15, capacity: 400, dims: [2.5, 1.2, 1.4], weight: 2330 },
      { model: "Compact 12", workHeight: 12, platHeight: 10, capacity: 300, dims: [2.5, 1.2, 1.53], weight: 2470 },
      { model: "Compact 14", workHeight: 13.8, platHeight: 11.8, capacity: 320, dims: [2.75, 1.2, 1.78], weight: 3175 },
      { model: "Compact 16", workHeight: 15.8, platHeight: 14.8, capacity: 320, dims: [2.8, 1.3, 1.94], weight: 3500 },
    ],
  },
  {
    id: "tijeras-diesel",
    name: "Tijeras diésel 4x4",
    short: "Tijeras diésel",
    power: "Diésel 4x4",
    description:
      "Tijeras todo terreno para obra: tracción 4x4, gran capacidad de carga y plataformas amplias para varios operarios.",
    features: ["Tracción 4x4", "Hasta 500 kg de carga", "Terrenos irregulares"],
    image: "/fotos/catalog-tijeras-diesel.webp",
    focus: "center 40%",
    icon: "scissor",
    primary: "workHeight",
    columns: [COLS.workHeight, COLS.platHeight, COLS.capacity, COLS.dims, COLS.weight],
    rows: [
      { model: "Compact 12DX", workHeight: 12.15, platHeight: 10.15, capacity: 450, dims: [3.17, 1.8, 1.8], weight: 4060 },
      { model: "H 15 SX", workHeight: 15, platHeight: 13, capacity: 500, dims: [4.18, 2.25, 2], weight: 6340 },
      { model: "H 18 SX", workHeight: 18, platHeight: 16, capacity: 500, dims: [4.18, 2.25, 2.2], weight: 7300 },
    ],
  },
  {
    id: "brazos-electricos",
    name: "Brazos articulados eléctricos",
    short: "Brazos eléctricos",
    power: "Eléctrica",
    description:
      "Brazos articulados para llegar por encima de obstáculos en espacios reducidos, con excelente radio de giro.",
    features: ["Excelente radio de giro", "Rodados no marcantes", "Interiores y exteriores"],
    image: "/fotos/catalog-brazos-electricos.webp",
    focus: "60% center",
    icon: "boom",
    primary: "workHeight",
    columns: [COLS.workHeight, COLS.platHeight, COLS.articulation, COLS.reach, COLS.capacity, COLS.dims, COLS.weight],
    rows: [
      { model: "HA 12 CJ+", workHeight: 11.7, platHeight: 9.7, articulation: 4.74, reach: 7.2, capacity: 230, dims: [5.64, 1.2, 2], weight: 7040 },
      { model: "HA 12 IP", workHeight: 12, platHeight: 10, articulation: 5.25, reach: 6.6, capacity: 230, dims: [5.45, 1.35, 2], weight: 5900 },
      { model: "HA 15 IP", workHeight: 15, platHeight: 13, articulation: 6.6, reach: 8.45, capacity: 230, dims: [6.6, 1.5, 2], weight: 7300 },
      { model: "SIGMA 16PRO", workHeight: 15.7, platHeight: 13.7, articulation: 7.4, reach: 8.05, capacity: 230, dims: [6.65, 1.75, 2.1], weight: 6950 },
      { model: "HA20 LE", workHeight: 20, platHeight: 18, articulation: 8.4, reach: 11.9, capacity: 230, dims: [8.45, 2.41, 2.4], weight: 9785 },
      { model: "HA26 LE", workHeight: 26.6, platHeight: 24.6, articulation: 8.8, reach: 18, capacity: 230, dims: [11.6, 2.5, 3.36], weight: 17300 },
    ],
  },
  {
    id: "brazos-diesel",
    name: "Brazos articulados diésel 4x4",
    short: "Brazos diésel",
    power: "Diésel 4x4",
    description:
      "La línea de mayor altura: brazos todo terreno que superan los 40 metros, con gran alcance horizontal para obra pesada.",
    features: ["Más de 40 m de altura", "Tracción 4x4", "Gran alcance horizontal"],
    image: "/fotos/catalog-brazos-diesel.webp",
    focus: "center 30%",
    icon: "boom",
    primary: "workHeight",
    columns: [COLS.workHeight, COLS.platHeight, COLS.articulation, COLS.reach, COLS.capacity, COLS.dims, COLS.weight],
    rows: [
      { model: "HA 16 RTJ PRO", workHeight: 16, platHeight: 14, articulation: 7.65, reach: 8.3, capacity: 230, dims: [6.75, 2.3, 2.3], weight: 6650 },
      { model: "HA 20 RTJ PRO", workHeight: 20.6, platHeight: 18.6, articulation: 8.4, reach: 12.2, capacity: 230, dims: [8.8, 2.42, 2.51], weight: 9600 },
      { model: "HA 26 RTJ PRO", workHeight: 26.4, platHeight: 24.4, articulation: 9.3, reach: 17.5, capacity: 250, dims: [11.8, 2.48, 2.97], weight: 15500 },
      { model: "HA 32 RTJ PRO", workHeight: 31.8, platHeight: 28.8, articulation: 11.35, reach: 21.6, capacity: 250, dims: [11.7, 2.53, 2.8], weight: 20100 },
      { model: "HA 41 RTJ PRO", workHeight: 41.5, platHeight: 39.5, articulation: 17.5, reach: 20.1, capacity: 230, dims: [13.1, 2.5, 2.99], weight: 23900 },
      { model: "HT 43 RTJ PRO", workHeight: 42.2, platHeight: 40.2, articulation: null, reach: 20.2, capacity: 230, dims: [14.8, 2.5, 3.05], weight: 21400 },
    ],
  },
  {
    id: "telescopicos",
    name: "Manipuladores telescópicos 4x4",
    short: "Telescópicos",
    power: "Diésel 4x4",
    description:
      "Manipuladores para mover cargas pesadas en altura y a distancia: de 2.500 a 7.500 kg y hasta 21 metros de elevación.",
    features: ["Hasta 7.500 kg", "Hasta 21 m de elevación", "Tracción 4x4"],
    image: "/fotos/catalog-telescopicos.webp",
    focus: "center 55%",
    icon: "telehandler",
    primary: "liftHeight",
    columns: [COLS.maxLoad, COLS.liftHeight, { key: "reach", label: "Alcance", kind: "m" }, COLS.dims, COLS.weight],
    rows: [
      { model: "HTL 2506", capacity: 2500, liftHeight: 6, reach: 3.43, dims: [3.94, 1.83, 1.96], weight: 5100 },
      { model: "HTL 3507", capacity: 3500, liftHeight: 7, reach: 3.9, dims: [5, 2.33, 2.34], weight: 7000 },
      { model: "HTL 5510", capacity: 5500, liftHeight: 10, reach: 5.7, dims: [6.28, 2.43, 2.6], weight: 10810 },
      { model: "HTL 7510", capacity: 7500, liftHeight: 10, reach: 5.4, dims: [6.35, 2.43, 2.6], weight: 12190 },
      { model: "HTL 5514", capacity: 5500, liftHeight: 14, reach: 6.1, dims: [6.35, 2.43, 2.6], weight: 12170 },
      { model: "HTL 4014", capacity: 4000, liftHeight: 13.6, reach: 9.8, dims: [6.47, 2.43, 2.67], weight: 11400 },
      { model: "HTL 4017", capacity: 4000, liftHeight: 16.7, reach: 12.85, dims: [6.76, 2.43, 2.67], weight: 12320 },
      { model: "HTL 5021R", capacity: 5000, liftHeight: 21, reach: 18.1, dims: [6.87, 2.47, 3.16], weight: 17100 },
    ],
  },
  {
    id: "autoelevadores",
    name: "Autoelevadores",
    short: "Autoelevadores",
    power: "Diésel",
    description:
      "Autoelevadores para depósitos, playas de carga e industria: de 2.500 a 16.000 kg de capacidad.",
    features: ["De 2.500 a 16.000 kg", "4,50 m de elevación", "Uso industrial"],
    image: "/fotos/catalog-autoelevadores.webp",
    focus: "center 60%",
    icon: "forklift",
    primary: "capacity",
    columns: [COLS.maxLoad, COLS.liftHeight, COLS.mast, COLS.dims, COLS.weight],
    rows: [
      { model: "CPCD25", capacity: 2500, liftHeight: 4.5, mast: 2, dims: [2.7, 1.2, 2.16], weight: 4115 },
      { model: "CPCD35", capacity: 3500, liftHeight: 4.5, mast: 2.1, dims: [2.98, 1.22, 2.16], weight: 5002 },
      { model: "CPCD50", capacity: 5000, liftHeight: 4.5, mast: 2.25, dims: [3.35, 1.95, 2.25], weight: 7190 },
      { model: "CPCD70", capacity: 7000, liftHeight: 4.5, mast: 2.72, dims: [3.75, 2, 2.4], weight: 10381 },
      { model: "CPCD100", capacity: 10000, liftHeight: 4.5, mast: 2.86, dims: [4.27, 2.2, 2.6], weight: 14540 },
      { model: "CPCD160", capacity: 16000, liftHeight: 4.5, mast: 3.3, dims: [5.13, 2.48, 3.3], weight: 20300 },
    ],
  },
];

const TOTAL_MODELS = CATEGORIES.reduce((acc, c) => acc + c.rows.length, 0);
const MAX_HEIGHT = Math.max(
  ...CATEGORIES.flatMap((c) => c.rows.map((r) => (typeof r.workHeight === "number" ? r.workHeight : 0)))
);

const PDF_URL = "/catalog/catalogo-keiser.pdf";
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ============================================================
   ÍCONOS (inline)
   ============================================================ */
const CategoryIcon = ({ type }: { type: Category["icon"] }) => {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  if (type === "scissor")
    return (
      <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
        <rect x="6" y="5" width="20" height="4" {...common} />
        <path d="M9 9l14 5M23 9 9 14M9 14l14 5M23 14 9 19" {...common} />
        <rect x="6" y="19" width="20" height="5" {...common} />
        <circle cx="10" cy="26.5" r="1.6" {...common} />
        <circle cx="22" cy="26.5" r="1.6" {...common} />
      </svg>
    );
  if (type === "boom")
    return (
      <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
        <rect x="4" y="20" width="12" height="5" {...common} />
        <path d="M12 20 18 11 25 7" {...common} />
        <rect x="23" y="3" width="6" height="4" {...common} />
        <circle cx="7" cy="27" r="1.6" {...common} />
        <circle cx="13" cy="27" r="1.6" {...common} />
      </svg>
    );
  if (type === "telehandler")
    return (
      <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
        <path d="M4 22h14v-6h-6l-2 3H4z" {...common} />
        <path d="M14 17 27 8" {...common} />
        <path d="M27 8v4h3" {...common} />
        <circle cx="8" cy="25" r="2.4" {...common} />
        <circle cx="16" cy="25" r="2.4" {...common} />
      </svg>
    );
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
      <path d="M6 23V12h7l3 5v6z" {...common} />
      <path d="M21 5v18M21 23h7" {...common} />
      <circle cx="9" cy="25.5" r="2.2" {...common} />
      <circle cx="16" cy="25.5" r="1.8" {...common} />
    </svg>
  );
};

/* ============================================================
   IMAGEN DE CATEGORÍA — panel cinematográfico con parallax
   ============================================================ */
const CategoryMedia = ({ category, index }: { category: Category; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const lineScale = useTransform(scrollYProgress, [0.1, 0.45], [0, 1]);

  return (
    <motion.div
      className="cg-media"
      ref={ref}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Número gigante en contorno detrás de la foto */}
      <span className="cg-media-n" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>

      {/* El que observa el viewport es el contenedor: la foto arranca recortada
          y el navegador no la detectaría como visible */}
      <motion.div
        className="cg-media-frame"
        variants={{
          hidden: { clipPath: index % 2 === 1 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" },
          show: { clipPath: "inset(0 0% 0 0%)", transition: { duration: 1.3, ease: [0.76, 0, 0.24, 1] } },
        }}
      >
        <motion.img
          src={category.image}
          alt={category.name}
          loading="lazy"
          style={{ y: reduce ? 0 : y, objectPosition: category.focus }}
        />
        <span className="cg-media-shade" aria-hidden="true" />
        <span className="cg-media-grain" aria-hidden="true" />

        <span className="cg-media-badge">
          <strong>{category.rows.length}</strong>
          modelo{category.rows.length === 1 ? "" : "s"}
        </span>
        <span className="cg-media-power">{category.power}</span>
      </motion.div>

      {/* Marco amarillo desplazado que se dibuja con el scroll */}
      <motion.span className="cg-media-line" style={{ scaleY: reduce ? 1 : lineScale }} aria-hidden="true" />
    </motion.div>
  );
};

/* ============================================================
   COMPONENTE
   ============================================================ */
const Catalog = () => {
  const { theme } = UseTheme();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(CATEGORIES[0].id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* Búsqueda por modelo o categoría */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.map((c) => ({
      ...c,
      rows: c.name.toLowerCase().includes(q) ? c.rows : c.rows.filter((r) => r.model.toLowerCase().includes(q)),
    })).filter((c) => c.rows.length);
  }, [query]);

  const resultCount = filtered.reduce((acc, c) => acc + c.rows.length, 0);

  /* Scroll spy: marca la categoría visible en la barra fija */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id.replace("cg-", ""));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [filtered]);

  const goTo = (id: string) => {
    const el = document.getElementById(`cg-${id}`);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 150;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <main className={`cg-root ${theme}`}>

      {/* ================= HERO ================= */}
      <header className="cg-hero">
        <div className="cg-hero-media">
          <img src="/fotos/catalog-hero.webp" alt="Flota de equipos Keiser" />
          <div className="cg-hero-shade" />
        </div>

        <div className="cg-hero-content">
          <motion.span
            className="cg-eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <span className="cg-eyebrow-dot" />
            Trabajo más rápido y seguro
          </motion.span>

          <h1 className="cg-title">
            <span className="cg-mask">
              <motion.span initial={{ y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}>
                Catálogo
              </motion.span>
            </span>
            <span className="cg-mask cg-accent">
              <motion.span initial={{ y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}>
                de equipos.
              </motion.span>
            </span>
          </h1>

          <motion.div
            className="cg-stats"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.4 }}
          >
            <div className="cg-stat">
              <strong>{CATEGORIES.length}</strong>
              <span>Líneas de equipos</span>
            </div>
            <div className="cg-stat">
              <strong>{TOTAL_MODELS}</strong>
              <span>Modelos disponibles</span>
            </div>
            <div className="cg-stat">
              <strong>
                {nf(MAX_HEIGHT, 1)}
                <small>m</small>
              </strong>
              <span>Altura máxima de trabajo</span>
            </div>
          </motion.div>

          <motion.div
            className="cg-hero-actions"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
          >
            <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="cg-btn cg-btn-ghost">
              Descargar PDF <span aria-hidden="true">↓</span>
            </a>
            <Link to="/contact" className="cg-btn cg-btn-primary">
              Consultar <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* ================= BARRA FIJA: CATEGORÍAS + BÚSQUEDA ================= */}
      <div className="cg-bar">
        <div className="cg-bar-inner">
          <nav className="cg-tabs" aria-label="Categorías">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`cg-tab ${active === c.id ? "is-active" : ""}`}
                onClick={() => goTo(c.id)}
              >
                {active === c.id && (
                  <motion.span layoutId="cg-tab-pill" className="cg-tab-pill" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
                )}
                <span className="cg-tab-label">{c.short}</span>
                <span className="cg-tab-count">{c.rows.length}</span>
              </button>
            ))}
          </nav>

          <label className="cg-search">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value.slice(0, 40))}
              placeholder="Buscar modelo…"
              aria-label="Buscar modelo"
            />
          </label>
        </div>
      </div>

      {/* ================= CATEGORÍAS ================= */}
      <div className="cg-body">
        <AnimatePresence>
          {query && (
            <motion.p
              className="cg-results"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {resultCount
                ? `${resultCount} modelo${resultCount === 1 ? "" : "s"} para "${query.trim()}"`
                : `No encontramos modelos para "${query.trim()}".`}
              {!resultCount && (
                <button type="button" className="cg-clear" onClick={() => setQuery("")}>
                  Ver todo el catálogo
                </button>
              )}
            </motion.p>
          )}
        </AnimatePresence>

        {filtered.map((c, ci) => {
          const primaryCol = c.columns.find((col) => col.key === c.primary) ?? c.columns[0];
          return (
            <section
              key={c.id}
              id={`cg-${c.id}`}
              className="cg-section"
              ref={(el) => {
                sectionRefs.current[c.id] = el;
              }}
            >
              {/* Cabecera de la categoría */}
              <div className={`cg-section-head ${ci % 2 === 1 ? "is-reverse" : ""}`}>
                <motion.div
                  className="cg-section-info"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  <div className="cg-section-meta">
                    <span className="cg-section-icon">
                      <CategoryIcon type={c.icon} />
                    </span>
                    <span className="cg-section-n">{String(ci + 1).padStart(2, "0")}</span>
                    <span className="cg-section-power">{c.power}</span>
                  </div>
                  <h2 className="cg-section-title">{c.name}</h2>
                  <p className="cg-section-desc">{c.description}</p>
                  <ul className="cg-features">
                    {c.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </motion.div>

                <CategoryMedia category={c} index={ci} />
              </div>

              {/* Tabla (desktop) */}
              <div className="cg-table-wrap">
                <table className="cg-table">
                  <thead>
                    <tr>
                      <th scope="col">Modelo</th>
                      {c.columns.map((col) => (
                        <th scope="col" key={col.key + col.label}>{col.label}</th>
                      ))}
                      <th scope="col" className="cg-th-action"><span className="cg-sr">Consultar</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.rows.map((r, ri) => (
                      <motion.tr
                        key={r.model}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5, ease: EASE, delay: ri * 0.04 }}
                      >
                        <th scope="row" className="cg-td-model">{r.model}</th>
                        {c.columns.map((col) => (
                          <td
                            key={col.key + col.label}
                            className={col.key === c.primary ? "cg-td-primary" : ""}
                          >
                            {formatValue(r[col.key], col.kind)}
                          </td>
                        ))}
                        <td className="cg-td-action">
                          <Link to={contactLink(r.model)} className="cg-row-cta" aria-label={`Consultar por ${r.model}`}>
                            Consultar <span aria-hidden="true">→</span>
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards (mobile) */}
              <div className="cg-cards">
                {c.rows.map((r) => (
                  <article key={r.model} className="cg-card">
                    <div className="cg-card-head">
                      <h3 className="cg-card-model">{r.model}</h3>
                      <span className="cg-card-primary">
                        {formatValue(r[primaryCol.key], primaryCol.kind)}
                        <small>{primaryCol.label}</small>
                      </span>
                    </div>
                    <dl className="cg-card-specs">
                      {c.columns
                        .filter((col) => col.key !== primaryCol.key)
                        .map((col) => (
                          <div key={col.key + col.label} className={col.kind === "dims" ? "is-wide" : ""}>
                            <dt>{col.label}</dt>
                            <dd>{formatValue(r[col.key], col.kind)}</dd>
                          </div>
                        ))}
                    </dl>
                    <Link to={contactLink(r.model)} className="cg-card-cta">
                      <span>Consultar este equipo</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        {/* ================= CTA FINAL ================= */}
        <motion.section
          className="cg-cta"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <div>
            <span className="cg-cta-tag">¿No encontrás lo que buscás?</span>
            <h2 className="cg-cta-title">
              Te asesoramos con el <span className="cg-accent">equipo justo.</span>
            </h2>
            <p className="cg-cta-text">
              Contanos la altura, la carga y el tipo de obra, y nuestro equipo técnico te recomienda la mejor opción.
            </p>
          </div>
          <div className="cg-cta-actions">
            <Link to="/contact" className="cg-btn cg-btn-primary">
              Hacer una consulta <span aria-hidden="true">→</span>
            </Link>
            <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="cg-btn cg-btn-ghost cg-btn-ghost-dark">
              Descargar catálogo PDF <span aria-hidden="true">↓</span>
            </a>
          </div>
        </motion.section>
      </div>

      <span className="cg-hazard" aria-hidden="true" />
    </main>
  );
};

export default Catalog;