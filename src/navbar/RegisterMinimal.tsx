import { useEffect, useRef, useState } from "react";
import "./registerMinimal.css";
import eyeClose from "/logos/eye-close.svg";
import eyeOpen from "/logos/eye-open.svg";
import { UseTheme } from "../contexts/ThemeContext";
import { UseSession } from "../contexts/SessionContext";

// Rutas de las páginas legales (ajustar si en el router tienen otro path)
const LEGAL_LINKS = {
    cookies: "/policy-cookie",
    privacy: "/policy-privacity",
    terms: "/terms-and-conditions",
};

const EXIT_MS = 600;

// Mismo criterio que valida el backend en /register
const SPECIAL = /[!@#$%^&*()_+=[\]{};':"\\|,.<>/?`~-]/;

interface RegisterProps {
    openLogin: () => void
    closeRegister: () => void
}

const RegisterMinimal = ({ openLogin, closeRegister }: RegisterProps) => {
    const { handleRegister, loading, error, setError } = UseSession();
    const { theme } = UseTheme();
    const registerRef = useRef<HTMLDivElement>(null);

    const [exit, setExit] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [passwordError, setPasswordError] = useState<string>("");
    const [showRequirements, setShowRequirements] = useState(false);
    const [visiblePassword, setVisiblePassword] = useState<boolean>(false);
    const [acceptedLegal, setAcceptedLegal] = useState<boolean>(false);

    const isLoading = loading === true;
    const errorText = typeof error === "string" ? error : "";
    // Con 201 el contexto deja "Cuenta creada..." en `error`: es éxito, no error
    const isInfo = errorText.startsWith("Cuenta creada");

    // Cierra con animación y después ejecuta la acción
    const leaveThen = (action: () => void) => {
        setExit(true);
        setTimeout(action, EXIT_MS);
    };

    const handleClose = () => leaveThen(closeRegister);

    const passwordRequirements = [
        { label: "Mínimo 10 caracteres", test: (pass: string) => pass.length >= 10 },
        { label: "Una mayúscula", test: (pass: string) => /[A-Z]/.test(pass) },
        { label: "Un número", test: (pass: string) => /\d/.test(pass) },
        { label: "Un símbolo", test: (pass: string) => SPECIAL.test(pass) },
    ];

    const metCount = passwordRequirements.filter((r) => r.test(password)).length;

    const isFormValid =
        email.includes("@") &&
        metCount === passwordRequirements.length &&
        password === password2 &&
        acceptedLegal &&
        !isLoading;

    const validatePassword = (pass: string) => {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?`~-]).{10,}$/;
        if (!regex.test(pass)) {
            setPasswordError("La contraseña no cumple con los requisitos.");
            return false;
        }
        setPasswordError("");
        return true;
    };

    // Al abrir, limpia mensajes viejos del contexto
    useEffect(() => {
        setError(null);
    }, []);

    // Click afuera y tecla Escape cierran el panel
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (registerRef.current && !registerRef.current.contains(e.target as Node)) {
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

    // handleRegister(email, password, loginOpen, registerOpen):
    // con 201 llama registerOpen(false) + loginOpen(true) y deja el aviso
    // "Cuenta creada..." en `error`, que el login muestra como info.
    // Acá se traduce a: animación de salida → vuelve al login.
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!acceptedLegal || isLoading) return;
        if (!validatePassword(password)) return;
        if (password !== password2) return;

        await handleRegister(
            email,
            password,
            (open: boolean) => { if (open) leaveThen(goBackToLogin); },
            () => { /* el cierre lo hace leaveThen junto con la vuelta al login */ }
        );
    };

    const goBackToLogin = () => {
        closeRegister();
        openLogin();
    };

    const goToLogin = () => leaveThen(goBackToLogin);

    return (
        <div className={`k-reg-overlay ${theme} ${exit ? "k-reg-fade-out" : ""}`}>
            <div className="k-reg-backdrop-word" aria-hidden="true">REGISTRO</div>

            <div
                ref={registerRef}
                className={`k-reg-panel ${theme} ${exit ? "k-reg-panel-exit" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="k-reg-title"
            >
                <span className="k-reg-edge" aria-hidden="true" />

                <div className="k-reg-wrapper">
                    <header className="k-reg-header">
                        <div className="k-reg-meta">
                            <span className="k-reg-tag">
                                <span className="k-reg-tag-dot" />
                                CREAR CUENTA
                            </span>
                        </div>
                        <button className="k-reg-close" onClick={handleClose} aria-label="Cerrar">
                            <div className="close-line l1"></div>
                            <div className="close-line l2"></div>
                        </button>
                    </header>

                    <main className="k-reg-main">
                        <div className="k-reg-intro">
                            <h2 className="k-reg-title" id="k-reg-title">
                                <span className="k-reg-line"><span>Creá tu</span></span>
                                <span className="k-reg-line k-reg-accent"><span>cuenta.</span></span>
                            </h2>
                            <p className="k-reg-desc">
                                Después de registrarte te enviamos un email para verificar tu cuenta.
                                Vas a poder ingresar una vez que la actives.
                            </p>
                        </div>

                        <form className="k-reg-form" onSubmit={onSubmit}>

                            <div className="k-reg-group">
                                <div className="k-reg-label-row">
                                    <label htmlFor="k-reg-email">Email</label>
                                    <span className="row-id">01</span>
                                </div>
                                <div className="k-reg-input-box">
                                    <input
                                        id="k-reg-email"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="nombre@empresa.com"
                                        required
                                        className="auth-input"
                                    />
                                    <div className="box-focus"></div>
                                </div>
                            </div>

                            <div className="k-reg-group">
                                <div className="k-reg-label-row">
                                    <label htmlFor="k-reg-pass">Contraseña</label>
                                    <span className="row-id">02</span>
                                </div>
                                <div className="k-reg-input-box">
                                    <input
                                        id="k-reg-pass"
                                        type={visiblePassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                                        onFocus={() => setShowRequirements(true)}
                                        onBlur={() => setShowRequirements(false)}
                                        placeholder="••••••••"
                                        required
                                        className="auth-input"
                                    />
                                    <button
                                        type="button"
                                        className="k-reg-eye"
                                        onClick={() => setVisiblePassword(!visiblePassword)}
                                        aria-label={visiblePassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    >
                                        <img src={visiblePassword ? eyeClose : eyeOpen} alt="" width={18} />
                                    </button>
                                    <div className="box-focus"></div>
                                </div>

                                {/* Medidor de fuerza: 4 segmentos */}
                                <div className="k-reg-meter" aria-hidden="true">
                                    {passwordRequirements.map((_, i) => (
                                        <span key={i} className={i < metCount ? "on" : ""} />
                                    ))}
                                </div>

                                <div className={`k-reg-req-grid ${showRequirements || (password && metCount < 4) ? "active" : ""}`}>
                                    {passwordRequirements.map((req, index) => {
                                        const isMet = req.test(password);
                                        return (
                                            <div key={index} className={`k-reg-req-item ${isMet ? "met" : ""}`}>
                                                <span className="req-icon" />
                                                <span className="req-text">{req.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="k-reg-group">
                                <div className="k-reg-label-row">
                                    <label htmlFor="k-reg-pass2">Verificar contraseña</label>
                                    <span className="row-id">03</span>
                                </div>
                                <div className="k-reg-input-box">
                                    <input
                                        id="k-reg-pass2"
                                        type={visiblePassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        value={password2}
                                        onChange={(e) => setPassword2(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="auth-input"
                                    />
                                    <div className="box-focus"></div>
                                </div>
                            </div>

                            {/* ACEPTACIÓN LEGAL */}
                            <label className="k-reg-legal">
                                <input
                                    type="checkbox"
                                    className="k-reg-legal-input"
                                    checked={acceptedLegal}
                                    onChange={(e) => setAcceptedLegal(e.target.checked)}
                                    required
                                />
                                <span className="k-reg-legal-box" aria-hidden="true">
                                    <svg viewBox="0 0 16 16" width="12" height="12">
                                        <path d="M3 8.5L6.5 12L13 4.5" fill="none" strokeWidth="2.2" strokeLinecap="square" />
                                    </svg>
                                </span>
                                <span className="k-reg-legal-text">
                                    Acepto la{" "}
                                    <a href={LEGAL_LINKS.cookies} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                        Política de Cookies
                                    </a>
                                    , la{" "}
                                    <a href={LEGAL_LINKS.privacy} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                        Política de Privacidad
                                    </a>
                                    {" "}y los{" "}
                                    <a href={LEGAL_LINKS.terms} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                        Términos y Condiciones
                                    </a>
                                    {" "}de Keiser Group.
                                </span>
                            </label>

                            <div className="k-reg-feedback" role="alert">
                                {(password !== password2 && password2 !== "") && <span className="k-reg-error">Las contraseñas no coinciden.</span>}
                                {passwordError && <span className="k-reg-error">{passwordError}</span>}
                                {errorText && (
                                    <span className={`k-reg-error ${isInfo ? "is-info" : ""}`}>{errorText}</span>
                                )}
                            </div>

                            <button type="submit" className="k-reg-submit" disabled={!isFormValid}>
                                <span className="k-reg-btn-text">{isLoading ? "Creando cuenta…" : "Registrarse"}</span>
                                <span className="k-reg-btn-icon">
                                    {isLoading ? <span className="k-reg-spinner" /> : "→"}
                                </span>
                            </button>
                        </form>
                    </main>
                </div>

                {/* ── FOOTER: volver al login ── */}
                <div className="k-reg-footer">
                    <span className="k-reg-footer-hint">¿Ya tenés cuenta?</span>
                    <button type="button" className="k-reg-footer-btn" onClick={goToLogin}>
                        <span>Iniciá sesión</span>
                        <span className="k-reg-footer-arrow">→</span>
                    </button>
                </div>

                <span className="k-reg-hazard" aria-hidden="true" />
            </div>
        </div>
    );
};

export default RegisterMinimal;