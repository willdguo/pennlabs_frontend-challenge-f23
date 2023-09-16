import { useState } from "react";

interface CartProps {
  cart: Array<{
    dept: string,
    number: Number,
    title: string,
    description: string,
  }>
}

/* styles:

style={{
      border: '1px solid rgba(0, 0, 0, 0.1)',
      padding: '1rem',
      marginBottom: '1.5rem',
      borderRadius: '4px',
    }}

*/

const Cart = (props: CartProps) => {

  return (
    <div className = "sidebar-cart">
      <h2> Course Cart </h2>

      {
        props.cart.length === 0
        ? <p> Your cart is currently empty! </p>
        : 
          <div className = "sidebar-cart-content">
            {props.cart.map(({ dept, number, title, description}) => (
              <div className = "sidebar-cart-course" key={`${dept}-${number}`}>
                <div className = "sidebar-cart-course-title">
                  <strong> {`${dept} ${number}:`} </strong> {`${title}`}
                </div>

                <div className = "sidebar-cart-drag">
                  ≡
                </div>
              </div>
            ))}

            <div className = "sidebar-submit">
              <button> Checkout </button>
            </div>
          </div>
      }

    </div>
  )
}

export default Cart;
