import React, { useContext, useState } from "react";
import { IUserData, UserContext } from '../assets/js/UserContext';

import { Lock, Vote, IdCard, User, Mail } from "lucide-react";
import './../assets/css/loginpage.css'
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

export default function SignupPage() {
    const navigate = useNavigate()
    const context = useContext(UserContext);

    const usefiller = process.env.NODE_ENV === 'development'
    const [matric_no, setMatricNo] = useState(usefiller ? "FT23CMP00001" : '');
    const [password, setPassword] = useState(usefiller ? "1" : '');
    const [fullname, setFullName] = useState(usefiller ? "Fabian Joseph" : '');
    const [email, setEmail] = useState(usefiller ? "fabian@example.com" : '');
    const [signing_in, setSigningIn] = useState(false);


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setSigningIn(true)
        const formData = {
            username: fullname,
            matric_no,
            email,
            password,
        };
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/authn/signup`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data: IUserData  & { msg: string } = await response.json();

            if (response.ok) {
                console.log("User created:", data);
                setSigningIn(false)
                console.log({ role: data.role, username: data.username, matric_no: data.matric_no })
                context?.setUserData({ role: data.role, username: data.username, matric_no: data.matric_no })
                context?.setIsLoggedIn(true)
                toast.success(data.msg || 'Signup successful!');
                navigate('/home');
            } else {
                setSigningIn(false)
                console.error("Signup error:", data);
                toast.warning(data.msg || 'Check your inputs.')
            }
        } catch (error) {
            setSigningIn(false)
            console.error("Network error:", error);
            toast.error('Something went wrong - ' + error);
        }


    };

    return (
        <div className="signin-container signup-page">
            {signing_in &&
                <div className='modal signing-in-spinner-case'>
                    <div id="spinner" className="spinner"></div>
                </div>
            }
            <div className="signin-box">
                <div className="icon-circle">
                    <Vote />
                </div>
                <h2>Create an Account</h2>
                <p className="subtitle">Sign up to start voting</p>
                <form onSubmit={handleSubmit}>
                    <label>Full Name</label>
                    <div className="input-group">
                        <User className="icon" />
                        <input
                            type="text"
                            placeholder="John Wick"
                            value={fullname}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
                    <label>Matric No</label>
                    <div className="input-group">
                        <IdCard className="icon" />
                        <input
                            type="text"
                            placeholder="FT23CMP0040"
                            value={matric_no}
                            onChange={(e) => setMatricNo(e.target.value)}
                            required
                        />
                    </div>

                    <label>Email</label>
                    <div className="input-group">
                        <Mail className="icon" />
                        <input
                            type="email"
                            placeholder="youremail@nsuk.edu.ng"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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

                    <button type="submit" className="signin-btn primary-btn">Sign Up</button>
                </form>
                <div className='redirect flex'>
                    <p className="caption">Already have an account? </p>
                    <Link to='/login' >Sign in</Link>
                </div>
            </div>
        </div>
    );
}