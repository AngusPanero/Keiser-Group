import "./footer.css";
import { UseTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";

/**
 * Footer — Keiser Group
 * ---------------------------------------------------------
 * Misma lógica que el footer de siempre (UseTheme, grid de
 * secciones, mapa embebido, bottom bar), con el sistema visual
 * de Keiser: negro puro, blanco puro y amarillo. Sin navegación;
 * en su lugar, botón para volver arriba.
 */

const CONTACT = {
    whatsapp: "https://api.whatsapp.com/send?phone=5491126973540",
    whatsappLabel: "+54 9 11 2697 3540",
    tel1: "tel:+541143014323",
    tel1Label: "+54 11 4301 4323",
    tel2: "tel:+541143012976",
    tel2Label: "+54 11 4301 2976",
    mapsHurlingham:
        "https://www.google.com/maps/search/?api=1&query=Parque+Industrial+Hurlingham+Camino+del+Buen+Ayre+Km+17",
    mapsNeuquen:
        "https://www.google.com/maps/place/KEISER+Sucursal+Neuqu%C3%A9n/@-38.7424646,-68.1967459,17z",
};

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

const SOCIALS = [
    {
        name: "LinkedIn",
        href: "https://www.linkedin.com/company/keiser-group-srl/home/",
        icon: (
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
                <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1v5.45h-4v-4.83c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.91h-3.95v-11Z" />
            </svg>
        ),
    },
    {
        name: "YouTube",
        href: "https://www.youtube.com/channel/UCcUosdXrOut0S585hLHCiuQ/featured",
        icon: (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M22.5 7.2a2.8 2.8 0 0 0-2-2C18.8 4.7 12 4.7 12 4.7s-6.8 0-8.5.5a2.8 2.8 0 0 0-2 2C1 8.9 1 12 1 12s0 3.1.5 4.8a2.8 2.8 0 0 0 2 2c1.7.5 8.5.5 8.5.5s6.8 0 8.5-.5a2.8 2.8 0 0 0 2-2c.5-1.7.5-4.8.5-4.8s0-3.1-.5-4.8ZM9.8 15.1V8.9l5.7 3.1-5.7 3.1Z" />
            </svg>
        ),
    },
    {
        name: "Facebook",
        href: "https://www.facebook.com/Keiser.Group",
        icon: (
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
                <path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.25-1.5 1.55-1.5h1.65V3.45A22 22 0 0 0 14.3 3.3c-2.4 0-4.05 1.47-4.05 4.17v2.33H7.5V13h2.75v8h3.25Z" />
            </svg>
        ),
    },
    {
        name: "Instagram",
        href: "https://www.instagram.com/keisergroup/",
        icon: (
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
            </svg>
        ),
    },
];

const Footer = () => {
    const { theme } = UseTheme();

    const scrollTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className={`footer-corporate ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
            <span className="footer-corporate-hazard" aria-hidden="true" />

            <div className="footer-corporate-grid">

                {/* BRAND */}
                <div className="footer-corporate-brand">
                    <motion.img
                        src={theme === "dark" ? "/logos/keiser-logo-blanco.png" : "/logos/keiser-logo-negro.png"}
                        alt="Keiser Group"
                        className="footer-corporate-logo-img"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: EASE }}
                    />
                    <p className="footer-corporate-tagline">PLATAFORMAS DE ELEVACIÓN · SERVICIO TÉCNICO</p>
                    <p className="footer-corporate-description">
                        Flota propia, repuestos originales con disponibilidad inmediata y un
                        grupo técnico altamente calificado para que ninguna máquina se detenga.
                    </p>
                    <span className="footer-corporate-horizon" />

                    {/* REDES */}
                    <div className="footer-corporate-socials">
                        <span className="footer-corporate-socials-label">Seguinos</span>
                        <ul className="footer-corporate-socials-list">
                            {SOCIALS.map((s, i) => (
                                <motion.li
                                    key={s.name}
                                    initial={{ opacity: 0, y: 14 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, ease: EASE, delay: 0.1 + i * 0.07 }}
                                >
                                    <a
                                        href={s.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="footer-corporate-social"
                                        aria-label={`Keiser Group en ${s.name}`}
                                    >
                                        <span className="footer-corporate-social-fill" aria-hidden="true" />
                                        <span className="footer-corporate-social-icon">{s.icon}</span>
                                    </a>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* CASA CENTRAL */}
                <div className="footer-corporate-section">
                    <h4 className="footer-corporate-title">Casa Central</h4>
                    <ul className="footer-corporate-list">
                        <li className="footer-corporate-location">
                            Parque Industrial Hurlingham<br />
                            Camino del Buen Ayre Km 17<br />
                            Buenos Aires, Argentina
                        </li>
                        <li>
                            <a
                                href={CONTACT.mapsHurlingham}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="footer-corporate-link-highlight"
                            >
                                Cómo llegar
                            </a>
                        </li>
                    </ul>
                </div>

                {/* SUCURSAL */}
                <div className="footer-corporate-section">
                    <h4 className="footer-corporate-title">Sucursal Neuquén</h4>
                    <ul className="footer-corporate-list">
                        <li className="footer-corporate-location">
                            Base operativa Patagonia<br />
                            Neuquén, Argentina
                        </li>
                        <li>
                            <a
                                href={CONTACT.mapsNeuquen}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="footer-corporate-link-highlight"
                            >
                                Cómo llegar
                            </a>
                        </li>
                    </ul>
                </div>

                {/* CONTACTO */}
                <div className="footer-corporate-section">
                    <h4 className="footer-corporate-title">Comunicación Directa</h4>
                    <ul className="footer-corporate-list">
                        <li>
                            <a
                                href={CONTACT.whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="footer-corporate-wa"
                            >
                                <strong>WHATSAPP</strong>
                                <span>{CONTACT.whatsappLabel}</span>
                            </a>
                        </li>
                        <li className="footer-corporate-location">
                            <strong>TEL.</strong>{" "}
                            <a href={CONTACT.tel1}>{CONTACT.tel1Label}</a>
                        </li>
                        <li className="footer-corporate-location">
                            <strong>TEL.</strong>{" "}
                            <a href={CONTACT.tel2}>{CONTACT.tel2Label}</a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* MAPA */}
            <div className="footer-corporate-map-container">
                <iframe
                    src="https://www.google.com/maps?q=Parque+Industrial+Hurlingham,+Camino+del+Buen+Ayre+Km+17,+Buenos+Aires&output=embed"
                    className="footer-corporate-iframe"
                    title="Keiser Group — Casa Central Hurlingham"
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </div>

            <div className="footer-corporate-bottom">
                <span>
                    © {new Date().getFullYear()} Keiser Group · Buenos Aires, Argentina
                    {" · "}Desarrollado por{" "}
                    <a
                        href="https://www.deepdev.com.ar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-corporate-dev-link"
                    >
                        DeepDev Studio
                    </a>
                </span>

                <motion.button
                    type="button"
                    className="footer-corporate-top"
                    onClick={scrollTop}
                    aria-label="Volver arriba"
                    whileTap={{ scale: 0.94 }}
                >
                    <span className="footer-corporate-top-label">VOLVER A 00 M</span>
                    <span className="footer-corporate-top-icon" aria-hidden="true">
                        <span className="footer-corporate-top-arrow">↑</span>
                        <span className="footer-corporate-top-arrow footer-corporate-top-arrow-next">↑</span>
                    </span>
                </motion.button>
            </div>
        </footer>
    );
};

export default Footer;