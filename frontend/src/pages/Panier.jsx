import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/ContexteAuth';

const Panier = () => {
  const [panierItems, setPanierItems]           = useState([]);
  const [chargement, setChargement]             = useState(true);
  const [erreur, setErreur]                     = useState('');
  const [commandeValidee, setCommandeValidee]   = useState('');

  const { utilisateur } = useAuth();
  const navigate = useNavigate();

  const chargerPanier = async () => {
    try {
      const r = await axios.get('/api/cart');
      setPanierItems(r.data);
    } catch {
      setErreur('Impossible de charger le panier.');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    if (!utilisateur) { navigate('/connexion'); return; }
    chargerPanier();
  }, [utilisateur]);

  const calculerPrix = (item) => {
    let prix = parseFloat(item.granola.prix_base);
    const perso = item.personnalisation;
    if (perso?.ingredients) {
      prix += perso.ingredients.reduce((s, i) => s + parseFloat(i.modificateur_prix || 0), 0);
    }
    if (perso?.taille) {
      const maj = { '500g': 10, '750g': 20, '1kg': 33 };
      prix += maj[perso.taille] ?? 0;
    }
    return prix;
  };

  const modifierQuantite = async (id, qte) => {
    if (qte < 1) return;
    try {
      await axios.put(`/api/cart/${id}`, { quantite: qte });
      setPanierItems(prev => prev.map(i => i.id === id ? { ...i, quantite: qte } : i));
    } catch {
      alert('Erreur lors de la mise à jour.');
    }
  };

  const supprimer = async (id) => {
    try {
      await axios.delete(`/api/cart/${id}`);
      setPanierItems(prev => prev.filter(i => i.id !== id));
    } catch {
      alert('Erreur lors de la suppression.');
    }
  };

  const vider = async () => {
    if (!window.confirm('Vider tout le panier ?')) return;
    try {
      await axios.delete('/api/cart');
      setPanierItems([]);
    } catch {
      alert('Erreur lors du vidage.');
    }
  };

  const validerCommande = async () => {
    try {
      setChargement(true);
      const r = await axios.post('/api/orders');
      setCommandeValidee(`Commande #${r.data.id} validée !`);
      setPanierItems([]);
      setTimeout(() => { setCommandeValidee(''); navigate('/commandes'); }, 2500);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la validation.');
    } finally {
      setChargement(false);
    }
  };

  const total = panierItems.reduce((s, i) => s + calculerPrix(i) * i.quantite, 0);

  if (chargement && !commandeValidee) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  return (
    <div className="px-3 px-md-4 py-4">
      <h2 className="fw-bold mb-4">Mon Panier</h2>

      {commandeValidee && (
        <div className="alert alert-success text-center p-4 mb-4">
          <i className="bi bi-bag-check-fill fs-2 d-block mb-2"></i>
          <h5 className="fw-bold">Merci pour votre commande !</h5>
          <p className="mb-0">{commandeValidee}</p>
          <small className="text-muted">Redirection vers vos commandes...</small>
        </div>
      )}

      {erreur && <div className="alert alert-danger mb-4">{erreur}</div>}

      {!commandeValidee && panierItems.length === 0 ? (
        <div className="card-custom text-center p-5">
          <div style={{ fontSize: '4rem' }} className="mb-3">🛒</div>
          <h4 className="fw-bold mb-2">Votre panier est vide</h4>
          <p className="text-muted mb-4">Ajoutez des granolas depuis notre catalogue ou composez le vôtre.</p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/" className="btn btn-outline-custom">Voir le catalogue</Link>
            <Link to="/personnaliser" className="btn btn-primary-custom">Créer mon mélange</Link>
          </div>
        </div>
      ) : !commandeValidee ? (
        <div className="row g-4">

          {/* Articles */}
          <div className="col-lg-8">
            <div className="card-custom p-3">
              <table className="table cart-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th className="text-center">Prix</th>
                    <th className="text-center">Quantité</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {panierItems.map(item => {
                    const prixUnit = calculerPrix(item);
                    const perso    = item.personnalisation;
                    const taille   = perso?.taille || '250g';
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="fw-bold">{item.granola.nom}</div>
                          <div className="text-muted small">
                            Format : {taille}
                            {perso && <span className="badge ms-2" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', fontSize: '0.65rem' }}>Custom</span>}
                          </div>
                          {perso?.ingredientsComplets?.length > 0 && (
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              {perso.ingredientsComplets.map(ing => (
                                <span key={ing.id} className="ingredient-badge">{ing.nom}</span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="text-center fw-semibold">{prixUnit.toFixed(2)} DH</td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center align-items-center gap-1">
                            <button onClick={() => modifierQuantite(item.id, item.quantite - 1)} className="btn btn-sm btn-outline-secondary px-2" disabled={item.quantite <= 1}>−</button>
                            <span className="px-2 fw-bold">{item.quantite}</span>
                            <button onClick={() => modifierQuantite(item.id, item.quantite + 1)} className="btn btn-sm btn-outline-secondary px-2">+</button>
                          </div>
                          <button onClick={() => supprimer(item.id)} className="btn btn-link btn-sm text-danger mt-1 p-0" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-trash me-1"></i>Supprimer
                          </button>
                        </td>
                        <td className="text-end fw-bold">{(prixUnit * item.quantite).toFixed(2)} DH</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="d-flex justify-content-between mt-3 pt-3 border-top">
                <Link to="/" className="btn btn-outline-custom btn-sm">
                  <i className="bi bi-arrow-left me-1"></i>Continuer mes achats
                </Link>
                <button onClick={vider} className="btn btn-outline-danger btn-sm">
                  <i className="bi bi-trash me-1"></i>Vider le panier
                </button>
              </div>
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="col-lg-4">
            <div className="card-custom p-4" style={{ position: 'sticky', top: '80px' }}>
              <h5 className="fw-bold border-bottom pb-2 mb-3">Récapitulatif</h5>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Articles ({panierItems.reduce((s, i) => s + i.quantite, 0)})</span>
                <span>{total.toFixed(2)} DH</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Livraison</span>
                <span className="fw-semibold" style={{ color: 'var(--success)' }}>Gratuite</span>
              </div>

              <div className="d-flex justify-content-between align-items-center border-top pt-3 mb-4">
                <span className="fw-bold">Total</span>
                <span className="fw-bold fs-4" style={{ color: 'var(--primary)' }}>{total.toFixed(2)} DH</span>
              </div>

              <button onClick={validerCommande} className="btn btn-primary-custom w-100 py-3 fw-bold">
                <i className="bi bi-check-circle me-2"></i>Valider ma commande
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Panier;
