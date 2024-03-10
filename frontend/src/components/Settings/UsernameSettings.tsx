const UsernameSettings = ({ username, setUsername }) => {
	return (
	  <div className='UsernameSettings'>
		<h2>Username</h2>
		<input value={username} onChange={(e) => setUsername(e.target.value)} />
	  </div>
	);
  };
  
  export default UsernameSettings;
  