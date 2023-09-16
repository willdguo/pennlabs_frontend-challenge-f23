import { useEffect, useState } from 'react';
import courses from '../data/courses.json'

interface Course {
  dept: string,
  number: Number,
  title: string,
  description: string
}

interface CartProps {
  cart: Array< {
    dept: string,
    number: Number,
    title: string,
    description: string,
  }>;
  setCart: React.Dispatch<React.SetStateAction<
    Array<Course>
  >>;
  search: string;
}

const Courses = (props: CartProps) => {
  /*
    COURSE SCHEMA:
    let course = {
      dept: String,
      number: Number,
      title: String,
      description: String,
    }
  */

  const [filtered_courses, setFiltered_courses] = useState<Course[]>([...courses])
  const [notification, setNotification] = useState("")

  useEffect(() => {
    setFiltered_courses(courses.filter(course => 
      course.title.includes(props.search) 
      || course.description.includes(props.search)
      || course.dept.includes(props.search)
    ))
  }, [props.search])

  const in_cart = (course: {dept: string, 
    number: Number, 
    title: string, 
    description: string}) => {

    const temp = props.cart.filter(cart_course => 
        cart_course.dept === course.dept && cart_course.number === course.number
      )
    return temp.length === 1
  }

  const add_to_cart = (course: {dept: string, 
    number: Number, 
    title: string, 
    description: string}) => {

    if(props.cart.length === 7){
      limit_notification()
    } else {
      props.setCart([...props.cart, course])
    }
  }

  const remove_from_cart = (course: {dept: string,
    number: Number,
    title: string,
    description: string}) => {

    const temp = props.cart.filter(cart_course => 
      cart_course.number !== course.number || cart_course.dept !== course.dept
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
      </div>

      <div className = "course-list">

        {filtered_courses.map(({ dept, number, title, description}) => (

          <div className = "course-item" key={`${dept}-${number}`}>
            <h3> {`${dept} ${number}: ${title}`}</h3>
            <p className = "course-desc">
              {description}
            </p>


            { in_cart({dept, number, title, description})
            ? 
              <div className = "course-option remove">
                <button title = "Remove Course" onClick = {() => remove_from_cart({ dept, number, title, description})}> 
                  -
                </button>
              </div> 
            : 
              <div className = "course-option add">
                <button onClick = {() => add_to_cart({ dept, number, title, description})}> 
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