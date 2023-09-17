import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import icon1 from "../icons/updown_icon.png"
import icon2 from "../icons/trashcan.png"

interface Course {
  dept: string,
  number: number,
  title: string,
  description: string,
  prereqs?: string[],
  "cross-listed"?: string[]
}

interface CartProps {
  cart: Array<{
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
}

const Cart = (props: CartProps) => {

  const [draggedItem, setDraggedItem] = useState("")
  const courseListRef = useRef<HTMLUListElement | null>(null)
  
  const navigate = useNavigate()
  
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

      if (mouseY < courseListRect.top + 20) {
        courseListElement.scrollTop -= 10; // Scroll up
      } else if (mouseY > courseListRect.bottom - 20) {
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

  const handleCheckout = () => {
    navigate('/checkout')
  }

  const remove_from_cart = (dept: string, number: number) => {

    const temp = props.cart.filter(cart_course => 
      cart_course.number !== number || cart_course.dept !== dept
    )

    props.setCart(temp)
    console.log(temp)
  }

  const handleClearCart = () => {
    props.setCart([])
  }

  return (
    <div className = "sidebar-cart">
      <h2> Course Cart </h2>
      <button className = "clear" onClick = {handleClearCart}> Clear Cart </button>

      {
        props.cart.length === 0
        ? <p> Your cart is currently empty! </p>
        : 
          <div className = "sidebar-cart-content">
            <ul ref = {courseListRef}>
              {props.cart.map(({ dept, number, title}) => (

                <li className = "sidebar-cart-course" key={`${dept}-${number}`}
                  data-course-id = {`${dept}-${number}`}
                  draggable = "true"
                  onDragStart = {(e) => handleDragStart(e, `${dept}-${number}`)}
                  onDragOver = {(e) => handleDragOver(e)}
                  onDrop = {(e) => handleDrop(e)}
                >
                  <div className = "sidebar-cart-course-title">
                    <strong> {`${dept} ${number}:`} </strong> {`${title}`}
                  </div>

                  <div className = "sidebar-cart-options">
                      <img draggable = "false" src = {icon1} alt = "Move item up and down" />
                      <img className = "delete" draggable = "false" src = {icon2} 
                        alt = "Delete Item" onClick = {() => remove_from_cart(dept, number)}
                      />
                  </div>
                </li>

              ))}
            </ul>

            <div className = "sidebar-submit">
              <button onClick = {handleCheckout}> Checkout </button>
            </div>
          </div>
      }

    </div>
  )
}

export default Cart;
