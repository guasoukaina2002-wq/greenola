import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/ContexteAuth';

const Accueil = () => {
  const [granolas, setGranolas]         = useState([]);
  const [chargement, setChargement]     = useState(true);
  const [erreur, setErreur]             = useState('');
  const [messageSucces, setMessageSucces] = useState('');

  const { utilisateur } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/granolas')
      .then(r => setGranolas(r.data))
      .catch(() => setErreur('Impossible de charger les granolas.'))
      .finally(() => setChargement(false));
  }, []);

  const ajouterAuPanier = async (granolaId) => {
    if (!utilisateur) { navigate('/connexion'); return; }
    try {
      await axios.post('/api/cart', { granola_id: granolaId, quantite: 1, personnalisation: null });
      setMessageSucces('Ajouté au panier !');
      setTimeout(() => setMessageSucces(''), 3000);
    } catch {
      alert('Erreur lors de l\'ajout au panier.');
    }
  };

  const personnaliser = (granola) => {
    navigate('/personnaliser', { state: { granolaDeBase: granola } });
  };

  return (
    <div>
      {/* ── Hero ── */}
      <div className="hero-section mx-3 mx-md-4 mt-4 mb-5 text-center">
        <p className="text-muted fw-semibold mb-2" style={{ letterSpacing: '0.08em', fontSize: '0.85rem', textTransform: 'uppercase' }}>
          Granolas Artisanaux • Rabat
        </p>
        <h1 className="display-5 fw-bold mb-3">
          Des granolas faits pour vous
        </h1>
        <p className="text-muted mx-auto mb-4" style={{ maxWidth: 520, fontSize: '1.05rem' }}>
          Choisissez une recette classique ou composez votre propre mélange avec les ingrédients de votre choix.
        </p>
        <div className="hero-badge mb-4">
          <i className="bi bi-tag-fill"></i>
          À partir de <strong className="ms-1">45 DH</strong>
        </div>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <button onClick={() => navigate('/personnaliser')} className="btn btn-primary-custom btn-lg px-4">
            <i className="bi bi-sliders me-2"></i>Composer mon granola
          </button>
          <a href="#catalogue" className="btn btn-outline-custom btn-lg px-4">
            Voir le catalogue
          </a>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="px-4">
        {messageSucces && (
          <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
            <i className="bi bi-check-circle-fill"></i> {messageSucces}
          </div>
        )}
        {erreur && (
          <div className="alert alert-danger mb-4">
            <i className="bi bi-exclamation-octagon-fill me-2"></i>{erreur}
          </div>
        )}
      </div>

      {/* ── Catalogue ── */}
      <div id="catalogue" className="px-3 px-md-4 mb-5">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 className="fw-bold mb-1">Nos Recettes</h2>
            <p className="text-muted mb-0">Achetez directement ou personnalisez à votre goût</p>
          </div>
        </div>

        {chargement ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status"></div>
            <p className="text-muted mt-3">Chargement...</p>
          </div>
        ) : (
          <div className="row g-4">
            {granolas.map((granola) => (
              <div key={granola.id} className="col-sm-6 col-lg-4">
                <div className="card-custom h-100 d-flex flex-column">
                  {/* Image */}
                  {granola.image ? (
                    <img
                      src={granola.image}
                      className="w-100 rounded-top"
                      style={{ height: 200, objectFit: 'cover' }}
                      alt={granola.nom}
                    />
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-center rounded-top"
                      style={{ height: 200, background: 'var(--primary-light)', fontSize: '3.5rem' }}
                    >
                      🥣
                    </div>
                  )}

                  {/* Contenu */}
                  <div className="p-3 flex-grow-1 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="fw-bold mb-0">{granola.nom}</h5>
                      <span className="price-badge ms-2">{parseFloat(granola.prix_base).toFixed(0)} DH</span>
                    </div>

                    <p className="text-muted small mb-3" style={{ lineHeight: 1.5 }}>{granola.description}</p>

                    {granola.ingredients?.length > 0 && (
                      <div className="d-flex flex-wrap gap-1 mb-3">
                        {granola.ingredients.slice(0, 4).map(ing => (
                          <span key={ing.id} className="ingredient-badge">{ing.nom}</span>
                        ))}
                        {granola.ingredients.length > 4 && (
                          <span className="ingredient-badge">+{granola.ingredients.length - 4}</span>
                        )}
                      </div>
                    )}

                    {/* Boutons */}
                    <div className="d-flex gap-2 mt-auto">
                      <button
                        onClick={() => ajouterAuPanier(granola.id)}
                        className="btn btn-primary-custom flex-grow-1"
                      >
                        <i className="bi bi-cart-plus me-1"></i> Acheter
                      </button>
                      <button
                        onClick={() => personnaliser(granola)}
                        className="btn btn-outline-custom"
                        title="Personnaliser"
                      >
                        <i className="bi bi-sliders"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bannière personnalisation ── */}
      <div className="mx-3 mx-md-4 mb-5 p-4 p-md-5 rounded-3 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3"
        style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)', border: '1px solid #FDE68A' }}
      >
        <div>
          <h3 className="fw-bold mb-1">Envie d'un mélange unique ?</h3>
          <p className="text-muted mb-0">Composez votre granola sur mesure : base, fruits secs, chocolat, graines…</p>
        </div>
        <button onClick={() => navigate('/personnaliser')} className="btn btn-primary-custom btn-lg px-4 flex-shrink-0">
          <i className="bi bi-palette me-2"></i>Créer ma recette
        </button>
      </div>
    </div>
  );
};

export default Accueil;
