
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUrl } from '../fetch';

export function ChannelMember({children}: {children: JSX.Element}) {
	const [loading, setLoading] = useState(true);
	const [exist, setExist] = useState(false);
	const [isMember, setIsMember] = useState(true);
	const [isBanned, setIsBanned] = useState(false);
	const { name } = useParams();

	async function verifyMembership() {
		try {
			const response = await fetchUrl(`/chat/channels/membership/${name}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
					'Content-Type': 'application/json',
				},
			});
			setExist(response.exist);
			setIsMember(response.member);
			setIsBanned(response.banned);
		} catch (err: any) {
			console.error(err.message);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		verifyMembership();
	}, []);

	if (loading) {
		return <div>Loading...</div>
	}

	if (!exist) {
		return <div className='accessError'>This channel does not exist</div>
	
	}

	if (isBanned) {
		return <div className='accessError'>Oops you are banned from this channel</div>
	}

	if (!isMember) {
		return <div className='accessError'>You are not a member of this channel</div>
	}

	return children;
}