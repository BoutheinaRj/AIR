import React from 'react'
import {Routes, Route, useLocation} from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar.jsx'
import Apropos from './components/Apropos.jsx'
import CnnxRec from './pages/CnnxRec.jsx'
import DashboardRec from './pages/DashboardRec.jsx'
import './index.css';


function App() {
  const location = useLocation()
  const isDashboardPage =
    location.pathname.startsWith('/dashboard-rec') ||
    location.pathname.startsWith('/EspaceRecruteur')

  return (
    <div className={isDashboardPage ? '' : 'px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'}>
    {!isDashboardPage && <Navbar />}
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/a-propos' element={<Apropos/>}/>
      <Route path='/connexion' element={<CnnxRec/>}/>
      <Route path='/cnnx' element={<CnnxRec/>}/>
      <Route path='/connesion' element={<CnnxRec/>}/>
      <Route path='/inscrire' element={<CnnxRec/>}/>
      <Route path='/dashboard-rec' element={<DashboardRec/>}/>
      <Route path='/EspaceRecruteur' element={<DashboardRec/>}/>
      
    </Routes>  
    </div>
  )
}

export default App