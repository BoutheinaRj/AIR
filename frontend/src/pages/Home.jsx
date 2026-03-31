import React from 'react'
import Hero from '../components/Hero'
import Apropos from '../components/Apropos'
import { useLocation } from 'react-router-dom'


function Home() {
  const location = useLocation()

  React.useEffect(() => {
    const hash = String(location.hash || '').replace('#', '').trim()
    if (!hash) return
    const el = document.getElementById(hash)
    if (!el) return
    // Wait a tick for layout to settle (images/fonts).
    const t = setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
    return () => clearTimeout(t)
  }, [location.hash])

  return (
  <div className='w-full'>
    <div className='-mx-4 sm:-mx-[5vw] md:-mx-[7vw] lg:-mx-[9vw]'>
      <Hero />
    </div>
    <div className='-mx-4 sm:-mx-[5vw] md:-mx-[7vw] lg:-mx-[9vw]'>
      <Apropos />
    </div>
  </div>
  )
}

export default Home