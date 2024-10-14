import { Html, OrbitControls, useAnimations, useGLTF } from "@react-three/drei";
import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import Typewriter from "../../shared/type-writer";

function VirtualAssistant({ action, message = "..." }) {
  const meshRef = useRef();
  const model = useGLTF("animations.glb");
  const { actions } = useAnimations(model.animations, meshRef);

  useEffect(() => {
    actions["idle"]?.reset().fadeIn(0.5).play();
  }, [actions]);

  useEffect(() => {
    if (action) actions[action]?.reset().fadeIn(0.5).play();
    return () => {
      actions[action]?.fadeOut(0.5);
    };
  }, [action]);
  return (
    <>
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
              {message}
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full h-0 w-0 border-x-[20px] border-x-transparent border-t-[20px] border-t-gray-900"></div>
            </div>
          </div>
        </Html>
      </group>
    </>
  );
}

VirtualAssistant.propTypes = {
  action: PropTypes.string,
  message: PropTypes.string,
  movement: PropTypes.string,
  speed: PropTypes.number,
};

export default VirtualAssistant;
