// Register.js
import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/register', { email, username, password });
      setSuccess('Registration successful! Please login.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {success && <p>{success}</p>}
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;
