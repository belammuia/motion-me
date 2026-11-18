
import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function CharacterModel() {
  const { scene } = useGLTF("/models/Soldier.glb");

  useEffect(() => {
    const bones: string[] = [];

    scene.traverse((object) => {
      if ((object as THREE.Bone).isBone) {
        bones.push(object.name);
      }
    });

    console.log("MotionMe character bones:", bones);
  }, [scene]);

  return (
    <primitive
      object={scene}
      position={[0, 0, 0]}
    />
  );
}

useGLTF.preload("/models/Soldier.glb");
