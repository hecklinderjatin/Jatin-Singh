// models/EarthModel.js
import React, { forwardRef } from 'react';
import { useGLTF } from '@react-three/drei';

const CricketModel = forwardRef((props, ref) => {
  const { scene } = useGLTF('/models/cricketball.glb');
  return <primitive ref={ref} object={scene} {...props} />;
});

export default CricketModel;
