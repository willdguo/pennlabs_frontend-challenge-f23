import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface Course {
    dept: string,
    number: number,
    title: string,
    description: string,
    prereqs?: string[]
    "cross-listed"?: string[]
}
  
interface CheckoutProps {
    cart: Array<{
      dept: string,
      number: number,
      title: string,
      description: string,
      prereqs?: string[]
      "cross-listed"?: string[]
    }>;
    setCart: React.Dispatch<React.SetStateAction<
      Array<Course>
    >>;
}
  

const Checkout = (props: CheckoutProps) => {

    const [notif, setNotif] = useState("")
    const navigate = useNavigate()

    const [draggedItem, setDraggedItem] = useState("")
    const courseListRef = useRef<HTMLUListElement | null>(null)

    
    const handleConfirm = () => {
        setNotif("Course Selection Confirmed!")
        setTimeout(() => {
            setNotif("")
        }, 3500)
    }

    const handleDragStart = (event: React.DragEvent<HTMLLIElement>, id: string) => {
        setDraggedItem(id)
        console.log(id)
    }
    
      
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
    

   if(props.cart.length === 0){

    return (
       <div className = "checkout">
            <h1> Checkout </h1>
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

            <h2> Reorder Courses </h2>
            <ul ref = {courseListRef}>
                {props.cart.map((course, index) => (

                <li className = "checkout-course" key = {`${course.dept}-${course.number}`}
                    data-course-id = {`${course.dept}-${course.number}`}
                    draggable = "true"
                    onDragStart={(e) => handleDragStart(e, `${course.dept}-${course.number}`)}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <h3> {`${index + 1}. ${course.dept} ${course.number}: ${course.title}`}</h3>
                    <div className = "checkout-course-desc">
                        {course.prereqs 
                            ? <p> <strong> Prereqs: </strong> {course.prereqs.join(', ')}</p>
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