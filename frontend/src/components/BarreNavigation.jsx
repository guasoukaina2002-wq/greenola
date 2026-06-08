import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/ContexteAuth';

const BarreNavigation = () => {
  const { utilisateur, deconnexion } = useAuth();
  const navigate = useNavigate();

  const handleDeconnexion = async () => {
    await deconnexion();
    navigate('/connexion');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top py-2">
      <div className="container-fluid px-4">

        {/* Logo */}
        <Link className="navbar-brand-custom text-decoration-none me-4" to="/">
          🌾 Greenola
        </Link>

        {/* Toggler mobile */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Liens gauche */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link nav-link-custom${isActive ? ' active' : ''}`} to="/">
                Accueil
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link nav-link-custom${isActive ? ' active' : ''}`} to="/personnaliser">
                Personnaliser
              </NavLink>
            </li>

            {utilisateur && utilisateur.role !== 'admin' && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link nav-link-custom${isActive ? ' active' : ''}`} to="/panier">
                    <i className="bi bi-cart3 me-1"></i>Panier
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link nav-link-custom${isActive ? ' active' : ''}`} to="/commandes">
                    Mes Commandes
                  </NavLink>
                </li>
              </>
            )}

            {utilisateur && utilisateur.role === 'admin' && (
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link nav-link-custom${isActive ? ' active' : ''}`} to="/admin">
                  Administration
                </NavLink>
              </li>
            )}
          </ul>

          {/* Boutons droite */}
          <div className="d-flex align-items-center gap-2">
            {utilisateur ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-custom dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle"></i>
                  <span>{utilisateur.name}</span>
                  <span className="badge ms-1" style={{ backgroundColor: 'var(--primary)', fontSize: '0.65rem' }}>
                    {utilisateur.role === 'admin' ? 'Admin' : 'Client'}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                  <li>
                    <button
                      className="dropdown-item text-danger d-flex align-items-center gap-2"
                      onClick={handleDeconnexion}
                    >
                      <i className="bi bi-box-arrow-right"></i> Déconnexion
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link className="btn btn-outline-custom" to="/connexion">
                  Connexion
                </Link>
                <Link className="btn btn-primary-custom" to="/inscription">
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BarreNavigation;
