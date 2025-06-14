// models/EarthModel.js
import React, { forwardRef } from 'react';
import { useGLTF } from '@react-three/drei';

const SpiderModel = forwardRef((props, ref) => {
  const { scene } = useGLTF('/models/spider.glb');
  return <primitive ref={ref} object={scene} {...props} />;
});

export default SpiderModel;
