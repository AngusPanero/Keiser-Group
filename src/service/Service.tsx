import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useScroll, useTransform, useReducedMotion, animate, type Variants } from "framer-motion";
import { UseTheme } from "../contexts/ThemeContext";
import "./service.css";

/**
 * Service — Keiser Group (ruta /service)
 * ---------------------------------------------------------
 * Servicio y soporte técnico: mantenimiento de flota, repuestos
 * propios y reparación de máquinas externas (multimarca).
 * Fotos: las mismas del catálogo (public/fotos y public/catalog).
 */

/* ============================================================
   CONTENIDO
   ============================================================ */
const IMG = {
  hero: "/catalog/catalog-hero.webp",
  tijerasElectricas: "/fotos/catalog-tijeras-electricas.webp",
  tijerasDiesel: "/fotos/catalog-tijeras-diesel.webp",
  brazosElectricos: "/fotos/catalog-brazos-electricos.webp",
  brazosDiesel: "/fotos/catalog-brazos-diesel.webp",
  telescopicos: "/fotos/catalog-telescopicos.webp",
  autoelevadores: "/fotos/catalog-autoelevadores.webp",
};

const CONTACT = {
  whatsapp: "https://api.whatsapp.com/send?phone=5491126973540",
  whatsappLabel: "+54 9 11 2697 3540",
  whatsappNeuquen: "https://api.whatsapp.com/send?phone=5492996114040",
  whatsappNeuquenLabel: "+54 9 299 611 4040",
};

const PILLARS = [
  {
    n: "01",
    tag: "Flota Keiser",
    title: "Mantenimiento de flota",
    text: "Contamos con un grupo técnico altamente calificado, que ofrece un servicio de asistencia eficaz para optimizar el tiempo de diagnóstico y solución de problemas, de manera de no prolongar el paro de máquinas.",
    points: ["Grupo técnico calificado", "Diagnóstico rápido", "Menos tiempo de máquina parada"],
    img: IMG.brazosElectricos,
  },
  {
    n: "02",
    tag: "Stock permanente",
    title: "Repuestos propios",
    text: "Un stock permanente de repuestos originales asegura el 100% de los componentes con disponibilidad inmediata, para que la reparación no dependa de esperas.",
    points: ["Repuestos originales", "Disponibilidad inmediata", "Stock permanente"],
    img: IMG.tijerasElectricas,
  },
  {
    n: "03",
    tag: "Multimarca",
    title: "Máquinas externas",
    text: "Ofrecemos mantenimiento y reparación de la línea HAULOTTE, en la que nos especializamos, y también de JLG, GENIE, MANITOU, SNORKEL, SKYJACK, UPRIGHT, TEREX, SKYTRAK y GROVE, entre otras.",
    points: ["Especialistas en Haulotte", "Equipos de terceros", "Más de 10 marcas"],
    img: IMG.brazosDiesel,
  },
];

const STEPS = [
  {
    n: "01",
    title: "Consulta",
    text: "Nos contás qué equipo tenés, qué falla presenta y dónde está trabajando.",
  },
  {
    n: "02",
    title: "Diagnóstico",
    text: "Nuestro grupo técnico identifica el problema en el menor tiempo posible.",
  },
  {
    n: "03",
    title: "Solución",
    text: "Reparamos con repuestos originales en stock, sin prolongar el paro de la máquina.",
  },
  {
    n: "04",
    title: "Postventa",
    text: "Escuchamos tu demanda y, con un proceso de mejora continua, nos adaptamos a tus necesidades.",
  },
];

const BRANDS = ["JLG", "GENIE", "MANITOU", "SNORKEL", "SKYJACK", "UPRIGHT", "TEREX", "SKYTRAK", "GROVE"];

const GALLERY = [
  { src: IMG.tijerasElectricas, label: "Tijeras eléctricas" },
  { src: IMG.brazosDiesel, label: "Brazos diésel 4x4" },
  { src: IMG.telescopicos, label: "Telescópicos 4x4" },
  { src: IMG.tijerasDiesel, label: "Tijeras diésel 4x4" },
  { src: IMG.brazosElectricos, label: "Brazos eléctricos" },
  { src: IMG.autoelevadores, label: "Autoelevadores" },
];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_IO: [number, number, number, number] = [0.76, 0, 0.24, 1];

/* ============================================================
   HELPERS
   ============================================================ */
const reveal: Variants = {
  hidden: { y: "105%" },
  show: (i: number = 0) => ({ y: "0%", transition: { duration: 1.1, ease: EASE, delay: i * 0.08 } }),
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE, delay: i * 0.1 } }),
};

/* Línea que sube desde una máscara. Observa el contenedor (siempre visible), no el texto. */
const MaskLine = ({ children, i = 0, className = "", now = false }: { children: React.ReactNode; i?: number; className?: string; now?: boolean }) => (
  <motion.span
    className={`sv-mask ${className}`}
    initial="hidden"
    {...(now ? { animate: "show" } : { whileInView: "show", viewport: { once: true, amount: 0.3 } })}
  >
    <motion.span className="sv-mask-inner" variants={reveal} custom={i}>
      {children}
    </motion.span>
  </motion.span>
);

const Counter = ({ to, suffix = "" }: { to: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, to, { duration: 2.2, ease: EASE, onUpdate: (v) => setVal(Math.round(v)) });
    return () => ctrl.stop();
  }, [inView, to]);
  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
};

/* Foto con cortina de entrada + parallax (el contenedor dispara la animación) */
const RevealImage = ({ src, alt, side = "left", className = "" }: { src: string; alt: string; side?: "left" | "right"; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-9%", "9%"]);
  return (
    <motion.div
      ref={ref}
      className={`sv-reveal ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div
        className="sv-reveal-frame"
        variants={{
          hidden: { clipPath: side === "left" ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" },
          show: { clipPath: "inset(0 0% 0 0%)", transition: { duration: 1.3, ease: EASE_IO } },
        }}
      >
        <motion.img src={src} alt={alt} loading="lazy" style={{ y: reduce ? 0 : y }} />
        <span className="sv-reveal-shade" aria-hidden="true" />
      </motion.div>
    </motion.div>
  );
};

/* ============================================================
   COMPONENTE
   ============================================================ */
const Service = () => {
  const { theme } = UseTheme();
  const reduce = useReducedMotion();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* Hero: parallax de la foto */
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(heroP, [0, 1], [1, 1.15]);
  const heroFade = useTransform(heroP, [0, 0.8], [1, 0.2]);

  /* Proceso: línea que se completa con el scroll */
  const stepsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: stepsP } = useScroll({ target: stepsRef, offset: ["start 0.8", "end 0.55"] });
  const stepsLine = useTransform(stepsP, [0, 1], [0, 1]);

  return (
    <main className={`sv-root ${theme}`}>

      {/* ================= HERO ================= */}
      <header className="sv-hero" ref={heroRef}>
        <motion.div className="sv-hero-media" style={{ scale: reduce ? 1 : heroScale, opacity: heroFade }}>
          <img src={IMG.hero} alt="" />
          <span className="sv-hero-shade" aria-hidden="true" />
        </motion.div>

        <div className="sv-hero-content">
          <motion.span
            className="sv-eyebrow"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <span className="sv-dot" />
            Servicio y soporte técnico
          </motion.span>

          <h1 className="sv-hero-title">
            <MaskLine now i={0}>Expertos en</MaskLine>
            <MaskLine now i={1} className="sv-accent">mantenimiento de equipos</MaskLine>
          </h1>

          <motion.p
            className="sv-hero-lead"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.45 }}
          >
            Trabajamos brindando el apoyo profesional que necesitan nuestros clientes para
            maximizar la productividad de los equipos.
          </motion.p>

          <motion.ul
            className="sv-hero-pillars"
            initial="hidden"
            animate="show"
          >
            {["Mantenimiento de flota Keiser", "Repuestos propios", "Arreglos de máquinas externas"].map((t, i) => (
              <motion.li key={t} variants={fadeUp} custom={i + 5}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {t}
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <motion.span
          className="sv-hero-line"
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.4, ease: EASE_IO, delay: 0.3 }}
        />
      </header>

      {/* ================= PILARES ================= */}
      <section className="sv-pillars">
        {PILLARS.map((p, i) => (
          <article key={p.n} className={`sv-pillar ${i % 2 === 1 ? "is-reverse" : ""}`}>
            <div className="sv-pillar-media">
              <span className="sv-pillar-n" aria-hidden="true">{p.n}</span>
              <RevealImage src={p.img} alt={p.title} side={i % 2 === 1 ? "right" : "left"} />
            </div>

            <motion.div
              className="sv-pillar-info"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.span className="sv-tag" variants={fadeUp} custom={0}>{p.tag}</motion.span>
              <h2 className="sv-h2">
                <MaskLine i={0}>{p.title}</MaskLine>
              </h2>
              <motion.p className="sv-text" variants={fadeUp} custom={1}>{p.text}</motion.p>
              <motion.ul className="sv-points" variants={fadeUp} custom={2}>
                {p.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </motion.ul>
            </motion.div>
          </article>
        ))}
      </section>

      {/* ================= 100% ================= */}
      <section className="sv-stat">
        <div className="sv-stat-inner">
          <div className="sv-stat-value" aria-label="100%">
            <Counter to={100} suffix="%" />
          </div>
          <motion.div
            className="sv-stat-info"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
          >
            <motion.span className="sv-stat-tag" variants={fadeUp} custom={0}>Repuestos originales</motion.span>
            <motion.p className="sv-stat-text" variants={fadeUp} custom={1}>
              de los componentes con disponibilidad inmediata, gracias a un stock permanente de
              repuestos propios.
            </motion.p>
          </motion.div>
        </div>
        <div className="sv-stat-stripes" aria-hidden="true" />
      </section>

      {/* ================= PROCESO ================= */}
      <section className="sv-process">
        <div className="sv-container">
          <div className="sv-section-head">
            <span className="sv-eyebrow sv-eyebrow-dark">
              <span className="sv-dot" />
              Cómo trabajamos
            </span>
            <h2 className="sv-h2 sv-h2-xl">
              <MaskLine i={0}>Del diagnóstico</MaskLine>
              <MaskLine i={1} className="sv-accent">a la postventa.</MaskLine>
            </h2>
          </div>

          <div className="sv-steps" ref={stepsRef}>
            <div className="sv-steps-track" aria-hidden="true">
              <motion.span style={{ scaleX: reduce ? 1 : stepsLine }} />
            </div>
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                className="sv-step"
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.4 }}
              >
                <span className="sv-step-dot" aria-hidden="true" />
                <span className="sv-step-n">{s.n}</span>
                <h3 className="sv-step-title">{s.title}</h3>
                <p className="sv-step-text">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MARCAS ================= */}
      <section className="sv-brands">
        <div className="sv-container">
          <div className="sv-brands-grid">
            <motion.div
              className="sv-brand-main"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.span className="sv-tag" variants={fadeUp} custom={0}>Nos especializamos en</motion.span>
              <motion.span className="sv-brand-main-name" variants={fadeUp} custom={1}>HAULOTTE</motion.span>
              <motion.p className="sv-text" variants={fadeUp} custom={2}>
                Mantenimiento y reparación de toda la línea Haulotte, con repuestos originales y
                técnicos especializados.
              </motion.p>
            </motion.div>

            <div className="sv-brand-list">
              <span className="sv-brand-list-tag">También reparamos</span>
              <ul>
                {BRANDS.map((b, i) => (
                  <motion.li
                    key={b}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: EASE, delay: i * 0.05 }}
                  >
                    <span className="sv-brand-n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="sv-brand-name">{b}</span>
                    <span className="sv-brand-arrow" aria-hidden="true">↗</span>
                  </motion.li>
                ))}
                <motion.li
                  className="sv-brand-more"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: EASE, delay: BRANDS.length * 0.05 }}
                >
                  <span className="sv-brand-name">y otras marcas</span>
                </motion.li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================= GALERÍA ================= */}
      <section className="sv-gallery" aria-label="Equipos en acción">
        <div className="sv-container sv-gallery-head">
          <span className="sv-eyebrow sv-eyebrow-dark">
            <span className="sv-dot" />
            Equipos que mantenemos
          </span>
        </div>
        <div className="sv-gallery-marquee">
          <div className="sv-gallery-track">
            {[...GALLERY, ...GALLERY].map((g, i) => (
              <figure className="sv-gallery-item" key={i}>
                <img src={g.src} alt={i < GALLERY.length ? g.label : ""} loading="lazy" />
                <figcaption>{g.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="sv-cta">
        <div className="sv-container sv-cta-inner">
          <div>
            <span className="sv-cta-tag">¿Tu equipo está parado?</span>
            <h2 className="sv-cta-title">
              <MaskLine i={0}>Hablemos y</MaskLine>
              <MaskLine i={1}>lo ponemos a</MaskLine>
              <MaskLine i={2} className="sv-cta-accent">trabajar.</MaskLine>
            </h2>
          </div>

          <motion.div
            className="sv-cta-actions"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
          >
            <motion.div variants={fadeUp} custom={0}>
              <Link to="/contact" className="sv-cta-main">
                <span>Solicitar servicio técnico</span>
                <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
            <motion.a variants={fadeUp} custom={1} href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="sv-cta-wa">
              <span>WhatsApp Buenos Aires</span>
              <strong>{CONTACT.whatsappLabel}</strong>
            </motion.a>
            <motion.a variants={fadeUp} custom={2} href={CONTACT.whatsappNeuquen} target="_blank" rel="noopener noreferrer" className="sv-cta-wa">
              <span>WhatsApp Neuquén</span>
              <strong>{CONTACT.whatsappNeuquenLabel}</strong>
            </motion.a>
          </motion.div>
        </div>
      </section>

      <span className="sv-hazard" aria-hidden="true" />
    </main>
  );
};

export default Service;