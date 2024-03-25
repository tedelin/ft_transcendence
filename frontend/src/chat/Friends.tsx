import { useEffect, useState } from 'react';
import { fetchUrl } from '../fetch';
import { useAuth } from '../components/AuthProvider';
import { useToast } from '../utils/hooks/useToast';
import { Friendship } from '../utils/types';
import { useNavigate } from 'react-router-dom';
import '../styles/friends.css';
import { getAvatar } from '../utils/utils';
import { AddFriendModal } from './AddFriendModal';


function FriendsTopBar({ setSelected, selected, setFriendModal }: { setSelected: Function, selected: string, setFriendModal: Function }) {
	const options = ["All", "Online", "Pending", "Blocked"];

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


function SearchFriends({ friendList, setFriends }: { friendList: Friendship[], setFriends: Function }) {
	const [input, setInput] = useState('');
	const auth = useAuth();

	function filterFriends(value: string) {
		setFriends(friendList.filter((friendship) => {
			const friend = auth?.user?.id === friendship.initiator.id ? friendship.receiver : friendship.initiator;
			const username = friend.username || '';
			const lowercaseUsername = username.toLowerCase();
			const lowercaseValue = value.toLowerCase();
			return lowercaseUsername.includes(lowercaseValue);
		}));
	}

	function handleChange(value: string) {
		setInput(value);
		filterFriends(value);
	}

	return (
		<div className='topContainer'>
			<input
				className="searchFriends"
				type="text"
				placeholder="Search friends"
				value={input}
				onChange={(e) => handleChange(e.target.value)}
			/>
		</div>
	);
}

function FriendsList({ selected }: { selected: string }) {
	const [friends, setFriends] = useState<Friendship[] | []>([]);
	const [filteredFriends, setFilteredFriends] = useState<Friendship[] | []>([]);
	const [searchFriends, setSearchFriends] = useState<Friendship[] | []>([]);
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
			setFilteredFriends((prevFriends) =>
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
			setFilteredFriends((prevFriends) =>
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
			setFilteredFriends((prevFriends) =>
				prevFriends.filter((friend) => friend.id !== friendRequest.id)
			);
		} catch (err: any) {
			error(err.message);
		}
	}

	async function getFriends() {
		try {
			const response = await fetchUrl("/friends/all", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
				},
			});
			setFriends(response);
		} catch (err: any) {
			error(err.message);
		}
	}

	function filterFriends() {
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
		setFilteredFriends(filteredFriends);
		setSearchFriends(filteredFriends);
	}

	useEffect(() => {
		getFriends();
	}, [selected]);

	useEffect(() => {
		auth?.socket?.on('friendship', (request) => {
			setFriends((prevFriends) => {
				const friendIndex = prevFriends.findIndex((friend) => friend.id === request.id);
				if (friendIndex !== -1) {
					return prevFriends.map((friend, index) => {
						if (index === friendIndex) {
							return request;
						}
						return friend;
					});
				} else {
					return [...prevFriends, request];
				}
			});
		});

		auth?.socket?.on('friendship-delete', (request) => {
			setFriends((prevFriends) => {
				return prevFriends.filter((friend) => friend.id !== request.id);
			});
		});

		auth?.socket?.on('user-state', (data) => {
			setFriends((prevFriends) => {
				const updatedFriends = prevFriends.map((friend) => {
					if (friend.initiator.id === data.userId) {
						return { ...friend, initiator: { ...friend.initiator, status: data.state } };
					}
					else if (friend.receiver.id === data.userId) {
						return { ...friend, receiver: { ...friend.receiver, status: data.state } };
					}
					return friend;
				});
				return updatedFriends;
			});
		});

		return () => {
			auth?.socket?.off('user-state');
			auth?.socket?.off('friendship');
			auth?.socket?.off('friendship-delete');
		};
	}, []);

	useEffect(() => {
		filterFriends();
	}, [friends]);

	return (
		<>
			<SearchFriends friendList={searchFriends} setFriends={setFilteredFriends} />
			<div className='list'>
				{filteredFriends.length > 0 &&
					filteredFriends.map((friendship: Friendship) => {
						const friend = friendship.initiator.id === auth?.user?.id ? friendship.receiver : friendship.initiator;
						return (
							<div className='listItem' key={friend.id}>
								<div className='statusContainer'>
									<img
										onClick={() => navigate('/profil/' + friend.id)}
										className='smallAvatar'
										src={getAvatar(friend.avatar)}
										alt='avatar'
									/>
									<span className={`status ${friend.status === "ONLINE" ? "online" : friend.status === "IN_GAME" ? "IN_GAME inGame" : "offline"}`}>
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
											className='material-symbols-outlined privateMessageIcon'
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
		</>
	)
}


export function Friends() {
	const [selected, setSelected] = useState("All");
	const [friendModal, setFriendModal] = useState(false);

	return (
		<>
			<AddFriendModal enabled={friendModal} setEnabled={() => setFriendModal(false)} />
			<div className='flexColumn'>
				<FriendsList selected={selected} />
			</div>
			<div className='sideBar'>
				<FriendsTopBar selected={selected} setSelected={setSelected} setFriendModal={setFriendModal} />
			</div>
		</>
	);
}