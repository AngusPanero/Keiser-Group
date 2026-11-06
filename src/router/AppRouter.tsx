import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SessionProvider } from "../contexts/SessionContext";
import Footer from "../footer/Footer";
import NavBarCorporate from "../navbar/NavBarCorporate";
import PoliticaCookiesCorporate from "../cookies/PoliticaCookiesCorporate";
import ContactCorporate from "../contact/ContactCorporate";
import Home from "../home/Home";
import Error from "../processMessages/Error";
import PrivateRoute from "./PrivateRoute";
import Error404 from "../processMessages/Error404";
import ProcessOk from "../processMessages/ProcessOk";
import Transport from "../transport/Transport";
import Service from "../service/Service";
import Cookies from "../cookies/Cookies";
import Catalog from "../catalogo/Catalog";
import Loader from "../loader/Loader";
import AdminDashboard from "../admin/AdminDashboard";
import PoliticaPrivacidad from "../PoliticasGenerales/PoliticasPrivacidad";
import CondicionesReserva from "../PoliticasGenerales/CondicionesReserva";

const AppRouter = () => {
    return (
        <Router>
            <SessionProvider>
                <Cookies />
                <NavBarCorporate />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/catalog" element={<Catalog />} />
                    <Route path="/service" element={<Service />} />
                    <Route path="/transport" element={<Transport />} />
                    <Route path="/contact" element={<ContactCorporate />} />
                    <Route path="/policy-cookies" element={<PoliticaCookiesCorporate />} />
                    <Route path="/policy-privacy" element={<PoliticaPrivacidad />} />
                    <Route path="/policy-terms" element={<CondicionesReserva />} />
                    <Route path="/*" element={<Error404 />} />
                    <Route path="/loader" element={<Loader />} />
                    <Route path="/error" element={<Error errorMessage="Error 404: Página no encontrada" />} />
                    <Route path="/ok" element={<ProcessOk processMessage="Proceso completado con éxito" />} />
                    {/* Tiene Acceso solo el admin con la prop pasada */}
                    <Route path="/admin" element={<PrivateRoute adminOnly={true}><AdminDashboard /></PrivateRoute>} />
                    {/* <Route path="/dashboard" element={<PrivateRoute role="user"><UserDashboard /></PrivateRoute>} /> */}
                </Routes>
                <Footer />
            </SessionProvider>
        </Router>
    );  
}

export default AppRouter;   

