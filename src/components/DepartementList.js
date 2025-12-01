import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './DepartementList.css';

const DepartementList = () => {
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDepartements = async (retryAttempt = 0) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Tentative de connexion à:', 'https://backendiat.onrender.com/dept/departements');

      const response = await axios.get('https://backendiat.onrender.com/dept/departements', {
        timeout: 30000, // 30 secondes pour permettre au serveur Render de se réveiller
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Réponse reçue:', response.data);
      setDepartements(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur complète:', err);
      console.error('Réponse du serveur:', err.response);

      let errorMessage = 'Erreur lors du chargement des données: ';
      let canRetry = false;

      if (err.response) {
        // Le serveur a répondu avec un code d'erreur
        errorMessage += `${err.response.status} - ${err.response.statusText}. `;
        console.error('Données de l\'erreur:', err.response.data);

        if (err.response.status === 404) {
          errorMessage += '\n\nPossibles causes:\n' +
            '• L\'endpoint /dept/departements n\'existe pas sur le serveur\n' +
            '• Le serveur backend n\'est pas déployé correctement\n' +
            '• Vérifiez les routes dans votre backend';
        } else if (err.response.status === 500) {
          errorMessage += 'Erreur serveur. Vérifiez les logs du backend.';
          canRetry = retryAttempt < 2;
        }
      } else if (err.request) {
        // La requête a été envoyée mais aucune réponse reçue
        errorMessage += 'Pas de réponse du serveur.\n\n' +
          'Le serveur Render (gratuit) s\'endort après inactivité.\n' +
          'Il peut prendre jusqu\'à 30 secondes pour se réveiller.';
        canRetry = retryAttempt < 2;
      } else if (err.code === 'ECONNABORTED') {
        errorMessage += 'Délai d\'attente dépassé. Le serveur met trop de temps à répondre.';
        canRetry = retryAttempt < 1;
      } else {
        errorMessage += err.message;
      }

      setError(errorMessage);

      // Retry automatique pour certaines erreurs
      if (canRetry) {
        console.log(`Nouvelle tentative dans 3 secondes... (tentative ${retryAttempt + 1}/2)`);
        setError(errorMessage + `\n\nNouvelle tentative dans 3 secondes... (${retryAttempt + 1}/2)`);
        setTimeout(() => fetchDepartements(retryAttempt + 1), 3000);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce département?')) {
      try {
        await axios.delete(`https://backendiat.onrender.com/dept/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        fetchDepartements(); // Recharger la liste après suppression
      } catch (err) {
        alert('Erreur lors de la suppression: ' + err.message);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="departement-container">
      <div className="header">
        <h1>Liste des Départements</h1>
        <div className="header-actions">
          <button onClick={fetchDepartements} className="refresh-btn">Actualiser</button>
          <button onClick={handleLogout} className="logout-btn">Déconnexion</button>
        </div>
      </div>

      {departements.length === 0 ? (
        <p className="no-data">Aucun département trouvé</p>
      ) : (
        <div className="table-responsive">
          <table className="departement-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Service</th>
                <th>Message</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departements.map((dept) => (
                <tr key={dept._id}>
                  <td>{dept.nom}</td>
                  <td>{dept.prenom || '-'}</td>
                  <td>{dept.email}</td>
                  <td>{dept.phone || '-'}</td>
                  <td>{dept.service}</td>
                  <td className="message-cell">{dept.message}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(dept._id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="total-count">
        Total: {departements.length} département(s)
      </div>
    </div>
  );
};

export default DepartementList;
