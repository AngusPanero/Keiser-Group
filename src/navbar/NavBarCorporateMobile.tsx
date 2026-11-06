import { forwardRef } from "react";
import moon from "/logos/moon2.svg"
import sun from "/logos/sun.svg"
import { UseSession } from "../contexts/SessionContext";
import "./navBarCorporate.css";

interface NavBarMobileProps {
    closeMenu: () => void;
    texts: any;
    language: string;
    theme: string;
    toggleThemeWithAnimation: (e: React.MouseEvent<HTMLButtonElement>) => void;
    handleLanguage: (e: string) => void;
    openLogin: () => void;
}

// TODO (Angus): ajustá las rutas a las páginas reales del proyecto.
const LINKS = [
    { label: "Inicio", to: "/" },
    { label: "Flota", to: "/fleet" },
    { label: "Servicio Técnico", to: "/service" },
    { label: "Sedes", to: "/locations" },
    { label: "Contacto", to: "/contact" },
];

const WHATSAPP = "https://api.whatsapp.com/send?phone=5491126973540";

const pad = (n: number) => String(n).padStart(2, "0");

const NavBarCorporateMobile = forwardRef(({ closeMenu, texts, language, theme, toggleThemeWithAnimation, openLogin }: NavBarMobileProps, ref: any) => {
    const { user, handleLogout } = UseSession()

    const items = [
        ...LINKS,
        ...(user && user.admin === true ? [{ label: "Administrador", to: "/admin" }] : []),
    ];

    const loginLabel = texts?.[language]?.nav?.login ?? "Ingresar";

    return (
        <div className={`mobile-menu-container ${theme} corporate-mobile-panel`} ref={ref}>
            <span className="mobile-panel-hazard" aria-hidden="true" />

            <div className="mobile-panel-header">
                <span className="panel-title">MENÚ · NIVEL 00 M</span>
                <button className="close-panel-btn" onClick={closeMenu} aria-label="Cerrar menú">
                    <span />
                    <span />
                </button>
            </div>

            <nav className="mobile-nav-links">
                {items.map((link, i) => (
                    <a
                        key={link.to}
                        href={link.to}
                        onClick={closeMenu}
                        className={link.to === "/admin" ? "mobile-dash-link" : ""}
                        style={{ animationDelay: `${120 + i * 70}ms` }}
                    >
                        <span className="link-number">{pad(i + 1)}</span>
                        <span className="link-label">{link.label}</span>
                        <span className="link-arrow">→</span>
                    </a>
                ))}
            </nav>

            <div className="mobile-extra-actions">
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="mobile-wa-block">
                    <span>WHATSAPP</span>
                    <strong>+54 9 11 2697 3540</strong>
                </a>

                <div className="action-label">Preferencia de sistema</div>

                <div className="mobile-selectors">
                    <button className="theme-toggle-mobile" onClick={toggleThemeWithAnimation}>
                        <img src={theme === "dark" ? sun : moon} alt="theme-icon" width={18} />
                        <span>{theme === "dark" ? "Modo Claro" : "Modo Oscuro"}</span>
                    </button>

                    <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" onClick={closeMenu} className="corporate-auth-btn reservas">
                        Cotizar
                    </a>
                </div>

                {user ? (
                    <button onClick={() => { handleLogout(); closeMenu(); }} className="corporate-auth-btn logout">
                        Finalizar Sesión
                    </button>
                ) : (
                    <button onClick={() => { openLogin(); closeMenu(); }} className="corporate-auth-btn login">
                        {loginLabel}
                    </button>
                )}

                <span className="mobile-panel-address">Hurlingham · Neuquén — Argentina</span>
            </div>
        </div>
    );
});

export default NavBarCorporateMobile;