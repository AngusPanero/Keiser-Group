import { useEffect, useRef, useState } from "react";
import "./loginCorporate.css";
import { UseTheme } from "../contexts/ThemeContext";
import eyeClose from "/logos/eye-close.svg"
import eyeOpen from "/logos/eye-open.svg"
import { UseSession } from "../contexts/SessionContext";

interface LoginProps {
    closeLogin: () => void
    openRegister: () => void
}

const EXIT_MS = 600;

const LoginCorporate = ({ closeLogin, openRegister }: LoginProps) => {
    const { theme } = UseTheme()
    const { handleLogin, handleResetPassword, loading, error, emailNotVerified } = UseSession()
    const loginRef = useRef<HTMLDivElement>(null);

    const [ exit, setExit ] = useState(false);
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ visiblePassword, setVisiblePassword ] = useState<boolean>(false)

    const isLoading = loading === true;
    const errorText = typeof error === "string" ? error : "";
    // Después del registro el contexto deja "Cuenta creada..." en `error`: es info, no error
    const isInfo = errorText.startsWith("Cuenta creada");

    // Cierra con animación y después ejecuta la acción (cerrar o pasar al registro)
    const leaveThen = (action: () => void) => {
        setExit(true);
        setTimeout(action, EXIT_MS);
    };

    const handleClose = () => leaveThen(closeLogin);
    const goToRegister = () => leaveThen(openRegister);

    // Click afuera y tecla Escape cierran el panel
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
                handleClose();
            }
        };
        const handleKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, []);

    // handleLogin navega solo (/admin o /dashboard) y devuelve true si entró
    const loginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        const response = await handleLogin(email, password);
        if (response) {
            closeLogin();
        }
    }

    // Reenviar verificación: el backend la reenvía al intentar entrar con la
    // contraseña correcta, así solo puede pedirla el dueño de la cuenta
    const resendVerification = async () => {
        if (!email || !password) return;
        const response = await handleLogin(email, password);
        if (response) {
            closeLogin();
        }
    }

    return (
        <div className={`log-corp-overlay ${theme === "light" ? "light" : "dark"} ${exit ? "log-corp-fade-out" : ""}`}>
            <div className="log-corp-backdrop-word" aria-hidden="true">INGRESO</div>

            <div
                ref={loginRef}
                className={`log-corp-panel ${theme === "light" ? "light" : "dark"} ${exit ? "log-corp-exit" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="log-corp-title"
            >
                <span className="log-corp-edge" aria-hidden="true" />

                {/* ── HEADER ── */}
                <div className="log-corp-header">
                    <span className="log-corp-panel-title">
                        <span className="log-corp-panel-dot" />
                        INICIAR SESIÓN
                    </span>
                    <button className="log-corp-close-btn" onClick={handleClose} aria-label="Cerrar">
                        <span />
                        <span />
                    </button>
                </div>

                {/* ── CONTENT ── */}
                <div className="log-corp-content">

                    <h2 className="log-title" id="log-corp-title">
                        <span className="log-corp-line"><span>Bienvenido</span></span>
                        <span className="log-corp-line log-corp-accent"><span>de nuevo.</span></span>
                    </h2>

                    <p className="log-corp-desc">
                        Ingresá con tu email y contraseña para acceder a tu cuenta.
                    </p>

                    <form className="log-corp-form" onSubmit={loginSubmit}>

                        {/* PASO 01: Email */}
                        <div className="log-corp-input-wrapper">
                            <span className="log-corp-number">01</span>
                            <div className="log-corp-group">
                                <label htmlFor="log-corp-email">Email</label>
                                <input
                                    id="log-corp-email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="nombre@empresa.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <span className="log-corp-focus" />
                            </div>
                        </div>

                        {/* PASO 02: Password */}
                        <div className="log-corp-input-wrapper">
                            <span className="log-corp-number">02</span>
                            <div className="log-corp-group">
                                <label htmlFor="log-corp-password">Contraseña</label>
                                <div className="log-corp-pass-field">
                                    <input
                                        id="log-corp-password"
                                        type={visiblePassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="log-corp-eye"
                                        onClick={() => setVisiblePassword(!visiblePassword)}
                                        aria-label={visiblePassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    >
                                        <img src={visiblePassword ? eyeClose : eyeOpen} alt="" width={18} />
                                    </button>
                                </div>
                                <span className="log-corp-focus" />
                            </div>
                        </div>

                        <button type="button" className="log-corp-forgot" onClick={() => handleResetPassword(email)}>
                            ¿Olvidaste tu contraseña?
                        </button>

                        {/* ── Mensaje genérico / aviso de cuenta creada ── */}
                        {errorText && !emailNotVerified && (
                            <p className={`log-corp-error-msg ${isInfo ? "is-info" : ""}`} role="alert">
                                {errorText}
                            </p>
                        )}

                        {/* ── Email no verificado ── */}
                        {emailNotVerified && (
                            <div className="log-corp-verify" role="alert">
                                <span className="log-corp-verify-icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                                        <rect x="3" y="5.5" width="18" height="13" stroke="currentColor" strokeWidth="1.6" />
                                        <path d="M3.5 6.5 12 13l8.5-6.5" stroke="currentColor" strokeWidth="1.6" />
                                    </svg>
                                </span>
                                <div className="log-corp-verify-body">
                                    <p className="log-corp-verify-title">Verificá tu email</p>
                                    <p className="log-corp-verify-text">
                                        {errorText || "Revisá tu casilla y hacé click en el link de activación que te enviamos."}
                                    </p>
                                    <button
                                        type="button"
                                        className="log-corp-verify-btn"
                                        onClick={resendVerification}
                                        disabled={!email || !password || isLoading}
                                    >
                                        {isLoading ? "Enviando…" : "Reenviar email de verificación →"}
                                    </button>
                                </div>
                            </div>
                        )}

                        <button type="submit" className="log-corp-submit-btn" disabled={isLoading}>
                            <span className="log-corp-submit-text">
                                {isLoading ? "Ingresando…" : "Ingresar"}
                            </span>
                            <span className="log-corp-submit-icon">
                                {isLoading ? <span className="log-corp-spinner" /> : "→"}
                            </span>
                        </button>
                    </form>
                </div>

                {/* ── FOOTER: pasar al registro ── */}
                <div className="log-corp-footer">
                    <span className="log-corp-footer-hint">¿Usuario nuevo?</span>
                    <button type="button" className="log-corp-footer-btn" onClick={goToRegister}>
                        <span>Registrate</span>
                        <span className="log-corp-footer-arrow">→</span>
                    </button>
                </div>

                <span className="log-corp-hazard" aria-hidden="true" />
            </div>
        </div>
    );
};

export default LoginCorporate;