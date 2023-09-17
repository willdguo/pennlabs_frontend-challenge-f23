import { useEffect, useState } from 'react';
import courses from '../data/courses.json'
import courseService from '../services/getCourse'

interface Course {
  dept: string,
  number: number,
  title: string,
  description: string,
  prereqs?: string[] | string,
  "cross-listed"?: string[]
  "course_quality"?: number,
  "difficulty"?: number,
  "work_required"?: number,
}

interface CartProps {
  cart: Array< {
    dept: string,
    number: number,
    title: string,
    description: string,
    prereqs?: string[] | string,
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
      cross-listed: [String],
      course_quality: number,
      difficulty: number,
      work_required: number
    }
  */

  const [courseList, setCourseList] = useState<Course[]>([...courses])
  const [loading, setLoading] = useState(true)

  const [filtered_courses, setFiltered_courses] = useState<Course[]>([...courses])
  const [notification, setNotification] = useState("")

  /*
    Upon rendering:  
    - Set view to Normal upon reloading the Course View (e.g. after returning from Checkout)
    - Load all course quality/difficulty/work required (takes a bit - to-do: reduce time)
    Dependencies: none --> triggers only 1ce
  */
  useEffect(() => {
    props.setCartView(false)

    courseService.getAll(courses)
      .then(result => {
        console.log(result)
        setCourseList(result)
        setLoading(false) // Courses not found in database will no longer be "Loading"
      })
  }, [])


  // Filters visible courses on changing
  // Dependencies: search, numberFilter --> rerender courses to match relevant requirements
  useEffect(() => {
    // first filters based on cartView; if in cartView, only show cart courses
    let cartFilteredCourses
    if(props.cartView){
      cartFilteredCourses = props.cart
    } else {
      cartFilteredCourses = courseList
    }

    // next, filter by search parameters - title, description, & department
    const searchFilteredCourses = cartFilteredCourses.filter(course => 
      course.title.includes(props.search) 
      || course.description.includes(props.search)
      || course.dept.includes(props.search)
    )

    // finally, filter based on number/course level 
    let numFilteredCourses = searchFilteredCourses

    if(props.numberFilter[0] || props.numberFilter[1] || props.numberFilter[2]){
      numFilteredCourses = searchFilteredCourses.filter(course => 
        (props.numberFilter[0] && course.number < 200)
        || (props.numberFilter[1] && (course.number < 300 && 200 <= course.number))
        || (props.numberFilter[2] && 300 <= course.number)
      )
    }
    setFiltered_courses(numFilteredCourses)
  }, [courseList, props.search, props.numberFilter, props.cartView])

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
      prereqs?: string[] | string
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

  // Creates 4 second notification reminding user to have <=7 items
  // --> reveals notification div (conditionally rendered when notification is nonempty)
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

  // Converts course/difficulty/work rating to corresponding color rating
  // Parameters: val, highGood (whether higher = good) --> returns "high", "mid", or "low"
  const getColor = (val: number, highGood: boolean) => {
    const temp = ["low", "mid", "high"]

    if(val < 2.2){
      return highGood ? temp[0] : temp[2]
    } else if (val < 3.3) {
      return temp[1]
    } else {
      return highGood ? temp[2] : temp[0]
    }
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

        { filtered_courses.length === 0 && props.cartView
        ? <p> Your have no courses selected. Select a few courses to see your cart! </p>
        : filtered_courses.map(course => (

          <div className = "course-item" key={`${course.dept}-${course.number}`}>
            <h3> {`${course.dept} ${course.number}: ${course.title}`} </h3>

            <span className = "course-log"> 
                {course.prereqs 
                  ? <p> 
                      <strong> Prereqs: </strong> 
                      {typeof course.prereqs === 'string' ? course.prereqs : course.prereqs.join(', ')}
                    </p>
                  : null
                }

                {course['cross-listed']
                  ? <p> Cross listed as: {course["cross-listed"].join(', ')} </p>
                  : null
                }
            </span>

            <div className = "course-desc">
              {course.description}
            </div>

            {/* Depending on whether course is in/out of cart, button will change */}
            { in_cart(course.dept, course.number)
            ? 
              <div className = "course-options remove">
                {loading 
                  ? <span> Loading... </span> 
                  : 
                  <>
                    {course.course_quality 
                      ? <span className = {`${getColor(course.course_quality, true)}`}> 
                          Course Quality: {course.course_quality}
                        </span> 
                      : null
                    }
                    {course.difficulty 
                      ? <span className = {`${getColor(course.difficulty, false)}`}> 
                          Difficulty: {course.difficulty}
                        </span> 
                      : null
                    }
                    {course.work_required
                      ? <span className = {`${getColor(course.work_required, false)}`}> 
                          Work Required: {course.work_required}
                        </span> 
                      : null
                    }
                  </>
                }
                
                <button title = "Remove Course" onClick = {() => remove_from_cart(course.dept, course.number)}> 
                  -
                </button>
              </div> 
            : 
              <div className = "course-options add">
                {loading 
                  ? <span> Loading... </span> 
                  : 
                  <>
                    {course.course_quality 
                      ? <span className = {`${getColor(course.course_quality, true)}`}> 
                          Course Quality: {course.course_quality}
                        </span> 
                      : null
                    }
                    {course.difficulty 
                      ? <span className = {`${getColor(course.difficulty, false)}`}> 
                          Difficulty: {course.difficulty}
                        </span> 
                      : null
                    }
                    {course.work_required
                      ? <span className = {`${getColor(course.work_required, false)}`}> 
                          Work Required: {course.work_required}
                        </span> 
                      : null
                    }
                  </>
                }

                <button title = "Add Course" onClick = {() => add_to_cart(course)}> 
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