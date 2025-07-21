import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (res.ok) {
      router.push('/');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold">Login</h2>

      {error && <p className="text-red-500">{error}</p>}

      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full px-3 py-2 border rounded"
      />
      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
        className="w-full px-3 py-2 border rounded"
      />

      <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700" type="submit">
        Login
      </button>
    </form>
  );
}
