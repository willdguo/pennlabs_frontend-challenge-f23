import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import icon1 from "../icons/updown_icon.png"
import icon2 from "../icons/trashcan.png"

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

interface CartProps {
  cart: Array<{
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
}

const Cart = (props: CartProps) => {

  const [draggedItem, setDraggedItem] = useState("")
  const courseListRef = useRef<HTMLUListElement | null>(null)
  
  const navigate = useNavigate()
  
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

      if (mouseY < courseListRect.top + 20) {
        courseListElement.scrollTop -= 10; // Scroll up
      } else if (mouseY > courseListRect.bottom - 20) {
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
          props.setCart(updatedCart)
        }
      }
    }
  }
  
  const handleDrop = (event: React.DragEvent<HTMLLIElement>) => {
    event.preventDefault()
  }

  // Converts cart to an appropriate URL query
  // Returns string of cart course IDs ('[dept]-[number]') joined by ';'
  const cartToQuery = () => {
    const output = (props.cart.map(course => course.id)).join('+')
    console.log(output)
    return output
  }

  const handleCheckout = () => {
    navigate(`/checkout?cart=${cartToQuery()}`)
  }

  const remove_from_cart = (id: string) => {

    const temp = props.cart.filter(cart_course => 
      cart_course.id !== id
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
              {props.cart.map(({ id, title}) => (

                <li className = "sidebar-cart-course" key={id}
                  data-course-id = {id}
                  draggable = "true"
                  onDragStart = {(e) => handleDragStart(e, id)}
                  onDragOver = {(e) => handleDragOver(e)}
                  onDrop = {(e) => handleDrop(e)}
                >
                  <div className = "sidebar-cart-course-title">
                    <strong> {id}: </strong> {`${title}`}
                  </div>

                  <div className = "sidebar-cart-options">
                      <img draggable = "false" src = {icon1} alt = "Move item up and down" />
                      <img className = "delete" draggable = "false" src = {icon2} 
                        alt = "Delete Item" onClick = {() => remove_from_cart(id)}
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
