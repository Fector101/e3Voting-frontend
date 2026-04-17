import React, { useState } from "react";
import { Mail, Vote } from "lucide-react";
import './../assets/css/loginpage.css'
import { Link } from "react-router";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setSending(true);
        const formData = {
            email,
        };
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/authn/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSending(false);
                toast.success(data.msg || 'Reset email sent!');
                setEmail('');
            } else {
                setSending(false);
                toast.warning(data.msg || 'Check your email.');
            }
        } catch (error) {
            setSending(false);
            console.error("Network error:", error);
            toast.error('Something went wrong - ' + error);
        }
    };

    return (
        <div className="signin-container">
            {sending &&
                <div className='modal signing-in-spinner-case'>
                    <div id="spinner" className="spinner"></div>
                </div>
            }
            <div className="signin-box">
                <div className="icon-circle">
                    <Vote />
                </div>
                <h2>Forgot Password</h2>
                <p className="subtitle">Enter your email to reset your password</p>
                <form onSubmit={handleSubmit}>
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

                    <button type="submit" className="signin-btn primary-btn">Send Reset Email</button>
                </form>
                <div className='redirect flex'>
                    <p className="caption">Remember your password? </p>
                    <Link to='/login' >Sign in</Link>
                </div>
            </div>
        </div>
    );
}