import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/ContexteAuth';

const Connexion = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [erreur, setErreur]     = useState('');
  const [chargement, setChargement] = useState(false);

  const { connexion } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    const resultat = await connexion(email, password);
    setChargement(false);
    if (resultat.success) {
      navigate('/');
    } else {
      setErreur(resultat.error);
    }
  };

  return (
    <div className="min-vh-100 d-flex">

      {/* Panneau gauche — illustration */}
      <div
        className="d-none d-md-flex flex-column align-items-center justify-content-center p-5"
        style={{
          width: '45%',
          background: '#F5EFE6',
          borderRight: '1px solid #E8DDD0',
        }}
      >
        <i className="bi bi-basket2 mb-3" style={{ fontSize: '3.5rem', color: '#A0856A' }}></i>
        <h2 className="fw-bold mb-2" style={{ color: '#4B3A2E', fontSize: '1.8rem' }}>Greenola</h2>
        <p className="text-center" style={{ color: '#7A6055', maxWidth: 260, fontSize: '0.95rem' }}>
          Des granolas artisanaux préparés avec soin, personnalisés selon vos envies.
        </p>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4" style={{ backgroundColor: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          <h2 className="fw-bold mb-1">Connexion</h2>
          <p className="text-muted mb-4">Bienvenue ! Connectez-vous à votre compte.</p>

          {erreur && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>{erreur}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className="form-control form-control-lg"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Mot de passe</label>
              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary-custom w-100 py-3 fw-bold"
              disabled={chargement}
            >
              {chargement
                ? <span className="spinner-border spinner-border-sm" role="status"></span>
                : 'Se connecter'
              }
            </button>
          </form>

          <p className="text-center mt-4 text-muted">
            Pas encore de compte ?{' '}
            <Link to="/inscription" className="fw-bold text-decoration-none" style={{ color: 'var(--primary)' }}>
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Connexion;
