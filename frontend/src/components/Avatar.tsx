import React, { useState } from 'react';
import { useAuth } from './AuthProvider';


function AvatarUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const auth = useAuth();
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const filePath = auth?.user?.avatar;
  const fileName = filePath?.split('/').pop();
  const avatarUrl = API_BASE_URL + "/users/avatars/" + fileName;
  const [preview, setPreview] = useState(avatarUrl);
  const token = localStorage.getItem('jwtToken');


  // Gère la sélection du fichier et met à jour l'aperçu
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file)); // Crée un URL pour l'aperçu
    }
  };

  // Gère la soumission du formulaire
  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      alert("Veuillez sélectionner une image pour l'avatar.");
      return;
    }

    const formData = new FormData();
    formData.append('avatar', selectedFile);
    try {
      const response = await fetch(API_BASE_URL + "/users/upload-avatar", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("Avatar uploadé avec succès !");
        // Traite la réponse ici, par exemple en mettant à jour l'état du composant ou l'URL de l'aperçu
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
      <h2>Changer d'avatar</h2>
      <form onSubmit={handleUpload}>
        {preview && <img src={preview} alt="Aperçu de l'avatar" style={{ width: 100, height: 100, borderRadius: '50%' }} />}
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit">Changer d'avatar</button>
      </form>
    </div>
  );
}

export default AvatarUpload;
