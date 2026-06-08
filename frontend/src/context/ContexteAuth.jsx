import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Configurer l'URL de base de l'API Laravel
axios.defaults.baseURL = 'http://localhost:8000';

const ContexteAuth = createContext(null);

export const FournisseurAuth = ({ children }) => {
  const [utilisateur, setUtilisateur] = useState(null);
  const [jeton, setJeton] = useState(localStorage.getItem('greenola_token'));
  const [chargement, setChargement] = useState(true);

  // Mettre à jour le jeton et configurer Axios
  const configurerAuthentification = (nouveauJeton) => {
    if (nouveauJeton) {
      localStorage.setItem('greenola_token', nouveauJeton);
      axios.defaults.headers.common['Authorization'] = `Bearer ${nouveauJeton}`;
      setJeton(nouveauJeton);
    } else {
      localStorage.removeItem('greenola_token');
      delete axios.defaults.headers.common['Authorization'];
      setJeton(null);
      setUtilisateur(null);
    }
  };

  // Récupérer l'utilisateur actuellement connecté
  const chargerUtilisateur = async (tokenActuel) => {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenActuel}`;
      const reponse = await axios.get('/api/me');
      setUtilisateur(reponse.data);
    } catch (erreur) {
      console.error("Erreur lors du chargement de l'utilisateur :", erreur);
      configurerAuthentification(null); // Réinitialise en cas d'erreur
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    if (jeton) {
      chargerUtilisateur(jeton);
    } else {
      setChargement(false);
    }
  }, [jeton]);

  // Connexion
  const connexion = async (email, password) => {
    try {
      const reponse = await axios.post('/api/login', { email, password });
      const { user, token } = reponse.data;
      configurerAuthentification(token);
      setUtilisateur(user);
      return { success: true };
    } catch (erreur) {
      const message = erreur.response?.data?.message || "Identifiants incorrects";
      return { success: false, error: message };
    }
  };

  // Inscription
  const inscription = async (name, email, password, password_confirmation) => {
    try {
      const reponse = await axios.post('/api/register', {
        name,
        email,
        password,
        password_confirmation
      });
      const { user, token } = reponse.data;
      configurerAuthentification(token);
      setUtilisateur(user);
      return { success: true };
    } catch (erreur) {
      // Regrouper les erreurs de validation
      const validationErrors = erreur.response?.data?.errors;
      let message = erreur.response?.data?.message || "Erreur lors de l'inscription";
      if (validationErrors) {
        message = Object.values(validationErrors).flat().join(' ');
      }
      return { success: false, error: message };
    }
  };

  // Déconnexion
  const deconnexion = async () => {
    try {
      await axios.post('/api/logout');
    } catch (erreur) {
      console.error("Erreur lors de la déconnexion sur le serveur :", erreur);
    } finally {
      configurerAuthentification(null);
    }
  };

  return (
    <ContexteAuth.Provider value={{ utilisateur, jeton, chargement, connexion, inscription, deconnexion }}>
      {children}
    </ContexteAuth.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  return useContext(ContexteAuth);
};
