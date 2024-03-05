import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';
import { getAvatar } from '../../utils/utils';


function AvatarUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const auth = useAuth();
  const [preview, setPreview] = useState(getAvatar(auth?.user?.avatar));
  const token = localStorage.getItem('jwtToken');
  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file)); // Crée un URL pour l'aperçu
    }
  };

  // Gère la soumission du formulaire
  const handleUpload = async (event: any) => {
    event.preventDefault();

    if (!selectedFile) {
      alert("Veuillez sélectionner une image pour l'avatar.");
      return;
    }

    const formData = new FormData();
    formData.append('avatar', selectedFile);
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/users/upload-avatar", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("Avatar uploadé avec succès !");
      } else {
        alert("Échec de l'upload de l'avatar.");
      }
    } catch (error) {
      console.error("Erreur lors de l'upload de l'avatar:", error);
      alert("Une erreur est survenue lors de l'upload de l'avatar.");
    }
  };

  return (
    <div>
      <form onSubmit={handleUpload}>
        {preview && <img src={preview} alt="Aperçu de l'avatar" style={{ width: 300, height: 300, borderRadius: '50%' }} />}
        <div className="edit-button">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            id="fileInput"
            style={{ display: 'none' }}
          />
          <label htmlFor="fileInput" className="edit">
            Edit
          </label>
        </div>
        <button type="submit">Changer d'avatar</button>
      </form>
    </div>
  );
}

export default AvatarUpload;
