import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { UseTheme } from '../contexts/ThemeContext';
import { UseSession } from '../contexts/SessionContext';
// TODO (Angus): confirmá el path real de tu modal de login/registro.
import LoginCorporate from './LoginCorporate';
// TODO (Angus): confirmá el path real del registro.
import RegisterMinimal from './RegisterMinimal';
import './navBarCorporate.css';

/**
 * NavBarCorporate — Keiser Group
 * ---------------------------------------------------------
 * Componente único y autocontenido: solo maneja la navegación
 * (desktop + mobile). Se monta por fuera, en el layout:
 * <NavBarCorporate /> <Home /> <Footer />
 *
 * - Transparente sobre el hero, vidrio al scrollear.
 * - Se esconde al bajar y reaparece al subir.
 * - Links con efecto de rodillo y numeración técnica.
 * - Menú mobile a pantalla completa.
 */

// TODO (Angus): ajustá las rutas a las páginas reales del proyecto.
const NAV_LINKS = [
  { label: 'Flota', to: '/fleet' },
  { label: 'Servicio Técnico', to: '/service' },
  { label: 'Sedes', to: '/locations' },
  { label: 'Contacto', to: '/contact' },
];

const WHATSAPP = 'https://api.whatsapp.com/send?phone=5491126973540';

const pad = (n: number) => String(n).padStart(2, '0');

/* Texto duplicado para el efecto de rodillo en hover */
const Roll = ({ text }: { text: string }) => (
  <span className="nav-corporate-roll" aria-hidden="true">
    <span className="nav-corporate-roll-a">{text}</span>
    <span className="nav-corporate-roll-b">{text}</span>
  </span>
);

const ThemeIcon = ({ theme }: { theme: string }) =>
  theme === 'dark' ? (
    <svg viewBox="0 0 24 24" fill="none" className="nav-corporate-theme-icon">
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.55 1.55M18.25 18.25l1.55 1.55M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.55-1.55M18.25 5.75l1.55-1.55"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" className="nav-corporate-theme-icon">
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        d="M20 14.2A8.4 8.4 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z"
      />
    </svg>
  );

const NavBarCorporate: React.FC = () => {
  const { theme, handleTheme } = UseTheme();
  const { user, handleLogout } = UseSession();

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const lastY = useRef(0);

  // Round-morph con view-transition, igual que en el resto de tus proyectos:
  // el círculo nace desde el punto exacto donde se hizo click.
  const toggleThemeWithAnimation = (e: React.MouseEvent<HTMLButtonElement>) => {
    const x = e.clientX;
    const y = e.clientY;
    document.documentElement.style.setProperty('--x', `${x}px`);
    document.documentElement.style.setProperty('--y', `${y}px`);

    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    if (!document.startViewTransition) {
      handleTheme(nextTheme);
      return;
    }

    document.startViewTransition(() => handleTheme(nextTheme));
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      // Se esconde al bajar, aparece al subir
      if (y > 160 && y > lastY.current + 4) setHidden(true);
      else if (y < lastY.current - 4 || y <= 160) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Bloquea el scroll del body mientras el menú mobile está abierto.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Cierra el menú con Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  const mobileItems = [
    ...NAV_LINKS,
    ...(user && user.admin === true ? [{ label: 'Administrador', to: '/admin' }] : []),
  ];

  return (
    <>
      <header
        className={[
          'nav-corporate',
          scrolled ? 'is-scrolled' : '',
          hidden && !mobileOpen ? 'is-hidden' : '',
          mobileOpen ? 'is-menu-open' : '',
          theme === 'dark' ? 'theme-dark' : 'theme-light',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <nav className="nav-corporate-bar">
          <NavLink to="/" className="nav-corporate-logo" onClick={closeMobile} aria-label="Keiser Group — Inicio">
            <img
              src="/logos/keiser-logo-blanco.png"
              alt="Keiser Group"
              className="nav-corporate-logo-img nav-corporate-logo-light"
            />
            <img
              src="/logos/keiser-logo-negro.png"
              alt=""
              aria-hidden="true"
              className="nav-corporate-logo-img nav-corporate-logo-dark"
            />
          </NavLink>

          {/* ---------- Links desktop ---------- */}
          <ul className="nav-corporate-links">
            {NAV_LINKS.map((link, i) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `nav-corporate-link ${isActive ? 'is-active' : ''}`
                  }
                >
                  <span className="nav-corporate-link-index">{pad(i + 1)}</span>
                  <span className="nav-corporate-sr">{link.label}</span>
                  <Roll text={link.label} />
                </NavLink>
              </li>
            ))}

            {user && user.admin === true && (
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `nav-corporate-link ${isActive ? 'is-active' : ''}`
                  }
                >
                  <span className="nav-corporate-link-index">{pad(NAV_LINKS.length + 1)}</span>
                  <span className="nav-corporate-sr">Administrador</span>
                  <Roll text="Administrador" />
                </NavLink>
              </li>
            )}
          </ul>

          <div className="nav-corporate-actions">
            <button
              type="button"
              className="nav-corporate-theme-toggle"
              onClick={toggleThemeWithAnimation}
              aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            >
              <ThemeIcon theme={theme} />
            </button>

            {user ? (
              <button type="button" className="nav-corporate-ghost" onClick={handleLogout}>
                <span className="nav-corporate-sr">Cerrar sesión</span>
                <Roll text="Cerrar sesión" />
              </button>
            ) : (
              <button type="button" className="nav-corporate-ghost" onClick={() => setLoginOpen(true)}>
                <span className="nav-corporate-sr">Ingresar</span>
                <Roll text="Ingresar" />
              </button>
            )}

            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-corporate-cta"
            >
              <span className="nav-corporate-sr">Cotizar</span>
              <Roll text="Cotizar" />
              <span className="nav-corporate-cta-dot" />
            </a>

            {/* ---------- Botón hamburguesa (mobile) ---------- */}
            <button
              type="button"
              className="nav-corporate-burger"
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            >
              <span />
              <span />
            </button>
          </div>
        </nav>

        <span className="nav-corporate-line" aria-hidden="true" />
      </header>

      {/* ---------- Overlay mobile (fuera del header para no heredar el hide) ---------- */}
      <div
        className={`nav-corporate-mobile-overlay ${mobileOpen ? 'is-open' : ''} ${
          theme === 'dark' ? 'theme-dark' : 'theme-light'
        }`}
        aria-hidden={!mobileOpen}
      >
        <span className="nav-corporate-mobile-hazard" aria-hidden="true" />

        <div className="nav-corporate-mobile-top">
          <span className="nav-corporate-mobile-kicker">MENÚ · NIVEL 00 M</span>
        </div>

        <ul className="nav-corporate-mobile-links">
          {mobileItems.map((link, index) => (
            <li
              key={link.to}
              className="nav-corporate-mobile-item"
              style={{ transitionDelay: mobileOpen ? `${180 + index * 70}ms` : '0ms' }}
            >
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `nav-corporate-mobile-link ${isActive ? 'is-active' : ''}`
                }
                onClick={closeMobile}
              >
                <span className="nav-corporate-mobile-index">{pad(index + 1)}</span>
                <span className="nav-corporate-mobile-label">{link.label}</span>
                <span className="nav-corporate-mobile-arrow">→</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div
          className="nav-corporate-mobile-footer"
          style={{ transitionDelay: mobileOpen ? `${260 + mobileItems.length * 70}ms` : '0ms' }}
        >
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="nav-corporate-mobile-wa">
            <span>WHATSAPP</span>
            <strong>+54 9 11 2697 3540</strong>
          </a>

          <div className="nav-corporate-mobile-row">
            <button
              type="button"
              className="nav-corporate-theme-toggle nav-corporate-theme-toggle--mobile"
              onClick={toggleThemeWithAnimation}
              aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            >
              <ThemeIcon theme={theme} />
              <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
            </button>

            {user ? (
              <button
                type="button"
                className="nav-corporate-mobile-auth"
                onClick={() => {
                  handleLogout();
                  closeMobile();
                }}
              >
                Cerrar sesión
              </button>
            ) : (
              <button
                type="button"
                className="nav-corporate-mobile-auth"
                onClick={() => {
                  setLoginOpen(true);
                  closeMobile();
                }}
              >
                Ingresar
              </button>
            )}
          </div>

          <span className="nav-corporate-mobile-address">
            Hurlingham · Neuquén — Argentina
          </span>
        </div>
      </div>

      {loginOpen && (
        <LoginCorporate
          closeLogin={() => setLoginOpen(false)}
          openRegister={() => {
            setLoginOpen(false);
            setRegisterOpen(true);
          }}
        />
      )}

      {registerOpen && (
        <RegisterMinimal
          closeRegister={() => setRegisterOpen(false)}
          openLogin={() => setLoginOpen(true)}
        />
      )}
    </>
  );
};

export default NavBarCorporate;