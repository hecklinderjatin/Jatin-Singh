import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { registerModel, unregisterModel, handleCollisions } from './collisionManager';

const MAX_VELOCITY = 0.01;
const MAX_ROTATION_SPEED = 0.0001;
let idCounter = 0;

const ModelPhysicsWrapper = ({
  ModelComponent,
  scale = 1,
  verticalOffset = 0,
  followRadius = 1.0,
  startPosition,
  initialRotation = [0, 0, 0],
  rotationLerpSpeed = 0.00001,
  continuousRotationSpeed = 0.0,
  collisionRadius = 0.7, 
  onClick = () => {},
}) => {
  const modelRef = useRef();
  const velocity = useRef({
    x: (Math.random() - 0.5) * 0.02,
    y: (Math.random() - 0.5) * 0.02,
  });
  const velocityRotationOffset = useRef(new THREE.Euler(0, 0, 0));
  const targetRotation = useRef(new THREE.Euler(...initialRotation));
  const idRef = useRef(++idCounter);
  
  // Store the initial position to prevent resets
  const initialPositionRef = useRef(null);
  const hasSetInitialPosition = useRef(false);

  const { viewport, camera, mouse } = useThree();
  const [worldMouse, setWorldMouse] = useState(new THREE.Vector3());
  const cursorInside = useRef(false);
  const [hovered, setHovered] = useState(false); // <-- Hover state

  // Set initial position only once
  useEffect(() => {
    if (!hasSetInitialPosition.current && !startPosition) {
      const margin = 0.7 * scale;
      const randX = THREE.MathUtils.randFloatSpread(viewport.width - 2 * margin);
      const randY = THREE.MathUtils.randFloatSpread(viewport.height - 2 * margin) + verticalOffset;
      initialPositionRef.current = [randX, randY, 0];
      hasSetInitialPosition.current = true;
    }
  }, [viewport, scale, verticalOffset, startPosition]);

  // Register for collisions
  useEffect(() => {
    if (!modelRef.current) return;

    console.log(`Registering model ${idRef.current} for collisions`);

    registerModel({
      id: idRef.current,
      getPosition: () => modelRef.current.position.clone(),
      getRadius: () => collisionRadius * scale,
      getVelocity: () => velocity.current,
      setVelocity: (v) => {
        const speed = Math.hypot(v.x, v.y);
        const scaleFactor = speed > MAX_VELOCITY ? MAX_VELOCITY / speed : 1;
        velocity.current.x = v.x * scaleFactor;
        velocity.current.y = v.y * scaleFactor;
      },
      setPosition: ({ x, y }) => modelRef.current.position.set(x, y, 0),
    });

    return () => {
      console.log(`Unregistering model ${idRef.current}`);
      unregisterModel(idRef.current);
    };
  }, [scale, collisionRadius]);

  // Update world mouse position
  useFrame(() => {
    const vec = new THREE.Vector3(mouse.x, mouse.y, 0).unproject(camera);
    vec.z = 0;
    setWorldMouse(vec);
  });

  const updateTargetRotation = () => {
    const { x, y } = velocity.current;
    const angleY = Math.atan2(x, y);
    const tiltX = Math.min(Math.abs(x) + Math.abs(y), 0.2) * 0.1;
    targetRotation.current.set(tiltX, angleY, 0);
  };

  useFrame(() => {
    const model = modelRef.current;
    if (!model) return;

    const { x, y } = model.position;
    const margin = 0.7 * scale;
    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;
    const bounds = {
      left: -halfW + margin,
      right: halfW - margin,
      top: halfH - margin + verticalOffset,
      bottom: -halfH + margin + verticalOffset,
    };

    const dx = worldMouse.x - x;
    const dy = worldMouse.y - y;
    const distance = Math.hypot(dx, dy);

    // Mouse follow logic
    if (distance < followRadius && !cursorInside.current) {
      const baseSpeed = Math.hypot(velocity.current.x, velocity.current.y) || 0.01;
      const intensityMultiplier = 2.0;
      const newSpeed = Math.min(baseSpeed * intensityMultiplier, MAX_VELOCITY * 2);

      const dir = new THREE.Vector2(-dx, -dy).normalize().multiplyScalar(newSpeed);
      velocity.current.x = dir.x;
      velocity.current.y = dir.y;

      velocityRotationOffset.current.x += 0.001;
      velocityRotationOffset.current.y += 0.001;

      cursorInside.current = true;
      updateTargetRotation();

    } else if (distance >= followRadius) {
      cursorInside.current = false;
      model.position.x += velocity.current.x;
      model.position.y += velocity.current.y;
    }

    // Bounce off screen bounds
    const bounce = () => {
      let bounced = false;
      if (x < bounds.left) {
        model.position.x = bounds.left;
        velocity.current.x = Math.abs(velocity.current.x);
        bounced = true;
      } else if (x > bounds.right) {
        model.position.x = bounds.right;
        velocity.current.x = -Math.abs(velocity.current.x);
        bounced = true;
      }

      if (y < bounds.bottom) {
        model.position.y = bounds.bottom;
        velocity.current.y = Math.abs(velocity.current.y);
        bounced = true;
      } else if (y > bounds.top) {
        model.position.y = bounds.top;
        velocity.current.y = -Math.abs(velocity.current.y);
        bounced = true;
      }

      if (bounced) {
        updateTargetRotation();
        velocityRotationOffset.current.x += (0.01) * 0.005;
        velocityRotationOffset.current.y += (0.01) * 0.005;
      }
    };
    bounce();

    // Handle collisions
    const collisions = handleCollisions();
    if (collisions && collisions.length > 0) {
      console.log(`Model ${idRef.current} handling ${collisions.length} collisions`);
    }
    
    collisions?.forEach(({ id1, id2, normalX, normalY }) => {
      if (![id1, id2].includes(idRef.current)) return;

      console.log(`Collision detected between ${id1} and ${id2}`);

      const normal = new THREE.Vector2(normalX, normalY).normalize();
      const v = new THREE.Vector2(velocity.current.x, velocity.current.y);
      const dot = v.dot(normal);
      v.sub(normal.multiplyScalar(2 * dot)).multiplyScalar(0.9 + Math.random() * 0.2);

      const speed = v.length();
      if (speed > MAX_VELOCITY) v.multiplyScalar(MAX_VELOCITY / speed);

      velocity.current.x = v.x;
      velocity.current.y = v.y;

      model.position.x += normal.x * 0.01;
      model.position.y += normal.y * 0.01;

      velocityRotationOffset.current.x += 0.0001;
      velocityRotationOffset.current.y += 0.0001;

      updateTargetRotation();
    });

    // Rotation animation (slow down if hovered)
    model.position.z = 0;

    const dynamicRotationSpeed = hovered ? continuousRotationSpeed * 0.2 : continuousRotationSpeed;
    model.rotation.x += dynamicRotationSpeed;
    model.rotation.y += dynamicRotationSpeed;

    const lerpFactor = hovered ? rotationLerpSpeed * 0.2 : rotationLerpSpeed;

    const updateRotationAxis = (axis) => {
      let offset = targetRotation.current[axis] - velocityRotationOffset.current[axis];
      offset = ((offset + Math.PI) % (2 * Math.PI)) - Math.PI;
      const delta = offset * lerpFactor;
      return THREE.MathUtils.clamp(delta, -MAX_ROTATION_SPEED, MAX_ROTATION_SPEED);
    };

    velocityRotationOffset.current.x += updateRotationAxis('x');
    velocityRotationOffset.current.y += updateRotationAxis('y');

    model.rotation.z = 0;
    
    // Apply velocity rotation with hover dampening
    const velocityDampening = hovered ? 0.3 : 1.0;
    model.rotation.x += velocityRotationOffset.current.x * velocityDampening;
    model.rotation.y += velocityRotationOffset.current.y * velocityDampening;
  });

  // Don't render until we have a position
  if (!initialPositionRef.current && !startPosition) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    // Prevent any potential re-rendering issues
    onClick(e);
  };

  return (
    <ModelComponent
      ref={modelRef}
      scale={scale}
      position={startPosition ?? initialPositionRef.current}
      rotation={initialRotation}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    />
  );
};

export default ModelPhysicsWrapper;