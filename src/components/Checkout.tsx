import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courseService from '../services/getCourse'
import icon1 from '../icons/checkmark.png'

interface Course {
    id: string,
    title: string,
    description: string,
    prereqs?: string[] | string,
    "cross-listed"?: string[],
    "course_quality"?: number,
    "difficulty"?: number,
    "work_required"?: number,
    unavailable?: boolean
}
  
interface CheckoutProps {
    cart: Array<{
      id: string,
      title: string,
      description: string,
      prereqs?: string[] | string
      "cross-listed"?: string[],
      "course_quality"?: number,
      "difficulty"?: number,
      "work_required"?: number,
      unavailable?: boolean
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

    // Upon first render, a) gets cart courses from URL, b) gets course quality/etc. API data
    useEffect(() => {
        // If cart is empty, will redirect to '/'
        // To be expanded: component uses cart array from input parameter CheckoutProps
        const queryParams = (new URLSearchParams(location.search)).get('cart')

        const queryCart = queryParams ? queryParams.split('+') : []

        // checks if cart is empty & adjusts accordingly
        if(queryCart.length > 0 && props.cart.length === 0) {
          navigate('/checkout?cart=')
        }

        // console.log(queryCart)

        // Retrieves all data for courses in props.cart
      courseService.getListData(props.cart)
        .then(result => {
          console.log(result)
          setCartList(result)
          setLoading(false) // Cart courses not found in database will no longer be "Loading"
        })
      }, [])


    // Checks if all courses in cart are available in the target semester
    const checkCartValidity = () => {
      let output = true
      cartList.forEach(course => {
        if(course.unavailable){ // no course quality report = course unavailable
          return false
        }
      })
      return true
    }
    
    const handleConfirm = () => {

      if(checkCartValidity()){
        setNotif("Course Selection Confirmed!")
        setTimeout(() => {
            setNotif("")
        }, 3500)
      } else {
        const response = window.confirm("One or more of the courses in your cart is unavailable "
        + "this semester. Are you sure you'd like to proceed?")

        if(response){
          setTimeout(() => {
            setNotif("Course Selection Confirmed!")
          }, 500)
          setTimeout(() => {
              setNotif("")
          }, 3500)
        }
      }

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
            course.id === draggedItem
          )
          
          const targetItem = (event.target as HTMLElement)?.closest("li")
    
          if(targetItem){
            const targetItemId = targetItem.getAttribute("data-course-id")
            const targetItemIndex = props.cart.findIndex(course => 
              course.id === targetItemId
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
              setCartList(updatedCart)
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

      if (val === 0) {
        return ""
      }
      else if(val < 2.2){
        return highGood ? temp[0] : temp[2]
      } else if (val < 3.3) {
        return temp[1]
      } else {
        return highGood ? temp[2] : temp[0]
      }
    }

    // Returns cart average for 0 = Course Quality, 1 = Difficulty, 2 = Work Required
    const getAverage = (index: number) => {
      if(index === 0){
        let total = 0
        let count = 0
        cartList.forEach(course => {
          if(course.course_quality){
            total += Number(course.course_quality)
            count += 1
          }
        })

        if(count === 0){
          return 0
        } else {
          return Number((total/count).toFixed(2))
        }
      } else if(index === 1){
        let total = 0
        let count = 0
        cartList.forEach(course => {
          if(course.difficulty){
            total += Number(course.difficulty)
            count += 1
          }
        })

        if(count === 0){
          return 0
        } else {
          return Number((total/count).toFixed(2))
        }
      } else {
        let total = 0
        let count = 0
        cartList.forEach(course => {
          if(course.work_required){
            total += Number(course.work_required)
            count += 1
          }
        })

        if(count === 0){
          return 0
        } else {
          return Number((total/count).toFixed(2))
        }
      }
      
    }

   // Renders differently depending on whether cart is empty
   // If cart is empty, will return <p> telling user their cart is empty
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
                    <img src = {icon1} alt = "Confirmed!" />
                    <span> {notif} </span>
                </div>
            }

            <h1> Checkout </h1>

            <button className = "exit" onClick = {() => navigate('/')}> Back to courses </button>

            <div className = "avg">
              <span className = {`${getColor(getAverage(0), true)}`}> Average Course Quality: {getAverage(0)} </span>
              <span className = {`${getColor(getAverage(1), false)}`}> Average Difficulty: {getAverage(1)} </span>
              <span className = {`${getColor(getAverage(2), false)}`}> Average Work Required: {getAverage(2)} </span>
            </div>

            <h2> Order Courses by Preference </h2>
            <ul ref = {courseListRef}>
                {cartList.map((course, index) => (

                <li className = "checkout-course" key = {course.id}
                    data-course-id = {course.id}
                    draggable = "true"
                    onDragStart={(e) => handleDragStart(e, course.id)}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                  
                    <h3> 
                      {index + 1}. {course.id}: {course.title}
                    </h3>
                    
                    <div className = "checkout-course-data">
                      {loading 
                        ? <span> Loading... </span> 
                        : 
                        <>
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