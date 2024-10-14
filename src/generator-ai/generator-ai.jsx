import { Html, OrbitControls } from "@react-three/drei";
import { useState } from "react";
import { getAction } from "./openai-generator";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
function GeneratorAi() {
  const [model, setModel] = useState([]);
  const [description, setDescription] = useState("un perro");
  const [isLoading, setLoading] = useState(false);

  const generateObject = () => {
    setLoading(true);
    getAction(description).then((sceneDescription) => {
      setModel(sceneDescription);
      setLoading(false);
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      generateObject();
      event.preventDefault();
    }
  };

  const geometryComponents = {
    box: (props) => <boxGeometry {...props} />,
    sphere: (props) => <sphereGeometry {...props} />,
    plane: (props) => <planeGeometry {...props} />,
    circle: (props) => <circleGeometry {...props} />,
    cone: (props) => <coneGeometry {...props} />,
    cylinder: (props) => <cylinderGeometry {...props} />,
    dodecahedron: (props) => <dodecahedronGeometry {...props} />,
    icosahedron: (props) => <icosahedronGeometry {...props} />,
    octahedron: (props) => <octahedronGeometry {...props} />,
    torus: (props) => <torusGeometry {...props} />,
    torusKnot: (props) => <torusKnotGeometry {...props} />,
    tube: (props) => {
      const [pathPoints, tubularSegments, radius, radialSegments, closed] =
        props.args;
      const path = new THREE.CatmullRomCurve3(
        pathPoints.map((point) => new THREE.Vector3(...point)),
        closed
      );
      return (
        <tubeGeometry
          args={[path, tubularSegments, radius, radialSegments, closed]}
        />
      );
    },
    tetrahedron: (props) => <tetrahedronGeometry {...props} />,
    ring: (props) => <ringGeometry {...props} />,
    lathe: (props) => {
      const [pointsArray, segments] = props.args;
      const points = pointsArray.map((point) => new THREE.Vector2(...point));
      return <latheGeometry args={[points, segments]} />;
    },
    // Puedes agregar más geometrías aquí
  };

  return (
    <>
      <Canvas
        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <OrbitControls />
        <group>
          {model.map((geometry, index) => {
            const GeometryComponent = geometryComponents[geometry.type];
            if (!GeometryComponent) return null;

            return (
              <mesh
                key={`object-${index}`}
                position={geometry.position}
                rotation={geometry.rotation}
                scale={geometry.scale || [1, 1, 1]}
              >
                <GeometryComponent args={geometry.args} />
                <meshStandardMaterial
                  color={geometry.color || "white"}
                  side={THREE.DoubleSide}
                />
              </mesh>
            );
          })}
        </group>
        {isLoading && (
          <Html className="w-[300px]" position={[-0.5, 0, 0]}>
            Generando idea...
          </Html>
        )}
      </Canvas>
      <div className="absolute bottom-0 left-0 w-full h-full bg-black opacity-50">
        <div className="fixed left-0 bottom-16 w-full flex justify-center items-center flex-row">
          <div>
            <label
              htmlFor="description"
              className="block mb-2 text-sm font-medium text-white"
            >
              ¿Qué se te ocurre el día de hoy?
            </label>
            <textarea
              id="description"
              onChange={(e) => setDescription(e.target.value)}
              className="pointer-events-auto w-[500px] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
              placeholder="Ingresa tu idea aquí y presiona enter"
              required
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default GeneratorAi;
