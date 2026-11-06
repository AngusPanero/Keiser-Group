import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./cookies.css"
import { UseTheme } from "../contexts/ThemeContext";

const STORAGE_KEY = "cookiesAccepted";
const EXIT_MS = 500;

const Cookies = () => {
    const [ visible, setVisible ] = useState(false);
    const [ exit, setExit ] = useState(false);
    const { theme } = UseTheme()

    useEffect(() => {
        /* localStorage.clear(); */
        let accepted: string | null = null;
        try {
            accepted = localStorage.getItem(STORAGE_KEY);
        } catch {
            accepted = null;
        }
        if (!accepted) {
            const timer = setTimeout(() => setVisible(true), 4000);
            return () => clearTimeout(timer);
        }
    }, []);

    // "true" = todas las cookies · "essential" = solo las necesarias
    const saveChoice = (value: "true" | "essential") => {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch {
            /* modo privado: no se guarda, pero se cierra igual */
        }
        setExit(true);
        setTimeout(() => setVisible(false), EXIT_MS);
    };

    if (!visible) return null;

    return (
        <div className={`cookie-wrapper ${theme} ${exit ? "is-exit" : ""}`} role="dialog" aria-live="polite" aria-label="Aviso de cookies">
            <div className="cookie-banner">
                <span className="cookie-edge" aria-hidden="true" />

                <div className="cookie-content">
                    <span className="cookie-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                            <path
                                d="M12 3a9 9 0 1 0 9 9 3 3 0 0 1-3-3 3 3 0 0 1-3-3 3 3 0 0 1-3-3Z"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinejoin="round"
                            />
                            <circle cx="9" cy="10" r="1.2" fill="currentColor" />
                            <circle cx="14.5" cy="15" r="1.2" fill="currentColor" />
                            <circle cx="9.5" cy="15.5" r="1" fill="currentColor" />
                        </svg>
                    </span>
                    <div className="cookie-text">
                        <span className="cookie-kicker">AVISO DE COOKIES</span>
                        <p>
                            En <strong>Keiser Group</strong> usamos cookies para que el sitio funcione
                            correctamente y para mejorar tu experiencia.
                            {" "}<Link to="/policy-cookies" className="cookie-link">Ver política</Link>
                        </p>
                    </div>
                </div>

                <div className="cookie-actions">
                    {/* <button className="cookie-btn-ghost" onClick={() => saveChoice("essential")}>
                        Solo esenciales
                    </button> */}
                    <button className="cookie-btn" onClick={() => saveChoice("true")}>
                        <span>Aceptar</span>
                        <span className="cookie-btn-arrow" aria-hidden="true">→</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cookies;