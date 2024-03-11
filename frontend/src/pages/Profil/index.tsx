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

// la data dans le call :
// /users/getProfilData/:id
// {
//     "username": "gansard",
//     "avatar": "default-avatar.jpg",
//     "matchs": [
//         {
//             "playerId": 2,
//             "matchId": 1,
//             "score": 0,
//             "role": "PLAYER_TWO"
//         }
//     ],
//     "stats": {
//         "id": 2,
//         "userId": 2,
//         "nbGames": 1,
//         "nbWin": 0,
//         "nbLoose": 1
//     },
//     "Achievement": {
//         "id": 2,
//         "userId": 2,
//         "firstGame": true,
//         "firstWin": false,
//         "firstLoose": true,
//         "masterWinner": false,
//         "invincible_guardian": false,
//         "Speed_Demon": false
//     }
// }

function checkIfAnyAchievementIsTrue(achievement) {
	for (let key in achievement) {
	  if (typeof achievement[key] === 'boolean' && achievement[key] === true) {
		return true;
	  }
	}
	return false;
  }

function Profil() {
  const id = useParams().id;
  const userId = useAuth()?.user?.id;
  const me = id == userId;
  const [profilData, setProfilData] = useState(null); 
  const [profilMatchData, setProfilMatchData] = useState(null);

  useEffect(() => {
    async function fetchProfilData() {
      try {
        const data = await fetchUrl('/users/profilData/' + id); // renvoyer un truc precit si ca existe pas
		const matchData = await fetchUrl('/game/history');
        setProfilData(data);
		setProfilMatchData(matchData)
      } catch (error) {
        console.error("Erreur lors de la récupération des données du profil:", error);
		setProfilData({error})
      }
    }
    fetchProfilData();
  }, [id]);

  if (!profilData)
    return <div>Chargement des données du profil...</div>;
  if(profilData.error)
	return <div>User doesn't exist</div>;

  console.log("profilData.Achievement :", profilData.Achievement);

  const avatar = getAvatar(profilData.avatar);
  console.log("avatar : ", avatar);
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
