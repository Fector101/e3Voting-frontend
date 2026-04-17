import React, { useContext, useEffect, useState } from "react";
import { IUserData, UserContext } from '../assets/js/UserContext';

import { Lock, Vote, IdCard, User } from "lucide-react";
import './../assets/css/loginpage.css'
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Role } from "../assets/js/helper";


interface LoginPageProps {
    // setRole: React.Dispatch<React.SetStateAction<Role>>;
    role: Role;
}

export default function LoginPage({ role }: LoginPageProps) {
    const navigate = useNavigate()
    const context = useContext(UserContext);

    const usefiller = process.env.NODE_ENV === 'development'
    const [matric_no, setMatricNo] = useState(usefiller ? "FT23CMP00001" : '');
    const [password, setPassword] = useState(usefiller ? (role === 'admin' ? 'fabian' : "1") : '');
    const [signing_in, setSigningIn] = useState(false);
    useEffect(() => {
        setPassword(usefiller ? (role === 'admin' ? 'fabian' : "1") : '')
    }, [role, usefiller])
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setSigningIn(true)
        const formData = {
            matric_no,
            password,
        };
        try {
            const route = role === 'admin' ? 'admin-login' : 'login'
            const response = await fetch(`${import.meta.env.VITE_API_URL}/authn/${route}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data: IUserData  & { msg: string }  = await response.json();

            if (response.ok) {
                context?.setUserData({ role: data.role, username: data.username, matric_no: data.matric_no })
                setSigningIn(false)
                context?.setIsLoggedIn(true)
                toast.success(data.msg || 'Login successful!');
                navigate('/home');
            } else {
                setSigningIn(false)
                console.error("Login error:", data);
                toast.warning(data.msg || 'Check your inputs.')
            }
        } catch (error) {
            setSigningIn(false)
            console.error("Catch Login failed error:", error);
            toast.error('Something went wrong -' + error);
        }
    };

    return (
        <div className="signin-container">
            {signing_in &&
                <div className='modal'>
                    <div id="spinner" className="spinner"></div>
                </div>
            }
            <div className="signin-box">
                <div className="icon-circle">
                    <Vote />
                </div>
                <h2>E3Voting</h2>
                <p className="subtitle">
                    {role === 'admin' ? "Sign in to manage Polls Data" : "Sign in to your account"}
                </p>
                <form onSubmit={handleSubmit}>
                    <label>{role === 'admin' ? "Admin ID" : "Martric No"}</label>
                    <div className="input-group">
                        {role === 'admin' ? <User /> : <IdCard className="icon" />}
                        <input
                            type="text"
                            placeholder={role === 'admin' ? 'admin' : 'FT23CMP0040'}
                            value={matric_no}
                            onChange={(e) => setMatricNo(e.target.value)}
                            required
                        />
                    </div>

                    <label>Password</label>
                    <div className="input-group">
                        <Lock className="icon" />
                        <input
                            type="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="signin-btn primary-btn">Sign in</button>
                </form>
                {
                    role !== 'admin' ?
                        <div className='redirect flex'>
                            <Link to='/forgot-password' >Forgot Password?</Link>
                        </div>
                        :
                        <></>
                }
                {
                    role !== 'admin' ?
                        <div className='redirect flex'>
                            <p className="caption">Don't have an account?</p>
                            <Link to='/signup' >Sign Up</Link>
                        </div>
                        :
                        <></>
                }
                {
                    role !== 'admin' ?
                        <div className='redirect flex justify-self-cen'>
                            <p className="caption">Admin Demo -</p>
                            <Link to='/admin-login' >Login</Link>
                        </div>
                        :
                        <div className='redirect flex justify-self-cen'>
                            <p className="caption">Login as Student - </p>
                            <Link to='/login' >Login</Link>
                        </div>
                }
            </div>
        </div>
    );
}