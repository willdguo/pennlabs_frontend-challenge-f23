import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courseService from '../services/getCourse'

interface Course {
    dept: string,
    number: number,
    title: string,
    description: string,
    prereqs?: string[] | string,
    "cross-listed"?: string[],
    "course_quality"?: number,
    "difficulty"?: number,
    "work_required"?: number
}
  
interface CheckoutProps {
    cart: Array<{
      dept: string,
      number: number,
      title: string,
      description: string,
      prereqs?: string[] | string
      "cross-listed"?: string[],
      "course_quality"?: number,
      "difficulty"?: number,
      "work_required"?: number
    }>;
    setCart: React.Dispatch<React.SetStateAction<
      Array<Course>
    >>;
}
  

const Checkout = (props: CheckoutProps) => {

    const [cartList, setCartList] = useState<Course[]>(props.cart)
    const [loading, setLoading] = useState(true)

    const [notif, setNotif] = useState("")
    const navigate = useNavigate()
    const location = useLocation()

    const [draggedItem, setDraggedItem] = useState("")
    const courseListRef = useRef<HTMLUListElement | null>(null)

    // Upon first render, a) gets cart courses from URL, b) gets course quality/API data
    useEffect(() => {
        // If cart is empty, will redirect to '/'
        // To be expanded: component uses cart array from input parameter CheckoutProps
        const queryParams = (new URLSearchParams(location.search)).get('cart')

        const queryCart = queryParams ? queryParams.split(';') : []

        // checks if cart is empty & adjusts accordingly
        if(queryCart.length > 0 && props.cart.length === 0) {
          navigate('/checkout?cart=')
        }

        console.log(queryCart)

        // Retrieves all data for courses in props.cart
        courseService.getAll(props.cart)
        .then(result => {
          console.log(result)
          setCartList(result)
          setLoading(false) // Cart courses not found in database will no longer be "Loading"
        })
    }, [])

    
    const handleConfirm = () => {
        setNotif("Course Selection Confirmed!")
        setTimeout(() => {
            setNotif("")
        }, 3500)
    }

    // Initiates dragging & reordering process
    // Parameters: onDragStart event + course item id --> stores the currently dragged item's id 
    const handleDragStart = (event: React.DragEvent<HTMLLIElement>, id: string) => {
        setDraggedItem(id)
        console.log(id)
    }
    
    /* Reorders list items as they are dragged over.
        event: onDragOver (for <li>)
        draggedItemIndex: index in [carts] of the dragged item's id
        targetItem = <li> that the mouse is (closest to) hovering over
        courseListElement = bounding <ul> to help users scroll within the <ul> while dragging
    */
    const handleDragOver = (event: React.DragEvent<HTMLLIElement>) => {
    
        event.preventDefault()
    
        const courseListElement = courseListRef.current;
    
        if(courseListElement){
          const courseListRect = courseListElement.getBoundingClientRect();
          const mouseY = event.clientY;
    
          if (mouseY < courseListRect.top + 60) {
            courseListElement.scrollTop -= 10; // Scroll up
          } else if (mouseY > courseListRect.bottom - 60) {
            courseListElement.scrollTop += 10; // Scroll down
          }
        
          const draggedItemIndex = props.cart.findIndex(course => 
            `${course.dept}-${course.number}` === draggedItem
          )
          
          const targetItem = (event.target as HTMLElement)?.closest("li")
    
          if(targetItem){
            const targetItemId = targetItem.getAttribute("data-course-id")
            const targetItemIndex = props.cart.findIndex(course => 
              `${course.dept}-${course.number}` === targetItemId
            )
            
            const targetRect = targetItem.getBoundingClientRect()
            const targetOffset = targetRect.y + targetRect.height / 2
            
            const moveUp = draggedItemIndex > targetItemIndex && event.clientY < targetOffset
            const moveDown = draggedItemIndex < targetItemIndex && event.clientY > targetOffset
            
            // console.log(draggedItemIndex, targetItemIndex)
    
            if (moveUp || moveDown) {
              let updatedCart = [...props.cart]
              const [draggedItem] = updatedCart.splice(draggedItemIndex, 1)
              updatedCart.splice(targetItemIndex, 0, draggedItem)
              props.setCart(updatedCart)
            }
          }
        }
      }
      
    const handleDrop = (event: React.DragEvent<HTMLLIElement>) => {
        event.preventDefault()
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

   if(props.cart.length === 0){

    return (
       <div className = "checkout">
            <h1> Checkout </h1>
            <button className = "exit" onClick = {() => navigate('/')}> Back to courses </button>
            <p> Your cart is currently empty. </p>
       </div>
    )

   } else {

    return (
        <div className = "checkout">
            { notif === ""
            ? null
            : 
                <div className = "notification">
                    {notif}
                </div>
            }

            <h1> Checkout </h1>

            <button className = "exit" onClick = {() => navigate('/')}> Back to courses </button>

            <h2> Order Courses by Preference </h2>
            <ul ref = {courseListRef}>
                {cartList.map((course, index) => (

                <li className = "checkout-course" key = {`${course.dept}-${course.number}`}
                    data-course-id = {`${course.dept}-${course.number}`}
                    draggable = "true"
                    onDragStart={(e) => handleDragStart(e, `${course.dept}-${course.number}`)}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                  
                    <h3> 
                      {`${index + 1}. ${course.dept} ${course.number}: ${course.title}`}
                    </h3>
                    
                    <div className = "checkout-course-data">
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
                    </div>

                    <div className = "checkout-course-desc">
                        {course.prereqs 
                            ? 
                            <p> 
                              <strong> Prereqs: </strong> 
                              {typeof course.prereqs === 'string' ? course.prereqs : course.prereqs.join(', ')}
                            </p>
                            : null
                            }

                            {course['cross-listed']
                            ? <p> Cross listed as: {course["cross-listed"].join(', ')} </p>
                            : null
                            }
                        <p> {course.description} </p>
                    </div>
                </li>

                ))}
            </ul>

            <button className = "confirm" onClick = {handleConfirm}> Confirm Course Selection </button>

        </div>  
    )
   }
}

export default Checkout