import { useNavigate } from "react-router-dom";
import {fetchUrl} from "../../fetch"
import { useToast } from '../../utils/hooks/useToast';

function Infos(Infos : any) {
	const navigate = useNavigate();
	const { error, success } = useToast();

	const add = async (userId: number) => {
		try {
			await fetchUrl(`/friends/${userId}`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
				},
			});
			success('Friend request sent');
		} catch (err: any) {
			error(err.message);
		}
	}
	const play = () => {
		navigate(`/game?private=${Infos.id}`);
	}

	const goToSettings = () => {
		navigate('../../Settings');
	}

	const Actions = ({ me }) => (
		<div className="actions">
		  {me ? (<button className="add" onClick={goToSettings}>Settings</button>) : (
			<>
			  <button className="add" onClick={() => add(Infos.id)}>Add</button>
			  <button className="message" onClick={() => navigate(`/chat/private-messages/${Infos.id}`)}>Message</button>
			  <button className="playButton" onClick={play}>Invite to Play</button>
			</>
		  )}
		</div>
	);
	  
 	return (
		<div className="Infos">
			<div className="profil-picture">
				<img src={Infos.avatar} alt="profil-picture"></img>
			</div>
			<div className="side-Infos">
				<div className="pseudo">@{Infos.username}</div>
				<Actions me={Infos.me}/>
				<div className="Bio">
					{Infos.bio}</div>
				</div>
		</div>
	);
}

export default Infos;