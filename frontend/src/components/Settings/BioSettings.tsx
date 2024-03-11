const BioSettings = ({ bio, setBio }) => {
	return (
	  <div className='BioSettings'>
		<h2>Bio</h2>
		<textarea value={bio} onChange={(e) => setBio(e.target.value)}></textarea>
	  </div>
	);
  };
  
  export default BioSettings;
