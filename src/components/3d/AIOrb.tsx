"use client";

import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { shaderMaterial, primitive } from "@react-three/drei";
import * as THREE from "three";

const OrbMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor1: new THREE.Color(0x00d4aa),
    uColor2: new THREE.Color(0x6366f1),
    uColor3: new THREE.Color(0x00ffcc),
    uIntensity: 1.0,
  },
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform float uIntensity;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 5; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 uv = vUv * 3.0;
      float n = fbm(uv + uTime * 0.3);

      // Pulsing rings
      float rings = sin(20.0 * vUv.y - uTime * 3.0) * 0.05;
      n += rings;

      // Radial gradient
      float radial = 1.0 - length(vUv - 0.5) * 2.0;
      radial = smoothstep(0.0, 1.0, radial);

      vec3 color = mix(uColor1, uColor2, n) * radial;
      color += uColor3 * radial * 0.5 * sin(uTime * 2.0) * 0.5 + 0.5;

      // Fresnel glow
      float fresnel = 1.0 - dot(normalize(vWorldPosition), normalize(vNormal));
      fresnel = pow(fresnel, 3.0);
      color += uColor3 * fresnel * 0.8;

      float alpha = (radial * 0.7 + fresnel * 0.5) * uIntensity;

      gl_FragColor = vec4(color, alpha);
    }
  `
);

const RingMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color(0x00d4aa),
  },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform float uTime;
    uniform vec3 uColor;

    varying vec2 vUv;

    void main() {
      float ring = sin(vUv.x * 50.0 - uTime * 2.0) * 0.5 + 0.5;
      float radial = 1.0 - abs(vUv.y - 0.5) * 2.0;
      radial = smoothstep(0.0, 1.0, radial);

      float alpha = ring * radial * 0.3;
      gl_FragColor = vec4(uColor, alpha);
    }
  `
);

interface AIOrbProps {
  size?: number;
  isListening?: boolean;
  isSpeaking?: boolean;
  className?: string;
}

export function AIOrb({ size = 120, isListening = false, isSpeaking = false, className }: AIOrbProps) {
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  }, []);

  return (
    <div className={className} style={{ width: size, height: size }}>
      <Canvas
        camera={{ position: [0, 0, isMobile ? 3 : 2.5], fov: 30 }}
        style={{ width: "100%", height: "100%", display: "block" }}
        gl={{ antialias: true, alpha: true }}
        shadows={false}
      >
        <color attach="background" args={[0x0a0a0f]} />
        <AIOrbScene size={size / 100} isListening={isListening} isSpeaking={isSpeaking} />
      </Canvas>
    </div>
  );
}

function AIOrbScene({ size = 1.2, isListening, isSpeaking }: { size: number; isListening: boolean; isSpeaking: boolean }) {
  const timeRef = useRef(0);
  const orbRef = useRef<THREE.Mesh>(null);
  const ringRefs = useRef<THREE.Mesh[]>([]);
  const particleRef = useRef<THREE.Points>(null);

  const orbMaterial = useMemo(() => {
    return new OrbMaterial({
      uTime: 0,
      uColor1: new THREE.Color(0x001a1f),
      uColor2: new THREE.Color(0x0a0a0f),
      uColor3: new THREE.Color(isListening ? 0xf59e0b : isSpeaking ? 0x00ffcc : 0x00d4aa),
      uIntensity: isSpeaking ? 1.5 : isListening ? 1.2 : 1.0,
      transparent: true,
      depthWrite: false,
    });
  }, [isListening, isSpeaking]);

  const ringMaterials = useMemo(() => {
    return Array.from({ length: 3 }, () => {
      return new RingMaterial({
        uTime: 0,
        uColor: new THREE.Color(0x00d4aa),
        transparent: true,
        depthWrite: false,
      });
    });
  }, []);

  useEffect(() => {
    return () => {
      orbMaterial.dispose();
      ringMaterials.forEach(m => m.dispose());
    };
  }, [orbMaterial, ringMaterials]);

  useFrame((state) => {
    timeRef.current = state.clock.getElapsedTime();

    // Main orb pulse
    if (orbRef.current) {
      const pulseSpeed = isSpeaking ? 8 : isListening ? 5 : 1.5;
      const pulseAmount = isSpeaking ? 0.15 : isListening ? 0.1 : 0.03;
      const scale = 1 + Math.sin(timeRef.current * pulseSpeed) * pulseAmount;
      orbRef.current.scale.setScalar(scale);
      orbRef.current.rotation.y += 0.005;
      orbRef.current.rotation.x += 0.002;
    }

    // Update orb material uniforms
    if (orbMaterial.uniforms) {
      orbMaterial.uniforms.uTime.value = timeRef.current;
      orbMaterial.uniforms.uColor3.value = new THREE.Color(isListening ? 0xf59e0b : isSpeaking ? 0x00ffcc : 0x00d4aa);
      orbMaterial.uniforms.uIntensity.value = isSpeaking ? 1.5 : isListening ? 1.2 : 1.0;
    }

    // Rotating rings
    ringRefs.current.forEach((ring, i) => {
      if (ring && ringMaterials[i]) {
        ring.rotation.y += (i % 2 === 0 ? 0.01 : -0.01) * (isSpeaking ? 3 : isListening ? 2 : 1);
        ring.rotation.x += (i % 3 === 0 ? 0.005 : -0.005) * (isSpeaking ? 2 : 1);
        ring.material.opacity = (isSpeaking ? 0.4 : isListening ? 0.3 : 0.15) * (0.5 + Math.sin(timeRef.current * 2 + i) * 0.3);
        if (ringMaterials[i].uniforms) {
          ringMaterials[i].uniforms.uTime.value = timeRef.current;
        }
      }
    });

    // Particles
    if (particleRef.current) {
      particleRef.current.rotation.y += 0.001;
      const positions = particleRef.current.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        const x = positions.getX(i);
        const z = positions.getZ(i);
        positions.setY(i, y + Math.sin(timeRef.current * 2 + i * 0.1) * 0.002);
        positions.setX(i, x + Math.cos(timeRef.current * 1.5 + i * 0.1) * 0.001);
      }
      positions.needsUpdate = true;
    }
  });

  // Create orbiting rings
  const rings = useMemo(() => {
    const ringData = [];
    for (let i = 0; i < 3; i++) {
      ringData.push({
        radius: size * (1.4 + i * 0.3),
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      });
    }
    return ringData;
  }, [size]);

  // Particles around orb
  const particleData = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const r = size * (1.6 + Math.random() * 1.0);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const c = Math.random();
      if (c < 0.4) {
        colors[i * 3] = 0; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 0.8;
      } else if (c < 0.7) {
        colors[i * 3] = 0.4; colors[i * 3 + 1] = 0.4; colors[i * 3 + 2] = 1;
      } else {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.6; colors[i * 3 + 2] = 0;
      }

      sizes[i] = Math.random() * 1.5 + 0.5;
    }

    return { positions, colors, sizes, count };
  }, [size]);

  const particleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(particleData.positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(particleData.colors, 3));
    geometry.setAttribute("size", new THREE.Float32BufferAttribute(particleData.sizes, 1));
    return geometry;
  }, [particleData]);

  useEffect(() => {
    return () => {
      particleGeometry.dispose();
    };
  }, [particleGeometry]);

  return (
    <group>
      {/* Outer glow rings */}
      {rings.map((ring, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) ringRefs.current[i] = el; }}
          position={[0, 0, 0]}
          rotation={ring.rotation}
        >
          <torusGeometry args={[ring.radius, ring.radius * 0.02, 8, 64]} />
          <primitive object={ringMaterials[i]} attach="material" />
        </mesh>
      ))}

      {/* Main orb */}
      <mesh ref={orbRef} position={[0, 0, 0]}>
        <sphereGeometry args={[size, 64, 64]} />
        <primitive object={orbMaterial} attach="material" />
      </mesh>

      {/* Inner core */}
      <mesh position={[0, 0, 0]} scale={0.3}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial
          color={isListening ? 0xf59e0b : isSpeaking ? 0x00ffcc : 0x00d4aa}
          transparent
          opacity={isSpeaking ? 0.6 : isListening ? 0.5 : 0.3}
          depthWrite={false}
        />
      </mesh>

      {/* Orbiting particles */}
      <points ref={particleRef}>
        <primitive object={particleGeometry} attach="geometry" />
        <pointsMaterial vertexColors size={1} transparent opacity={0.6} sizeAttenuation depthWrite={false} />
      </points>

      {/* Pulse ring when speaking */}
      {isSpeaking && (
        <PulseRing size={size} />
      )}

      {/* Listening indicator */}
      {isListening && (
        <ListeningIndicator size={size} />
      )}
    </group>
  );
}

function PulseRing({ size }: { size: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, []);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  useFrame((state) => {
    if (ref.current) {
      timeRef.current = state.clock.getElapsedTime();
      const t = (timeRef.current * 0.5) % 1;
      ref.current.scale.setScalar(1 + t * 2);
      ref.current.material.opacity = (1 - t) * 0.4;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <ringGeometry args={[size * 1.1, size * 1.3, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function ListeningIndicator({ size }: { size: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((state) => {
    if (ref.current) {
      timeRef.current = state.clock.getElapsedTime();
      ref.current.rotation.z = Math.sin(timeRef.current * 3) * 0.3;
      ref.current.scale.setScalar(0.8 + Math.sin(timeRef.current * 6) * 0.2);
    }
  });

  return (
    <mesh ref={ref} position={[0, -size * 1.5, 0]}>
      <coneGeometry args={[size * 0.3, size * 0.6, 16]} />
      <meshBasicMaterial color={0xf59e0b} transparent opacity={0.6} depthWrite={false} />
    </mesh>
  );
}