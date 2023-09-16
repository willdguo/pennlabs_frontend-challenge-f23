import './App.css';
import { useEffect, useState } from 'react';
import Nav from './components/Nav';
import Courses from './components/Courses';
import Cart from './components/Cart';

interface Course {
  dept: string,
  number: Number,
  title: string,
  description: string
}

function App() {

  const [cart, setCart] = useState<Course[]>([])
  const [search, setSearch] = useState("")

  // const [numberFilter, setNumberFilter] = useState([false, false, false]) // FIX THIS

  return (
    <div className = "container">

      <div className = "toolbar">
        <Nav />
      </div>

      <div className = "content">

        <div className = "sidebar">

          <div className = "search">
            <div className = "searchbar">
              <input value = {search} placeholder = "Search" onChange = {(e) => setSearch(e.target.value)}/>
            </div>

            <div className = "filter">
              Course Level
              <p> RA </p>
              <p> RA </p>
              <p> RASPUTIN </p>
              <p> RUSSIA'S GREATEST LOVE MACHINE </p>
              {/* <input type = "checkbox" value = {} onChange = {} /> Intro (100-199) */}
            </div>
          </div>

          <div className = "sidebar-cart-container">
            <Cart cart = {cart}/>
          </div>

        </div>

        <div className = "course-list-container">
          <Courses cart = {cart} setCart = {setCart} search = {search}/>
        </div>

      </div>
    </div>
  );
}

export default App;
