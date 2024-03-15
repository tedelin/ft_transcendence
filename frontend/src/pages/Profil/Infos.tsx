import { useNavigate } from "react-router-dom";
import { fetchUrl } from "../../fetch"
import { useToast } from '../../utils/hooks/useToast';
import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthProvider";

interface InfoType {
	id: number;
	username: string,
	bio: string,
	avatar: string,
	me: boolean
}

function Infos(Infos: InfoType) {
	const navigate = useNavigate();
	const { error, success } = useToast();
	const [friends, setFriends] = useState<number[]>([]);;
	const userId = useAuth()?.user?.id;
	const getFriends = async () => {
		try {
			const currentUserID = userId;
			const friendsData = await fetchUrl(`/friends/all`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
				},
			});

			const acceptedFriendsIds = friendsData
				.filter(friend => friend.status === "ACCEPTED")
				.map(friend => friend.initiatorId === currentUserID ? friend.receiverId : friend.initiatorId); // Choisis l'ID de l'autre partie selon qui est l'initiateur
			setFriends(acceptedFriendsIds);
		} catch (err: any) {
			error(err.message);
		}
	};

	useEffect(() => {
		getFriends();
	}, []);

	const isFriends = () => {
		return friends.includes(Number(Infos.id));
	};

	const Actions = ({ me }) => (
		<div className="actions">
			{me ? (
				<button className="add" onClick={goToSettings}>Settings</button>
			) : (
				<>
					{isFriends() ? (
						<>
							<button className="block" onClick={() => blockUser(Infos.id)}>Block</button>
							<button className="message" onClick={() => navigate(`/chat/private-messages/${Infos.id}`)}>Message</button>
							<button className="playButton" onClick={play}>Invite to Play</button>
						</>
					) : (
						<>
							<button className="block" onClick={() => blockUser(Infos.id)}>Block</button>
							<button className="add" onClick={() => add(Infos.id)}>Add</button>
						</>
					)}
				</>
			)}
		</div>
	);


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

	async function blockUser(userId: number) {
		try {
			await fetchUrl(`/friends/block/${userId}`, {
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
				},
			});
			success('User blocked');
		} catch (err: any) {
			error(err.message);
		}
	}

	return (
		<div className="Infos">
			<div className="profil-picture">
				<img src={Infos.avatar} alt="profil-picture"></img>
			</div>
			<div className="side-Infos">
				<div className="pseudo">@{Infos.username}</div>
				<Actions me={Infos.me} />
				<div className="Bio">
					{Infos.bio}</div>
			</div>
		</div>
	);
}

export default Infos;