import { useUser } from '../components/AuthProvider';

export default function Home() {
  const user = useUser();

  return (
    <main>
    	<h2>{user.username ? "Bonjour " +  user.userName + " your id is " + user.id : "go to /pages/login to log in"} </h2>
    </main>
  )
}