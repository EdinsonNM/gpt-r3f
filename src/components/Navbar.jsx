import { Button } from "flowbite-react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="absolute top-0 left-0 px-4 py-4 pointer-events-auto">
      <Button.Group>
        <Button as={Link} to="/generator" color="gray pointer-events-auto">
          Ejemplo 1
        </Button>
        <Button as={Link} to="/assistant" color="gray pointer-events-auto">
          Ejemplo 2
        </Button>
      </Button.Group>
    </div>
  );
}

export default Navbar; 