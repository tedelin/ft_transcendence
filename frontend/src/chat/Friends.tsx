import { useEffect, useState } from 'react';
import { fetchUrl } from '../fetch';
import { useAuth } from '../components/AuthProvider';
import { useToast } from '../utils/hooks/useToast';
import { Friendship, User } from '../utils/types';
import { useNavigate } from 'react-router-dom';
import '../styles/chat.css';


function AddFriend({ selected } : { selected: string }) {
	const [username, setUsername] = useState('');
	const [user, setUser] = useState<User | null>(null);
	const {error, success} = useToast();
	const token = localStorage.getItem('jwtToken');

	async function getUser() {
		try {
			const response = await fetchUrl(`/users/username/${username}`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setUser(response);
            await sendRequest();
		} catch (err: any) {
			error(err.message);
		}
	}

	async function sendRequest() {
        try {
			if (user) {
				await fetchUrl(`/friends/${user.id}`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				success('Friend request sent');
			}
		} catch (err: any) {
			error(err.message);
		}
	}

	return ((selected === "AddFriend" &&
		<div className='createChannelContainer'>
			<input 
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				type="text"
				placeholder="You can add friends by typing their username"
			/>
			<button className='createButton' onClick={getUser}>
				Send Friend Request
			</button>
		</div>
	));
}

function FriendsTopBar({ setSelected, selected } : { setSelected: Function, selected: string }) {
	const options = ["Online", "All", "Pending", "Blocked"];

	const handleOptionClick = (option: string) => {
		setSelected(option);
	};

	return (
		<div className='friendsTopBar'>
			<span className='material-symbols-outlined'>
				group
			</span>
			<span className='spanMargin'>
				Friends
			</span>
			{options.map((option) => (
				<div
					key={option}
					className={`topBarAction${selected === option ? "Selected" : ""}`}
					onClick={() => handleOptionClick(option)}
				>
					<div>{option}</div>
				</div>
			))}
			<div className='addFriendAction' onClick={() => setSelected("AddFriend")}>
				<span>Add Friend</span>
			</div>
		</div>
	);
}


function SearchFriends({ selected } : { selected: string }) {
	return (
		(selected !== "AddFriend" && <>
			<input type="text" placeholder="Search friends" />
		</>)
	);
}

function FriendsList({ selected } : { selected: string }) {
	const [friends, setFriends] = useState<Friendship[] | []>([]);
	const token = localStorage.getItem('jwtToken');
	const {error, success} = useToast();
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

	const filteredFriends = friends.filter((friend : Friendship) => {
		if (selected === "Pending") {
			return (
				friend.status === "PENDING" &&
				friend.initiatorId !== auth?.user?.id
			);
		} else if (selected === "All") {
			return friend.status === "ACCEPTED";
		} else if (selected === "Blocked") {
			return (friend.status === "BLOCKED" && friend.initiatorId == auth?.user?.id);
		} else {
			return friend.status === "ACCEPTED";
		}
	});

	return (
		selected !== "AddFriend" && (
			<div className='friendsList'>
				{filteredFriends.length > 0 &&
					filteredFriends.map((friend: any) => (
						<div className='friendListItem' key={friend.id}>
							<span className='sideBarChatName'>{friend.initiatorId == auth?.user?.id ? friend.receiver.username : friend.initiator.username}</span>
							{friend.status === "PENDING" && (
								<div className='friendActions'>
									<button
										className='acceptFriend'
										onClick={() => acceptFriendRequest(friend.id)}
									>
										Accept
									</button>
									<button
										className='declineFriend'
										onClick={() => deleteFriend(friend.id)}
									>
										Decline
									</button>
								</div>
							)}
							{friend.status === "ACCEPTED" && (
								<div className='friendActions'>
									<button
										className='declineFriend'
										onClick={() => deleteFriend(friend.id)}
									>
										Remove
									</button>
									<button 
										className='declineFriend'
										onClick={() => blockFriend(friend)}
									>
										Block
									</button>
									<span
										onClick={() => navigate(`/chat/private-messages/${friend.initiatorId == auth?.user?.id ? friend.receiverId : friend.initiatorId}`)}
										className='material-symbols-outlined'
									>
										chat
									</span>
								</div>
							)}
						</div>
					))}
			</div>
		)
	);
}


export function Friends() {
	const [selected, setSelected] = useState("Online");

	return (
		<>
			<FriendsTopBar selected={selected} setSelected={setSelected} />
			<AddFriend selected={selected} />
			<SearchFriends selected={selected} />
			<FriendsList selected={selected} />
		</>
	);
}