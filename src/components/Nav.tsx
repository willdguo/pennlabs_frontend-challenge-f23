import { useNavigate } from "react-router-dom";
import icon1 from "../icons/cart_icon.png"


interface NavProps {
  cart: Array<{
    id: string,
    title: string,
    description: string,
    prereqs?: string[] | string,
    "cross-listed"?: string[]
  }>;
}

const Nav = (props: NavProps) => {

  const navigate = useNavigate()

  // Converts cart to an appropriate URL query
  // Returns string of cart course IDs ('[dept]-[number]') joined by ';'
  const cartToQuery = () => {
    const output = (props.cart.map(course => course.id)).join('+')
    console.log(output)
    return output
  }

  return (
    <div className = "nav">
      <h2 onClick = {() => navigate('/')}>Penn Course Cart</h2>

      <div className = "cart">
        <img src = {icon1} alt = "Checkout" title = "Checkout" 
          onClick = {() => navigate(`/checkout?cart=${cartToQuery()}`)} />
        {props.cart.length > 0 ? props.cart.length : null}
      </div>

    </div>
  )
}

export default Nav;