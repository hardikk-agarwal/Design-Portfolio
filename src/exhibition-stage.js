import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js'
import { exhibits } from './exhibits.js'

export function createExhibition(host, { index = 0, centered = false, interactive = true } = {}) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'default', preserveDrawingBuffer: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.shadowMap.autoUpdate = false
  renderer.shadowMap.needsUpdate = true
  renderer.setClearColor('#000000', 0)
  renderer.domElement.className = 'exhibition-canvas'
  renderer.domElement.setAttribute('aria-hidden', 'true')
  host.dataset.renderer = 'image'
  host.prepend(renderer.domElement)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60)
  const bindings = new AbortController()
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const geometries = new Set()
  const materials = new Set()
  const ambient = new THREE.HemisphereLight('#f7fbff', '#535b66', 2)
  const key = new THREE.DirectionalLight('#fff4e4', 3.8)
  key.position.set(-4, 7, 7)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 6, bottom: -6, near: 0.5, far: 25 })
  key.shadow.normalBias = 0.025
  key.shadow.bias = -0.0001
  const rim = new THREE.DirectionalLight('#bddef6', 2.2)
  rim.position.set(5, 3, -4)
  scene.add(ambient, key, rim)

  function material(color, options = {}) {
    const surface = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.12, ...options })
    materials.add(surface)
    return surface
  }
  function mesh(parent, geometry, surface, position = [0, 0, 0], rotation = [0, 0, 0]) {
    geometries.add(geometry)
    const object = new THREE.Mesh(geometry, surface)
    object.position.set(...position)
    object.rotation.set(...rotation)
    object.castShadow = object.receiveShadow = true
    parent.add(object)
    return object
  }
  function roundedPath(path, left, bottom, width, height, radius) {
    path.moveTo(left + radius, bottom)
    path.lineTo(left + width - radius, bottom)
    path.quadraticCurveTo(left + width, bottom, left + width, bottom + radius)
    path.lineTo(left + width, bottom + height - radius)
    path.quadraticCurveTo(left + width, bottom + height, left + width - radius, bottom + height)
    path.lineTo(left + radius, bottom + height)
    path.quadraticCurveTo(left, bottom + height, left, bottom + height - radius)
    path.lineTo(left, bottom + radius)
    path.quadraticCurveTo(left, bottom, left + radius, bottom)
    return path
  }
  function extrude(shape, depth = 0.4) {
    const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: 0.045, bevelThickness: 0.045, bevelSegments: 6, steps: 1, curveSegments: 32 })
    geometry.translate(0, 0, -depth / 2)
    const capNormals = geometry.getAttribute('normal')
    const smooth = toCreasedNormals(geometry)
    const normals = smooth.getAttribute('normal')
    for (const group of smooth.groups) {
      if (group.materialIndex !== 0) continue
      for (let vertex = group.start; vertex < group.start + group.count; vertex++) {
        normals.setXYZ(vertex, capNormals.getX(vertex), capNormals.getY(vertex), capNormals.getZ(vertex))
      }
    }
    return smooth
  }
  function portal() {
    const shape = new THREE.Shape()
    shape.moveTo(-1.25, -1.6)
    shape.lineTo(-1.25, 1.04)
    shape.quadraticCurveTo(-1.25, 1.64, -0.65, 1.64)
    shape.lineTo(0.65, 1.64)
    shape.quadraticCurveTo(1.25, 1.64, 1.25, 1.04)
    shape.lineTo(1.25, -1.6)
    shape.lineTo(0.69, -1.6)
    shape.lineTo(0.69, 0.91)
    shape.quadraticCurveTo(0.69, 1.08, 0.52, 1.08)
    shape.lineTo(-0.52, 1.08)
    shape.quadraticCurveTo(-0.69, 1.08, -0.69, 0.91)
    shape.lineTo(-0.69, -1.6)
    shape.closePath()
    return extrude(shape, 0.48)
  }

  const builders = {
    store(group) {
      const frame = portal()
      const paper = material('#f2e8da')
      const coral = material('#d38788')
      const wine = material('#813449')
      mesh(group, frame, wine, [0.66, 0, -1.42])
      mesh(group, frame, coral, [0.33, 0, -0.71])
      mesh(group, frame, paper)
      mesh(group, new RoundedBoxGeometry(1.31, 0.11, 4.05, 3, 0.03), paper, [0.12, -1.56, -0.25])
    },
    copilot(group) {
      const outline = roundedPath(new THREE.Shape(), -0.86, -0.86, 1.72, 1.72, 0.28)
      outline.holes.push(roundedPath(new THREE.Path(), -0.42, -0.42, 0.84, 0.84, 0.12))
      const frame = extrude(outline, 0.4)
      const colors = ['#dae5f6', '#d9e990', '#7d9aca', '#f0efe4']
      const positions = [[-0.94, 0.94, -0.2], [0.94, 0.94, 0.1], [-0.94, -0.94, 0.16], [0.94, -0.94, -0.16]]
      positions.forEach((position, index) => mesh(group, frame, material(colors[index]), position, [0.04, index % 2 ? -0.11 : 0.11, index % 2 ? 0.07 : -0.07]))
    },
    hello(group) {
      const surface = material('#2e4030', { roughness: 0.25, metalness: 0.25 })
      for (let ridge = 0; ridge < 15; ridge += 1) {
        const radius = 0.18 + ridge * 0.089
        const height = 0.32 + ridge * 0.113
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-radius, -0.96 - ridge * 0.025, 0),
          new THREE.Vector3(-radius, 0.14, 0.03),
          new THREE.Vector3(-radius * 0.78, height * 0.79, 0.08),
          new THREE.Vector3(0, height, 0.14),
          new THREE.Vector3(radius * 0.78, height * 0.79, 0.08),
          new THREE.Vector3(radius * 0.96, 0.08, 0),
          new THREE.Vector3(radius * 0.72, -0.72, -0.13),
          new THREE.Vector3(radius * 0.43, -1.38 - ridge * 0.012, -0.18),
        ])
        mesh(group, new THREE.TubeGeometry(curve, 64, 0.026, 10, false), surface)
      }
    },
    vr(group) {
      mesh(group, portal(), material('#efe8d9'), [0.05, 0.15, -0.48], [0, 0.08, -0.08])
      const corner = new THREE.Shape()
      corner.moveTo(-1.05, -0.98)
      corner.lineTo(-1.05, 1.16)
      corner.lineTo(-0.38, 1.16)
      corner.lineTo(-0.38, -0.32)
      corner.lineTo(1.01, -0.32)
      corner.lineTo(1.01, -0.98)
      corner.closePath()
      mesh(group, extrude(corner, 0.6), material('#345675'), [-0.94, -0.7, 0.36], [0, -0.08, 0.04])
      const wedge = new THREE.Shape()
      wedge.moveTo(-0.82, -0.83)
      wedge.lineTo(0.82, -0.83)
      wedge.lineTo(0, 0.8)
      wedge.closePath()
      mesh(group, extrude(wedge, 0.64), material('#c3d982'), [1.31, -0.86, 0.38], [0, -0.1, -0.14])
    },
  }

  const models = exhibits.map((exhibit, exhibitIndex) => {
    const content = new THREE.Group()
    builders[exhibit.id](content)
    const bounds = new THREE.Box3().setFromObject(content)
    const size = bounds.getSize(new THREE.Vector3())
    const center = bounds.getCenter(new THREE.Vector3())
    content.position.sub(center)
    const group = new THREE.Group()
    group.userData.exhibitIndex = exhibitIndex
    group.add(content)
    scene.add(group)
    const scale = 4.15 / Math.max(size.y, size.x * 0.85)
    return { group, scale, baseY: size.y * scale / 2 - 2.12, angle: exhibit.id === 'hello' ? -0.22 : -0.46 }
  })
  const shadow = new THREE.ShadowMaterial({ opacity: 0.19, color: '#262125', depthWrite: false })
  materials.add(shadow)
  const floorGeometry = new THREE.PlaneGeometry(35, 25)
  geometries.add(floorGeometry)
  const floor = new THREE.Mesh(floorGeometry, shadow)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -2.14
  floor.receiveShadow = true
  scene.add(floor)
  let ready = false
  let mobile = false
  let target = index
  let position = index
  let frame = 0
  let active = true
  let disposed = false
  let lost = false
  let previousTime = performance.now()
  let dragOrigin = null
  let dragPosition = index
  const pointer = new THREE.Vector2()
  const tilt = new THREE.Vector2()
  const raycaster = new THREE.Raycaster()
  const hitPoint = new THREE.Vector2()

  async function prepareScene() {
    try {
      await renderer.compileAsync(scene, camera)
      if (disposed || lost) return
      ready = true
      invalidate()
    } catch {
      if (!disposed) host.dataset.renderer = 'image'
    }
  }

  function pick(horizontal, vertical) {
    if (!ready || lost) return null
    const bounds = host.getBoundingClientRect()
    hitPoint.set((horizontal - bounds.left) / bounds.width * 2 - 1, -(vertical - bounds.top) / bounds.height * 2 + 1)
    raycaster.setFromCamera(hitPoint, camera)
    let object = raycaster.intersectObjects(models.filter(model => model.group.visible).map(model => model.group), true)[0]?.object
    while (object && object.userData.exhibitIndex === undefined) object = object.parent
    return object?.userData.exhibitIndex ?? null
  }

  function invalidate() { if (!frame && ready && active && !disposed && !lost && !document.hidden) frame = requestAnimationFrame(render) }
  function render(time) {
    frame = 0
    const delta = Math.min(0.05, (time - previousTime) / 1000)
    previousTime = time
    const amount = reduced.matches ? 1 : 1 - Math.exp(-delta * 12)
    position = dragOrigin === null ? THREE.MathUtils.lerp(position, target, amount) : dragPosition
    tilt.lerp(reduced.matches ? new THREE.Vector2() : pointer, amount)
    const moving = dragOrigin === null && Math.abs(position - target) > 0.001 || tilt.distanceTo(reduced.matches ? new THREE.Vector2() : pointer) > 0.001
    if (!moving && dragOrigin === null) position = target
    models.forEach((model, modelIndex) => {
      let offset = ((modelIndex - position) % exhibits.length + exhibits.length) % exhibits.length
      if (offset > exhibits.length / 2) offset -= exhibits.length
      const distance = Math.abs(offset)
      model.group.position.set((mobile || centered ? 0 : 2.1) + offset * 9.1 + tilt.x * 0.08, model.baseY + Math.sin(Math.min(distance, 1) * Math.PI) * 0.35, -distance * 1.4)
      model.group.rotation.set(tilt.y * 0.09, model.angle - offset * 0.22 + tilt.x * 0.17, offset * 0.08)
      model.group.scale.setScalar(model.scale * (1 - Math.min(distance, 1) * 0.1))
      model.group.visible = distance < 0.94
    })
    renderer.shadowMap.needsUpdate = true
    renderer.render(scene, camera)
    host.dataset.renderer = 'webgl'
    host.dataset.moving = String(moving)
    if (moving) invalidate()
  }
  function resize() {
    const { width, height } = host.getBoundingClientRect()
    if (!width || !height) return
    mobile = width < 800
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    camera.position.set(0, 0.65, Math.max(9.5, 5.8 / (2 * tangent * camera.aspect * 0.92)))
    camera.lookAt(0, -0.16, 0)
    camera.updateProjectionMatrix()
    invalidate()
  }
  function updateTheme() {
    const dark = document.documentElement.dataset.theme === 'dark'
    ambient.intensity = dark ? 1.65 : 2
    key.intensity = dark ? 3.5 : 3.8
    invalidate()
  }
  host.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return
    const bounds = host.getBoundingClientRect()
    pointer.set((event.clientX - bounds.left) / bounds.width - 0.5, (event.clientY - bounds.top) / bounds.height - 0.5)
    if (interactive) host.style.cursor = dragOrigin !== null ? 'grabbing' : pick(event.clientX, event.clientY) === null ? 'grab' : 'pointer'
    invalidate()
  }, { signal: bindings.signal })
  host.addEventListener('pointerleave', () => { pointer.set(0, 0); invalidate() }, { signal: bindings.signal })
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0 }
    else invalidate()
  }, { signal: bindings.signal })
  reduced.addEventListener('change', invalidate, { signal: bindings.signal })
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault()
    lost = true
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    host.dataset.renderer = 'image'
  }, { signal: bindings.signal })
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    lost = false
    ready = false
    prepareScene()
  }, { signal: bindings.signal })
  const observer = new ResizeObserver(resize)
  observer.observe(host)
  resize()
  updateTheme()
  prepareScene()
  return {
    pick,
    drag(horizontal) {
      if (dragOrigin === null) dragOrigin = position
      const height = host.getBoundingClientRect().height
      const worldHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z
      const pixelsPerExhibit = height * 9.1 / worldHeight
      dragPosition = dragOrigin - THREE.MathUtils.clamp(horizontal / pixelsPerExhibit, -0.95, 0.95)
      pointer.set(0, 0)
      host.dataset.dragging = 'true'
      host.style.cursor = 'grabbing'
      invalidate()
    },
    release() {
      dragOrigin = null
      host.dataset.dragging = 'false'
      host.style.cursor = 'grab'
      invalidate()
    },
    select(next, instant = false) {
      let difference = next - ((target % exhibits.length + exhibits.length) % exhibits.length)
      if (difference > exhibits.length / 2) difference -= exhibits.length
      if (difference < -exhibits.length / 2) difference += exhibits.length
      target += difference
      if (instant || reduced.matches) position = target
      invalidate()
    },
    setActive(value) {
      active = value
      if (!value) { dragOrigin = null; host.dataset.dragging = 'false' }
      if (!value && frame) { cancelAnimationFrame(frame); frame = 0 }
      if (value) resize()
    },
    updateTheme,
    dispose() {
      disposed = true
      if (frame) cancelAnimationFrame(frame)
      bindings.abort()
      observer.disconnect()
      for (const geometry of geometries) geometry.dispose()
      for (const surface of materials) surface.dispose()
      key.shadow.map?.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}