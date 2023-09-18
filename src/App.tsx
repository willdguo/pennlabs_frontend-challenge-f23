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
  const [sortVal, setSortVal] = useState(0)

  const [numberFilter, setNumberFilter] = useState([false, false, false])

  // Flips filter for index'th filter (hardcoded for simplicity - can be made cscalable for >3 inputs)
  const flip_filter = (index: number) => {
    if(index === 0){
      setNumberFilter([!numberFilter[0], numberFilter[1], numberFilter[2]])
    } else if (index === 1){
      setNumberFilter([numberFilter[0], !numberFilter[1], numberFilter[2]])
    } else {
      setNumberFilter([numberFilter[0], numberFilter[1], !numberFilter[2]])
    }
  }

  // Changes sortVal based on input. If already selected (e.g. if sortVal = val), then will unselect
  // Parameters: val (0 = number, 1 = quality, 2 = difficulty, 3 = work) --> changes sortVal accordingly
  const handleSortVal = (val: number) => {
    if(val === sortVal){
      setSortVal(0)
    } else {
      setSortVal(val)
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

          <div className = "sort">
            <h3> Sort By </h3>
            <button className = {sortVal === 0 ? "selected" : ""} onClick = {() => handleSortVal(0)}> Course Number </button>
            <button className = {sortVal === 1 ? "selected" : ""} onClick = {() => handleSortVal(1)}> Course Quality </button>
            <button className = {sortVal === 2 ? "selected" : ""} onClick = {() => handleSortVal(2)}> Difficulty </button>
            <button className = {sortVal === 3 ? "selected" : ""} onClick = {() => handleSortVal(3)}> Work Required </button>
          </div>

          <div className = "sidebar-cart-container">
            <Cart cart = {cart} setCart = {setCart}/>
          </div>

        </div>

        <div className = "course-list-container">
          <Courses cart = {cart} setCart = {setCart} search = {search} 
            numberFilter = {numberFilter} cartView = {cartView} setCartView = {setCartView} sortVal = {sortVal}/>
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
