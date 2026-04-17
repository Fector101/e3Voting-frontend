import React, { useState } from "react";
import { Lock, Vote } from "lucide-react";
import './../assets/css/loginpage.css'
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

export default function ResetPasswordPage() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetting, setResetting] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.warning('Passwords do not match.');
            return;
        }
        setResetting(true);
        const formData = {
            token,
            newPassword,
        };
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/authn/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setResetting(false);
                toast.success(data.msg || 'Password reset successfully!');
                navigate('/login');
            } else {
                setResetting(false);
                toast.warning(data.msg || 'Invalid or expired token.');
            }
        } catch (error) {
            setResetting(false);
            console.error("Network error:", error);
            toast.error('Something went wrong - ' + error);
        }
    };

    return (
        <div className="signin-container">
            {resetting &&
                <div className='modal signing-in-spinner-case'>
                    <div id="spinner" className="spinner"></div>
                </div>
            }
            <div className="signin-box">
                <div className="icon-circle">
                    <Vote />
                </div>
                <h2>Reset Password</h2>
                <p className="subtitle">Enter your new password</p>
                <form onSubmit={handleSubmit}>
                    <label>New Password</label>
                    <div className="input-group">
                        <Lock className="icon" />
                        <input
                            type="password"
                            placeholder="********"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <label>Confirm Password</label>
                    <div className="input-group">
                        <Lock className="icon" />
                        <input
                            type="password"
                            placeholder="********"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="signin-btn primary-btn">Reset Password</button>
                </form>
                <div className='redirect flex'>
                    <p className="caption">Remember your password? </p>
                    <Link to='/login' >Sign in</Link>
                </div>
            </div>
        </div>
    );
}