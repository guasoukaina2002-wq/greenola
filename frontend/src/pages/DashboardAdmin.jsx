import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/ContexteAuth';

const STATUTS = ['en_attente', 'confirmee', 'en_preparation', 'expediee', 'livree', 'annulee'];
const STATUTS_FR = {
  en_attente: 'En attente', confirmee: 'Confirmée',
  en_preparation: 'En préparation', expediee: 'Expédiée',
  livree: 'Livrée', annulee: 'Annulée',
};
const CATEGORIES = ['base', 'fruit', 'chocolat', 'graine', 'sucrant'];
const CATEGORIES_FR = {
  base: 'Céréale de base', fruit: 'Fruit sec', chocolat: 'Chocolat',
  graine: 'Graine', sucrant: 'Sucrant',
};

const GRANOLA_VIDE  = { id: null, nom: '', description: '', prix_base: '', image: '', est_actif: true };
const INGR_VIDE     = { id: null, nom: '', categorie: 'fruit', modificateur_prix: '', stock: 0 };

const DashboardAdmin = () => {
  const { utilisateur } = useAuth();
  const navigate = useNavigate();

  const [onglet, setOnglet]           = useState('commandes');
  const [commandes, setCommandes]     = useState([]);
  const [granolas, setGranolas]       = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [chargement, setChargement]   = useState(true);
  const [feedback, setFeedback]       = useState({ type: '', msg: '' });

  const [modalG, setModalG] = useState({ open: false, mode: 'create', data: GRANOLA_VIDE });
  const [modalI, setModalI] = useState({ open: false, mode: 'create', data: INGR_VIDE });

  useEffect(() => {
    if (!utilisateur || utilisateur.role !== 'admin') { navigate('/'); return; }
    charger();
  }, [utilisateur]);

  const notif = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback({ type: '', msg: '' }), 4000);
  };

  const charger = async () => {
    setChargement(true);
    try {
      const [rC, rG, rI] = await Promise.all([
        axios.get('/api/admin/orders'),
        axios.get('/api/granolas'),
        axios.get('/api/ingredients'),
      ]);
      setCommandes(rC.data);
      setGranolas(rG.data);
      // Aplatir les ingrédients groupés par catégorie
      const flat = [];
      Object.values(rI.data).forEach(liste => liste.forEach(i => flat.push(i)));
      setIngredients(flat);
    } catch {
      notif('danger', 'Erreur lors du chargement des données.');
    } finally {
      setChargement(false);
    }
  };

  /* ── Commandes ── */
  const changerStatut = async (id, statut) => {
    try {
      await axios.put(`/api/admin/orders/${id}/status`, { statut });
      setCommandes(prev => prev.map(c => c.id === id ? { ...c, statut } : c));
      notif('success', `Statut de la commande #${id} mis à jour.`);
    } catch {
      notif('danger', 'Erreur lors de la mise à jour.');
    }
  };

  /* ── Granolas ── */
  const soumettreGranola = async (e) => {
    e.preventDefault();
    const g = modalG.data;
    try {
      const payload = { nom: g.nom, description: g.description, prix_base: parseFloat(g.prix_base), image: g.image || null, est_actif: g.est_actif };
      if (modalG.mode === 'create') {
        const r = await axios.post('/api/granolas', payload);
        setGranolas(prev => [...prev, r.data]);
        notif('success', 'Granola créé.');
      } else {
        const r = await axios.put(`/api/granolas/${g.id}`, payload);
        setGranolas(prev => prev.map(x => x.id === g.id ? r.data : x));
        notif('success', 'Granola mis à jour.');
      }
      setModalG({ ...modalG, open: false });
    } catch {
      notif('danger', 'Erreur lors de l\'enregistrement.');
    }
  };

  const supprimerGranola = async (id) => {
    if (!window.confirm('Supprimer ce granola ?')) return;
    try {
      await axios.delete(`/api/granolas/${id}`);
      setGranolas(prev => prev.filter(g => g.id !== id));
      notif('success', 'Granola supprimé.');
    } catch {
      notif('danger', 'Impossible de supprimer.');
    }
  };

  /* ── Ingrédients ── */
  const soumettreIngredient = async (e) => {
    e.preventDefault();
    const ing = modalI.data;
    try {
      const payload = { nom: ing.nom, categorie: ing.categorie, modificateur_prix: parseFloat(ing.modificateur_prix), stock: parseInt(ing.stock) };
      if (modalI.mode === 'create') {
        const r = await axios.post('/api/ingredients', payload);
        setIngredients(prev => [...prev, r.data]);
        notif('success', 'Ingrédient ajouté.');
      } else {
        const r = await axios.put(`/api/ingredients/${ing.id}`, payload);
        setIngredients(prev => prev.map(x => x.id === ing.id ? r.data : x));
        notif('success', 'Ingrédient mis à jour.');
      }
      setModalI({ ...modalI, open: false });
    } catch {
      notif('danger', 'Erreur lors de l\'enregistrement.');
    }
  };

  const supprimerIngredient = async (id) => {
    if (!window.confirm('Supprimer cet ingrédient ?')) return;
    try {
      await axios.delete(`/api/ingredients/${id}`);
      setIngredients(prev => prev.filter(i => i.id !== id));
      notif('success', 'Ingrédient supprimé.');
    } catch {
      notif('danger', 'Impossible de supprimer.');
    }
  };

  if (chargement) return (
    <div className="d-flex justify-content-center py-5">
      <div className="spinner-border" role="status"></div>
    </div>
  );

  return (
    <div className="px-3 px-md-4 py-4">

      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Administration</h2>
          <p className="text-muted mb-0">Gérez le catalogue, les ingrédients et les commandes.</p>
        </div>
        <button onClick={charger} className="btn btn-outline-custom btn-sm">
          <i className="bi bi-arrow-clockwise me-1"></i>Actualiser
        </button>
      </div>

      {/* Notification */}
      {feedback.msg && (
        <div className={`alert alert-${feedback.type} d-flex align-items-center gap-2 mb-4`}>
          <i className={`bi ${feedback.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
          {feedback.msg}
        </div>
      )}

      {/* Onglets */}
      <ul className="nav admin-tabs border-bottom mb-4">
        {['commandes', 'granolas', 'ingredients'].map(o => (
          <li className="nav-item" key={o}>
            <button className={`nav-link ${onglet === o ? 'active' : ''}`} onClick={() => setOnglet(o)}>
              {o === 'commandes' && <><i className="bi bi-receipt me-2"></i>Commandes ({commandes.length})</>}
              {o === 'granolas'  && <><i className="bi bi-box-seam me-2"></i>Granolas ({granolas.length})</>}
              {o === 'ingredients' && <><i className="bi bi-egg-fried me-2"></i>Ingrédients ({ingredients.length})</>}
            </button>
          </li>
        ))}
      </ul>

      {/* ── ONGLET COMMANDES ── */}
      {onglet === 'commandes' && (
        <div className="card-custom p-3">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Montant</th>
                  <th>Date</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {commandes.map(cmd => (
                  <tr key={cmd.id}>
                    <td className="fw-bold">#{cmd.id}</td>
                    <td>
                      <div className="fw-semibold">{cmd.user?.name}</div>
                      <small className="text-muted">{cmd.user?.email}</small>
                    </td>
                    <td className="fw-bold" style={{ color: 'var(--primary)' }}>
                      {parseFloat(cmd.prix_total).toFixed(2)} DH
                    </td>
                    <td className="text-muted small">
                      {new Date(cmd.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      <select
                        value={cmd.statut}
                        onChange={e => changerStatut(cmd.id, e.target.value)}
                        className="form-select form-select-sm"
                        style={{ width: 160 }}
                      >
                        {STATUTS.map(s => <option key={s} value={s}>{STATUTS_FR[s]}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {commandes.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-muted py-4">Aucune commande.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ONGLET GRANOLAS ── */}
      {onglet === 'granolas' && (
        <div className="card-custom p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold mb-0">Catalogue des Granolas</h6>
            <button onClick={() => setModalG({ open: true, mode: 'create', data: { ...GRANOLA_VIDE } })} className="btn btn-primary-custom btn-sm">
              <i className="bi bi-plus me-1"></i>Ajouter
            </button>
          </div>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Description</th>
                  <th>Prix de base</th>
                  <th>Statut</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {granolas.map(g => (
                  <tr key={g.id}>
                    <td className="fw-semibold">{g.nom}</td>
                    <td><small className="text-muted" style={{ display: 'block', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.description}</small></td>
                    <td className="fw-semibold">{parseFloat(g.prix_base).toFixed(2)} DH</td>
                    <td>
                      <span className={`badge ${g.est_actif ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.7rem' }}>
                        {g.est_actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button onClick={() => setModalG({ open: true, mode: 'edit', data: { ...g } })} className="btn btn-outline-secondary btn-sm">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button onClick={() => supprimerGranola(g.id)} className="btn btn-outline-danger btn-sm">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {granolas.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-muted py-4">Aucun granola.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ONGLET INGRÉDIENTS ── */}
      {onglet === 'ingredients' && (
        <div className="card-custom p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold mb-0">Gestion des Ingrédients</h6>
            <button onClick={() => setModalI({ open: true, mode: 'create', data: { ...INGR_VIDE } })} className="btn btn-primary-custom btn-sm">
              <i className="bi bi-plus me-1"></i>Ajouter
            </button>
          </div>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Catégorie</th>
                  <th>Prix extra</th>
                  <th>Stock</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map(ing => (
                  <tr key={ing.id}>
                    <td className="fw-semibold">{ing.nom}</td>
                    <td><span className="badge bg-light text-dark border">{CATEGORIES_FR[ing.categorie] ?? ing.categorie}</span></td>
                    <td className="fw-semibold" style={{ color: 'var(--primary)' }}>+{parseFloat(ing.modificateur_prix).toFixed(2)} DH</td>
                    <td>
                      <span className={`fw-bold ${ing.stock <= 5 ? 'text-danger' : ing.stock <= 20 ? 'text-warning' : ''}`}>
                        {ing.stock}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button onClick={() => setModalI({ open: true, mode: 'edit', data: { ...ing } })} className="btn btn-outline-secondary btn-sm">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button onClick={() => supprimerIngredient(ing.id)} className="btn btn-outline-danger btn-sm">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {ingredients.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-muted py-4">Aucun ingrédient.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL GRANOLA ── */}
      {modalG.open && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {modalG.mode === 'create' ? 'Ajouter un Granola' : 'Modifier le Granola'}
                </h5>
                <button className="btn-close" onClick={() => setModalG({ ...modalG, open: false })}></button>
              </div>
              <form onSubmit={soumettreGranola}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Nom</label>
                    <input type="text" className="form-control" required value={modalG.data.nom}
                      onChange={e => setModalG({ ...modalG, data: { ...modalG.data, nom: e.target.value } })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea className="form-control" rows="2" value={modalG.data.description || ''}
                      onChange={e => setModalG({ ...modalG, data: { ...modalG.data, description: e.target.value } })}></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Prix de base (DH)</label>
                    <input type="number" step="0.01" className="form-control" required value={modalG.data.prix_base}
                      onChange={e => setModalG({ ...modalG, data: { ...modalG.data, prix_base: e.target.value } })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Image (chemin ou URL)</label>
                    <input type="text" className="form-control" placeholder="/images/granola.png" value={modalG.data.image || ''}
                      onChange={e => setModalG({ ...modalG, data: { ...modalG.data, image: e.target.value } })} />
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="actifSwitch" checked={modalG.data.est_actif}
                      onChange={e => setModalG({ ...modalG, data: { ...modalG.data, est_actif: e.target.checked } })} />
                    <label className="form-check-label" htmlFor="actifSwitch">Actif (visible dans le catalogue)</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setModalG({ ...modalG, open: false })}>Annuler</button>
                  <button type="submit" className="btn btn-primary-custom">Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL INGRÉDIENT ── */}
      {modalI.open && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {modalI.mode === 'create' ? 'Ajouter un Ingrédient' : 'Modifier l\'Ingrédient'}
                </h5>
                <button className="btn-close" onClick={() => setModalI({ ...modalI, open: false })}></button>
              </div>
              <form onSubmit={soumettreIngredient}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Nom</label>
                    <input type="text" className="form-control" required value={modalI.data.nom}
                      onChange={e => setModalI({ ...modalI, data: { ...modalI.data, nom: e.target.value } })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Catégorie</label>
                    <select className="form-select" value={modalI.data.categorie}
                      onChange={e => setModalI({ ...modalI, data: { ...modalI.data, categorie: e.target.value } })}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORIES_FR[c]}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Prix supplémentaire (DH)</label>
                    <input type="number" step="0.01" className="form-control" required value={modalI.data.modificateur_prix}
                      onChange={e => setModalI({ ...modalI, data: { ...modalI.data, modificateur_prix: e.target.value } })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Stock</label>
                    <input type="number" className="form-control" required value={modalI.data.stock}
                      onChange={e => setModalI({ ...modalI, data: { ...modalI.data, stock: e.target.value } })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setModalI({ ...modalI, open: false })}>Annuler</button>
                  <button type="submit" className="btn btn-primary-custom">Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAdmin;
