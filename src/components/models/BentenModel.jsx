// models/EarthModel.js
import React, { forwardRef } from 'react';
import { useGLTF } from '@react-three/drei';

const BentenModel = forwardRef((props, ref) => {
  const { scene } = useGLTF('/models/benten.glb');
  return <primitive ref={ref} object={scene} {...props} />;
});

export default BentenModel;
