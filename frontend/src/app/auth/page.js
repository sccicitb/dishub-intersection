'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi } from '../../lib/apiService';
import { useAuth } from '../context/authContext';

export default function Auth () {
  const router = useRouter();
  const { loading, setLoading, setUserId, login, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fakeToken = "mocked.jwt.token"
  useEffect(() => {
    const storedToken = Cookies.get('token');
    if (storedToken) {
      router.push('/');
    }
  }, []);

  // test login fetch api login to dashboard
  const handleSubmitAPI = async (e) => {
    e.preventDefault();
    if (
      username === 'viana@dishub.jogjaprov.go.id' &&
      password === 'password'
    ) {
      login(fakeToken)
      router.push('/');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await authApi.login({ email: username, password });
      const { token, user } = response.data.data;
      login(token, user)
      router.push("/");
    } catch (error) {
      setErrorMessage("Invalid username or password");
    }
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* Background image using next/image */}
      <Image
        src="/image/bg-Login-viana.png"
        alt="Background"
        fill
        className="object-cover -z-10"
        priority
      />

      <div className="flex min-h-screen items-center justify-center relative">
        {/* Blur effect behind the form */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[400px] h-[400px] bg-red-900 blur-3xl opacity-50 rounded-full"></div>
        </div>

        <form
          onSubmit={handleSubmitAPI}
          className="p-6 bg-white/90 shadow-md backdrop-blur-2xl rounded-2xl w-96 gap-2 flex flex-col pt-5 pb-5 z-10"
        >
          <div className="text-left gap-2 flex flex-col">
              {/* <h4 className="text-[20px] tracking-wide font-semibold text-left">Selamat Datang</h4> */}
            <div className="flex gap-5 items-center w-full justify-center">
              <Image
                src="/image/dishub-jogja-logo.png"
                alt="Logo Viana"
                width={50}
                height={50}
                className={`transition-opacity py-5 drop-shadow-2xl duration-500 ${loaded ? 'opacity-100' : 'opacity-0'
                  }`}
                onLoadingComplete={() => setLoaded(true)}
              />
              <div className='w-full'>
                <h3 className="text-[16px] tracking-wide text-wrap font-bold">Viana Smart Mobility<br /><span className='font-normal'>Dinas Perhubungan Provinsi Daerah Istimewa Yogyakarta</span></h3>
              </div>
            </div>
          </div>

          <fieldset className="fieldset">
            <legend className="fieldset-legend text-left">Username</legend>
            <input
              className="input w-full rounded-2xl bg-white/10 backdrop-blur-md placeholder-gray-300"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend text-left">Password</legend>
            <input
              className="input w-full rounded-2xl bg-white/10 backdrop-blur-md placeholder-gray-300"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </fieldset>

          <button
            type="submit"
            className="btn bg-neutral-800 text-white py-2 rounded-2xl border-none shadow-none mt-5"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>

          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        </form>
      </div >
    </div >
  );
}
