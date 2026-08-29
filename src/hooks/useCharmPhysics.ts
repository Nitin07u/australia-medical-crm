import { useState, useRef, useEffect, useCallback } from 'react';

interface PhysicsConfig {
  baseLength?: number;
  gravity?: number;
  damping?: number;
  idleAmplitude?: number;
  idleFrequency?: number;
  maxAngle?: number;
  elasticity?: number;
}

export function useCharmPhysics(config: PhysicsConfig = {}) {
  const {
    baseLength = 240,
    gravity = 1400,
    damping = 1.45,
    idleAmplitude = 0.028, // subtle ~1.6 degree idle oscillation
    idleFrequency = 1.0,
    maxAngle = 1.15,
    elasticity = 0.28,
  } = config;

  // Anchor position in viewport pixels (sits at ~63% across desktop viewport, matching reference!)
  const [anchorX, setAnchorX] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        return window.innerWidth * 0.82;
      }
      return Math.min(window.innerWidth * 0.64, 980);
    }
    return 800;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Rendered state driven by 60/120fps physics loop
  const [motionState, setMotionState] = useState({
    angle: 0, // degrees for CSS transform
    x: 0,     // px offset from anchor
    y: baseLength, // px down from anchor
    stringLength: baseLength,
  });

  // Physical simulation state refs
  const angleRef = useRef(0);
  const omegaRef = useRef(0); // angular velocity (rad/s)
  const lengthRef = useRef(baseLength);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; startAnchorX: number }>({
    clientX: 0,
    clientY: 0,
    startAnchorX: 0,
  });
  const pointerHistory = useRef<{ x: number; y: number; time: number }[]>([]);
  const lastTimeRef = useRef<number | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Responsive anchor positioning on resize
  useEffect(() => {
    const handleResize = () => {
      setAnchorX((prev) => {
        if (window.innerWidth < 768) {
          return window.innerWidth * 0.82;
        }
        return Math.min(window.innerWidth * 0.64, 980);
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  // Continuous Physics Simulation Loop (Numerical Verlet / Semi-implicit Euler integration)
  useEffect(() => {
    let running = true;

    const step = (now: number) => {
      if (!running) return;

      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
        animFrameId.current = requestAnimationFrame(step);
        return;
      }

      // Delta time capped at 32ms
      const dt = Math.min(0.032, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      if (!isDraggingRef.current) {
        // --- REAL PENDULUM SWING WITH GRAVITATIONAL TORQUE & AIR DAMPING ---
        const t = now / 1000;
        
        // Organic dual-harmonic background breathing
        const idleDriving =
          Math.sin(t * idleFrequency * Math.PI * 2) * idleAmplitude +
          Math.sin(t * (idleFrequency * 0.43) * Math.PI * 2) * (idleAmplitude * 0.3);

        // α = -(g / L) * sin(θ) - damping * ω + external_idle
        const theta = angleRef.current;
        const L = lengthRef.current;
        const alpha = -((gravity / L) * Math.sin(theta)) - damping * omegaRef.current + idleDriving * 6.5;

        // Semi-implicit Euler step
        omegaRef.current += alpha * dt;
        angleRef.current += omegaRef.current * dt;

        // Restore length if stretched
        lengthRef.current += (baseLength - lengthRef.current) * (12.0 * dt);

        const curAngle = angleRef.current;
        const curLen = lengthRef.current;
        const xOffset = Math.sin(curAngle) * curLen;
        const yOffset = Math.cos(curAngle) * curLen;

        setMotionState({
          angle: curAngle * (180 / Math.PI),
          x: xOffset,
          y: yOffset,
          stringLength: curLen,
        });
      }

      animFrameId.current = requestAnimationFrame(step);
    };

    animFrameId.current = requestAnimationFrame(step);

    return () => {
      running = false;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [baseLength, gravity, damping, idleAmplitude, idleFrequency]);

  // Flick / Impulse Torque
  const triggerFlick = useCallback((customImpulse = 4.2) => {
    const dir = Math.random() > 0.5 ? 1 : -1;
    omegaRef.current += customImpulse * dir;
  }, []);

  // Pointer drag start
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setIsDragging(true);
      isDraggingRef.current = true;

      dragStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        startAnchorX: anchorX,
      };

      pointerHistory.current = [{ x: e.clientX, y: e.clientY, time: performance.now() }];
      omegaRef.current = 0;
    },
    [anchorX]
  );

  // Pointer drag move
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;

      const now = performance.now();
      const history = pointerHistory.current;
      history.push({ x: e.clientX, y: e.clientY, time: now });

      while (history.length > 2 && now - history[0].time > 120) {
        history.shift();
      }

      // Check if dragging near top edge to reposition anchor
      const isTopDrag = e.clientY < 60;
      if (isTopDrag) {
        const newAnchor = Math.max(60, Math.min(window.innerWidth - 60, e.clientX));
        setAnchorX(newAnchor);
        dragStartRef.current.startAnchorX = newAnchor;
      }

      const curAnchorX = anchorX;
      const dx = e.clientX - curAnchorX;
      const dy = Math.max(40, e.clientY);

      const targetAngle = Math.atan2(dx, dy);
      const clampedAngle = Math.max(-maxAngle, Math.min(maxAngle, targetAngle));
      const dist = Math.sqrt(dx * dx + dy * dy);

      const stretchedLen = baseLength + (dist - baseLength) * elasticity;

      angleRef.current = clampedAngle;
      lengthRef.current = Math.max(baseLength * 0.7, Math.min(baseLength * 1.5, stretchedLen));

      const xOffset = Math.sin(clampedAngle) * lengthRef.current;
      const yOffset = Math.cos(clampedAngle) * lengthRef.current;

      setMotionState({
        angle: clampedAngle * (180 / Math.PI),
        x: xOffset,
        y: yOffset,
        stringLength: lengthRef.current,
      });
    },
    [anchorX, baseLength, elasticity, maxAngle]
  );

  // Pointer drag release
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}

      setIsDragging(false);
      isDraggingRef.current = false;

      const now = performance.now();
      const history = pointerHistory.current;

      let vx = 0;
      if (history.length >= 2) {
        const oldest = history[0];
        const latest = history[history.length - 1];
        const dt = (latest.time - oldest.time) / 1000;
        if (dt > 0.01) {
          vx = (latest.x - oldest.x) / dt;
        }
      }

      const totalMoved = Math.hypot(
        e.clientX - dragStartRef.current.clientX,
        e.clientY - dragStartRef.current.clientY
      );

      if (totalMoved < 6 && (now - (history[0]?.time || now)) < 300) {
        triggerFlick(3.4);
        return;
      }

      const L = Math.max(100, lengthRef.current);
      const angularVel = (vx / L) * 1.35;
      omegaRef.current = Math.max(-12, Math.min(12, angularVel));
    },
    [triggerFlick]
  );

  const setAnchorPosition = useCallback((newX: number) => {
    setAnchorX(Math.max(60, Math.min(window.innerWidth - 60, newX)));
  }, []);

  return {
    anchorX,
    setAnchorPosition,
    isDragging,
    isHovered,
    setIsHovered,
    motionState,
    triggerFlick,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
