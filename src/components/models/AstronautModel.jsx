import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { registerModel, unregisterModel, handleCollisions } from '../physics/collisionManager';

const AstronautModel = ({ position = [0, 0, 0], scale = 1 }) => {
  const modelRef = useRef();
  const { scene } = useGLTF('https://jatin-singh-assets.s3.eu-north-1.amazonaws.com/models/astronaut.glb');
  const idRef = useRef(Math.random().toString(36).substr(2, 9));

  // Store velocity in a ref for stable mutation (unused for movement here)
  const velocity = useRef(new THREE.Vector3(0, 0, 0));

  // Track floating animation time locally
  const elapsedTime = useRef(0);

  // Get viewport size to clamp position inside visible bounds
  const { viewport } = useThree();

  useEffect(() => {
    registerModel({
      id: idRef.current,
      type: 'astronaut',
      mass: 1.0,
      restitution: 0.6,
      friction: 0.9,
      isStatic: false,
      getPosition: () => modelRef.current ? modelRef.current.position.clone() : new THREE.Vector3(...position),
      getRadius: () => 1.0 * scale,
      getVelocity: () => velocity.current,
      setVelocity: (newVel) => {
        velocity.current.copy(new THREE.Vector3(newVel.x, newVel.y, newVel.z));
      },
      setPosition: (newPos) => {
        if (modelRef.current) {
          modelRef.current.position.set(newPos.x, newPos.y, newPos.z);
        }
      },
      onCollision: (collisionData) => {
        console.log('Astronaut collision with:', collisionData.otherObject.type);
      },
    });

    // Set initial position immediately
    if (modelRef.current) {
      modelRef.current.position.set(...position);
    }

    return () => {
      // Use the stored value in cleanup
      if (idRef.current) {
        unregisterModel(idRef.current);
      }
    };
  }, [scale, position]);

  useFrame((state, delta) => {
    if (!modelRef.current) return;

    elapsedTime.current += delta;

    // Floating animation offsets
    const floatX = Math.cos(elapsedTime.current * 1.8) * 0.1;
    const floatY = Math.sin(elapsedTime.current * 2.5) * 0.3;
    const floatZ = Math.sin(elapsedTime.current * 1.2) * 0.1;

    // **DO NOT update position by velocity — keep astronaut fixed except floating**

    // Clamp base position inside viewport bounds with some margin
    const margin = 1.0 * scale;
    const halfWidth = viewport.width / 2 - margin;
    const halfHeight = viewport.height / 2 - margin;

    // Fix position to base position + floating offsets
    modelRef.current.position.x = THREE.MathUtils.clamp(position[0], -halfWidth, halfWidth) + floatX;
    modelRef.current.position.y = THREE.MathUtils.clamp(position[1], -halfHeight, halfHeight) + floatY;
    modelRef.current.position.z = position[2] + floatZ;

    // Call collision handler if you want to detect collisions
    handleCollisions();

    // Damping velocity is optional since velocity is not used here
    velocity.current.multiplyScalar(0.98);

    // Apply mouse-based rotation and floating rotation effect
    const mouseX = (state.mouse.x || 0);
    const mouseY = (state.mouse.y || 0);
    modelRef.current.rotation.y = mouseX * 0.5;
    modelRef.current.rotation.x = mouseY * 0.5;
    modelRef.current.rotation.z = Math.cos(elapsedTime.current * 0.4) * 0.15;
  });

  return (
    <primitive 
      ref={modelRef} 
      object={scene.clone()} 
      scale={[scale, scale, scale]} 
      position={position} 
    />
  );
};

export default AstronautModel;
