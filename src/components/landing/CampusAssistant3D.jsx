import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CanvasTexture } from 'three'
import { Link } from 'react-router-dom'

function detectWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function createSoftShadowTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(32, 32, 2, 32, 32, 30)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.58)')
  gradient.addColorStop(0.38, 'rgba(0, 0, 0, 0.22)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

function GraphiteMaterial({ color = '#2c2e33' }) {
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={0.78}
      roughness={0.34}
      clearcoat={0.42}
      clearcoatRoughness={0.28}
      reflectivity={0.48}
    />
  )
}

function AssistantBot({ mouseRef, hoverRef, clickRef, reduceMotionRef, activeRef }) {
  const root = useRef()
  const body = useRef()
  const head = useRef()
  const visor = useRef()
  const leftEye = useRef()
  const rightEye = useRef()
  const leftEyeMat = useRef()
  const rightEyeMat = useRef()
  const visorMat = useRef()
  const antennaLight = useRef()
  const chestLight = useRef()
  const blinkUntil = useRef(0)
  const nextBlink = useRef(4.2)
  const shadowTexture = useMemo(() => createSoftShadowTexture(), [])

  useEffect(() => () => shadowTexture?.dispose(), [shadowTexture])

  useFrame((state, delta) => {
    if (!activeRef.current || !root.current || !head.current || !body.current) return

    const dt = Math.min(0.05, delta)
    const smooth = 1 - Math.exp(-dt * 5.4)
    const time = state.clock.elapsedTime
    const reduced = reduceMotionRef.current
    const hovering = hoverRef.current
    const pointer = mouseRef.current
    const lookScale = hovering ? 1.35 : 1
    const idleHeadY = reduced ? 0 : Math.sin(time * 0.21) * 0.018 + Math.sin(time * 0.47) * 0.008
    const idleHeadX = reduced ? 0 : Math.sin(time * 0.33) * 0.014
    const targetHeadY = pointer.x * 0.25 * lookScale + idleHeadY
    const targetHeadX = -pointer.y * 0.12 * lookScale + idleHeadX
    const clickAmount = clickRef.current
    clickRef.current = lerp(clickAmount, 0, 1 - Math.exp(-dt * 4.8))

    if (time > nextBlink.current) {
      blinkUntil.current = time + 0.1
      nextBlink.current = time + 4.2 + Math.random() * 4.8
    }
    const blinking = !reduced && time < blinkUntil.current

    const floatY = reduced ? 0 : Math.sin(time * 0.52) * 0.026 + Math.sin(time * 0.93) * 0.01
    const idleYaw = reduced ? 0 : Math.sin(time * 0.19) * 0.024 + Math.sin(time * 0.41) * 0.01
    const breath = reduced ? 1 : 1 + Math.sin(time * 1.02) * 0.006 + Math.sin(time * 0.37) * 0.002

    root.current.position.y = lerp(root.current.position.y, floatY - 0.04, smooth)
    root.current.position.x = lerp(root.current.position.x, pointer.x * 0.055, smooth)
    root.current.rotation.y = lerp(root.current.rotation.y, 0.18 + idleYaw + pointer.x * 0.04, smooth)

    body.current.scale.y = lerp(body.current.scale.y, breath, smooth)
    body.current.rotation.y = lerp(body.current.rotation.y, pointer.x * 0.06, smooth)

    head.current.rotation.y = lerp(head.current.rotation.y, targetHeadY, smooth)
    head.current.rotation.x = lerp(
      head.current.rotation.x,
      targetHeadX + clickAmount * 0.18,
      smooth,
    )

    if (visor.current) {
      visor.current.rotation.y = lerp(visor.current.rotation.y, pointer.x * 0.03, smooth)
      visor.current.rotation.x = lerp(visor.current.rotation.x, -pointer.y * 0.02, smooth)
    }

    const eyeX = pointer.x * (hovering ? 0.072 : 0.05)
    const eyeY = -pointer.y * (hovering ? 0.042 : 0.03)
    if (leftEye.current && rightEye.current) {
      leftEye.current.position.x = lerp(leftEye.current.position.x, -0.072 + eyeX, smooth)
      rightEye.current.position.x = lerp(rightEye.current.position.x, 0.072 + eyeX, smooth)
      leftEye.current.position.y = lerp(leftEye.current.position.y, eyeY, smooth)
      rightEye.current.position.y = lerp(rightEye.current.position.y, eyeY, smooth)
      const eyeScaleY = blinking ? 0.08 : hovering ? 0.48 : 0.42
      leftEye.current.scale.y = lerp(leftEye.current.scale.y, eyeScaleY, blinking ? 0.55 : smooth)
      rightEye.current.scale.y = lerp(rightEye.current.scale.y, eyeScaleY, blinking ? 0.55 : smooth)
    }

    const eyeGlow = blinking ? 0.06 : hovering ? 0.95 : 0.48
    if (leftEyeMat.current && rightEyeMat.current) {
      leftEyeMat.current.emissiveIntensity = lerp(leftEyeMat.current.emissiveIntensity, eyeGlow, smooth)
      rightEyeMat.current.emissiveIntensity = lerp(rightEyeMat.current.emissiveIntensity, eyeGlow, smooth)
    }
    if (visorMat.current) {
      visorMat.current.emissiveIntensity = lerp(visorMat.current.emissiveIntensity, hovering ? 0.32 : 0.16, smooth)
    }

    if (antennaLight.current) {
      const pulse = hovering ? 0.72 : 0.32 + Math.sin(time * 1.15) * 0.08
      antennaLight.current.emissiveIntensity = lerp(antennaLight.current.emissiveIntensity, pulse, smooth)
    }
    if (chestLight.current) {
      const chest = hovering ? 0.32 : 0.12 + Math.sin(time * 0.9) * 0.04
      chestLight.current.emissiveIntensity = lerp(chestLight.current.emissiveIntensity, chest, smooth)
    }
  })

  return (
    <group ref={root}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.16, 0]} scale={[1.18, 0.92, 1]} renderOrder={-1}>
        <planeGeometry args={[1.7, 1.7]} />
        <meshBasicMaterial map={shadowTexture} transparent opacity={0.9} depthWrite={false} />
      </mesh>

      <group ref={body} position={[0, -0.2, 0]}>
        <mesh>
          <capsuleGeometry args={[0.33, 0.46, 6, 16]} />
          <GraphiteMaterial />
        </mesh>
        <mesh position={[0, 0.06, 0.325]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.012, 0.22, 4, 8]} />
          <meshPhysicalMaterial
            ref={chestLight}
            color="#2c2d31"
            metalness={0.35}
            roughness={0.18}
            emissive="#d8d4cc"
            emissiveIntensity={0.12}
          />
        </mesh>
        <mesh position={[0, 0.38, 0]}>
          <torusGeometry args={[0.16, 0.018, 8, 20]} />
          <GraphiteMaterial color="#2a2b2f" />
        </mesh>
        <mesh position={[-0.4, 0.16, 0]} rotation={[0, 0, 0.28]}>
          <capsuleGeometry args={[0.055, 0.38, 4, 10]} />
          <GraphiteMaterial color="#17181b" />
        </mesh>
        <mesh position={[0.4, 0.16, 0]} rotation={[0, 0, -0.28]}>
          <capsuleGeometry args={[0.055, 0.38, 4, 10]} />
          <GraphiteMaterial color="#17181b" />
        </mesh>
        <mesh position={[-0.5, -0.04, 0]}>
          <sphereGeometry args={[0.068, 12, 12]} />
          <GraphiteMaterial color="#2e2f33" />
        </mesh>
        <mesh position={[0.5, -0.04, 0]}>
          <sphereGeometry args={[0.068, 12, 12]} />
          <GraphiteMaterial color="#2e2f33" />
        </mesh>
        <mesh position={[-0.13, -0.52, 0]}>
          <capsuleGeometry args={[0.068, 0.18, 4, 10]} />
          <GraphiteMaterial color="#141518" />
        </mesh>
        <mesh position={[0.13, -0.52, 0]}>
          <capsuleGeometry args={[0.068, 0.18, 4, 10]} />
          <GraphiteMaterial color="#141518" />
        </mesh>
        <mesh position={[-0.13, -0.68, 0.03]} scale={[1, 0.38, 1.15]}>
          <sphereGeometry args={[0.11, 12, 10]} />
          <GraphiteMaterial color="#101114" />
        </mesh>
        <mesh position={[0.13, -0.68, 0.03]} scale={[1, 0.38, 1.15]}>
          <sphereGeometry args={[0.11, 12, 10]} />
          <GraphiteMaterial color="#101114" />
        </mesh>
      </group>

      <group ref={head} position={[0, 0.58, 0]}>
        <mesh scale={[1, 0.92, 0.96]}>
          <sphereGeometry args={[0.3, 24, 18]} />
          <GraphiteMaterial color="#18191c" />
        </mesh>
        <mesh position={[0, -0.018, 0.232]} rotation={[Math.PI / 2, 0, 0]} scale={[1.18, 1, 0.62]}>
          <cylinderGeometry args={[0.168, 0.168, 0.042, 24]} />
          <GraphiteMaterial color="#101114" />
        </mesh>
        <mesh position={[0, -0.018, 0.252]} rotation={[Math.PI / 2, 0, 0]} scale={[1.12, 1, 0.58]}>
          <cylinderGeometry args={[0.15, 0.15, 0.018, 24]} />
          <meshPhysicalMaterial
            ref={visorMat}
            color="#07080b"
            metalness={0.28}
            roughness={0.05}
            clearcoat={0.82}
            clearcoatRoughness={0.1}
            emissive="#cfc8bc"
            emissiveIntensity={0.16}
          />
        </mesh>
        <mesh position={[0, 0.055, 0.258]}>
          <boxGeometry args={[0.22, 0.006, 0.008]} />
          <meshPhysicalMaterial color="#3a3b40" metalness={0.85} roughness={0.2} />
        </mesh>
        <group ref={visor} position={[0, -0.015, 0.285]}>
          <mesh ref={leftEye} position={[-0.072, 0, 0]} scale={[1.55, 0.42, 1]}>
            <sphereGeometry args={[0.022, 12, 10]} />
            <meshPhysicalMaterial
              ref={leftEyeMat}
              color="#eceae4"
              emissive="#f3efe6"
              emissiveIntensity={0.48}
              metalness={0.05}
              roughness={0.22}
            />
          </mesh>
          <mesh ref={rightEye} position={[0.072, 0, 0]} scale={[1.55, 0.42, 1]}>
            <sphereGeometry args={[0.022, 12, 10]} />
            <meshPhysicalMaterial
              ref={rightEyeMat}
              color="#eceae4"
              emissive="#f3efe6"
              emissiveIntensity={0.48}
              metalness={0.05}
              roughness={0.22}
            />
          </mesh>
        </group>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.16, 8]} />
          <GraphiteMaterial color="#2c2d31" />
        </mesh>
        <mesh position={[0, 0.39, 0]}>
          <sphereGeometry args={[0.022, 10, 10]} />
          <meshPhysicalMaterial
            ref={antennaLight}
            color="#d8d4cc"
            emissive="#f4f1ea"
            emissiveIntensity={0.32}
            metalness={0.4}
            roughness={0.22}
          />
        </mesh>
      </group>
    </group>
  )
}

function CameraAim() {
  const { camera } = useThree()
  useEffect(() => {
    camera.lookAt(0, 0.04, 0)
  }, [camera])
  return null
}

function AssistantScene({ mouseRef, hoverRef, clickRef, reduceMotionRef, activeRef }) {
  return (
    <>
      <CameraAim />
      <hemisphereLight skyColor="#f2eee6" groundColor="#141416" intensity={0.42} />
      <ambientLight intensity={0.28} />
      <directionalLight position={[2.4, 3.1, 2.2]} intensity={1.08} color="#f4f0e8" />
      <directionalLight position={[-2.8, 1.4, -2.1]} intensity={0.52} color="#a8abb4" />
      <pointLight position={[0.15, 0.55, 1.6]} intensity={0.22} color="#efeae1" distance={4} />
      <AssistantBot
        mouseRef={mouseRef}
        hoverRef={hoverRef}
        clickRef={clickRef}
        reduceMotionRef={reduceMotionRef}
        activeRef={activeRef}
      />
    </>
  )
}

function StaticFallback() {
  return (
    <div className="assistant-fallback" aria-hidden="true">
      <span className="assistant-fallback-antenna" />
      <span className="assistant-fallback-head" />
      <span className="assistant-fallback-body" />
    </div>
  )
}

function CampusAssistant3D() {
  const [webgl] = useState(() => (typeof window === 'undefined' ? true : detectWebGL()))
  const [helpOpen, setHelpOpen] = useState(false)
  const [inView, setInView] = useState(true)
  const stageRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const hoverRef = useRef(false)
  const clickRef = useRef(0)
  const reduceMotionRef = useRef(false)
  const activeRef = useRef(true)
  const coarsePointerRef = useRef(false)

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarse = window.matchMedia('(pointer: coarse)')
    const sync = () => {
      reduceMotionRef.current = motion.matches
      coarsePointerRef.current = coarse.matches
    }
    sync()
    motion.addEventListener('change', sync)
    coarse.addEventListener('change', sync)
    return () => {
      motion.removeEventListener('change', sync)
      coarse.removeEventListener('change', sync)
    }
  }, [])

  useEffect(() => {
    const node = stageRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting
        setInView(visible)
        activeRef.current = visible
      },
      { threshold: 0.08 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onMove = (event) => {
      if (coarsePointerRef.current) return
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const activate = useCallback(() => {
    clickRef.current = 1
    setHelpOpen(true)
  }, [])

  const onStagePointer = (inside) => {
    hoverRef.current = inside
  }

  const onKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      activate()
    }
    if (event.key === 'Escape') setHelpOpen(false)
  }

  return (
    <div className="assistant-block">
      <div
        ref={stageRef}
        className={helpOpen ? 'assistant-stage is-open' : 'assistant-stage'}
        role="button"
        tabIndex={0}
        aria-label="CampusFinder interactive AI assistant"
        aria-expanded={helpOpen}
        onClick={activate}
        onKeyDown={onKeyDown}
        onPointerEnter={() => onStagePointer(true)}
        onPointerLeave={() => onStagePointer(false)}
        onPointerDown={(event) => {
          if (!coarsePointerRef.current) return
          mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
          mouseRef.current.y = (event.clientY / window.innerHeight) * 2 - 1
        }}
      >
        {webgl ? (
          <Canvas
            className="assistant-canvas"
            dpr={[1, 1.5]}
            frameloop={inView ? 'always' : 'never'}
            gl={{ antialias: true, alpha: true, powerPreference: 'low-power', stencil: false }}
            camera={{ position: [1.05, 0.42, 3.45], fov: 28 }}
            resize={{ scroll: false }}
          >
            <Suspense fallback={null}>
              <AssistantScene
                mouseRef={mouseRef}
                hoverRef={hoverRef}
                clickRef={clickRef}
                reduceMotionRef={reduceMotionRef}
                activeRef={activeRef}
              />
            </Suspense>
          </Canvas>
        ) : (
          <StaticFallback />
        )}
      </div>

      <p className="assistant-label">
        CampusFinder
        <span>AI Assistant</span>
      </p>
      <p className="assistant-status">
        <span className="assistant-status-dot" aria-hidden="true" />
        Online
      </p>

      {helpOpen && (
        <div
          className="assistant-help"
          role="dialog"
          aria-label="Need help finding something?"
          onClick={(event) => event.stopPropagation()}
        >
          <p>Need help finding something?</p>
          <div className="assistant-help-actions">
            <Link to="/reports/new?type=lost" className="assistant-help-primary">Lost something?</Link>
            <Link to="/reports/new?type=found" className="assistant-help-secondary">Found something?</Link>
          </div>
          <button type="button" className="assistant-help-close" onClick={() => setHelpOpen(false)}>
            Close
          </button>
        </div>
      )}
    </div>
  )
}

export default CampusAssistant3D
