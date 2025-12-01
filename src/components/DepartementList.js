import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DepartementList.css';

const DepartementList = () => {
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDepartements();
  }, []);

  const fetchDepartements = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://backendiat.onrender.com/dept/departements');
      setDepartements(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce département?')) {
      try {
        await axios.delete(`https://backendiat.onrender.com/dept/${id}`);
        fetchDepartements(); // Recharger la liste après suppression
      } catch (err) {
        alert('Erreur lors de la suppression: ' + err.message);
      }
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="departement-container">
      <h1>Liste des Départements</h1>
      <div className="refresh-btn">
        <button onClick={fetchDepartements}>Actualiser</button>
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
