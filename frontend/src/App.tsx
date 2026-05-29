import './App.css'
import CandleParams from './candleSearch/candleParamsDiv';
import Home from './home/home';
import { Routes, Route } from 'react-router-dom'
import Navbar from './navbar/navbar';

function App() {

  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/search' element={<CandleParams />}/>
      </Routes>
    </>
    
  )
}

export default App
