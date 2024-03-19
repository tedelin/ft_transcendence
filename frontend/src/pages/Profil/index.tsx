import Infos from './Infos'
import Stats from './Stats'
import Achievements from './Achievements'
import History from './History'
import './ProfilStyle.css';
import { useAuth } from '../../components/AuthProvider';
import { useParams } from 'react-router-dom';
import { fetchUrl } from '../../fetch';
import { useEffect, useState } from 'react';
import { getAvatar } from '../../utils/utils';
import { ProfilData } from '../../utils/types';

function checkIfAnyAchievementIsTrue(achievement) {
	for (let key in achievement) {
	  if (typeof achievement[key] === 'boolean' && achievement[key] === true) {
		return true;
	  }
	}
	return false;
  }

function Profil() {
  const id = Number(useParams().id);
  if (isNaN(id))
    return <div>Invalid user id</div>;
  const userId = useAuth()?.user?.id;
  const me = id == userId;
  const [profilData, setProfilData] = useState<ProfilData | null>(null);
  const [profilMatchData, setProfilMatchData] = useState(null);

  useEffect(() => {
    async function fetchProfilData() {
      try {
        const data = await fetchUrl('/users/profilData/' + id); 
		const matchData = await fetchUrl('/game/history');
        setProfilData(data);
		setProfilMatchData(matchData)
      } catch (error) {
        console.error("Erreur lors de la récupération des données du profil:", error);
		    setProfilData({error: "User doesn't exist"});
      }
    }
    fetchProfilData();
  }, [id]);

  if (!profilData)
    return <div>Loading profil...</div>;
  if(profilData.error)
	return <div>User doesn't exist</div>;


  const avatar = getAvatar(profilData.avatar);
  return (
	<div className='profilPage'>
		<div className='Layout-profil'>
		<Infos username={profilData.username} avatar={avatar} bio={profilData.bio} id={id} me={me}/>
		<Stats stats={profilData.stats} />
		{checkIfAnyAchievementIsTrue(profilData.Achievement) && <Achievements Achievement={profilData.Achievement} />}
		<History match={profilMatchData} userId={id}/>
		</div>
	</div>
  );
}

export default Profil;
