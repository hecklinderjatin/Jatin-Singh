// models/EarthModel.js
import React, { forwardRef } from 'react';
import { useGLTF } from '@react-three/drei';

const EarthModel = forwardRef((props, ref) => {
  const { scene } = useGLTF('https://jatin-singh-assets.s3.eu-north-1.amazonaws.com/models/earth.glb');
  return <primitive ref={ref} object={scene} {...props} />;
});

export default EarthModel;
