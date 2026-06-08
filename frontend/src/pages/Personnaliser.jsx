import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/ContexteAuth';

// Majoration selon la taille
const TAILLES = [
  { label: '250g', valeur: '250g', majoration: 0 },
  { label: '500g', valeur: '500g', majoration: 10 },
  { label: '750g', valeur: '750g', majoration: 20 },
  { label: '1 kg', valeur: '1kg',  majoration: 33 },
];

const NOMS_CATEGORIES = {
  fruit:    '🍇 Fruits Secs',
  chocolat: '🍫 Chocolat',
  graine:   '🌻 Graines',
  sucrant:  '🍯 Sucrant',
};

export default function Personnaliser() {
  const { state }         = useLocation();
  const navigate          = useNavigate();
  const { utilisateur }   = useAuth();

  const [recettes,   setRecettes]   = useState([]);
  const [categories, setCategories] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [erreur,     setErreur]     = useState('');
  const [succes,     setSucces]     = useState('');

  const [recette,  setRecette]  = useState(null);
  const [choisis,  setChoisis]  = useState([]);
  const [taille,   setTaille]   = useState('250g');
  const [quantite, setQuantite] = useState(1);

  /* ── Chargement ── */
  useEffect(() => {
    (async () => {
      try {
        const [rG, rI] = await Promise.all([
          axios.get('/api/granolas'),
          axios.get('/api/ingredients'),
        ]);
        setRecettes(rG.data);

        // Retirer la catégorie "base" (gérée par la recette)
        const { base: _, ...sansBase } = rI.data;
        setCategories(sansBase);

        const depart = state?.granolaDeBase
          ? rG.data.find(g => g.id === state.granolaDeBase.id) ?? rG.data[0]
          : rG.data[0];
        appliquerRecette(depart);
      } catch {
        setErreur('Impossible de charger les données.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const appliquerRecette = (r) => {
    if (!r) return;
    setRecette(r);
    const precoches = (r.ingredients ?? [])
      .filter(i => i.categorie !== 'base')
      .map(i => ({ id: i.id, nom: i.nom, modificateur_prix: +i.modificateur_prix, categorie: i.categorie }));
    setChoisis(precoches);
  };

  const toggle = (ing) => {
    if (ing.stock <= 0) return;
    setChoisis(prev =>
      prev.find(c => c.id === ing.id)
        ? prev.filter(c => c.id !== ing.id)
        : [...prev, { id: ing.id, nom: ing.nom, modificateur_prix: +ing.modificateur_prix, categorie: ing.categorie }]
    );
  };

  /* ── Calcul prix ── */
  const idsBase   = recette?.ingredients?.map(i => i.id) ?? [];
  const extras    = choisis.filter(c => !idsBase.includes(c.id));
  const prixExtra = extras.reduce((s, c) => s + c.modificateur_prix, 0);
  const tailleObj = TAILLES.find(t => t.valeur === taille);
  const prixUnit  = (recette ? +recette.prix_base : 0) + prixExtra + (tailleObj?.majoration ?? 0);
  const prixTotal = prixUnit * quantite;

  /* ── Ajouter au panier ── */
  const ajouterPanier = async () => {
    if (!utilisateur) { navigate('/connexion'); return; }
    try {
      await axios.post('/api/cart', {
        granola_id: recette.id,
        quantite,
        personnalisation: {
          ingredients:         extras.map(({ id, nom, modificateur_prix }) => ({ id, nom, modificateur_prix })),
          ingredientsComplets: choisis,
          taille,
        },
      });
      setSucces('Granola ajouté au panier !');
      setTimeout(() => { setSucces(''); navigate('/panier'); }, 1500);
    } catch {
      setErreur('Erreur lors de l\'ajout au panier.');
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border" role="status"></div>
    </div>
  );

  return (
    <div className="px-3 px-md-4 py-4">

      <div className="mb-4">
        <h2 className="fw-bold mb-1">Composer mon Granola</h2>
        <p className="text-muted mb-0">Suivez les 3 étapes ci-dessous pour créer votre mélange.</p>
      </div>

      {succes && <div className="alert alert-success mb-4"><i className="bi bi-check-circle me-2"></i>{succes}</div>}
      {erreur && <div className="alert alert-danger mb-4"><i className="bi bi-exclamation-triangle me-2"></i>{erreur}</div>}

      <div className="row g-4">

        {/* ── Colonne gauche : étapes ── */}
        <div className="col-lg-8">

          {/* Étape 1 — Recette de base */}
          <div className="card-custom p-4 mb-4">
            <h5 className="fw-bold d-flex align-items-center gap-2 mb-3">
              <span className="step-badge">1</span> Recette de base
            </h5>
            <div className="row g-2">
              {recettes.map(r => (
                <div key={r.id} className="col-6 col-sm-4 col-md-3">
                  <button
                    onClick={() => appliquerRecette(r)}
                    className={`btn-choice w-100 py-3 px-2 text-center border rounded-3 ${recette?.id === r.id ? 'selected' : ''}`}
                  >
                    <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{r.nom}</div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>{(+r.prix_base).toFixed(0)} DH</div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Étape 2 — Ingrédients supplémentaires */}
          <div className="card-custom p-4 mb-4">
            <h5 className="fw-bold d-flex align-items-center gap-2 mb-1">
              <span className="step-badge">2</span> Ingrédients extras
            </h5>
            <p className="text-muted small mb-3">
              Les ingrédients déjà inclus dans votre recette sont marqués <strong>Inclus</strong>. Les autres sont payants.
            </p>

            {Object.entries(categories).map(([cat, items]) => (
              <div key={cat} className="mb-4">
                <p className="fw-semibold mb-2" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {NOMS_CATEGORIES[cat] ?? cat}
                </p>
                <div className="row g-2">
                  {items.map(ing => {
                    const inclus     = idsBase.includes(ing.id);
                    const selectionne = choisis.some(c => c.id === ing.id);
                    const horsStock  = ing.stock <= 0;

                    return (
                      <div key={ing.id} className="col-6 col-sm-4 col-md-3">
                        <button
                          onClick={() => toggle(ing)}
                          disabled={horsStock}
                          className={`btn-choice w-100 py-2 px-2 text-center border rounded-3 ${selectionne ? 'selected' : ''} ${horsStock ? 'opacity-50' : ''}`}
                        >
                          <div style={{ fontSize: '0.85rem', fontWeight: selectionne ? 700 : 500 }}>{ing.nom}</div>
                          <div style={{ fontSize: '0.75rem' }}>
                            {horsStock
                              ? <span className="text-danger">Rupture</span>
                              : inclus
                                ? <span style={{ color: 'var(--success)' }}>Inclus</span>
                                : <span style={{ color: 'var(--primary)' }}>+{(+ing.modificateur_prix).toFixed(0)} DH</span>
                            }
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Étape 3 — Taille */}
          <div className="card-custom p-4">
            <h5 className="fw-bold d-flex align-items-center gap-2 mb-3">
              <span className="step-badge">3</span> Taille du paquet
            </h5>
            <div className="row g-2">
              {TAILLES.map(t => (
                <div key={t.valeur} className="col-6 col-sm-3">
                  <button
                    onClick={() => setTaille(t.valeur)}
                    className={`btn-choice w-100 py-3 text-center border rounded-3 ${taille === t.valeur ? 'selected' : ''}`}
                  >
                    <div className="fw-bold">{t.label}</div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                      {t.majoration === 0 ? 'Base' : `+${t.majoration} DH`}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Colonne droite : récapitulatif ── */}
        <div className="col-lg-4">
          <div className="card-custom p-4" style={{ position: 'sticky', top: '80px' }}>
            <h5 className="fw-bold mb-3 pb-2 border-bottom">Récapitulatif</h5>

            {/* Recette choisie */}
            {recette && (
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">{recette.nom}</span>
                <span className="fw-semibold">{(+recette.prix_base).toFixed(0)} DH</span>
              </div>
            )}

            {/* Extras */}
            {extras.map(e => (
              <div key={e.id} className="d-flex justify-content-between mb-1">
                <span className="text-muted small">+ {e.nom}</span>
                <span className="small">+{e.modificateur_prix.toFixed(0)} DH</span>
              </div>
            ))}

            {/* Taille */}
            {tailleObj && tailleObj.majoration > 0 && (
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Taille {tailleObj.label}</span>
                <span className="small">+{tailleObj.majoration} DH</span>
              </div>
            )}

            <hr />

            {/* Prix unitaire */}
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Prix unitaire</span>
              <span className="fw-bold">{prixUnit.toFixed(2)} DH</span>
            </div>

            {/* Quantité */}
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-muted">Quantité</span>
              <div className="d-flex align-items-center border rounded-3 overflow-hidden">
                <button className="btn btn-light border-0 px-3 py-1" onClick={() => setQuantite(q => Math.max(1, q - 1))}>−</button>
                <span className="px-3 fw-bold">{quantite}</span>
                <button className="btn btn-light border-0 px-3 py-1" onClick={() => setQuantite(q => q + 1)}>+</button>
              </div>
            </div>

            {/* Total */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="fw-bold">Total</span>
              <span className="fw-bold fs-4" style={{ color: 'var(--primary)' }}>{prixTotal.toFixed(2)} DH</span>
            </div>

            <button
              onClick={ajouterPanier}
              className="btn btn-primary-custom w-100 py-3 fw-bold"
            >
              <i className="bi bi-cart-plus me-2"></i>Ajouter au Panier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
