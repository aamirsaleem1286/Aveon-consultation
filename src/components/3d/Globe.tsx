"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

const GLOBE_VERTEX = `
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
`;

const GLOBE_FRAGMENT = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uGlobeRadius;

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
    vec2 uv = vUv * 10.0;
    float n = fbm(uv + uTime * 0.1);

    vec3 baseColor = mix(uColor1, uColor2, n);

    float fresnel = 1.0 - dot(normalize(vWorldPosition), normalize(vNormal));
    fresnel = pow(fresnel, 2.0);

    float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
    vec3 glowColor = mix(uColor1, uColor3, pulse);

    vec3 atmosphere = glowColor * fresnel * 0.6;

    vec3 color = baseColor * (0.5 + n * 0.5);

    float grid = step(0.98, abs(vUv.x * 20.0 - floor(vUv.x * 20.0 + 0.5))) +
                 step(0.98, abs(vUv.y * 20.0 - floor(vUv.y * 20.0 + 0.5)));
    color += vec3(0.0, 1.0, 0.8) * grid * 0.3 * (1.0 - n);

    gl_FragColor = vec4(color + atmosphere, 0.85);
  }
`;

interface Country {
  name: string;
  lat: number;
  lng: number;
  color: number;
}

function latLngToVector3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

interface GlobeProps {
  radius?: number;
  rotationSpeed?: number;
  showParticles?: boolean;
}

export function Globe({
  radius = 2.5,
  rotationSpeed = 0.02,
  showParticles = true,
}: GlobeProps) {
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  }, []);

  const countries = useMemo<Country[]>(() => [
    { name: "Pakistan", lat: 30.3753, lng: 69.3451, color: 0x00d4aa },
    { name: "Malaysia", lat: 4.2105, lng: 101.9758, color: 0x6366f1 },
    { name: "United Kingdom", lat: 55.3781, lng: -3.436, color: 0x00ffcc },
    { name: "United States", lat: 37.0902, lng: -95.7129, color: 0xf59e0b },
    { name: "Canada", lat: 56.1304, lng: -106.3468, color: 0xef4444 },
    { name: "Australia", lat: -25.2744, lng: 133.7751, color: 0x8b5cf6 },
    { name: "Germany", lat: 51.1657, lng: 10.4515, color: 0xec4899 },
    { name: "Ireland", lat: 53.4129, lng: -8.2439, color: 0x10b981 },
    { name: "New Zealand", lat: -40.9006, lng: 174.886, color: 0x06b6d4 },
    { name: "UAE", lat: 23.4241, lng: 53.8478, color: 0xf97316 },
  ], []);

  return (
    <group>
      <GlobeSphere radius={radius} rotationSpeed={rotationSpeed} isMobile={isMobile} />

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[radius * 1.15, 32, 32]} />
        <meshBasicMaterial
          color={0x00d4aa}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outer glow ring */}
      <mesh>
        <ringGeometry args={[radius * 1.2, radius * 1.25, 64]} />
        <meshBasicMaterial
          color={0x00d4aa}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Country markers */}
      {countries.map((country, i) => (
        <PulsingMarker
          key={country.name}
          position={latLngToVector3(country.lat, country.lng, radius * 1.05)}
          color={country.color}
          markerRadius={radius * 0.06}
          delay={i * 0.2}
        />
      ))}

      {/* Connection lines between key countries */}
      <ConnectionLines
        countries={countries.slice(0, 7)}
        radius={radius}
      />

      {/* Floating particles around globe */}
      {showParticles && !isMobile && <GlobeParticles radius={radius * 1.5} count={150} />}
    </group>
  );
}

function GlobeSphere({
  radius,
  rotationSpeed,
  isMobile,
}: {
  radius: number;
  rotationSpeed: number;
  isMobile: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: GLOBE_VERTEX,
      fragmentShader: GLOBE_FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(0x001a1f) },
        uColor2: { value: new THREE.Color(0x0a0a0f) },
        uColor3: { value: new THREE.Color(0x00d4aa) },
        uGlobeRadius: { value: radius },
      },
      transparent: true,
      depthWrite: false,
    });
  }, [radius]);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed * state.clock.getDelta() * 60;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, isMobile ? 32 : 64, isMobile ? 32 : 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function PulsingMarker({
  position,
  color,
  markerRadius,
  delay,
}: {
  position: THREE.Vector3;
  color: number;
  markerRadius: number;
  delay: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime() + delay;
      ref.current.scale.setScalar(1 + Math.sin(t * 2) * 0.3);
      ref.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={ref} position={position.toArray()}>
      <sphereGeometry args={[markerRadius, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} depthWrite={false} />
    </mesh>
  );
}

function ConnectionLines({
  countries,
  radius,
}: {
  countries: Country[];
  radius: number;
}) {
  const geometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < countries.length - 1; i++) {
      const start = latLngToVector3(countries[i].lat, countries[i].lng, radius * 1.1);
      const end = latLngToVector3(countries[i + 1].lat, countries[i + 1].lng, radius * 1.1);

      const mid = new THREE.Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5)
        .normalize()
        .multiplyScalar(radius * 1.3);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      pts.push(...curve.getPoints(20));
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(pts.flatMap((p) => [p.x, p.y, p.z]), 3)
    );
    geom.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(pts.length * 3), 3));

    return geom;
  }, [countries, radius]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((state) => {
    const positions = geometry.attributes.position;
    const colors = geometry.attributes.color as THREE.BufferAttribute;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      const wave = Math.sin((x + y + z) * 2 + time * 3) * 0.5 + 0.5;
      colors.setXYZ(i, wave * 0.5, 1, wave * 0.8);
    }
    colors.needsUpdate = true;
  });

  return (
    <mesh geometry={geometry}>
      <lineBasicMaterial vertexColors transparent opacity={0.6} depthWrite={false} />
    </mesh>
  );
}

function GlobeParticles({ radius, count }: { radius: number; count: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const r = radius * (0.8 + Math.random() * 0.6);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const colorChoice = Math.random();
      if (colorChoice < 0.4) {
        colors[i * 3] = 0;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 0.8;
      } else if (colorChoice < 0.7) {
        colors[i * 3] = 0.4;
        colors[i * 3 + 1] = 0.4;
        colors[i * 3 + 2] = 1;
      } else {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.6;
        colors[i * 3 + 2] = 0;
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    return geom;
  }, [count, radius]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0001;
      pointsRef.current.rotation.x += 0.00005;

      const positions = geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < count; i++) {
        const y = positions.getY(i);
        positions.setY(i, y + Math.sin(time + i) * 0.001);
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial vertexColors size={1} transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  );
}

interface GlobeCanvasProps {
  className?: string;
  radius?: number;
  rotationSpeed?: number;
}

export function GlobeCanvas({ className, radius = 2.5, rotationSpeed = 0.02 }: GlobeCanvasProps) {
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  }, []);

  return (
    <div className={className} style={{ width: "100%", height: "100%", minHeight: "500px" }}>
      <Canvas
        camera={{ position: [0, 0, isMobile ? 7 : 6], fov: isMobile ? 50 : 45 }}
        style={{ width: "100%", height: "100%", display: "block" }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        shadows={false}
      >
        <color attach="background" args={["#0a0a0f"]} />
        <fog attach="fog" args={["#0a0a0f", 5, 15]} />
        <Stars radius={100} depth={50} count={isMobile ? 500 : 2000} factor={4} saturation={0} />
        <ambientLight intensity={0.5} color={0x00d4aa} />
        <directionalLight position={[5, 5, 5]} intensity={1} color={0x00ffcc} />
        <pointLight position={[-5, 3, 5]} intensity={0.5} color={0x6366f1} />
        <Globe radius={radius} rotationSpeed={rotationSpeed} showParticles={!isMobile} />
      </Canvas>
    </div>
  );
}