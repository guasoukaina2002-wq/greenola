import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/ContexteAuth';

const Inscription = () => {
  const [nom, setNom]                               = useState('');
  const [email, setEmail]                           = useState('');
  const [password, setPassword]                     = useState('');
  const [passwordConfirmation, setPasswordConf]     = useState('');
  const [erreur, setErreur]                         = useState('');
  const [chargement, setChargement]                 = useState(false);

  const { inscription } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');

    if (password.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== passwordConfirmation) {
      setErreur('Les mots de passe ne correspondent pas.');
      return;
    }

    setChargement(true);
    const resultat = await inscription(nom, email, password, passwordConfirmation);
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
        <i className="bi bi-person-plus mb-3" style={{ fontSize: '3.5rem', color: '#A0856A' }}></i>
        <h2 className="fw-bold mb-2" style={{ color: '#4B3A2E', fontSize: '1.8rem' }}>Rejoignez-nous</h2>
        <p className="text-center" style={{ color: '#7A6055', maxWidth: 260, fontSize: '0.95rem' }}>
          Créez votre compte et composez votre granola personnalisé en quelques clics.
        </p>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4" style={{ backgroundColor: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          <h2 className="fw-bold mb-1">Créer un compte</h2>
          <p className="text-muted mb-4">Rejoignez la communauté Greenola.</p>

          {erreur && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>{erreur}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Nom complet</label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Ex : Guasmi Soukaina"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
            </div>

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

            <div className="mb-3">
              <label className="form-label fw-semibold">Mot de passe <span className="text-muted fw-normal">(min 8 caractères)</span></label>
              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Confirmer le mot de passe</label>
              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="••••••••"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConf(e.target.value)}
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
                : 'Créer mon compte'
              }
            </button>
          </form>

          <p className="text-center mt-4 text-muted">
            Déjà un compte ?{' '}
            <Link to="/connexion" className="fw-bold text-decoration-none" style={{ color: 'var(--primary)' }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Inscription;
