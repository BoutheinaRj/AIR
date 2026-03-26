import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const ChooseRole = () => {
  return (
    <section className='relative overflow-hidden min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12'>
      <div
        className='absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: `url(${assets.couverture})` }}
      />
      <div className='absolute inset-0 -z-10 bg-gradient-to-b from-slate-900/60 via-slate-900/45 to-slate-900/65' />

      <div className='w-full max-w-3xl rounded-3xl border border-white bg-white p-8 sm:p-12 text-center shadow-[0_24px_80px_rgba(3,20,49,0.38)] animate-[fadeIn_500ms_ease-out]'>
        <p className='text-sm font-semibold tracking-[0.22em] uppercase text-slate-600'>Bienvenue</p>
        <h1 className='mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900'>Choisissez votre espace</h1>
        <p className='mt-4 text-slate-600 max-w-xl mx-auto'>
          En un clic, accedez a l interface qui vous correspond pour commencer rapidement.
        </p>

        <div className='mt-10 grid gap-4 sm:grid-cols-2'>
          <Link
            to='/cnnx'
            className='group relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800 text-white px-6 py-6 text-left shadow-[0_16px_44px_rgba(30,64,175,0.42)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(30,64,175,0.56)] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
          >
            <span className='pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/15 blur-2xl' />
            <span className='block text-lg font-bold'>Je suis recruteur</span>
            <span className='block mt-1 text-sm font-normal text-blue-100'>Acceder a la connexion recruteur</span>
          </Link>

          <Link
            to='/connecter'
            className='group relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-700 via-sky-700 to-blue-800 text-white px-6 py-6 text-left shadow-[0_16px_44px_rgba(8,145,178,0.42)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(8,145,178,0.56)] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2'
          >
            <span className='pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/15 blur-2xl' />
            <span className='block text-lg font-bold'>Je suis candidat</span>
            <span className='block mt-1 text-sm font-normal text-cyan-100'>Acceder a la connexion candidat</span>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}

export default ChooseRole
