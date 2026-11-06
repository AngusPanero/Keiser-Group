import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion, type Variants } from "framer-motion";
import { UseTheme } from "../contexts/ThemeContext";
import "./transport.css";

/**
 * Transport — Keiser Group (ruta /transport)
 * ---------------------------------------------------------
 * Logística y transporte: vehículos adecuados para cada máquina,
 * entrega y retiro coordinados, y traslado de equipos de clientes.
 * Los pesos y largos salen de las fichas del catálogo.
 */

/* ============================================================
   CONTENIDO
   ============================================================ */
const IMG = {
  hero: "/fotos/catalog-hero.webp",
  telescopicos: "/fotos/catalog-telescopicos.webp",
  brazosDiesel: "/fotos/catalog-brazos-diesel.webp",
  tijerasDiesel: "/fotos/catalog-tijeras-diesel.webp",
  tijerasElectricas: "/fotos/catalog-tijeras-electricas.webp",
  brazosElectricos: "/fotos/catalog-brazos-electricos.webp",
  autoelevadores: "/fotos/catalog-autoelevadores.webp",
};

const CONTACT = {
  whatsapp: "https://api.whatsapp.com/send?phone=5491126973540",
  whatsappLabel: "+54 9 11 2697 3540",
  whatsappNeuquen: "https://api.whatsapp.com/send?phone=5492996114040",
  whatsappNeuquenLabel: "+54 9 299 611 4040",
};

const SERVICES = [
  {
    n: "01",
    title: "Un vehículo para cada máquina",
    text: "Contamos con vehículos de transporte adecuados para cada equipo: desde una tijera eléctrica compacta hasta un brazo articulado de más de 40 metros.",
    tag: "Flota de transporte",
    img: IMG.brazosDiesel,
  },
  {
    n: "02",
    title: "Entrega y retiro coordinados",
    text: "Nuestro equipo coordina de manera eficiente la entrega y el retiro de las máquinas, evitando retrasos en el inicio o la finalización de las tareas.",
    tag: "Sin demoras en obra",
    img: IMG.telescopicos,
  },
  {
    n: "03",
    title: "Logística para tus equipos",
    text: "También ofrecemos servicio de logística para movilizar los equipos de nuestros clientes, aunque no sean de nuestra flota.",
    tag: "Equipos de terceros",
    img: IMG.tijerasDiesel,
  },
];

/* Rango de peso y largo de cada línea (fichas del catálogo) */
const LOADS = [
  { id: "tijeras-electricas", label: "Tijeras eléctricas", minKg: 1520, maxKg: 3500, maxLength: 2.8, models: 7, img: IMG.tijerasElectricas },
  { id: "tijeras-diesel", label: "Tijeras diésel 4x4", minKg: 4060, maxKg: 7300, maxLength: 4.18, models: 3, img: IMG.tijerasDiesel },
  { id: "brazos-electricos", label: "Brazos eléctricos", minKg: 5900, maxKg: 17300, maxLength: 11.6, models: 6, img: IMG.brazosElectricos },
  { id: "brazos-diesel", label: "Brazos diésel 4x4", minKg: 6650, maxKg: 23900, maxLength: 14.8, models: 6, img: IMG.brazosDiesel },
  { id: "telescopicos", label: "Telescópicos 4x4", minKg: 5100, maxKg: 17100, maxLength: 6.87, models: 8, img: IMG.telescopicos },
  { id: "autoelevadores", label: "Autoelevadores", minKg: 4115, maxKg: 20300, maxLength: 5.13, models: 6, img: IMG.autoelevadores },
];
const HEAVIEST = Math.max(...LOADS.map((l) => l.maxKg));

const STEPS = [
  { n: "01", title: "Coordinación", text: "Acordamos fecha, horario y acceso a la obra según el inicio de tus tareas." },
  { n: "02", title: "Carga", text: "Asignamos el vehículo adecuado al peso y las dimensiones del equipo." },
  { n: "03", title: "Traslado", text: "Llevamos la máquina desde nuestra base hasta el lugar de trabajo." },
  { n: "04", title: "Entrega en obra", text: "El equipo llega a tiempo para que el trabajo arranque sin demoras." },
  { n: "05", title: "Retiro", text: "Al finalizar, coordinamos el retiro para no prolongar tu cierre de obra." },
];

const BASES = [
  { tag: "Base Buenos Aires", city: "Hurlingham", detail: "Parque Industrial Hurlingham · Camino del Buen Ayre Km 17" },
  { tag: "Base Patagonia", city: "Neuquén", detail: "Ruta Provincial Nº 51 Km 3,5 · Río Neuquén Distrito Industrial" },
];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_IO: [number, number, number, number] = [0.76, 0, 0.24, 1];

/* Ruta del hero (Neuquén → Hurlingham, estilizada) */
const ROUTE = "M 60 250 C 180 250, 220 120, 360 140 S 560 60, 700 90";

/* ============================================================
   HELPERS
   ============================================================ */
const reveal: Variants = {
  hidden: { y: "105%" },
  show: (i: number = 0) => ({ y: "0%", transition: { duration: 1.1, ease: EASE, delay: i * 0.08 } }),
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 34 },
  show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE, delay: i * 0.1 } }),
};

/* Observa el contenedor (visible), no el texto que arranca escondido */
const MaskLine = ({ children, i = 0, className = "", now = false }: { children: React.ReactNode; i?: number; className?: string; now?: boolean }) => (
  <motion.span
    className={`tr-mask ${className}`}
    initial="hidden"
    {...(now ? { animate: "show" } : { whileInView: "show", viewport: { once: true, amount: 0.3 } })}
  >
    <motion.span className="tr-mask-inner" variants={reveal} custom={i}>
      {children}
    </motion.span>
  </motion.span>
);

const kg = (n: number) => `${n.toLocaleString("es-AR")} kg`;
const m = (n: number) => `${n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m`;

const TruckIcon = () => (
  <svg viewBox="0 0 48 28" width="48" height="28" aria-hidden="true">
    <rect x="1" y="4" width="28" height="16" fill="#e3b14e" />
    <path d="M29 9h10l7 6v5H29z" fill="#e3b14e" />
    <path d="M32 11h6l4 4h-10z" fill="#000" />
    <circle cx="9" cy="22" r="4" fill="#000" stroke="#e3b14e" strokeWidth="2" />
    <circle cx="38" cy="22" r="4" fill="#000" stroke="#e3b14e" strokeWidth="2" />
  </svg>
);

/* ============================================================
   COMPONENTE
   ============================================================ */
const Transport = () => {
  const { theme } = UseTheme();
  const reduce = useReducedMotion();
  const [load, setLoad] = useState(LOADS[3].id);
  const current = LOADS.find((l) => l.id === load) ?? LOADS[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* Hero: parallax */
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroP, [0, 1], ["0%", "18%"]);

  /* Pasos: camino que se dibuja con el scroll */
  const stepsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: stepsP } = useScroll({ target: stepsRef, offset: ["start 0.8", "end 0.6"] });
  const stepsLine = useTransform(stepsP, [0, 1], [0, 1]);
  const truckX = useTransform(stepsP, [0, 1], ["0%", "100%"]);

  return (
    <main className={`tr-root ${theme}`}>

      {/* ================= HERO ================= */}
      <header className="tr-hero" ref={heroRef}>
        <motion.div className="tr-hero-media" style={{ y: reduce ? 0 : heroY }}>
          <img src={IMG.hero} alt="" />
        </motion.div>
        <span className="tr-hero-shade" aria-hidden="true" />

        <div className="tr-hero-content">
          <div className="tr-hero-text">
            <motion.span
              className="tr-eyebrow"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <span className="tr-dot" />
              Logística y transporte
            </motion.span>

            <h1 className="tr-hero-title">
              <MaskLine now i={0}>Llevamos</MaskLine>
              <MaskLine now i={1}>la altura</MaskLine>
              <MaskLine now i={2} className="tr-accent">a tu obra.</MaskLine>
            </h1>

            <motion.p
              className="tr-hero-lead"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
            >
              Vehículos de transporte adecuados para cada máquina y un equipo que coordina la
              entrega y el retiro para que tu trabajo empiece y termine a tiempo.
            </motion.p>

            <motion.div
              className="tr-hero-actions"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.62 }}
            >
              <Link to="/contact" className="tr-btn tr-btn-primary">
                Coordinar una entrega <span aria-hidden="true">→</span>
              </Link>
              <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="tr-btn tr-btn-ghost">
                WhatsApp
              </a>
            </motion.div>
          </div>

          {/* Ruta animada entre bases */}
          <motion.div
            className="tr-route"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 760 320" className="tr-route-svg">
              <defs>
                <pattern id="tr-grid" width="38" height="38" patternUnits="userSpaceOnUse">
                  <path d="M38 0H0V38" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="760" height="320" fill="url(#tr-grid)" />

              <path id="tr-route-path" d={ROUTE} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeDasharray="6 8" />
              <motion.path
                d={ROUTE}
                fill="none"
                stroke="#e3b14e"
                strokeWidth="3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.4, ease: EASE_IO, delay: 0.6 }}
              />

              {/* Puntos de base */}
              <g>
                <circle cx="60" cy="250" r="22" fill="rgba(227,177,78,0.14)" className="tr-pulse" />
                <circle cx="60" cy="250" r="7" fill="#e3b14e" />
                <text x="40" y="296" textAnchor="start" className="tr-route-label">NEUQUÉN</text>
              </g>
              <g>
                <circle cx="700" cy="90" r="22" fill="rgba(227,177,78,0.14)" className="tr-pulse tr-pulse-2" />
                <circle cx="700" cy="90" r="7" fill="#e3b14e" />
                <text x="724" y="52" textAnchor="end" className="tr-route-label">HURLINGHAM</text>
              </g>

              {/* Camión recorriendo la ruta */}
              {!reduce && (
                <g className="tr-truck">
                  <g transform="translate(-24 -26)">
                    <rect x="1" y="4" width="28" height="16" fill="#e3b14e" />
                    <path d="M29 9h10l7 6v5H29z" fill="#e3b14e" />
                    <path d="M32 11h6l4 4h-10z" fill="#000" />
                    <circle cx="9" cy="22" r="4" fill="#000" stroke="#e3b14e" strokeWidth="2" />
                    <circle cx="38" cy="22" r="4" fill="#000" stroke="#e3b14e" strokeWidth="2" />
                  </g>
                  <animateMotion dur="7s" repeatCount="indefinite" begin="2.4s" rotate="auto" keyPoints="0;1;1" keyTimes="0;0.85;1" calcMode="linear">
                    <mpath href="#tr-route-path" />
                  </animateMotion>
                </g>
              )}
            </svg>

            <div className="tr-route-meta">
              <span>2 bases operativas</span>
              <span>Buenos Aires · Patagonia</span>
            </div>
          </motion.div>
        </div>

        <motion.span
          className="tr-hero-line"
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.4, ease: EASE_IO, delay: 0.3 }}
        />
      </header>

      {/* ================= SERVICIOS ================= */}
      <section className="tr-services">
        <div className="tr-container">
          <div className="tr-head">
            <span className="tr-eyebrow tr-eyebrow-dark">
              <span className="tr-dot" />
              Qué hacemos
            </span>
            <h2 className="tr-h2">
              <MaskLine i={0}>Logística pensada</MaskLine>
              <MaskLine i={1} className="tr-accent">para equipos pesados.</MaskLine>
            </h2>
          </div>

          <div className="tr-cards">
            {SERVICES.map((s, i) => (
              <motion.article
                key={s.n}
                className="tr-card"
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
              >
                <div className="tr-card-media">
                  <img src={s.img} alt="" loading="lazy" />
                  <span className="tr-card-n">{s.n}</span>
                </div>
                <div className="tr-card-body">
                  <span className="tr-card-tag">{s.tag}</span>
                  <h3 className="tr-card-title">{s.title}</h3>
                  <p className="tr-card-text">{s.text}</p>
                </div>
                <span className="tr-card-bar" aria-hidden="true" />
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CARGA POR EQUIPO (interactivo) ================= */}
      <section className="tr-loads">
        <div className="tr-container">
          <div className="tr-loads-grid">
            <div className="tr-loads-info">
              <span className="tr-eyebrow tr-eyebrow-dark">
                <span className="tr-dot" />
                Cada máquina, su transporte
              </span>
              <h2 className="tr-h2 tr-h2-sm">
                <MaskLine i={0}>Elegí el equipo.</MaskLine>
                <MaskLine i={1} className="tr-accent">Nosotros, el vehículo.</MaskLine>
              </h2>
              <p className="tr-text">
                Movemos desde equipos de 1.500 kg hasta máquinas de más de 20 toneladas. Elegí una
                línea para ver el rango de peso y largo que trasladamos.
              </p>

              <div className="tr-load-tabs" role="tablist" aria-label="Línea de equipos">
                {LOADS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    role="tab"
                    aria-selected={load === l.id}
                    className={`tr-load-tab ${load === l.id ? "is-active" : ""}`}
                    onClick={() => setLoad(l.id)}
                  >
                    {load === l.id && (
                      <motion.span layoutId="tr-load-pill" className="tr-load-pill" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
                    )}
                    <span className="tr-load-tab-label">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="tr-loads-panel">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  className="tr-loads-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <div className="tr-loads-media">
                    <img src={current.img} alt={current.label} />
                    <span className="tr-loads-name">{current.label}</span>
                  </div>

                  <div className="tr-loads-data">
                    <div className="tr-loads-row">
                      <span>Peso por equipo</span>
                      <strong>
                        {kg(current.minKg)} <em>—</em> {kg(current.maxKg)}
                      </strong>
                    </div>

                    {/* Barra de peso relativa al equipo más pesado */}
                    <div className="tr-meter" aria-hidden="true">
                      <motion.span
                        className="tr-meter-fill"
                        initial={{ left: "0%", width: "0%" }}
                        animate={{
                          left: `${(current.minKg / HEAVIEST) * 100}%`,
                          width: `${((current.maxKg - current.minKg) / HEAVIEST) * 100}%`,
                        }}
                        transition={{ duration: 0.8, ease: EASE }}
                      />
                      <span className="tr-meter-scale">
                        <span>0</span>
                        <span>{kg(HEAVIEST)}</span>
                      </span>
                    </div>

                    <div className="tr-loads-split">
                      <div>
                        <span>Largo máximo</span>
                        <strong>{m(current.maxLength)}</strong>
                      </div>
                      <div>
                        <span>Modelos</span>
                        <strong>{current.models}</strong>
                      </div>
                    </div>

                    <Link
                      to={`/contact?equipo=transporte-${current.id}&modelo=${encodeURIComponent(`Transporte · ${current.label}`)}`}
                      className="tr-loads-cta"
                    >
                      <span>Consultar traslado</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PROCESO ================= */}
      <section className="tr-process">
        <div className="tr-container">
          <div className="tr-head">
            <span className="tr-eyebrow tr-eyebrow-dark">
              <span className="tr-dot" />
              Cómo es una entrega
            </span>
            <h2 className="tr-h2">
              <MaskLine i={0}>De nuestra base</MaskLine>
              <MaskLine i={1} className="tr-accent">a tu obra.</MaskLine>
            </h2>
          </div>

          <div className="tr-steps" ref={stepsRef}>
            <div className="tr-road" aria-hidden="true">
              <motion.span className="tr-road-fill" style={{ scaleX: reduce ? 1 : stepsLine }} />
              <motion.span className="tr-road-truck" style={{ left: reduce ? "100%" : truckX }}>
                <TruckIcon />
              </motion.span>
            </div>

            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                className="tr-step"
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.4 }}
              >
                <span className="tr-step-dot" aria-hidden="true" />
                <span className="tr-step-n">{s.n}</span>
                <h3 className="tr-step-title">{s.title}</h3>
                <p className="tr-step-text">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BASES ================= */}
      <section className="tr-bases">
        <div className="tr-container">
          <div className="tr-bases-grid">
            {BASES.map((b, i) => (
              <motion.div
                key={b.city}
                className="tr-base"
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.4 }}
              >
                <span className="tr-base-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="tr-base-tag">{b.tag}</span>
                <span className="tr-base-city">{b.city}</span>
                <span className="tr-base-detail">{b.detail}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="tr-cta">
        <div className="tr-container tr-cta-inner">
          <div>
            <span className="tr-cta-tag">¿Tenés que mover un equipo?</span>
            <h2 className="tr-cta-title">
              <MaskLine i={0}>Coordinemos</MaskLine>
              <MaskLine i={1} className="tr-cta-accent">el traslado.</MaskLine>
            </h2>
            <p className="tr-cta-text">
              Sea de nuestra flota o propio, te ayudamos a llevarlo a donde lo necesitás.
            </p>
          </div>

          <motion.div
            className="tr-cta-actions"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
          >
            <motion.div variants={fadeUp} custom={0}>
              <Link to="/contact" className="tr-cta-main">
                <span>Solicitar transporte</span>
                <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
            <motion.a variants={fadeUp} custom={1} href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="tr-cta-wa">
              <span>WhatsApp Buenos Aires</span>
              <strong>{CONTACT.whatsappLabel}</strong>
            </motion.a>
            <motion.a variants={fadeUp} custom={2} href={CONTACT.whatsappNeuquen} target="_blank" rel="noopener noreferrer" className="tr-cta-wa">
              <span>WhatsApp Neuquén</span>
              <strong>{CONTACT.whatsappNeuquenLabel}</strong>
            </motion.a>
          </motion.div>
        </div>
      </section>

      <span className="tr-hazard" aria-hidden="true" />
    </main>
  );
};

export default Transport;