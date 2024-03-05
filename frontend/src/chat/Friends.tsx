import { useEffect, useState } from 'react';
import { fetchUrl } from '../fetch';
import { useAuth } from '../components/AuthProvider';
import { useToast } from '../utils/hooks/useToast';
import { Friendship, User } from '../utils/types';
import { useNavigate } from 'react-router-dom';
import '../styles/friends.css';
import { getAvatar } from '../utils/utils';
import { AddFriendModal } from './AddFriendModal';


function FriendsTopBar({ setSelected, selected, setFriendModal }: { setSelected: Function, selected: string, setFriendModal: Function }) {
	const options = ["All", "Online","Pending", "Blocked"];

	const handleOptionClick = (option: string) => {
		setSelected(option);
	};

	return (
		<>
			<div className='list'>
				{options.map((option) => (
					<div
						key={option}
						className={`listItemCenter${selected === option ? "Selected" : ""}`}
						onClick={() => handleOptionClick(option)}
					>
						{option}
					</div>
				))}
			</div>
			<div className='addFriendAction' onClick={() => setFriendModal(true)}>
				Add Friend
			</div>
		</>
	);
}


function SearchFriends({ selected }: { selected: string }) {
	return (
		(selected !== "AddFriend" &&
			<div className='searchContainer'>
				<input className="searchFriends" type="text" placeholder="Search friends" />
			</div>)
	);
}

function FriendsList({ selected }: { selected: string }) {
	const [friends, setFriends] = useState<Friendship[] | []>([]);
	const token = localStorage.getItem('jwtToken');
	const { error, success } = useToast();
	const navigate = useNavigate();
	const auth = useAuth();

	async function acceptFriendRequest(requestId: number) {
		try {
			await fetchUrl(`/friends/accept/${requestId}`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setFriends((prevFriends) =>
				prevFriends.filter((friend) => friend.id !== requestId)
			);
			success('Friend request accepted');
		} catch (err: any) {
			error(err.message);
		}
	}

	async function deleteFriend(requestId: number) {
		try {
			await fetchUrl(`/friends/delete/${requestId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setFriends((prevFriends) =>
				prevFriends.filter((friend) => friend.id !== requestId)
			);
		} catch (err: any) {
			error(err.message);
		}
	}

	async function blockFriend(friendRequest: Friendship) {
		const userId = auth?.user?.id === friendRequest.initiatorId ? friendRequest.receiverId : friendRequest.initiatorId;
		try {
			await fetchUrl(`/friends/block/${userId}`, {
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setFriends((prevFriends) =>
				prevFriends.filter((friend) => friend.id !== friendRequest.id)
			);
		} catch (err: any) {
			error(err.message);
		}

	}

	async function getFriends() {
		const token = localStorage.getItem('jwtToken');
		try {
			const response = await fetchUrl("/friends/all", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setFriends(response);
		} catch (err: any) {
			error(err.message);
		}
	}

	useEffect(() => {
		getFriends();
	}, [selected]);

	useEffect(() => {
		auth?.socket?.on('user-state', (data) => {
			const updatedFriends = friends.map((friend) => {
				if (friend.initiator.id === data.userId) {
					return { ...friend, initiator: { ...friend.initiator, status: data.state } };
				}
				else if (friend.receiver.id === data.userId) {
					return { ...friend, receiver: { ...friend.receiver, status: data.state } };
				}
				return friend;
			});
			setFriends(updatedFriends);
		});

		return () => {
			auth?.socket?.off('user-state');
		};
	}, [friends]);
	

	const filteredFriends = friends.filter((friendship: Friendship) => {
		const friend = friendship.initiator.id === auth?.user?.id ? friendship.receiver : friendship.initiator;
		if (selected === "Pending") {
			return (
				friendship.status === "PENDING" &&
				friendship.initiator.id !== auth?.user?.id
			);
		} else if (selected === "All") {
			return friendship.status === "ACCEPTED";
		} else if (selected === "Blocked") {
			return (friendship.status === "BLOCKED" && friendship.initiator.id == auth?.user?.id);
		} else if (selected === "Online") {
			return friendship.status === "ACCEPTED" && friend.status === "ONLINE";
		} else {
			return friendship.status === "ACCEPTED";
		}
	});

	return (
		<div className='list'>
			{filteredFriends.length > 0 &&
				filteredFriends.map((friendship: Friendship) => {
					const friend = friendship.initiator.id === auth?.user?.id ? friendship.receiver : friendship.initiator;
					return (
						<div className='listItem' key={friend.id}>
							<div className='statusContainer'>
								<img
									className='smallAvatar'
									src={getAvatar(friend.avatar)}
									alt='avatar'
								/>
								<span className={`status ${friend.status === "ONLINE" ? "online" : "offline"}`}>
								</span>
							</div>
							<span className='spanMargin'>
								{friend.username}
							</span>
							{friendship.status === "PENDING" && (
								<div className='friendActions'>
									<button
										className='acceptFriend'
										onClick={() => acceptFriendRequest(friendship.id)}
									>
										Accept
									</button>
									<button
										className='declineFriend'
										onClick={() => deleteFriend(friendship.id)}
									>
										Decline
									</button>
								</div>
							)}
							{friendship.status === "ACCEPTED" && (
								<div className='friendActions'>
									<span
										onClick={() => navigate(`/chat/private-messages/${friend.id}`)}
										className='material-symbols-outlined'
									>
										chat
									</span>
									<button
										className='declineFriend'
										onClick={() => deleteFriend(friendship.id)}
									>
										Remove
									</button>
									<button
										className='declineFriend'
										onClick={() => blockFriend(friendship)}
									>
										Block
									</button>
								</div>
							)}
							{friendship.status === "BLOCKED" && (
								<div className='friendActions'>
									<button
										className='declineFriend'
										onClick={() => deleteFriend(friendship.id)}
									>
										Unblock
									</button>
								</div>
							)}
						</div>
					);
				})}
		</div>
	)
}


export function Friends() {
	const [selected, setSelected] = useState("All");
	const [friendModal, setFriendModal] = useState(false);

	return (
		<>
			<div className='flexColumn'>
				<AddFriendModal enabled={friendModal} setEnabled={() => setFriendModal(false)} />
				<SearchFriends selected={selected} />
				<FriendsList selected={selected} />
			</div>
			<div className='sideBar'>
				<FriendsTopBar selected={selected} setSelected={setSelected} setFriendModal={setFriendModal}/>
			</div>
		</>
	);
}