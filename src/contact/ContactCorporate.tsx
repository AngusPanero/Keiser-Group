import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { UseTheme } from "../contexts/ThemeContext";
import "./contactCorporate.css";

/**
 * ContactCorporate — Keiser Group (ruta /contact)
 * ---------------------------------------------------------
 * Parámetros opcionales en la URL (desde la card de un equipo):
 *   /contact?equipo=<id-o-slug>&modelo=<texto visible>
 *   ej: /contact?equipo=haulotte-compact-12&modelo=HAULOTTE%20Compact%2012
 *
 * - Con parámetros válidos: el mail sale como "Consulta por equipo".
 * - Sin parámetros (o inválidos): consulta general normal.
 *
 * Seguridad (el front solo hace UX, el back vuelve a validar todo):
 * - Los parámetros de la URL se validan y recortan: cualquiera puede armar un link.
 * - Nada se inyecta como HTML (React escapa el texto).
 * - Campo trampa (honeypot) y tiempo mínimo de llenado contra bots.
 */

const API_URL = import.meta.env.VITE_API_URL;

const CONTACT = {
  whatsapp: "https://api.whatsapp.com/send?phone=5491126973540",
  whatsappLabel: "+54 9 11 2697 3540",
  tel1: "tel:+541143014323",
  tel1Label: "+54 11 4301 4323",
  tel2: "tel:+541143012976",
  tel2Label: "+54 11 4301 2976",
  whatsappNeuquen: "https://api.whatsapp.com/send?phone=5492996114040",
  whatsappNeuquenLabel: "+54 9 299 611 4040",
};

/* Límites: los mismos que valida el backend */
const LIMITS = {
  name: 80,
  email: 254,
  phone: 30,
  company: 100,
  message: 2000,
  equipmentId: 64,
  equipmentLabel: 120,
};

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const PHONE_RE = /^[0-9+()\-\s]{6,30}$/;
const EQUIPMENT_ID_RE = /^[a-zA-Z0-9_-]{1,64}$/;

type Fields = {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
};

type FieldErrors = Partial<Record<keyof Fields, string>>;
type Status = "idle" | "sending" | "success" | "error";

const EMPTY: Fields = { name: "", email: "", phone: "", company: "", message: "" };

/* Limpia texto que viene de la URL: sin caracteres de control ni < >, recortado */
const cleanParam = (value: string | null, max: number) =>
  (value ?? "")
    .replace(/[\u0000-\u001F\u007F<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const validate = (f: Fields): FieldErrors => {
  const e: FieldErrors = {};
  if (f.name.trim().length < 2) e.name = "Ingresá tu nombre y apellido.";
  if (!EMAIL_RE.test(f.email.trim())) e.email = "Ingresá un email válido.";
  if (!PHONE_RE.test(f.phone.trim())) e.phone = "Ingresá un teléfono válido (solo números, +, guiones o espacios).";
  if (f.company.trim().length < 2) e.company = "Ingresá el nombre de tu empresa.";
  if (f.message.trim().length < 10) e.message = "Contanos un poco más (mínimo 10 caracteres).";
  return e;
};

/* Traduce cada falla posible de la petición a un mensaje claro */
const errorMessage = (err: unknown): string => {
  if (!axios.isAxiosError(err)) return "Ocurrió un error inesperado. Probá de nuevo.";

  if (err.code === "ECONNABORTED") {
    return "El servidor tardó demasiado en responder. Puede estar iniciándose: esperá unos segundos y volvé a intentar.";
  }
  if (!err.response) {
    return "No pudimos conectarnos con el servidor. Revisá tu conexión a internet e intentá de nuevo.";
  }

  const status = err.response.status;
  const data = err.response.data as { code?: string; message?: string; retryAfterMinutes?: number } | undefined;

  if (status === 400) return data?.message || "Revisá los datos del formulario.";
  if (status === 413) return "El mensaje es demasiado largo.";
  if (status === 429) {
    const min = data?.retryAfterMinutes;
    return min
      ? `Enviaste varias consultas seguidas. Probá de nuevo en ${min} minuto(s) o escribinos por WhatsApp.`
      : "Enviaste varias consultas seguidas. Probá de nuevo en unos minutos o escribinos por WhatsApp.";
  }
  if (status === 502 || status === 503) {
    return "No pudimos enviar tu consulta en este momento. Probá en unos minutos o escribinos por WhatsApp.";
  }
  if (status >= 500) return "Hubo un problema en el servidor. Probá de nuevo más tarde o escribinos por WhatsApp.";
  return "No pudimos enviar tu consulta. Probá de nuevo.";
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const MARQUEE = [
  "Alquiler de plataformas",
  "Repuestos originales",
  "Servicio técnico",
  "Especialistas Haulotte",
  "Mantenimiento de flota",
  "Hurlingham · Neuquén",
];

const SITES = [
  {
    tag: "Casa central",
    city: "Hurlingham",
    coord: "34°34′S — 58°39′W",
    lines: ["Parque Industrial Hurlingham", "Camino del Buen Ayre Km 17", "Buenos Aires, Argentina"],
    map: "https://www.google.com/maps/search/?api=1&query=Parque+Industrial+Hurlingham+Camino+del+Buen+Ayre+Km+17",
  },
  {
    tag: "Sucursal",
    city: "Neuquén",
    coord: "38°44′S — 68°11′W",
    lines: [
      "Ruta Provincial Nº 51 Km 3,5, Vista Alegre",
      "Río Neuquén Distrito Industrial",
      "Neuquén, Argentina",
      "WhatsApp +54 9 299 611 4040",
    ],
    map: "https://www.google.com/maps/place/KEISER+Sucursal+Neuqu%C3%A9n/@-38.7424646,-68.1967459,17z",
  },
];

/* Hora actual en Argentina, para el detalle del hero */
const useArgentinaTime = () => {
  const format = () =>
    new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Argentina/Buenos_Aires",
    }).format(new Date());
  const [time, setTime] = useState(format);
  useEffect(() => {
    const id = setInterval(() => setTime(format()), 15000);
    return () => clearInterval(id);
  }, []);
  return time;
};

const ContactCorporate = () => {
  const { theme } = UseTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const startedAt = useRef<number>(Date.now());
  const time = useArgentinaTime();

  /* Progreso del formulario: campos válidos sobre el total */
  const FIELD_KEYS: (keyof Fields)[] = ["name", "email", "phone", "company", "message"];
  const currentErrors = validate(fields);
  const completed = FIELD_KEYS.filter((k) => !currentErrors[k]).length;

  /* ── Equipo desde la URL (validado) ── */
  const equipment = useMemo(() => {
    const id = cleanParam(searchParams.get("equipo"), LIMITS.equipmentId);
    const label = cleanParam(searchParams.get("modelo"), LIMITS.equipmentLabel);
    if (!id || !EQUIPMENT_ID_RE.test(id)) return null;
    return { id, label: label || id };
  }, [searchParams]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const removeEquipment = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("equipo");
    next.delete("modelo");
    setSearchParams(next, { replace: true });
  };

  const onChange = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value.slice(0, LIMITS[key]);
    const next = { ...fields, [key]: value };
    setFields(next);
    if (touched[key]) setErrors(validate(next));
    if (serverError) setServerError("");
  };

  const onBlur = (key: keyof Fields) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(fields));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;

    const v = validate(fields);
    setErrors(v);
    setTouched({ name: true, email: true, phone: true, company: true, message: true });
    setTermsError(!acceptedTerms);
    if (Object.keys(v).length || !acceptedTerms) return;

    setStatus("sending");
    setServerError("");

    try {
      await axios.post(
        `${API_URL}/contact`,
        {
          name: fields.name.trim(),
          email: fields.email.trim(),
          phone: fields.phone.trim(),
          company: fields.company.trim(),
          message: fields.message.trim(),
          equipment: equipment ? { id: equipment.id, label: equipment.label } : null,
          acceptedTerms, // el back exige true: sin aceptación no se envía
          website: honeypot, // honeypot: tiene que llegar vacío
          elapsed: Date.now() - startedAt.current,
        },
        { timeout: 20000 }
      );
      setStatus("success");
      setFields(EMPTY);
      setTouched({});
      setAcceptedTerms(false);
    } catch (err) {
      console.error("Error al enviar el formulario de contacto:", err);
      setServerError(errorMessage(err));
      setStatus("error");
    }
  };

  const resetForm = () => {
    setStatus("idle");
    startedAt.current = Date.now();
  };

  const fieldError = (key: keyof Fields) => (touched[key] ? errors[key] : undefined);

  const renderField = (
    key: keyof Fields,
    n: string,
    label: string,
    type: string,
    placeholder: string,
    autoComplete: string
  ) => {
    const err = fieldError(key);
    return (
      <div className={`ct-field ${err ? "has-error" : ""}`}>
        <div className="ct-field-head">
          <label htmlFor={`ct-${key}`}>
            {label} <span className="ct-req">*</span>
          </label>
          <span className="ct-field-n">{n}</span>
        </div>
        <div className="ct-input-box">
          <input
            id={`ct-${key}`}
            type={type}
            value={fields[key]}
            onChange={onChange(key)}
            onBlur={onBlur(key)}
            placeholder={placeholder}
            autoComplete={autoComplete}
            maxLength={LIMITS[key]}
            aria-invalid={!!err}
            aria-describedby={err ? `ct-${key}-err` : undefined}
            required
          />
          <span className="ct-focus" />
        </div>
        {err && (
          <span className="ct-field-error" id={`ct-${key}-err`}>
            {err}
          </span>
        )}
      </div>
    );
  };

  return (
    <main className={`ct-root ${theme}`}>
      {/* ── HERO ── */}
      <header className="ct-hero">
        <div className="ct-hero-word" aria-hidden="true">CONTACTO</div>

        <div className="ct-hero-inner">
          <motion.img
            src={theme === "dark" ? "/logos/keiser-logo-blanco.png" : "/logos/keiser-logo-negro.png"}
            alt="Keiser Group"
            className="ct-hero-logo"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE }}
          />

          <motion.div
            className="ct-hero-meta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <span className="ct-hero-meta-item">
              <span className="ct-live-dot" />
              Buenos Aires · {time} h
            </span>
            <span className="ct-hero-meta-item">Nivel 32 M · Cima</span>
            <span className="ct-hero-meta-item">Hurlingham · Neuquén</span>
          </motion.div>
        </div>

        <motion.span
          className="ct-hero-line"
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
        />
      </header>

      {/* ── MARQUEE DE SERVICIOS ── */}
      <div className="ct-marquee" aria-hidden="true">
        <div className="ct-marquee-track">
          {[...MARQUEE, ...MARQUEE].map((t, i) => (
            <span className="ct-marquee-item" key={i}>
              {t}
              <span className="ct-marquee-dot" />
            </span>
          ))}
        </div>
      </div>

      <div className="ct-container">

        {/* ── COLUMNA INFO ── */}
        <aside className="ct-info">
          <motion.span
            className="ct-eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <span className="ct-eyebrow-dot" />
            Contacto
          </motion.span>

          <h1 className="ct-title">
            <span className="ct-mask">
              <motion.span
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
              >
                Hablemos
              </motion.span>
            </span>
            <span className="ct-mask ct-accent">
              <motion.span
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
              >
                de tu obra.
              </motion.span>
            </span>
          </h1>

          <motion.p
            className="ct-lead"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
          >
            Contactate con nosotros por teléfono o completando el formulario. Nuestro equipo
            te responde a la brevedad.
          </motion.p>

          <motion.div
            className="ct-channels"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.45 }}
          >
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="ct-wa">
              <span className="ct-wa-label">WhatsApp</span>
              <span className="ct-wa-number">{CONTACT.whatsappLabel}</span>
              <span className="ct-wa-arrow" aria-hidden="true">→</span>
            </a>
            <a href={CONTACT.tel1} className="ct-phone">
              <span>TEL.</span> {CONTACT.tel1Label}
            </a>
            <a href={CONTACT.tel2} className="ct-phone">
              <span>TEL.</span> {CONTACT.tel2Label}
            </a>
            <a href={CONTACT.whatsappNeuquen} target="_blank" rel="noopener noreferrer" className="ct-phone ct-phone-wide">
              <span>NEUQUÉN</span> {CONTACT.whatsappNeuquenLabel}
            </a>
          </motion.div>

        </aside>

        {/* ── COLUMNA FORMULARIO ── */}
        <motion.section
          className="ct-panel"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.25 }}
        >
          <span className="ct-panel-edge" aria-hidden="true" />

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                className="ct-success"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: EASE }}
                role="status"
              >
                <span className="ct-success-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
                    <path d="M5 12.5 10 17l9-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
                  </svg>
                </span>
                <h2 className="ct-success-title">Consulta enviada.</h2>
                <p className="ct-success-text">
                  Recibimos tu mensaje{equipment ? <> sobre <strong>{equipment.label}</strong></> : null}. Te
                  vamos a responder al email que nos dejaste lo antes posible.
                </p>
                <button type="button" className="ct-link-btn" onClick={resetForm}>
                  Enviar otra consulta →
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                className="ct-form"
                onSubmit={onSubmit}
                noValidate
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Tipo de consulta */}
                <AnimatePresence initial={false}>
                  {equipment ? (
                    <motion.div
                      key="eq"
                      className="ct-equipment"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.45, ease: EASE }}
                    >
                      <div className="ct-equipment-inner">
                        <span className="ct-equipment-tag">Consulta por equipo</span>
                        <span className="ct-equipment-name">{equipment.label}</span>
                        <span className="ct-equipment-ref">REF · {equipment.id}</span>
                      </div>
                      <button
                        type="button"
                        className="ct-equipment-remove"
                        onClick={removeEquipment}
                        aria-label="Quitar equipo y hacer una consulta general"
                      >
                        <span />
                        <span />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="general"
                      className="ct-general"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <span className="ct-general-dot" />
                      Consulta general
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="ct-progress" aria-hidden="true">
                  <div className="ct-progress-bars">
                    {FIELD_KEYS.map((k, i) => (
                      <span key={k} className={i < completed ? "on" : ""} />
                    ))}
                  </div>
                  <span className="ct-progress-label">
                    {completed === FIELD_KEYS.length ? "Listo para enviar" : `${completed}/${FIELD_KEYS.length} completos`}
                  </span>
                </div>

                <div className="ct-grid">
                  {renderField("name", "01", "Nombre y Apellido", "text", "Juan Pérez", "name")}
                  {renderField("email", "02", "E-mail", "email", "nombre@empresa.com", "email")}
                  {renderField("phone", "03", "Teléfono", "tel", "+54 9 11 0000 0000", "tel")}
                  {renderField("company", "04", "Empresa", "text", "Nombre de la empresa", "organization")}
                </div>

                {/* Mensaje */}
                <div className={`ct-field ct-field-full ${fieldError("message") ? "has-error" : ""}`}>
                  <div className="ct-field-head">
                    <label htmlFor="ct-message">
                      Mensaje <span className="ct-req">*</span>
                    </label>
                    <span className="ct-field-n">05</span>
                  </div>
                  <div className="ct-input-box">
                    <textarea
                      id="ct-message"
                      rows={5}
                      value={fields.message}
                      onChange={onChange("message")}
                      onBlur={onBlur("message")}
                      placeholder={
                        equipment
                          ? `Contanos qué necesitás del ${equipment.label}: fechas, obra, altura de trabajo…`
                          : "Contanos qué necesitás: alquiler, repuestos, servicio técnico…"
                      }
                      maxLength={LIMITS.message}
                      aria-invalid={!!fieldError("message")}
                      aria-describedby={fieldError("message") ? "ct-message-err" : undefined}
                      required
                    />
                    <span className="ct-focus" />
                  </div>
                  <div className="ct-field-foot">
                    {fieldError("message") ? (
                      <span className="ct-field-error" id="ct-message-err">{fieldError("message")}</span>
                    ) : <span />}
                    <span className="ct-counter">
                      {fields.message.length}/{LIMITS.message}
                    </span>
                  </div>
                </div>

                {/* Aceptación de términos (obligatoria) */}
                <label className={`ct-terms ${termsError ? "has-error" : ""}`}>
                  <input
                    type="checkbox"
                    className="ct-terms-input"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);
                      if (e.target.checked) setTermsError(false);
                    }}
                    aria-invalid={termsError}
                    aria-describedby={termsError ? "ct-terms-err" : undefined}
                    required
                  />
                  <span className="ct-terms-box" aria-hidden="true">
                    <svg viewBox="0 0 16 16" width="12" height="12">
                      <path d="M3 8.5L6.5 12L13 4.5" fill="none" strokeWidth="2.2" strokeLinecap="square" />
                    </svg>
                  </span>
                  <span className="ct-terms-text">
                    Acepto los{" "}
                    <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                      Términos y Condiciones
                    </a>{" "}
                    y la{" "}
                    <a href="/policy-privacity" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                      Política de Privacidad
                    </a>{" "}
                    de Keiser Group, y autorizo el uso de mis datos para responder esta consulta.
                  </span>
                </label>
                {termsError && (
                  <span className="ct-field-error ct-terms-error" id="ct-terms-err">
                    Tenés que aceptar los términos y condiciones para enviar la consulta.
                  </span>
                )}

                {/* Honeypot: invisible para personas, los bots lo completan */}
                <div className="ct-hp" aria-hidden="true">
                  <label htmlFor="ct-website">No completar</label>
                  <input
                    id="ct-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <AnimatePresence>
                  {status === "error" && serverError && (
                    <motion.p
                      className="ct-server-error"
                      role="alert"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {serverError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button type="submit" className="ct-submit" disabled={status === "sending"}>
                  <span className="ct-submit-text">
                    {status === "sending" ? "Enviando…" : "Enviar consulta"}
                  </span>
                  <span className="ct-submit-icon">
                    {status === "sending" ? <span className="ct-spinner" /> : "→"}
                  </span>
                </button>

              </motion.form>
            )}
          </AnimatePresence>
        </motion.section>
      </div>

      {/* ── SEDES ── */}
      <section className="ct-sites">
        <div className="ct-sites-inner">
          {SITES.map((site, i) => (
            <motion.a
              key={site.city}
              href={site.map}
              target="_blank"
              rel="noopener noreferrer"
              className="ct-site"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, ease: EASE, delay: i * 0.1 }}
            >
              <span className="ct-site-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="ct-site-tag">{site.tag}</span>
              <span className="ct-site-city">{site.city}</span>
              <span className="ct-site-coord">{site.coord}</span>
              <span className="ct-site-lines">
                {site.lines.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </span>
              <span className="ct-site-cta">
                Cómo llegar <span aria-hidden="true">↗</span>
              </span>
              <span className="ct-site-pin" aria-hidden="true" />
            </motion.a>
          ))}
        </div>
      </section>

      <span className="ct-hazard" aria-hidden="true" />
    </main>
  );
};

export default ContactCorporate;