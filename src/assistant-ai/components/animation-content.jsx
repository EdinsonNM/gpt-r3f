import { useRef, useState, useEffect } from "react";
import { useGLTF, useAnimations, Html, OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import PropTypes from "prop-types"; // ES6

function AnimationAIContent({
  action = "Idle",
  message = "",
  movement = "",
  speed = 1,
}) {
  const meshRef = useRef();
  const model = useGLTF("models/animations.glb");
  const { actions } = useAnimations(model.animations, meshRef);

  const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });
  const [maxRotation, setMaxRotation] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [direction, setDirection] = useState(0);
  useEffect(() => {
    const newVelocity = { x: 0, y: 0, z: 0 };

    switch (movement) {
      case "MoveForward":
        newVelocity.z = speed;
        break;
      case "TurnAround":
        newVelocity.z = -speed;
        setMaxRotation(Math.PI);
        setRotation(0);
        setDirection(1);
        break;
      case "TurnLeft":
        newVelocity.x = -speed;
        setMaxRotation(Math.PI / 2);
        setRotation(0);
        setDirection(1);
        break;
      case "TurnRight":
        newVelocity.x = speed;
        setMaxRotation(Math.PI / 2);
        setRotation(0);
        setDirection(-1);
        break;
    }

    setVelocity(newVelocity);
  }, [movement, speed]); // Dependencia de speed

  useFrame((state, delta) => {
    if (meshRef.current) {
      //meshRef.current.position.x += velocity.x * delta;
      //meshRef.current.position.z += velocity.z * delta;
    }
    if (Math.abs(rotation) < maxRotation) {
      meshRef.current.rotation.y += 0.1 * direction;
      setRotation(rotation + 0.1 * direction);
    } else {
      setVelocity({ x: 0, y: 0, z: 0 });
      setRotation(0);
      setDirection(0);
    }
  });

  useEffect(() => {
    if (actions) {
      actions[action]?.reset().fadeIn(0.5).play();
    }
    if (["TurnLeft", "TurnRIght", "TurnAround"].includes(movement)) {
      actions["CharacterArmature|Walk"]?.reset().fadeIn(0.5).play();
    }
    return () => {
      actions[action]?.fadeOut(0.5);
    };
  }, [actions, action, movement]);

  useEffect(() => {
    actions["idle"]?.reset().fadeIn(0.5).play();
  }, [actions]);
  return (
    <>
      {" "}
      <OrbitControls />
      <group ref={meshRef}>
        <primitive object={model.scene} />
        <Html
          className="w-[310px] lg:w-[800px] sm:w-[400px] md:w-[500px]"
          center
          position={[0, 2, 0]}
        >
          <div className="absolute bottom-full mb-2 flex flex-col items-center max-w-[800px] text-2xl md:text-3xl text-yellow-400 w-full text-center">
            <div className="relative bg-gray-900 text-yellow-500 rounded py-2 px-3">
              {message || "..."}
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full h-0 w-0 border-x-[20px] border-x-transparent border-t-[20px] border-t-gray-900"></div>
            </div>
          </div>
        </Html>
      </group>
    </>
  );
}

AnimationAIContent.propTypes = {
  action: PropTypes.string,
  message: PropTypes.string,
  movement: PropTypes.string,
  speed: PropTypes.number,
};

export default AnimationAIContent;
