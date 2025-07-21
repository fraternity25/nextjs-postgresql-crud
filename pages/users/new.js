import UserForm from '@/components/UserForm';

export default function NewUser() {
  const handleSubmit = async (userData) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create user');
    }

    return response.json();
  };

  return <UserForm onSubmit={handleSubmit} />;
}