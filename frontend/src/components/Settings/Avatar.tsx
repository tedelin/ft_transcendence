function Avatar({handleFileChange, preview}) {

  return (
    <div className="avatar">
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
    </div>
  );
}

export default Avatar;
