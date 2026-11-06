import { useEffect } from "react";
import { UseTheme } from "../contexts/ThemeContext";
import "./politicaCookieCorporate.css";

/* Fecha fija de la última revisión: cambiala solo cuando modifiques el texto */
const LAST_UPDATE = "6 de noviembre de 2026";

const COMPANY = {
  name: "Keiser Group",
  // TODO (Angus): confirmar razón social y CUIT con el cliente
  legalName: "Keiser Group S.R.L.",
  address: "Camino del Buen Ayre Km 17, Parque Industrial Hurlingham, Provincia de Buenos Aires, Argentina",
  whatsapp: "+54 9 11 2697 3540",
  phones: "+54 11 4301 4323 / +54 11 4301 2976",
};

type ListItem = { name: string; desc: string };
type Section = {
  title: string;
  content?: string;
  list?: ListItem[];
  link?: { label: string; href: string };
  legend?: string;
};

const SECTIONS: Section[] = [
  {
    title: "¿Qué son las cookies?",
    content: `Las cookies son pequeños archivos de texto que un sitio web guarda en tu dispositivo cuando lo visitás. Permiten que el sitio recuerde tus acciones y preferencias durante un tiempo, para que no tengas que volver a configurarlas en cada visita. En esta política también incluimos tecnologías similares, como el almacenamiento local del navegador (localStorage), que cumplen una función equivalente.`,
  },
  {
    title: "Responsable del tratamiento",
    content: `El responsable de los datos que se recopilan a través de este sitio es ${COMPANY.legalName} ("${COMPANY.name}"), con domicilio en ${COMPANY.address}. Podés comunicarte con nosotros por WhatsApp al ${COMPANY.whatsapp} o por teléfono al ${COMPANY.phones}.`,
  },
  {
    title: "Marco legal en Argentina",
    content: `En Argentina no existe una ley específica sobre cookies. Cuando las cookies permiten identificar a una persona, se aplica el régimen general de protección de datos personales: el artículo 43 de la Constitución Nacional (acción de hábeas data), la Ley N° 25.326 de Protección de los Datos Personales y su Decreto Reglamentario N° 1558/2001, y el Convenio 108+ del Consejo de Europa, aprobado por la Ley N° 27.699. Conforme a esta normativa, el tratamiento de datos personales requiere el consentimiento libre, expreso e informado del titular (artículo 5 de la Ley N° 25.326), salvo las excepciones previstas por la ley. La Agencia de Acceso a la Información Pública (AAIP) es el órgano de control en la materia.`,
  },
  {
    title: "¿Qué cookies utilizamos?",
    list: [
      {
        name: "Cookies esenciales",
        desc: "Necesarias para el funcionamiento básico del sitio. Incluyen la cookie de sesión que se crea al iniciar sesión, que es segura (httpOnly) y se elimina al cerrar sesión o tras un período de inactividad. Sin ellas, servicios como el acceso a tu cuenta no estarían disponibles, por lo que no pueden desactivarse.",
      },
      {
        name: "Cookies de funcionalidad",
        desc: "Recuerdan tus preferencias, como el tema visual (claro u oscuro) y la elección que hiciste en el aviso de cookies. No comparten información con terceros.",
      },
      {
        name: "Cookies de análisis y rendimiento",
        desc: "Solo se activan si hacés clic en \"Aceptar\" en el aviso de cookies. Recopilan información agregada y anónima sobre cómo se navega el sitio, para detectar errores y mejorar nuestros servicios.",
      },
      {
        name: "Cookies de terceros",
        desc: "Algunas secciones incluyen contenido de terceros, como el mapa de Google Maps con la ubicación de nuestra casa central. Estos servicios pueden instalar sus propias cookies, que se rigen por las políticas de privacidad de cada proveedor.",
      },
    ],
  },
  {
    title: "Finalidad y conservación",
    content: `Utilizamos la información obtenida mediante cookies exclusivamente para hacer funcionar el sitio, mantener tu sesión iniciada, recordar tus preferencias y mejorar la experiencia de navegación. No vendemos ni cedemos estos datos a terceros con fines comerciales. Las cookies de sesión se eliminan al cerrar sesión; las de preferencias permanecen en tu navegador hasta que las borres.`,
  },
  {
    title: "¿Cómo gestionarlas?",
    content: `Al ingresar al sitio podés elegir "Aceptar" para habilitar todas las cookies o "Solo esenciales" para usar únicamente las necesarias. Además, podés configurar tu navegador para que rechace las cookies o te avise cuando se instale una. Los navegadores más usados (Chrome, Firefox, Safari y Edge) permiten hacerlo desde su menú de privacidad. Tené en cuenta que si bloqueás las cookies esenciales, algunas funciones del sitio, como el inicio de sesión, pueden dejar de funcionar.`,
  },
  {
    title: "Consentimiento",
    content: `Al hacer clic en "Aceptar" en nuestro aviso de cookies, prestás tu consentimiento expreso para el uso de cookies no esenciales conforme a esta política y al artículo 5 de la Ley N° 25.326. Podés revocar tu consentimiento en cualquier momento eliminando las cookies y los datos del sitio desde la configuración de tu navegador; la próxima vez que ingreses, el aviso volverá a aparecer para que elijas nuevamente.`,
  },
  {
    title: "Derechos del titular",
    content: `Como titular de los datos, tenés derecho a acceder a tu información personal, y a solicitar su rectificación, actualización o supresión, conforme a los artículos 14, 15 y 16 de la Ley N° 25.326. El derecho de acceso puede ejercerse en forma gratuita a intervalos no inferiores a seis meses. Las solicitudes de rectificación, actualización o supresión se resuelven dentro de los cinco días hábiles de recibidas. Para ejercer estos derechos podés contactarnos a través de la sección Contacto de este sitio o por los medios indicados en esta política.`,
    legend: `El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley N° 25.326. La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.`,
    link: {
      label: "Agencia de Acceso a la Información Pública (AAIP)",
      href: "https://www.argentina.gob.ar/aaip",
    },
  },
  {
    title: "Cambios en esta política",
    content: `Podemos actualizar esta política para reflejar cambios en el sitio o en la normativa vigente. Las modificaciones se publicarán en esta página junto con la fecha de la última actualización. Te recomendamos revisarla periódicamente.`,
  },
];

const PoliticaCookiesCorporate = () => {
  const { theme } = UseTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className={`pc-wrapper ${theme}`}>
      <div className="pc-container">

        {/* ── HEADER ── */}
        <div className="pc-header">
          <span className="pc-eyebrow">
            <span className="pc-eyebrow-dot" />
            Privacidad · Keiser Group
          </span>
          <h1 className="pc-title">
            Política de<br />
            <span className="pc-title-accent">Cookies.</span>
          </h1>
          <p className="pc-intro">
            En <strong>{COMPANY.name}</strong> nos comprometemos a ser transparentes sobre
            cómo usamos la información que se recopila cuando navegás nuestro sitio. Esta
            política explica qué son las cookies, cuáles utilizamos, para qué y cómo podés
            gestionarlas, conforme a la normativa argentina de protección de datos personales.
          </p>
          <div className="pc-meta">
            <span>Última actualización: {LAST_UPDATE}</span>
            <span className="pc-meta-dot">·</span>
            <span>Ley 25.326 · Decreto 1558/2001</span>
          </div>
        </div>

        {/* ── ÍNDICE ── */}
        <nav className="pc-index" aria-label="Índice">
          {SECTIONS.map((sec, i) => (
            <a key={i} href={`#pc-${i + 1}`} className="pc-index-link">
              <span className="pc-index-n">{String(i + 1).padStart(2, "0")}</span>
              <span>{sec.title}</span>
            </a>
          ))}
        </nav>

        {/* ── SECCIONES ── */}
        <div className="pc-body">
          {SECTIONS.map((sec, i) => (
            <div key={i} className="pc-section" id={`pc-${i + 1}`}>
              <h2 className="pc-section-title">
                <span className="pc-section-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="pc-section-bar" />
                {sec.title}
              </h2>

              {sec.content && (
                <p className="pc-section-text">{sec.content}</p>
              )}

              {sec.list && (
                <ul className="pc-list">
                  {sec.list.map((item, j) => (
                    <li key={j} className="pc-list-item">
                      <span className="pc-list-name">{item.name}</span>
                      <span className="pc-list-desc">{item.desc}</span>
                    </li>
                  ))}
                </ul>
              )}

              {sec.legend && (
                <p className="pc-legend">{sec.legend}</p>
              )}

              {sec.link && (
                <a
                  href={sec.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pc-external"
                >
                  {sec.link.label}
                  <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          ))}
        </div>

        {/* ── CONTACTO ── */}
        <div className="pc-contact">
          <p>
            ¿Tenés dudas sobre esta política?{" "}
            <a href="/contact" className="pc-contact-link">Contactanos</a>.
          </p>
        </div>

      </div>
    </section>
  );
};

export default PoliticaCookiesCorporate;