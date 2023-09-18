import { useEffect, useState } from 'react';
import jsonData from '../data/courses.json'
import courseService from '../services/getCourse'

interface Course {
  id: string,
  title: string,
  description: string,
  prereqs?: string[] | string,
  "cross-listed"?: string[]
  "course_quality"?: number,
  "difficulty"?: number,
  "work_required"?: number,
  unavailable?: boolean,
}

interface CourseJSON {
  dept: string,
  number: number,
  title: string,
  description: string,
  prereqs?: string[] | string,
  "cross-listed"?: string[]
}

interface CartProps {
  cart: Array< {
    id: string,
    title: string,
    description: string,
    prereqs?: string[] | string,
    "cross-listed"?: string[],
    "course_quality"?: number,
    "difficulty"?: number,
    "work_required"?: number,
    unavailable?: boolean
  }>;
  setCart: React.Dispatch<React.SetStateAction<
    Array<Course>
  >>;
  search: string;
  numberFilter: Array<boolean>;
  cartView: boolean;
  setCartView: React.Dispatch<React.SetStateAction<boolean>>;
  sortVal: number;
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

  const [courseList, setCourseList] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  const [filtered_courses, setFiltered_courses] = useState<Course[]>([])
  const [notification, setNotification] = useState("")

  /*
    Upon first render:  
    - Set view to Normal upon reloading the Course View (e.g. after returning from Checkout)
    - Load all course quality/difficulty/work required (takes a bit on penn slowass wifi - to-do: reduce time)
    - Merges API data with JSON data
    Dependencies: none --> triggers only 1ce
  */
  useEffect(() => {
    // Checks if CourseJSON element is in the standardized courseList
    const in_courseList = (course: CourseJSON, currList: Course[]) => {
      const temp = currList.filter(cart_course => 
        cart_course.id === `${course.dept}-${course.number}`
      )
      return temp.length === 1
    }

    // Merges API data with JSON data
    // Parameters: currList (API data) --> returns API data with prereqs, cross-listing, + unlisted courses from the JSON
    const mergeJsonData = (currList: Course[]) => {
      jsonData.forEach((course: CourseJSON) => {
        if(in_courseList(course, currList)){ // If already in courseList, add prereqs + crossref
          const temp = currList.map(c => 
              `${course.dept}-${course.number}` === c.id 
              ? {...c, prereqs: course.prereqs, 'cross-listed': course['cross-listed']}
              : c
          )
          currList = temp
        } else { // Otherwise, add it to the list raw + mark it as "unavailable"
          currList = currList.concat({...course, id: `${course.dept}-${course.number}`, unavailable: true})
        }
      })

      return currList
    }

    props.setCartView(false)

    courseService.getAll()
      .then(result => {
        let temp = result.filter((course: Course) => course.title)
        console.log("Loading complete!")
        console.log(temp)
        temp = mergeJsonData(temp)
        temp = sortCourses(temp, 0)
        setCourseList(temp)
        setLoading(false)
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

    // once (potentially) filtered, sort remaining courses based on sortVal
    cartFilteredCourses = sortCourses(cartFilteredCourses, props.sortVal)

    // next, filter by search parameters - title, description, & id
    const searchFilteredCourses = cartFilteredCourses.filter(course => 
      course.title.includes(props.search) 
      || course.description.includes(props.search)
      || course.id.includes(props.search)
    )

    // finally, filter based on number/course level 
    let numFilteredCourses = searchFilteredCourses

    if(props.numberFilter[0] || props.numberFilter[1] || props.numberFilter[2]){
      numFilteredCourses = searchFilteredCourses.filter(course => 
        (props.numberFilter[0] && getNumber(course) < 200)
        || (props.numberFilter[1] && (getNumber(course) < 300 && 200 <= getNumber(course)))
        || (props.numberFilter[2] && 300 <= getNumber(course))
      )
    }
    setFiltered_courses(numFilteredCourses)
  }, [courseList, props.search, props.numberFilter, props.cartView, props.sortVal])

  // Retrieve course number from course
  // Return: course number : number
  const getNumber = (course: Course) => {
    const temp = course.id.split('-')
    return Number(temp[1])
  }

  // Sorts courses based on desired parameter (0 = course, 1 = quality, 2 = difficulty, 3 = work)
  const sortCourses = (courses: Course[], sortVal: number) => {
    const sortedCourses = courses.sort((c1, c2) => {
      if(sortVal === 0){
        const num1 = getNumber(c1)
        const num2 = getNumber(c2)
        return num1 - num2
      } else if(sortVal === 1){
        const num1 = c1.course_quality || 0
        const num2 = c2.course_quality || 0
        return num2 - num1
      } else if (sortVal === 2){
         const num1 = c1.difficulty || 5
         const num2 = c2.difficulty || 5
         return num1 - num2
      } else {
        const num1 = c1.work_required || 5
        const num2 = c2.work_required || 5
        return num1 - num2
      }
    })
    return sortedCourses
  }

  // Check if course is in cart
  // Don't overuse - inefficient runtime
  const in_cart = (id: string) => {
    const temp = props.cart.filter(cart_course => 
        cart_course.id === id
      )
    return temp.length === 1
  }

  const add_to_cart = (course: 
    { id: string, 
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

  const remove_from_cart = (id: string) => {
    const temp = props.cart.filter(cart_course => 
      cart_course.id !== id
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
        {loading
        ? <p> Loading...</p>
        : null
        }

        { filtered_courses.length === 0 && props.cartView && !loading
        ? <p> Your have no courses selected. Select a few courses to see your cart! </p>
        : filtered_courses.map(course => (

          <div className = "course-item" key={course.id}>
            <h3> {course.id}: {course.title} </h3>

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
            { in_cart(course.id)
            ? 
              <div className = "course-options remove">
                {course.unavailable
                  ? <span className = "unavailable"> Not available this semester </span>
                  : null
                }
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
                <button title = "Remove Course" onClick = {() => remove_from_cart(course.id)}> 
                  -
                </button>
              </div> 
            : 
              <div className = "course-options add">
                {course.unavailable
                  ? <span className = "unavailable"> Not available this semester </span>
                  : null
                }
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