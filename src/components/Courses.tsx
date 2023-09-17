import { useEffect, useState } from 'react';
import courses from '../data/courses.json'

interface Course {
  dept: string,
  number: number,
  title: string,
  description: string,
  prereqs?: string[],
  "cross-listed"?: string[]
}

interface CartProps {
  cart: Array< {
    dept: string,
    number: number,
    title: string,
    description: string,
    prereqs?: string[],
    "cross-listed"?: string[]
  }>;
  setCart: React.Dispatch<React.SetStateAction<
    Array<Course>
  >>;
  search: string;
  numberFilter: Array<boolean>;
  cartView: boolean;
  setCartView: React.Dispatch<React.SetStateAction<boolean>>;
}

const Courses = (props: CartProps) => {
  /*
    COURSE SCHEMA:
    let course = {
      dept: String,
      number: Number,
      title: String,
      description: String,
      prereqs: [String],
      cross-listed: [String]
    }
  */

  const [filtered_courses, setFiltered_courses] = useState<Course[]>([...courses])
  const [notification, setNotification] = useState("")

  // Set view to Normal upon reloading the Course View (e.g. after returning from Checkout)
  // Dependencies: none --> triggers only 1ce
  useEffect(() => {

  }, []) 

  // Filters visible courses on changing
  // Dependencies: search, numberFilter --> rerender courses to match relevant requirements
  useEffect(() => {
    let cartFilteredCourses
    if(props.cartView){
      cartFilteredCourses = props.cart
    } else {
      cartFilteredCourses = courses
    }

    const searchFilteredCourses = cartFilteredCourses.filter(course => 
      course.title.includes(props.search) 
      || course.description.includes(props.search)
      || course.dept.includes(props.search)
    )

    let numFilteredCourses = searchFilteredCourses

    if(props.numberFilter[0] || props.numberFilter[1] || props.numberFilter[2]){
      numFilteredCourses = searchFilteredCourses.filter(course => 
        (props.numberFilter[0] && course.number < 200)
        || (props.numberFilter[1] && (course.number < 300 && 200 <= course.number))
        || (props.numberFilter[2] && 300 <= course.number)
      )
    }
    setFiltered_courses(numFilteredCourses)
  }, [props.search, props.numberFilter, props.cartView])

  const in_cart = (dept: string, number: Number) => {

    const temp = props.cart.filter(cart_course => 
        cart_course.dept === dept && cart_course.number === number
      )
    return temp.length === 1
  }

  const add_to_cart = (course: 
    { dept: string, 
      number: number, 
      title: string, 
      description: string,
      prereqs?: string[]
      "cross-listed"?: string[]
    }) => {

    if(props.cart.length === 7){
      limit_notification()
    } else {
      props.setCart([...props.cart, course])
    }
  }

  const remove_from_cart = (dept: string, number: Number) => {

    const temp = props.cart.filter(cart_course => 
      cart_course.number !== number || cart_course.dept !== dept
    )

    props.setCart(temp)
    console.log(temp)
  }

  const limit_notification = () => {
    setNotification("Cart limit exceeded")
    setTimeout(() => {
      setNotification("")
    }, 4000)
  }

  // Toggles cart view via cartView state
  const handleViewCart = () => {
    props.setCartView(!props.cartView)
  }

  return (
    <div className = "course-list-content">
      { notification === ""
      ? null
      :
        <div className = "notification">
          {notification}
        </div>
      }

      <div className = "course-list-header">
        <h1 onClick={() => console.log(props.cart)}> Courses </h1>
        <p> Select your courses! </p>
        <button onClick = {handleViewCart}> 
          {props.cartView
          ? <> View Courses </>
          : <> View Cart </>
          }
        </button>
      </div>

      <div className = "course-list">

        { filtered_courses.length === 0
        ? <p> Your have no courses selected. Select a few courses to see your cart! </p>
        : filtered_courses.map(course => (

          <div className = "course-item" key={`${course.dept}-${course.number}`}>
            <h3> {`${course.dept} ${course.number}: ${course.title}`} </h3>

            <div className = "course-desc">
              <span className = "course-log"> 
                {course.prereqs 
                ? <p> <strong> Prereqs: </strong> {course.prereqs.join(', ')}</p>
                : null
                }

                {course['cross-listed']
                ? <p> Cross listed as: {course["cross-listed"].join(', ')} </p>
                : null
                }
              </span>

              {course.description}
            </div>


            { in_cart(course.dept, course.number)
            ? 
              <div className = "course-option remove">
                <button title = "Remove Course" onClick = {() => remove_from_cart(course.dept, course.number)}> 
                  -
                </button>
              </div> 
            : 
              <div className = "course-option add">
                <button onClick = {() => add_to_cart(course)}> 
                  +
                </button>
              </div>             
            }
            
          </div>

        ))}

      </div>

    </div>
  )
}

export default Courses;