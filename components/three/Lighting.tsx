import React from "react";

export const Lighting: React.FC = () => {
  return (
    <>
      {/* 1. Very low ambient light for dark atmospheric foundation */}
      <ambientLight intensity={0.25} color="#2A2E3D" />

      {/* 2. Soft white key light from top-left for crisp metallic specular definition */}
      <directionalLight
        position={[-4, 6, 5]}
        intensity={1.5}
        color="#FFFFFF"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* 3. Signature lime rim light from back-right */}
      <directionalLight
        position={[4, -2, -3]}
        intensity={1.8}
        color="#C8FF3D"
      />

      {/* 4. Violet secondary rim from back-left for atmospheric depth */}
      <directionalLight
        position={[-3, -3, -4]}
        intensity={1.2}
        color="#8B5CF6"
      />

      {/* 5. Controlled lime bounce reflection accent */}
      <pointLight
        position={[3, -2, 2.5]}
        intensity={1.5}
        distance={6}
        color="#C8FF3D"
      />

      {/* 6. Subtle top silver specular highlight */}
      <spotLight
        position={[0, 7, 2]}
        intensity={0.7}
        angle={0.6}
        penumbra={0.8}
        color="#F5F5F0"
      />
    </>
  );
};
