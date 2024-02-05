import { useState } from 'react';
import { useAuth } from '../components/AuthProvider'
import { useNavigate, useLocation } from 'react-router-dom';
import { useError } from '../components/ErrorProvider'
import '../styles/login.css';


export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const auth = useAuth();
    const location = useLocation();
    const err = useError();

    const from = location.state?.from?.pathname || '/';

    async function handleSignIn() {
        if (!username || !password) {
            err.setError('Please enter both username and password.');
            return;
        }
        try {
            await auth?.signin(username, password);
            navigate(from, { replace: true });
        } catch (error) {
            console.log(error);
            err.setError(error.message);
        }
    }

    async function handleSignUp() {
        if (!username || !password) {
            err.setError('Please enter both username and password.');
            return;
        }
        try {
            await auth?.signup(username, password);
            navigate(from, { replace: true });
        } catch (error) {
            console.log(error);
            err.setError(error.message);
        }
    }
    return (
        <div className="fix">
            <div className="loginContainer">
                <input
                    className="field"
                    type="text"
                    placeholder="Username"
                    onChange={(e) => {
                        setUsername(e.target.value);
                    }}
                />
                <input
                    className="field"
                    type="password"
                    placeholder="Password"
                    onChange={(e) => {
                        setPassword(e.target.value);
                    }}
                />
                <button
                    className="button"
                    onClick={handleSignIn}
                >
                    Login
                </button>
                <button
                    className="registerButton"
                    onClick={handleSignUp}
                >
                    Register
                </button>
                {/* <a href={import.meta.env.VITE_URL_OAUTH}>
                    <button className="registerButton">
                        Connect with 42
                    </button>
                </a> */}
            </div>
        </div>
    );
}
