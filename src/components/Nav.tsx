import { useNavigate } from "react-router-dom";
import icon1 from "../icons/cart_icon.png"

interface Course {
  dept: string,
  number: number,
  title: string,
  description: string,
  prereqs?: string[],
  "cross-listed"?: string[]
}

interface NavProps {
  cart: Array<{
    dept: string,
    number: number,
    title: string,
    description: string,
    prereqs?: string[],
    "cross-listed"?: string[]
  }>;
  setCartView: React.Dispatch<React.SetStateAction<boolean>>
}

const Nav = (props: NavProps) => {

  const navigate = useNavigate()

  const handleViewCart = () => {
    navigate('/')
    props.setCartView(true)
  }

  return (
    <div className = "nav">
      <h2 onClick = {() => navigate('/')}>Penn Course Cart</h2>

      <div className = "cart">
        <img src = {icon1} alt = "View Cart" onClick = {handleViewCart} />
        {props.cart.length > 0 ? props.cart.length : null}
      </div>

    </div>
  )
}

export default Nav;