// models/EarthModel.js
import React, { forwardRef } from 'react';
import { useGLTF } from '@react-three/drei';

const RecordModel = forwardRef((props, ref) => {
  const { scene } = useGLTF('/models/record.glb');
  return <primitive ref={ref} object={scene} {...props} />;
});

export default RecordModel;
