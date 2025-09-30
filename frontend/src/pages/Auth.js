import React from 'react';

export default function Auth({ userType }) {
  const [isLogin, setIsLogin] = React.useState(true);
  const [usePhone, setUsePhone] = React.useState(true);
  const [form, setForm] = React.useState({ loginInput: '', password: '', confirmPassword: '' });
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (isLogin) {
      // Login API call
      const res = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginInput: form.loginInput,
          password: form.password
        })
      });
      const data = await res.json();
      if (data.success) {
        // Save login state for user or admin
        if (userType === 'admin') {
          localStorage.setItem('admin', JSON.stringify(data.user));
          setSuccess('Login successful!');
          window.location.href = '/admin-dashboard';
        } else {
          localStorage.setItem('user', JSON.stringify(data.user));
          setSuccess('Login successful!');
          window.location.href = '/dashboard';
        }

        // this is what shivam changed only addition, nothing updated 
      } else {
        setError(data.error || 'Login failed');
      }
    } else {
      // Register API call
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match!');
        return;
      }
      const res = await fetch('http://127.0.0.1:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginInput: form.loginInput,
          password: form.password,
          confirmPassword: form.confirmPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        // Save user object to localStorage for registration as well
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccess('Registration successful!');
      } else {
        setError(data.error || 'Registration failed');
      }
    }
  };

  return (
    <main className="flex flex-center w-100" style={{ minHeight: '80vh' }}>
      <section className="auth-form card shadow p-3" style={{ maxWidth: '600px', width: '100%' }}>
        <h2 className="heading-info text-center m-2">
          {userType === 'admin' ? '🛡️ Admin Login' : isLogin ? '🔑 Login' : '📝 Sign Up'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-column">
          {/* Toggle Switch for phone/email */}

          <div className="flex flex-row align-items-center m-1" style={{ gap: '0.5rem' }}>
            <label className="switch">
              <input type="checkbox" checked={usePhone} onChange={() => setUsePhone(!usePhone)} />
              <span className="slider"></span>
            </label>
            <span>{usePhone ? 'Login with Phone Number' : 'Login with Email'}</span>
          </div>

          <input
            className="m-1"
            type={usePhone ? 'text' : 'email'}
            name="loginInput"
            placeholder={usePhone ? 'Enter phone number' : 'Enter email'}
            required
            value={form.loginInput}
            onChange={handleChange}
          />

          <label htmlFor="password" className="m-1">Password</label>
          <input
            className="m-1"
            type="password"
            name="password"
            required
            value={form.password}
            onChange={handleChange}
          />

          {!isLogin && (
            <>
              <label htmlFor="confirmPassword" className="m-1">Confirm Password</label>
              <input
                className="m-1"
                type="password"
                name="confirmPassword"
                required
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </>
          )}

          <button type="submit" className="btn m-2">{isLogin ? 'Login' : 'Sign Up'}</button>
        </form>
        {error && <div className="m-1" style={{ color: 'red' }}>{error}</div>}
        {success && <div className="m-1" style={{ color: 'green' }}>{success}</div>}
        <div className="divider"></div>
        <p className="text-center m-1">
          {userType === 'admin' ? null : isLogin ? (
            <>Don't have account? <button className="btn" style={{ padding: '0.2rem 1rem', fontSize: '1rem' }} onClick={() => setIsLogin(false)}>Sign Up</button></>
          ) : (
            <>Already have an account? <button className="btn" style={{ padding: '0.2rem 1rem', fontSize: '1rem' }} onClick={() => setIsLogin(true)}>Log In</button></>
          )}
        </p>
      </section>
    </main>
  );
}
