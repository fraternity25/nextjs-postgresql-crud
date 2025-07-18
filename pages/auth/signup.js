import UserForm from '../../components/UserForm';

export default function SignupPage() {
  const handleSubmit = async (userData) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Signup failed');
    // maybe route to login page here
  };

  return <UserForm onSubmit={handleSubmit} mode="signup" />;
}
