import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/ContexteAuth';

const STATUTS = {
  en_attente:      'En attente',
  confirmee:       'Confirmée',
  en_preparation:  'En préparation',
  expediee:        'Expédiée',
  livree:          'Livrée',
  annulee:         'Annulée',
};

const Commandes = () => {
  const [commandes, setCommandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const { utilisateur } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!utilisateur) { navigate('/connexion'); return; }
    axios.get('/api/orders')
      .then(r => setCommandes(r.data))
      .catch(() => setErreur('Impossible de charger vos commandes.'))
      .finally(() => setChargement(false));
  }, [utilisateur]);

  const formaterDate = (d) =>
    new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (chargement) return (
    <div className="d-flex justify-content-center py-5">
      <div className="spinner-border" role="status"></div>
    </div>
  );

  return (
    <div className="px-3 px-md-4 py-4">
      <h2 className="fw-bold mb-4">Mes Commandes</h2>

      {erreur && <div className="alert alert-danger mb-4">{erreur}</div>}

      {commandes.length === 0 ? (
        <div className="card-custom text-center p-5">
          <div style={{ fontSize: '4rem' }} className="mb-3">📦</div>
          <h4 className="fw-bold mb-2">Aucune commande</h4>
          <p className="text-muted mb-4">Vous n'avez pas encore passé de commande.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary-custom px-4">
            Découvrir nos granolas
          </button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {commandes.map(commande => (
            <div key={commande.id} className="card-custom overflow-hidden">

              {/* En-tête */}
              <div className="px-4 py-3 d-flex flex-wrap justify-content-between align-items-center gap-3"
                style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <span className="fw-bold px-3 py-2 rounded-3 text-white"
                    style={{ background: 'var(--text)', fontSize: '0.9rem' }}>
                    #{commande.id}
                  </span>
                  <div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>Date</div>
                    <div className="fw-semibold">{formaterDate(commande.created_at)}</div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-4">
                  <div className="text-end">
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>Montant</div>
                    <div className="fw-bold fs-5" style={{ color: 'var(--primary)' }}>
                      {parseFloat(commande.prix_total).toFixed(2)} DH
                    </div>
                  </div>
                  <span className={`status-badge badge-${commande.statut}`}>
                    {STATUTS[commande.statut] ?? commande.statut}
                  </span>
                </div>
              </div>

              {/* Articles */}
              <div className="p-4">
                <p className="text-muted fw-semibold mb-3" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Articles commandés
                </p>
                <div className="d-flex flex-column gap-3">
                  {commande.elements_commande?.map(el => {
                    const perso  = el.personnalisation ? JSON.parse(el.personnalisation) : null;
                    const taille = perso?.taille || '250g';
                    return (
                      <div key={el.id} className="d-flex justify-content-between align-items-start pb-3 border-bottom">
                        <div className="d-flex align-items-start gap-3">
                          <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: 44, height: 44, background: 'var(--primary-light)', color: 'var(--primary-dark)', fontSize: '1.2rem' }}>
                            {perso ? '🎨' : '🥣'}
                          </div>
                          <div>
                            <div className="fw-bold">{el.granola?.nom || 'Granola'}</div>
                            <div className="text-muted small">Format : {taille} · Qté : {el.quantite}</div>
                            {perso?.ingredientsComplets?.length > 0 && (
                              <div className="d-flex flex-wrap gap-1 mt-1">
                                {perso.ingredientsComplets.map(ing => (
                                  <span key={ing.id} className="ingredient-badge">{ing.nom}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-end flex-shrink-0">
                          <div className="fw-bold">{(parseFloat(el.prix_unitaire) * el.quantite).toFixed(2)} DH</div>
                          <div className="text-muted small">{parseFloat(el.prix_unitaire).toFixed(2)} DH / pqt</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Commandes;
