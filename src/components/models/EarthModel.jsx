// models/EarthModel.js
import React, { forwardRef } from 'react';
import { useGLTF } from '@react-three/drei';

const EarthModel = forwardRef((props, ref) => {
  const { scene } = useGLTF('/models/earth.glb');
  return <primitive ref={ref} object={scene} {...props} />;
});

export default EarthModel;
