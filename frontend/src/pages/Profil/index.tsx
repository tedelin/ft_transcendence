import Infos from './Infos'
import Stats from './Stats'
import Achievements from './Achievements'
import History from './History'
import './ProfilStyle.css';

function Profil(id : any) {
	return (
	  <div className='Layout-profil'>
		<Infos id={id}/>
		<Stats/>
		<Achievements/>
		<History playerId={id}/>
	  </div>
	);
}
  
  export default Profil;