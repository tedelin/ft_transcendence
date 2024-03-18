import '../../pages/Profil/ProfilStyle.css'

function Avatar({handleFileChange, preview}) {

  return (
    <div className="avatar">
        {preview && <img src={preview} alt="Aperçu de l'avatar" className="avatarProfil" />}
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
    </div>
  );
}

export default Avatar;
