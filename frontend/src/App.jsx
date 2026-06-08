import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FournisseurAuth, useAuth } from './context/ContexteAuth';
import BarreNavigation from './components/BarreNavigation';

// Pages
import Accueil from './pages/Accueil';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import Personnaliser from './pages/Personnaliser';
import Panier from './pages/Panier';
import Commandes from './pages/Commandes';
import DashboardAdmin from './pages/DashboardAdmin';

// Route protégée pour les clients connectés
const RouteClient = ({ children }) => {
  const { utilisateur, chargement } = useAuth();
  if (chargement) return <Spinner />;
  return utilisateur ? children : <Navigate to="/connexion" />;
};

// Route protégée pour l'administrateur
const RouteAdmin = ({ children }) => {
  const { utilisateur, chargement } = useAuth();
  if (chargement) return <Spinner />;
  return utilisateur && utilisateur.role === 'admin' ? children : <Navigate to="/" />;
};

const Spinner = () => (
  <div className="d-flex justify-content-center align-items-center py-5">
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Chargement...</span>
    </div>
  </div>
);

function ContenuApp() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <BarreNavigation />

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/personnaliser" element={<Personnaliser />} />

          <Route path="/panier" element={
            <RouteClient><Panier /></RouteClient>
          } />
          <Route path="/commandes" element={
            <RouteClient><Commandes /></RouteClient>
          } />
          <Route path="/admin" element={
            <RouteAdmin><DashboardAdmin /></RouteAdmin>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="footer-custom mt-auto py-4">
        <div className="container">
          <div className="row align-items-center gy-3">

            {/* Marque */}
            <div className="col-12 col-md-4 text-center text-md-start">
              <div className="footer-brand mb-1">
                <i className="bi bi-basket2-fill me-2" style={{ color: 'var(--primary)' }}></i>
                Greenola
              </div>
            </div>

            {/* Contact */}
            <div className="col-12 col-md-4 text-center">
              <div className="d-flex flex-column gap-2">
                <a href="tel:+212600000000">
                  <i className="bi bi-telephone me-2"></i>+212 6 00 00 00 00
                </a>
                <a href="mailto:contact@greenola.ma">
                  <i className="bi bi-envelope me-2"></i>contact@greenola.ma
                </a>
                <a href="https://instagram.com/greenola.ma" target="_blank" rel="noreferrer">
                  <i className="bi bi-instagram me-2"></i>@greenola.ma
                </a>
              </div>
            </div>

            {/* Droits */}
            <div className="col-12 col-md-4 text-center text-md-end">
              <small style={{ color: '#9CA3AF' }}>
                © {new Date().getFullYear()} Greenola
              </small>
            </div>

          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <FournisseurAuth>
      <BrowserRouter>
        <ContenuApp />
      </BrowserRouter>
    </FournisseurAuth>
  );
}

export default App;
