import './App.css'
import { useState } from 'react'
import Nav from './components/Nav'
import Courses from './components/Courses'
import Cart from './components/Cart'
import Checkout from './components/Checkout'
import { Routes, Route, Navigate } from 'react-router-dom'


interface Course {
  id: string,
  title: string,
  description: string,
  prereqs?: string[] | string,
  "cross-listed"?: string[],
  "course_quality"?: number,
  "difficulty"?: number,
  "work_required"?: number,
  unavailable?: boolean,
}

function App() {

  const [cart, setCart] = useState<Course[]>([])
  const [search, setSearch] = useState("")
  const [cartView, setCartView] = useState(false)

  const [numberFilter, setNumberFilter] = useState([false, false, false])

  const flip_filter = (index: number) => {
    if(index === 0){
      setNumberFilter([!numberFilter[0], numberFilter[1], numberFilter[2]])
    } else if (index === 1){
      setNumberFilter([numberFilter[0], !numberFilter[1], numberFilter[2]])
    } else {
      setNumberFilter([numberFilter[0], numberFilter[1], !numberFilter[2]])
    }
  }

  // Main content of Penn Course Cart; conditionally rendered depending on route
  const main = () => (
    <div className = "content">
        <div className = "sidebar">

          <div className = "search">
            <div className = "searchbar">
              <input value = {search} 
                placeholder = "Search" 
                onChange = {(e) => setSearch(e.target.value)}
              />
            </div>

            <div className = "filter">
              <h3> Course Level </h3>
              <ul>
                <li onClick = {() => flip_filter(0)}>
                  <input 
                    type = "checkbox" 
                    checked = {numberFilter[0]}
                    onChange = {() => flip_filter(0)}
                  /> 
                  Intro (100 - 199)
                </li>
                <li onClick = {() => flip_filter(1)}>
                  <input  
                    type = "checkbox" 
                    checked = {numberFilter[1]} 
                    onChange = {() => flip_filter(1)}
                  /> 
                  Regular (200-299)
                </li>
                <li onClick = {() => flip_filter(2)}>
                  <input 
                    type = "checkbox" 
                    checked = {numberFilter[2]} 
                    onChange = {() => flip_filter(2)}
                  /> 
                  Upper Level (300+)
                </li>
              </ul>
            </div>
          </div>

          <div className = "sidebar-cart-container">
            <Cart cart = {cart} setCart = {setCart}/>
          </div>

        </div>

        <div className = "course-list-container">
          <Courses cart = {cart} setCart = {setCart} search = {search} 
            numberFilter = {numberFilter} cartView = {cartView} setCartView = {setCartView}/>
        </div>
    </div>
  )

  return (
    <div className = "container">

      <div className = "toolbar">
        <Nav cart = {cart} />
      </div>

      <Routes>
        <Route path = "/" element = {main()} />
        <Route path = "/checkout" element = {<Checkout cart = {cart} setCart = {setCart}/>} />
        <Route path = "*" element = {<Navigate to = "/" />} />
      </Routes>

    </div>
  )
}

export default App;
