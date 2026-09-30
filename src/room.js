import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import oakColorUrl from './assets/oak-color.jpg'
import oakNormalUrl from './assets/oak-normal.jpg'
import oakRoughnessUrl from './assets/oak-roughness.jpg'
import nebulaUrl from './assets/orion-nebula.jpg'

export function createRoom(stage, callbacks = {}) {
  RectAreaLightUniformsLib.init()
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.VSMShadowMap
  renderer.shadowMap.autoUpdate = false
  renderer.shadowMap.needsUpdate = true
  renderer.domElement.className = 'room-canvas'
  renderer.domElement.setAttribute('aria-hidden', 'true')
  const cssRenderer = new CSS3DRenderer()
  cssRenderer.domElement.className = 'room-surfaces'
  stage.append(cssRenderer.domElement, renderer.domElement)

  const scene = new THREE.Scene()
  const cssScene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(44, 1, 0.05, 120)
  const lensCamera = new THREE.PerspectiveCamera(40, 1.6, 0.1, 90)
  const liveTarget = new THREE.WebGLRenderTarget(640, 400)
  liveTarget.texture.colorSpace = THREE.SRGBColorSpace
  const orbit = new OrbitControls(camera, stage)
  orbit.enablePan = false
  orbit.enableZoom = false
  orbit.enableDamping = true
  orbit.dampingFactor = 0.12
  orbit.rotateSpeed = 0.24
  orbit.minAzimuthAngle = -0.46
  orbit.maxAzimuthAngle = 0.46
  orbit.minPolarAngle = 1.18
  orbit.maxPolarAngle = 1.68
  const surfaces = []
  const materials = new Set()
  const textures = new Set()
  const materialLoads = []
  const models = new Map()
  const geometryCache = new Map()
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const world = new THREE.Group()
  scene.add(world)

  const colors = { wall: '#d1d4cf', desk: '#444b49', wood: '#79776d', ink: '#171d21', metal: '#b0b9bc', paper: '#edf0ec', blue: '#425f80', green: '#52654b', red: '#bc5039', warm: '#f4cf95' }
  function material(color, options = {}) {
    const MaterialType = options.clearcoat || options.sheen ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial
    const value = new MaterialType({ color, roughness: 0.6, ...options })
    materials.add(value)
    return value
  }
  const paint = {
    wall: material(colors.wall, { roughness: 0.96 }), desk: material(colors.desk, { roughness: 0.44, clearcoat: 0.2, clearcoatRoughness: 0.5 }), wood: material(colors.wood, { roughness: 0.62 }),
    ink: material(colors.ink, { roughness: 0.36, metalness: 0.15 }), metal: material(colors.metal, { metalness: 0.94, roughness: 0.24 }),
    paper: material(colors.paper, { roughness: 0.88 }), blue: material(colors.blue, { roughness: 0.38 }), green: material(colors.green), red: material(colors.red, { metalness: 0.25, roughness: 0.28, clearcoat: 0.7 }),
    rubber: material('#121719', { roughness: 0.78 }), floor: material('#3c4545', { roughness: 0.9 }),
  }
  function texture(width, height, draw) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    draw(canvas.getContext('2d'), width, height)
    const image = new THREE.CanvasTexture(canvas)
    image.colorSpace = THREE.SRGBColorSpace
    image.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
    textures.add(image)
    return image
  }
  const grain = texture(256, 256, (context, width, height) => {
    const pixels = context.createImageData(width, height)
    let seed = 147
    for (let index = 0; index < pixels.data.length; index += 4) {
      seed = seed * 16807 % 2147483647
      const shade = 114 + seed % 30
      pixels.data.set([shade, shade, shade, 255], index)
    }
    context.putImageData(pixels, 0, 0)
  })
  grain.colorSpace = THREE.NoColorSpace
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping
  grain.repeat.set(6, 6)
  for (const surface of [paint.desk, paint.wall, paint.rubber]) {
    surface.bumpMap = grain
    surface.bumpScale = surface === paint.rubber ? 0.016 : 0.01
  }
  const woodgrain = texture(512, 256, (context, width, height) => {
    context.fillStyle = colors.wood
    context.fillRect(0, 0, width, height)
    context.strokeStyle = colors.ink
    for (let row = 0; row < 130; row += 1) {
      context.globalAlpha = 0.02 + row % 4 * 0.007
      context.beginPath()
      for (let column = 0; column <= width; column += 12) {
        const vertical = row * 2 + Math.sin(column * 0.012 + row * 0.1) * 2
        column ? context.lineTo(column, vertical) : context.moveTo(column, vertical)
      }
      context.stroke()
    }
  })
  paint.wood.map = woodgrain
  paint.wood.color.set('#ffffff')
  const textureLoader = new THREE.TextureLoader()
  materialLoads.push(Promise.all([oakColorUrl, oakNormalUrl, oakRoughnessUrl].map(url => textureLoader.loadAsync(url))).then(([color, normal, roughness]) => {
    if (disposed) { for (const image of [color, normal, roughness]) image.dispose(); return }
    for (const image of [color, normal, roughness]) {
      image.wrapS = image.wrapT = THREE.RepeatWrapping
      image.repeat.set(1.5, 3)
      image.center.set(0.5, 0.5)
      image.rotation = Math.PI / 2
      image.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
      textures.add(image)
    }
    color.colorSpace = THREE.SRGBColorSpace
    for (const surface of [paint.desk, paint.wood]) {
      surface.map = color
      surface.normalMap = normal
      surface.normalScale.set(0.23, 0.23)
      surface.roughnessMap = roughness
      surface.roughness = 0.85
      surface.bumpMap = null
      surface.color.set('#e5e7e4')
      surface.needsUpdate = true
    }
    stage.dataset.materialMaps = '3'
  }))

  function box(parent, dimensions, surface, position = [0, 0, 0], radius = 0.025) {
    const key = `${dimensions},${radius}`
    const segments = radius < 0.02 ? 1 : radius < 0.07 ? 3 : 4
    if (!geometryCache.has(key)) geometryCache.set(key, new RoundedBoxGeometry(...dimensions, segments, Math.min(radius, ...dimensions.map(size => size / 3))))
    const mesh = new THREE.Mesh(geometryCache.get(key), surface)
    mesh.position.set(...position)
    mesh.castShadow = mesh.receiveShadow = true
    parent.add(mesh)
    return mesh
  }
  function cylinder(parent, radiusTop, radiusBottom, height, surface, position = [0, 0, 0], segments = 48) {
    const detail = Math.min(segments, Math.max(16, Math.ceil(Math.max(radiusTop, radiusBottom) * 300)))
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, detail), surface)
    mesh.position.set(...position)
    mesh.castShadow = mesh.receiveShadow = true
    parent.add(mesh)
    return mesh
  }
  function bar(parent, from, to, radius, surface) {
    const start = new THREE.Vector3(...from)
    const end = new THREE.Vector3(...to)
    const mesh = cylinder(parent, radius, radius, start.distanceTo(end), surface)
    mesh.position.copy(start.clone().add(end).multiplyScalar(0.5))
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize())
    return mesh
  }
  function ring(parent, radius, tube, surface, position = [0, 0, 0]) {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 16, 80), surface)
    mesh.position.set(...position)
    parent.add(mesh)
    return mesh
  }
  function cable(parent, points, radius = 0.013, surface = paint.rubber) {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)))
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, radius < 0.01 ? 24 : 36, radius, 6, false), surface)
    mesh.castShadow = mesh.receiveShadow = true
    parent.add(mesh)
    return mesh
  }
  function ribbon(parent, points, width, surface) {
    const shape = new THREE.Shape()
    shape.moveTo(-width / 2, -0.006)
    shape.lineTo(width / 2, -0.006)
    shape.lineTo(width / 2, 0.006)
    shape.lineTo(-width / 2, 0.006)
    shape.closePath()
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)))
    const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { steps: 48, bevelEnabled: false, extrudePath: curve }), surface)
    mesh.castShadow = mesh.receiveShadow = true
    parent.add(mesh)
    return mesh
  }
  function label(parent, text, width, height, position, background = colors.paper, foreground = colors.ink, size = 44) {
    const image = texture(768, Math.round(768 * height / width), (context, pixelWidth, pixelHeight) => {
      context.fillStyle = background
      context.fillRect(0, 0, pixelWidth, pixelHeight)
      context.fillStyle = foreground
      context.font = `600 ${size}px Manrope, sans-serif`
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(text, pixelWidth / 2, pixelHeight / 2)
    })
    const surface = material('#ffffff', { map: image, emissiveMap: image, emissive: '#ffffff', emissiveIntensity: 0.12 })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), surface)
    mesh.position.set(...position)
    parent.add(mesh)
    return mesh
  }
  function group(id, position) {
    const object = new THREE.Group()
    object.position.set(...position)
    object.userData.action = id
    world.add(object)
    models.set(id, object)
    return object
  }
  function surface(id, parent, width, height, position, pixels = 1000) {
    const element = document.getElementById(id)
    element.style.width = `${pixels}px`
    element.style.height = `${pixels * height / width}px`
    const anchor = new THREE.Group()
    anchor.position.set(...position)
    parent.add(anchor)
    const holeMaterial = new THREE.MeshBasicMaterial({ color: '#000000', opacity: 0, transparent: true, blending: THREE.NoBlending, side: THREE.FrontSide, depthWrite: true })
    materials.add(holeMaterial)
    const hole = new THREE.Mesh(new THREE.PlaneGeometry(width, height), holeMaterial)
    hole.renderOrder = 3
    anchor.add(hole)
    const object = new CSS3DObject(element)
    object.element.style.userSelect = 'text'
    cssScene.add(object)
    const previewMaterial = new THREE.MeshBasicMaterial({ color: id.includes('paper') || id.includes('resume') || id.includes('name') || id.includes('notebook') ? colors.paper : colors.ink, toneMapped: false })
    materials.add(previewMaterial)
    const entry = { id, anchor, object, hole, holeMaterial, previewMaterial, element, ratio: width / pixels, enabled: true, previewTexture: null }
    surfaces.push(entry)
    return entry
  }
  function contact(position, width, depth) {
    const image = texture(96, 96, (context) => {
      const shadow = context.createRadialGradient(48, 48, 4, 48, 48, 46)
      shadow.addColorStop(0, 'rgba(14,25,26,.35)')
      shadow.addColorStop(1, 'rgba(14,25,26,0)')
      context.fillStyle = shadow
      context.fillRect(0, 0, 96, 96)
    })
    const shadowMaterial = new THREE.MeshBasicMaterial({ map: image, transparent: true, depthWrite: false })
    materials.add(shadowMaterial)
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), shadowMaterial)
    shadow.rotation.x = -Math.PI / 2
    shadow.position.set(...position)
    world.add(shadow)
  }

  box(world, [40, 0.2, 40], paint.floor, [0, -0.15, 0])
  box(world, [10.5, 8.2, 0.2], paint.wall, [-1.45, 4.05, -3.55])
  box(world, [0.2, 8.2, 13], paint.wall, [-6.7, 4.05, 2.9])
  box(world, [0.2, 8.2, 13], paint.wall, [7, 4.05, 2.9])
  box(world, [13.7, 0.16, 13], paint.wall, [0.15, 8.18, 2.9])
  box(world, [3.5, 1.8, 0.2], paint.wall, [5.55, 0.9, -3.55])
  box(world, [3.5, 1.7, 0.2], paint.wall, [5.55, 7.35, -3.55])
  for (const horizontal of [3.79, 7.28]) box(world, [0.1, 4.9, 0.31], paint.wood, [horizontal, 4.2, -3.47])
  for (const vertical of [1.79, 4.28, 6.65]) box(world, [3.52, 0.09, 0.31], paint.wood, [5.55, vertical, -3.47])
  box(world, [0.055, 4.9, 0.15], paint.paper, [5.57, 4.2, -3.31])
  box(world, [3.72, 0.14, 0.62], paint.wood, [5.55, 1.76, -3.25])
  for (let index = 0; index < 18; index += 1) box(world, [0.052, 6, 0.045], paint.wood, [-6.49, 3.8, -2.6 + index * 0.19])
  box(world, [10.1, 0.1, 0.05], paint.wood, [-1.55, 1.2, -3.42])

  const nightTexture = texture(1024, 640, (context, width, height) => {
    context.fillStyle = '#111f30'
    context.fillRect(0, 0, width, height)
    let seed = 1603
    for (let index = 0; index < 380; index += 1) {
      seed = seed * 16807 % 2147483647
      const horizontal = seed % width
      seed = seed * 16807 % 2147483647
      const vertical = seed % height
      context.fillStyle = `rgba(217,232,246,${0.15 + index % 5 * 0.08})`
      context.fillRect(horizontal, vertical, index % 9 === 0 ? 1.5 : 0.8, index % 9 === 0 ? 1.5 : 0.8)
    }
    const stars = [[655, 172, 4, '#efc29c'], [412, 193, 3, '#e2edff'], [570, 304, 2.5, '#d9eaff'], [530, 310, 2.7, '#e9f3ff'], [490, 320, 2.5, '#d9eaff'], [375, 475, 4, '#dceaff'], [650, 501, 3, '#d7e7ff']]
    for (const [horizontal, vertical, radius, color] of stars) {
      context.fillStyle = color
      context.beginPath()
      context.arc(horizontal, vertical, radius, 0, Math.PI * 2)
      context.fill()
    }
  })
  const skyMaterial = new THREE.MeshBasicMaterial({ map: nightTexture, toneMapped: false })
  materials.add(skyMaterial)
  const distantSkyMaterial = new THREE.MeshBasicMaterial({ color: '#111f30', toneMapped: false })
  materials.add(distantSkyMaterial)
  const distantSky = new THREE.Mesh(new THREE.PlaneGeometry(100, 65), distantSkyMaterial)
  distantSky.position.set(5.5, 5.7, -26.1)
  world.add(distantSky)
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(20, 12.5), skyMaterial)
  sky.position.set(5.5, 5.7, -26)
  world.add(sky)
  const nebulaMaterial = new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false })
  materials.add(nebulaMaterial)
  const nebula = new THREE.Mesh(new THREE.PlaneGeometry(18.5, 19.03), nebulaMaterial)
  nebula.position.set(5.45, 5.2, -25.8)
  nebula.visible = false
  world.add(nebula)
  materialLoads.push(textureLoader.loadAsync(nebulaUrl).then(image => {
    if (disposed) { image.dispose(); return }
    image.colorSpace = THREE.SRGBColorSpace
    image.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
    textures.add(image)
    nebulaMaterial.map = image
    nebulaMaterial.needsUpdate = true
    stage.dataset.astronomy = 'loaded'
  }))

  const desk = group('desk', [0, 0, 0])
  box(desk, [11.4, 0.22, 4.65], paint.wood, [0, 2.12, -0.18], 0.07)
  box(desk, [11.42, 0.035, 4.67], paint.desk, [0, 2.247, -0.18], 0.012)
  box(desk, [9.4, 0.055, 0.055], paint.ink, [0, 2.29, -2.39], 0.016)
  const diffuser = material('#e9d4b3', { emissive: '#ffdeb4', emissiveIntensity: 1.6, roughness: 0.4 })
  box(desk, [9.3, 0.021, 0.023], diffuser, [0, 2.324, -2.39], 0.006)
  const rearLight = new THREE.RectAreaLight('#ffdbab', 9, 8.7, 0.1)
  rearLight.position.set(0, 2.36, -2.4)
  rearLight.lookAt(0, 4.2, -3.45)
  scene.add(rearLight)
  for (const horizontal of [-4.93, 4.93]) for (const depth of [-1.94, 1.59]) bar(desk, [horizontal, 0, depth], [horizontal, 2, depth], 0.075, paint.ink)
  box(desk, [2, 0.48, 3.85], paint.blue, [-4.17, 1.79, -0.12], 0.08)
  bar(desk, [-4.5, 1.8, 1.85], [-3.88, 1.8, 1.85], 0.024, paint.metal)

  const nameplate = group('resume', [-0.45, 5.53, -3.22])
  box(nameplate, [3.92, 1.02, 0.075], paint.wood, [0, 0, 0], 0.035)
  surface('name-surface', nameplate, 3.76, 0.86, [0, 0, 0.045], 1120)
  for (const horizontal of [-1.48, 1.48]) {
    bar(nameplate, [horizontal, 0.5, 0], [horizontal * 0.78, 1.08, -0.06], 0.009, paint.ink)
    ring(nameplate, 0.035, 0.007, paint.metal, [horizontal * 0.78, 1.08, -0.06])
  }
  const resume = group('resume', [-4.08, 4.63, -3.19])
  resume.rotation.z = -0.035
  box(resume, [1.48, 2.07, 0.07], paint.wood, [0, 0, -0.02])
  box(resume, [1.38, 1.97, 0.035], paint.paper)
  surface('resume-surface', resume, 1.34, 1.91, [0, 0, 0.023], 820)
  box(resume, [0.33, 0.16, 0.05], paint.metal, [0, 1.01, 0.064])
  const resumeRest = { position: resume.position.clone(), quaternion: resume.quaternion.clone() }

  const monitorGroups = []
  const monitorStands = []
  for (const [index, horizontal] of [-1.6, 1.74].entries()) {
    const monitor = group('work', [horizontal, 3.67, -1.5])
    monitor.rotation.y = index === 0 ? 0.035 : -0.045
    box(monitor, [3.105, 1.88, 0.095], paint.ink, [0, 0, 0.015], 0.025)
    box(monitor, [2.85, 1.58, 0.085], paint.rubber, [0, 0.02, -0.055], 0.06)
    box(monitor, [3.055, 1.83, 0.018], paint.rubber, [0, 0, 0.073], 0.012)
    box(monitor, [3.02, 0.043, 0.018], paint.ink, [0, -0.906, 0.089], 0.008)
    surface(index === 0 ? 'catalog-surface' : 'work-surface', monitor, 2.99, 1.765, [0, 0, 0.103], 1000)
    monitorStands.push(box(monitor, [0.105, 0.48, 0.145], paint.metal, [0, -1.15, -0.04], 0.018))
    monitorStands.push(box(monitor, [1.08, 0.034, 0.53], paint.ink, [0, -1.385, 0.06], 0.013))
    monitorStands.push(box(monitor, [1.055, 0.008, 0.505], paint.metal, [0, -1.365, 0.06], 0.008))
    for (let vent = 0; vent < 20; vent += 1) box(monitor, [0.065, 0.003, 0.018], paint.rubber, [-0.95 + vent * 0.1, 0.951, -0.016], 0.001)
    const led = material('#9cd2d3', { emissive: '#9cd2d3', emissiveIntensity: 0.75 })
    box(monitor, [0.025, 0.013, 0.005], led, [1.37, -0.955, 0.065], 0.002)
    monitorGroups.push(monitor)
    contact([horizontal, 2.269, -1.28], 2, 1.1)
    cable(world, [[horizontal, 2.68, -1.66], [horizontal + 0.18, 2.31, -1.8], [horizontal + 0.35, 2.285, -1.96], [0.4, 2.283, -2.08]], 0.011)
  }
  const portraitRig = new THREE.Group()
  box(portraitRig, [0.11, 3.5, 0.12], paint.metal, [0, 4, -1.74])
  box(portraitRig, [0.74, 0.08, 0.44], paint.ink, [0, 2.31, -1.6])
  world.add(portraitRig)
  const monitorLight = new THREE.PointLight('#b5deee', 2, 5)
  monitorLight.position.set(0, 3.4, -0.3)
  scene.add(monitorLight)

  const weave = texture(128, 128, context => {
    context.fillStyle = '#32383b'
    context.fillRect(0, 0, 128, 128)
    for (let row = 0; row < 32; row += 1) for (let column = 0; column < 32; column += 1) {
      context.fillStyle = (row + column) % 2 ? '#41464a' : '#262d30'
      context.fillRect(column * 4, row * 4, 3, 2)
    }
  })
  weave.wrapS = weave.wrapT = THREE.RepeatWrapping
  weave.repeat.set(12, 5)
  const fabric = material('#c2c7c6', { map: weave, roughness: 0.98, sheen: 0.25, sheenColor: new THREE.Color('#777e80') })
  box(world, [4.45, 0.021, 1.75], fabric, [-0.02, 2.272, 0.82], 0.01)
  cable(world, [[-2.14, 2.286, 1.64], [0, 2.286, 1.66], [2.1, 2.286, 1.64]], 0.003, paint.ink)
  const keyboard = new THREE.Group()
  keyboard.position.set(-0.52, 2.337, 0.9)
  keyboard.rotation.y = -0.035
  world.add(keyboard)
  box(keyboard, [2.42, 0.09, 0.87], paint.metal, [0, 0, 0], 0.035)
  box(keyboard, [2.35, 0.023, 0.8], paint.ink, [0, 0.052, 0], 0.017)
  const keyRows = [
    [['esc', 1, 'red'], '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', ['back', 1.6]],
    [['tab', 1.5], 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', ['del', 1.1]],
    [['caps', 1.8], 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", ['enter', 1.8, 'blue']],
    [['shift', 2.1], 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', ['shift', 1.5], 'up'],
    [['ctrl', 1.2], ['win', 1.1], ['alt', 1.1], ['', 5.3], ['alt', 1.1], ['fn', 1.1], 'left', 'down', 'right'],
  ]
  const keycaps = []
  keyRows.forEach((row, rowIndex) => {
    const entries = row.map(entry => Array.isArray(entry) ? entry : [entry, 1])
    const unit = 2.245 / entries.reduce((total, entry) => total + entry[1], 0)
    let cursor = -1.1225
    for (const [legend, units, accent] of entries) {
      const keyWidth = units * unit
      keycaps.push({ legend, width: keyWidth - 0.017, x: cursor + keyWidth / 2, z: -0.301 + rowIndex * 0.15, accent })
      cursor += keyWidth
    }
  })
  const keys = new THREE.InstancedMesh(new RoundedBoxGeometry(0.125, 0.053, 0.125, 3, 0.011), paint.paper, keycaps.length)
  const matrixObject = new THREE.Object3D()
  keycaps.forEach((keycap, index) => {
    matrixObject.position.set(keycap.x, 0.089, keycap.z)
    matrixObject.scale.set(keycap.width / 0.125, 1, 1)
    matrixObject.updateMatrix()
    keys.setMatrixAt(index, matrixObject.matrix)
    keys.setColorAt(index, new THREE.Color(keycap.accent ? colors[keycap.accent] : '#d8dddc'))
  })
  keys.castShadow = keys.receiveShadow = true
  keyboard.add(keys)
  const legends = texture(2048, 768, (context, pixelWidth, pixelHeight) => {
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    for (const keycap of keycaps) {
      context.font = `500 ${keycap.legend.length > 1 ? 16 : 23}px Manrope, sans-serif`
      context.fillStyle = keycap.accent ? '#e9eeeb' : '#354047'
      context.fillText(keycap.legend, (keycap.x / 2.38 + 0.5) * pixelWidth, (keycap.z / 0.83 + 0.5) * pixelHeight)
    }
  })
  const legendMaterial = material('#ffffff', { map: legends, transparent: true, alphaTest: 0.05, depthWrite: false, roughness: 0.8 })
  const legendPlane = new THREE.Mesh(new THREE.PlaneGeometry(2.38, 0.83), legendMaterial)
  legendPlane.rotation.x = -Math.PI / 2
  legendPlane.position.y = 0.118
  keyboard.add(legendPlane)
  box(keyboard, [0.115, 0.044, 0.1], paint.rubber, [0.75, 0.009, -0.46], 0.012)
  cable(world, [[0.22, 2.35, 0.41], [0.37, 2.29, 0.22], [0.55, 2.286, -0.12], [0.34, 2.286, -1.1], [0.4, 2.286, -2.08]], 0.013)
  const mouse = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), paint.paper)
  mouse.scale.set(0.25, 0.12, 0.4)
  mouse.position.set(1.36, 2.36, 0.84)
  world.add(mouse)
  const scrollWheel = cylinder(world, 0.026, 0.026, 0.052, paint.rubber, [1.36, 2.477, 0.73], 28)
  scrollWheel.rotation.z = Math.PI / 2
  cable(world, [[1.36, 2.412, 0.51], [1.36, 2.464, 0.62], [1.36, 2.48, 0.8]], 0.005, paint.ink)
  contact([1.36, 2.286, 0.84], 0.69, 0.94)

  const pc = group('work', [4.44, 3.14, -0.82])
  pc.rotation.y = -0.26
  const caseMetal = material('#626a6f', { metalness: 0.7, roughness: 0.31 })
  box(pc, [1.39, 0.045, 1.36], caseMetal, [0, 0.86, 0], 0.014)
  box(pc, [1.39, 0.055, 1.36], paint.ink, [0, -0.86, 0], 0.015)
  box(pc, [0.045, 1.74, 1.36], caseMetal, [-0.68, 0, 0], 0.013)
  box(pc, [0.045, 1.74, 1.36], paint.ink, [0.68, 0, 0], 0.013)
  box(pc, [1.32, 1.69, 0.035], paint.rubber, [0, 0, -0.66])
  box(pc, [1.23, 0.3, 1.17], paint.ink, [0, -0.65, 0], 0.013)
  box(pc, [0.58, 1.02, 0.025], paint.rubber, [-0.3, 0.18, -0.55])
  box(pc, [0.38, 0.41, 0.13], paint.metal, [-0.32, 0.34, -0.45], 0.012)
  for (let fin = 0; fin < 13; fin += 1) box(pc, [0.023, 0.4, 0.18], caseMetal, [-0.5 + fin * 0.029, 0.34, -0.32], 0.003)
  for (let slot = 0; slot < 2; slot += 1) box(pc, [0.035, 0.41, 0.034], paint.blue, [-0.04 + slot * 0.06, 0.36, -0.43], 0.004)
  box(pc, [0.83, 0.12, 0.52], caseMetal, [-0.13, -0.19, -0.16], 0.01)
  box(pc, [0.83, 0.055, 0.045], paint.rubber, [-0.13, -0.18, 0.124], 0.003)
  cable(pc, [[-0.32, 0.42, -0.33], [-0.45, 0.72, -0.05], [0.2, 0.74, 0.15], [0.29, 0.5, 0.41]], 0.025)
  cable(pc, [[-0.31, 0.23, -0.33], [-0.51, 0.64, 0.04], [0.14, 0.68, 0.21], [0.3, 0.39, 0.4]], 0.025)
  for (let wire = 0; wire < 4; wire += 1) cable(pc, [[-0.14 + wire * 0.025, -0.14, 0.12], [-0.13 + wire * 0.025, -0.38, 0.21], [0.06 + wire * 0.025, -0.52, 0.16]], 0.008)
  const fanColors = ['#7ba8b2', '#c0cbc2', '#7ba8b2']
  const fanMaterials = fanColors.map(color => material(color, { emissive: color, emissiveIntensity: 0.35, roughness: 0.32 }))
  for (let index = 0; index < 3; index += 1) {
    const vertical = 0.52 - index * 0.52
    box(pc, [0.49, 0.49, 0.105], paint.rubber, [0.34, vertical, 0.36], 0.025)
    ring(pc, 0.218, 0.013, fanMaterials[index], [0.34, vertical, 0.426])
    ring(pc, 0.198, 0.004, paint.metal, [0.34, vertical, 0.424])
    for (let bladeIndex = 0; bladeIndex < 7; bladeIndex += 1) {
      const angle = bladeIndex * Math.PI * 2 / 7
      const blade = box(pc, [0.157, 0.061, 0.011], caseMetal, [0.34 + Math.cos(angle) * 0.11, vertical + Math.sin(angle) * 0.11, 0.407], 0.02)
      blade.rotation.z = angle + 0.66
    }
    const center = cylinder(pc, 0.063, 0.063, 0.024, paint.ink, [0.34, vertical, 0.436])
    center.rotation.x = Math.PI / 2
  }
  const glass = material('#b9ced5', { transparent: true, opacity: 0.16, metalness: 0.3, roughness: 0.1, clearcoat: 1, depthWrite: false })
  box(pc, [1.3, 1.65, 0.012], glass, [0, 0, 0.692])
  for (const horizontal of [-0.64, 0.64]) box(pc, [0.025, 1.65, 0.019], caseMetal, [horizontal, 0, 0.709], 0.004)
  for (let vent = 0; vent < 19; vent += 1) box(pc, [0.79, 0.002, 0.016], paint.rubber, [0.08, 0.884, -0.52 + vent * 0.048], 0.001)
  const casePower = cylinder(pc, 0.038, 0.038, 0.007, paint.metal, [-0.47, 0.889, 0.44], 32)
  for (const horizontal of [-0.36, -0.21]) box(pc, [0.09, 0.002, 0.031], paint.rubber, [horizontal, 0.885, 0.44], 0.003)
  for (const horizontal of [-0.6, 0.6]) for (const vertical of [-0.76, 0.76]) {
    const screw = cylinder(pc, 0.018, 0.018, 0.01, paint.metal, [horizontal, vertical, 0.715], 16)
    screw.rotation.x = Math.PI / 2
  }
  contact([4.44, 2.269, -0.82], 1.8, 1.75)

  const notebook = group('notebook', [-2.24, 2.31, 0.3])
  notebook.rotation.set(-Math.PI / 2, 0, -0.15)
  box(notebook, [1.44, 1.91, 0.07], paint.blue, [0, 0, -0.025])
  box(notebook, [1.34, 1.82, 0.025], paint.paper)
  surface('notebook-surface', notebook, 1.29, 1.77, [0, 0, 0.02], 820)
  for (let index = 0; index < 8; index += 1) ring(notebook, 0.042, 0.009, paint.metal, [-0.68, -0.65 + index * 0.185, 0.025])
  const notebookRest = { position: notebook.position.clone(), quaternion: notebook.quaternion.clone() }
  bar(world, [-2.96, 2.29, 0.16], [-2.67, 2.29, 1.12], 0.019, paint.red)

  const headset = group('vr', [2.87, 2.74, 0.96])
  headset.rotation.y = -0.36
  const polymer = material('#e1e4e2', { roughness: 0.32, clearcoat: 0.28, clearcoatRoughness: 0.4 })
  const opticalGlass = material('#101c25', { metalness: 0.48, roughness: 0.075, clearcoat: 1 })
  const visor = new THREE.Mesh(new RoundedBoxGeometry(1.16, 0.5, 0.38, 8, 0.165), polymer)
  const visorVertices = visor.geometry.attributes.position
  for (let vertex = 0; vertex < visorVertices.count; vertex += 1) visorVertices.setZ(vertex, visorVertices.getZ(vertex) + 0.045 * (1 - Math.pow(visorVertices.getX(vertex) / 0.58, 2)))
  visor.geometry.computeVertexNormals()
  visor.castShadow = visor.receiveShadow = true
  headset.add(visor)
  box(headset, [1.06, 0.4, 0.19], fabric, [0, 0.008, -0.22], 0.085)
  box(headset, [0.96, 0.33, 0.16], paint.rubber, [0, 0.01, -0.29], 0.07)
  for (const horizontal of [-0.36, 0, 0.36]) {
    const depth = horizontal ? 0.224 : 0.246
    box(headset, [0.084, 0.228, 0.009], paint.ink, [horizontal, 0, depth], 0.032)
    for (const vertical of [-0.065, 0.065]) {
      const sensor = new THREE.Mesh(new THREE.CircleGeometry(0.022, 32), opticalGlass)
      sensor.position.set(horizontal, vertical, depth + 0.007)
      headset.add(sensor)
      ring(headset, 0.025, 0.002, paint.metal, [horizontal, vertical, depth + 0.006])
    }
  }
  for (const horizontal of [-0.57, 0.57]) {
    box(headset, [0.052, 0.093, 0.42], polymer, [horizontal, 0.015, -0.23], 0.022)
    box(headset, [0.01, 0.015, 0.072], paint.rubber, [horizontal * 1.049, 0.02, -0.11], 0.006)
    for (let vent = 0; vent < 6; vent += 1) box(headset, [0.003, 0.017, 0.008], paint.ink, [horizontal * 1.049, 0.015, -0.23 - vent * 0.017], 0.002)
  }
  ribbon(headset, [[-0.57, 0.01, -0.31], [-0.54, 0.03, -0.63], [-0.36, 0.07, -0.86], [0, 0.09, -0.95], [0.36, 0.07, -0.86], [0.54, 0.03, -0.63], [0.57, 0.01, -0.31]], 0.115, polymer)
  ribbon(headset, [[0, 0.22, -0.09], [0, 0.32, -0.34], [0, 0.33, -0.59], [0, 0.13, -0.93]], 0.105, polymer)
  bar(headset, [0, -0.19, -0.09], [0, -0.42, -0.09], 0.045, paint.metal)
  box(headset, [0.82, 0.045, 0.56], paint.ink, [0, -0.443, -0.04])
  for (const horizontal of [-0.65, 0.67]) {
    const controller = new THREE.Group()
    controller.position.set(horizontal, -0.26, 0.16)
    controller.rotation.z = horizontal < 0 ? -0.2 : 0.2
    controller.rotation.x = 0.24
    headset.add(controller)
    box(controller, [0.12, 0.32, 0.15], polymer, [0, -0.01, 0.01], 0.055)
    const controllerFace = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), polymer)
    controllerFace.scale.set(0.115, 0.045, 0.135)
    controllerFace.position.set(0, 0.15, 0.015)
    controllerFace.castShadow = true
    controller.add(controllerFace)
    cylinder(controller, 0.028, 0.021, 0.032, paint.rubber, [-0.036, 0.195, -0.027], 24)
    for (const depth of [-0.015, 0.047]) cylinder(controller, 0.012, 0.012, 0.008, paint.ink, [0.04, 0.193, depth], 20)
    box(controller, [0.073, 0.05, 0.025], paint.paper, [0, 0.092, -0.087], 0.019)
    cable(controller, [[0, -0.17, 0.02], [-0.06, -0.19, 0.12], [0.02, -0.18, 0.23], [0.075, -0.17, 0.11], [0, -0.17, 0.02]], 0.004)
  }
  contact([2.87, 2.27, 0.96], 1.9, 1.4)

  const telescope = group('sky', [5.3, 0, -1.42])
  for (const end of [[-0.58, 0.05, 0.55], [0.6, 0.05, 0.51], [0.01, 0.05, -0.7]]) bar(telescope, [0, 3.98, 0], end, 0.045, paint.metal)
  cylinder(telescope, 0.13, 0.13, 0.2, paint.ink, [0, 3.99, 0])
  for (const horizontal of [-0.29, 0.29]) bar(telescope, [horizontal * 0.38, 3.99, 0], [horizontal, 4.42, 0], 0.047, paint.ink)
  const mountAxle = cylinder(telescope, 0.071, 0.071, 0.73, paint.metal, [0, 4.42, 0])
  mountAxle.rotation.z = Math.PI / 2
  const altitudeKnob = cylinder(telescope, 0.093, 0.093, 0.065, paint.rubber, [0.39, 4.42, 0], 48)
  altitudeKnob.rotation.z = Math.PI / 2
  const tube = new THREE.Group()
  tube.position.set(0, 4.43, -0.04)
  tube.rotation.set(-Math.PI / 2 + 0.28, 0, 0)
  telescope.add(tube)
  cylinder(tube, 0.25, 0.22, 1.64, paint.paper)
  for (const vertical of [-0.34, 0.3]) {
    cylinder(tube, 0.257, 0.257, 0.065, paint.ink, [0, vertical, 0])
    box(tube, [0.08, 0.09, 0.04], paint.metal, [0, vertical, 0.256], 0.014)
  }
  cylinder(tube, 0.28, 0.28, 0.13, paint.blue, [0, 0.75, 0])
  cylinder(tube, 0.242, 0.242, 0.035, paint.ink, [0, 0.826, 0])
  cylinder(tube, 0.11, 0.11, 0.3, paint.ink, [0, -0.91, 0])
  cylinder(tube, 0.135, 0.135, 0.07, paint.rubber, [0, -1.055, 0])
  cylinder(tube, 0.099, 0.099, 0.011, opticalGlass, [0, -1.094, 0])
  for (let ridge = 0; ridge < 36; ridge += 1) {
    const angle = ridge * Math.PI * 2 / 36
    const grip = box(tube, [0.009, 0.065, 0.012], paint.ink, [Math.cos(angle) * 0.132, -1.055, Math.sin(angle) * 0.132], 0.002)
    grip.rotation.y = -angle
  }
  const focuser = cylinder(tube, 0.064, 0.064, 0.085, paint.metal, [0.16, -0.85, 0], 40)
  focuser.rotation.z = Math.PI / 2
  bar(tube, [0.2, -0.35, 0], [0.4, -0.35, 0], 0.018, paint.metal)
  cylinder(tube, 0.045, 0.045, 0.44, paint.ink, [0.4, -0.22, 0])

  const fitness = new THREE.Group()
  fitness.position.set(-5.04, 0.12, 2)
  world.add(fitness)
  const matRoll = cylinder(fitness, 0.24, 0.24, 1.55, paint.green, [0, 0.69, -0.16])
  matRoll.rotation.z = 0.12
  for (const depth of [0.55, 1.08]) {
    bar(fitness, [-0.34, 0.05, depth], [0.39, 0.05, depth], 0.054, paint.metal)
    for (const horizontal of [-0.37, 0.42]) {
      const weight = cylinder(fitness, 0.18, 0.18, 0.18, paint.rubber, [horizontal, 0.05, depth], 6)
      weight.rotation.z = Math.PI / 2
    }
  }
  const bottle = group('fitness', [-4.84, 2.6, 0.55])
  cylinder(bottle, 0.135, 0.145, 0.64, paint.green)
  cylinder(bottle, 0.095, 0.12, 0.12, paint.ink, [0, 0.37, 0])
  ring(bottle, 0.08, 0.019, paint.ink, [0, 0.49, 0])
  delete bottle.userData.action

  const lamp = group('light', [4.31, 2.28, 1.41])
  cylinder(lamp, 0.27, 0.3, 0.065, paint.red)
  cylinder(lamp, 0.237, 0.253, 0.012, paint.ink, [0, -0.031, 0])
  for (const depth of [-0.025, 0.025]) {
    bar(lamp, [0, 0.07, depth], [-0.12, 0.68, depth], 0.018, paint.ink)
    bar(lamp, [-0.12, 0.68, depth], [-0.61, 1.17, -0.13 + depth], 0.018, paint.ink)
  }
  for (const position of [[0, 0.08, 0.046], [-0.12, 0.68, 0.046], [-0.61, 1.17, -0.084]]) {
    const joint = cylinder(lamp, 0.045, 0.045, 0.022, paint.metal, position, 32)
    joint.rotation.x = Math.PI / 2
  }
  const shadeProfile = [[0.13, 0.145], [0.158, 0.122], [0.292, -0.115], [0.319, -0.141], [0.319, -0.151], [0.3, -0.151], [0.143, 0.102], [0.127, 0.113], [0.13, 0.145]].map(point => new THREE.Vector2(...point))
  const shade = new THREE.Mesh(new THREE.LatheGeometry(shadeProfile, 64), paint.red)
  shade.position.set(-0.61, 1.05, -0.13)
  shade.castShadow = shade.receiveShadow = true
  lamp.add(shade)
  cable(lamp, [[-0.57, 1.14, -0.15], [-0.32, 1.02, -0.11], [-0.13, 0.66, -0.05], [-0.045, 0.31, -0.05], [0.07, 0.06, -0.13]], 0.008)
  const bulb = material('#f9e2b7', { emissive: '#ffd7a0', emissiveIntensity: 1 })
  cylinder(lamp, 0.28, 0.28, 0.012, bulb, [-0.61, 0.897, -0.13])
  const lampLight = new THREE.PointLight('#ffd1a0', 4, 7)
  lampLight.position.set(3.69, 3.15, 1.3)
  scene.add(lampLight)

  const contactCard = group('contact', [0.53, 2.475, 1.68])
  contactCard.scale.setScalar(0.68)
  contactCard.rotation.x = -0.22
  box(contactCard, [1.25, 0.46, 0.035], paint.paper)
  surface('contact-surface', contactCard, 1.21, 0.42, [0, 0, 0.024], 720)
  bar(contactCard, [-0.45, -0.21, -0.01], [-0.45, -0.3, -0.18], 0.01, paint.metal)
  bar(contactCard, [0.45, -0.21, -0.01], [0.45, -0.3, -0.18], 0.01, paint.metal)

  const dslr = group('camera', [-3.26, 2.705, 0.94])
  dslr.scale.setScalar(0.87)
  dslr.rotation.set(0.04, 0.31, -0.025)
  const bodyOutline = new THREE.Shape()
  bodyOutline.moveTo(-0.82, -0.35)
  bodyOutline.quadraticCurveTo(-0.82, -0.48, -0.68, -0.48)
  bodyOutline.lineTo(0.6, -0.48)
  bodyOutline.quadraticCurveTo(0.83, -0.48, 0.83, -0.29)
  bodyOutline.lineTo(0.81, 0.3)
  bodyOutline.quadraticCurveTo(0.78, 0.51, 0.55, 0.51)
  bodyOutline.lineTo(0.31, 0.51)
  bodyOutline.quadraticCurveTo(0.22, 0.54, 0.2, 0.66)
  bodyOutline.quadraticCurveTo(0.18, 0.72, 0.08, 0.72)
  bodyOutline.lineTo(-0.22, 0.72)
  bodyOutline.quadraticCurveTo(-0.31, 0.72, -0.35, 0.55)
  bodyOutline.quadraticCurveTo(-0.38, 0.5, -0.48, 0.49)
  bodyOutline.lineTo(-0.64, 0.49)
  bodyOutline.quadraticCurveTo(-0.82, 0.49, -0.82, 0.34)
  bodyOutline.closePath()
  const bodyGeometry = new THREE.ExtrudeGeometry(bodyOutline, { depth: 0.53, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.06, bevelSegments: 8, curveSegments: 24, steps: 1 })
  bodyGeometry.deleteAttribute('normal')
  const smoothBodyGeometry = mergeVertices(bodyGeometry)
  smoothBodyGeometry.computeVertexNormals()
  bodyGeometry.dispose()
  const cameraPolymer = material('#222628', { roughness: 0.66, bumpMap: grain, bumpScale: 0.002 })
  const bodyShell = new THREE.Mesh(smoothBodyGeometry, cameraPolymer)
  bodyShell.position.z = -0.28
  bodyShell.castShadow = bodyShell.receiveShadow = true
  dslr.add(bodyShell)
  box(dslr, [0.35, 0.9, 0.8], paint.rubber, [0.64, -0.015, -0.025], 0.14)
  box(dslr, [0.13, 0.65, 0.075], paint.rubber, [-0.75, -0.055, 0.285], 0.03)
  box(dslr, [0.37, 0.215, 0.07], paint.rubber, [-0.05, 0.61, 0.322], 0.04)
  box(dslr, [0.275, 0.11, 0.012], opticalGlass, [-0.05, 0.61, 0.364], 0.021)
  for (const horizontal of [-0.16, 0.06]) box(dslr, [0.035, 0.024, 0.19], paint.metal, [horizontal, 0.779, -0.07], 0.003)
  box(dslr, [0.24, 0.008, 0.18], paint.rubber, [-0.05, 0.765, -0.07], 0.003)
  box(dslr, [1.16, 0.78, 0.07], paint.ink, [-0.21, -0.04, 0.35], 0.026)
  box(dslr, [1.11, 0.72, 0.02], paint.ink, [-0.21, -0.04, 0.396], 0.015)
  const cameraSurface = surface('camera-surface', dslr, 1.05, 0.665, [-0.21, -0.04, 0.411], 680)
  const liveMaterial = new THREE.MeshBasicMaterial({ map: liveTarget.texture, toneMapped: false })
  materials.add(liveMaterial)
  const liveScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.665), liveMaterial)
  liveScreen.position.set(-0.21, -0.04, 0.41)
  liveScreen.visible = false
  dslr.add(liveScreen)
  const lens = cylinder(dslr, 0.38, 0.34, 0.7, paint.ink, [-0.14, 0.03, -0.57])
  lens.rotation.x = Math.PI / 2
  for (const depth of [-0.54, -0.69, -0.83]) ring(dslr, 0.36, 0.023, paint.rubber, [-0.14, 0.03, depth])
  const lensRidges = new THREE.InstancedMesh(new RoundedBoxGeometry(0.012, 0.02, 0.17, 1, 0.004), paint.rubber, 64)
  for (let ridge = 0; ridge < 64; ridge += 1) {
    const angle = ridge * Math.PI * 2 / 64
    matrixObject.position.set(-0.14 + Math.sin(angle) * 0.366, 0.03 + Math.cos(angle) * 0.366, -0.66)
    matrixObject.scale.set(1, 1, 1)
    matrixObject.rotation.set(0, 0, -angle)
    matrixObject.updateMatrix()
    lensRidges.setMatrixAt(ridge, matrixObject.matrix)
  }
  dslr.add(lensRidges)
  ring(dslr, 0.349, 0.006, paint.red, [-0.14, 0.03, -0.86])
  ring(dslr, 0.333, 0.014, paint.metal, [-0.14, 0.03, -0.91])
  const frontGlass = new THREE.Mesh(new THREE.CircleGeometry(0.32, 48), material('#264454', { metalness: 0.55, roughness: 0.12 }))
  frontGlass.position.set(-0.14, 0.03, -0.93)
  frontGlass.rotation.y = Math.PI
  dslr.add(frontGlass)
  label(dslr, 'Canon', 0.28, 0.075, [-0.58, 0.427, 0.328], colors.ink, colors.paper, 155)
  const shutter = cylinder(dslr, 0.068, 0.083, 0.027, paint.ink, [0.57, 0.545, 0.15])
  shutter.rotation.x = 0.2
  shutter.userData.action = 'viewfinder'
  const topDial = cylinder(dslr, 0.105, 0.105, 0.067, paint.rubber, [-0.62, 0.548, -0.06], 64)
  for (let notch = 0; notch < 30; notch += 1) {
    const angle = notch * Math.PI * 2 / 30
    const ridge = box(dslr, [0.01, 0.055, 0.011], paint.ink, [-0.62 + Math.cos(angle) * 0.105, 0.548, -0.06 + Math.sin(angle) * 0.105], 0.002)
    ridge.rotation.y = -angle
  }
  for (const horizontal of [-0.79, 0.79]) ring(dslr, 0.046, 0.009, paint.metal, [horizontal, 0.33, -0.05])
  for (const [horizontal, vertical] of [[-0.74, -0.41], [0.76, -0.39], [-0.69, 0.34]]) {
    const screw = cylinder(dslr, 0.014, 0.014, 0.009, paint.metal, [horizontal, vertical, 0.332], 20)
    screw.rotation.x = Math.PI / 2
    box(dslr, [0.015, 0.002, 0.002], paint.rubber, [horizontal, vertical, 0.338], 0.0005)
  }
  const power = cylinder(dslr, 0.058, 0.058, 0.025, paint.metal, [0.64, 0.29, 0.409])
  power.rotation.x = Math.PI / 2
  power.userData.action = 'power'
  const dial = cylinder(dslr, 0.11, 0.11, 0.055, paint.ink, [0.61, -0.045, 0.435], 48)
  dial.rotation.x = Math.PI / 2
  ring(dslr, 0.111, 0.009, paint.metal, [0.61, -0.045, 0.465])
  const cameraControls = surface('camera-controls-surface', dslr, 0.32, 0.78, [0.62, -0.02, 0.48], 250)
  let controlLayout = ''
  function syncCameraControls() {
    if (!cameraControls.element.clientWidth) return
    const buttons = [...cameraControls.element.querySelectorAll('button')]
    const layout = buttons.map(button => [button.offsetLeft, button.offsetTop, button.offsetWidth, button.offsetHeight].join(',')).join('/')
    if (layout === controlLayout) return
    controlLayout = layout
    const cutouts = buttons.map(button => {
      let horizontal = 0
      let vertical = 0
      let current = button
      while (current && current !== cameraControls.element) {
        horizontal += current.offsetLeft
        vertical += current.offsetTop
        current = current.offsetParent
      }
      const geometry = new THREE.CircleGeometry(1, 48)
      geometry.scale(button.offsetWidth * cameraControls.ratio / 2, button.offsetHeight * cameraControls.ratio / 2, 1)
      geometry.translate((horizontal + button.offsetWidth / 2 - cameraControls.element.clientWidth / 2) * cameraControls.ratio, (cameraControls.element.clientHeight / 2 - vertical - button.offsetHeight / 2) * cameraControls.ratio, 0)
      return geometry
    })
    cameraControls.hole.geometry.dispose()
    cameraControls.hole.geometry = mergeGeometries(cutouts)
    for (const geometry of cutouts) geometry.dispose()
  }
  const strapFabric = material('#464d4d', { map: weave, roughness: 0.97, sheen: 0.3 })
  ribbon(dslr, [[-0.82, 0.31, -0.02], [-0.95, 0.01, 0.06], [-1.02, -0.46, 0.22], [-0.95, -0.51, 0.6], [-0.49, -0.51, 0.91], [-0.22, -0.49, 0.65]], 0.085, strapFabric)
  contact([-3.26, 2.269, 0.94], 2.1, 1.6)
  const cameraRest = { position: dslr.position.clone(), quaternion: dslr.quaternion.clone() }

  const key = new THREE.DirectionalLight('#ffead2', 3.1)
  key.position.set(-3.8, 7.1, 4.8)
  key.target.position.set(0, 2, -1)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  Object.assign(key.shadow.camera, { left: -10, right: 10, top: 9, bottom: -6, near: 0.5, far: 35 })
  key.shadow.normalBias = 0.008
  key.shadow.bias = -0.0001
  key.shadow.radius = 3
  key.shadow.blurSamples = 6
  scene.add(key, key.target)
  const fill = new THREE.HemisphereLight('#c1d5e6', '#414640', 0.48)
  scene.add(fill)
  const windowLight = new THREE.RectAreaLight('#b7d6eb', 4.4, 3.35, 4.6)
  windowLight.position.set(5.4, 4.2, -3.23)
  windowLight.lookAt(-0.5, 2.5, 1.5)
  scene.add(windowLight)
  function environmentMap() {
    const generator = new THREE.PMREMGenerator(renderer)
    const room = new RoomEnvironment()
    const result = generator.fromScene(room, 0.04)
    generator.dispose()
    room.dispose()
    return result
  }
  let environment = environmentMap()
  scene.environment = environment.texture
  scene.environmentIntensity = 0.22

  let state = { mode: 'desk', focus: 'store', powered: false }
  let frame = 0
  let ready = false
  let disposed = false
  let lost = false
  let previousTime = performance.now()
  let transition = null
  let width = 1
  let height = 1
  let mobile = false
  let cameraHeld = 0
  let active = true
  let savedView = null
  let pointerStart = null
  let captured = 0
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const goalPosition = new THREE.Vector3()
  const goalTarget = new THREE.Vector3()
  const poseTarget = new THREE.Vector3()
  const poseQuaternion = new THREE.Quaternion()
  const lastPosition = new THREE.Vector3()
  const identityQuaternion = new THREE.Quaternion()
  const focusPoints = {
    store: new THREE.Vector3(1.74, 3.67, -1.35), copilot: new THREE.Vector3(1.74, 3.67, -1.35), hello: new THREE.Vector3(1.74, 3.67, -1.35),
    notebook: notebookRest.position.clone(), resume: resumeRest.position.clone(), vr: headset.position.clone(), sky: new THREE.Vector3(5.3, 4.5, -1.42),
  }
  function invalidate() {
    if (!frame && ready && active && !disposed && !lost && !document.hidden) frame = requestAnimationFrame(render)
  }
  function deskView() {
    return { position: new THREE.Vector3(0, mobile ? 4.75 : 4.5, mobile ? 7.6 : 7.7), target: new THREE.Vector3(0, mobile ? 4.5 : 3.2, -1.1), fov: mobile ? 52 : 48 }
  }
  function viewFor(mode) {
    if (mode === 'work' || mode === 'vr') return { position: new THREE.Vector3(monitorGroups[1].position.x, monitorGroups[1].position.y, mobile ? 4.8 : 2.65), target: monitorGroups[1].position.clone().add(new THREE.Vector3(0, 0, 0.1)), fov: mobile ? 58 : 39 }
    if (mode === 'resume' || mode === 'notebook') return { position: new THREE.Vector3(0, 3.8, 7.7), target: new THREE.Vector3(0, 3.74, 3.3), fov: mobile ? 56 : 41 }
    if (mode === 'sky') return { position: new THREE.Vector3(5.5, 4.72, -3.85), target: new THREE.Vector3(5.4, 5.2, -26), fov: mobile ? 55 : 38 }
    if (mode === 'viewfinder') return savedView || { position: deskView().position, target: focusPoints[state.focus].clone(), fov: 38 }
    return deskView()
  }
  function moveTo(view, instant = false) {
    goalPosition.copy(view.position)
    goalTarget.copy(view.target)
    transition = { fov: view.fov }
    if (instant || reduced.matches) {
      camera.position.copy(goalPosition)
      orbit.target.copy(goalTarget)
      camera.fov = view.fov
      camera.updateProjectionMatrix()
      orbit.update()
      transition = null
    }
    invalidate()
  }
  function syncSurfaces() {
    scene.updateMatrixWorld(true)
    for (const entry of surfaces) {
      const enabled = !['sky', 'viewfinder'].includes(state.mode)
      const cameraUI = entry.id.startsWith('camera-')
      entry.enabled = cameraUI ? ['desk', 'camera', 'gallery'].includes(state.mode) : enabled
      if (entry.id === 'camera-controls-surface' && state.mode === 'desk') entry.enabled = false
      entry.anchor.matrixWorld.decompose(entry.object.position, entry.object.quaternion, entry.object.scale)
      entry.object.scale.multiplyScalar(entry.ratio)
      entry.object.visible = entry.enabled
      entry.hole.visible = entry.enabled || state.mode === 'viewfinder' && !cameraUI
      entry.hole.material = state.mode === 'viewfinder' ? entry.previewMaterial : entry.holeMaterial
      const interactive = state.mode === 'desk' || ['camera', 'gallery'].includes(state.mode) && cameraUI || ['work', 'vr'].includes(state.mode) && ['catalog-surface', 'work-surface'].includes(entry.id) || state.mode === 'resume' && entry.id === 'resume-surface' || state.mode === 'notebook' && entry.id === 'notebook-surface'
      entry.element.inert = !entry.enabled || !interactive
    }
    cssRenderer.render(cssScene, camera)
    syncCameraControls()
  }
  function render(time) {
    frame = 0
    const delta = Math.min((time - previousTime) / 1000, 0.05)
    previousTime = time
    const amount = reduced.matches ? 1 : 1 - Math.exp(-delta * 7)
    let moving = false
    if (transition) {
      camera.position.lerp(goalPosition, amount)
      orbit.target.lerp(goalTarget, amount)
      camera.fov = THREE.MathUtils.lerp(camera.fov, transition.fov, amount)
      camera.updateProjectionMatrix()
      if (camera.position.distanceTo(goalPosition) < 0.002 && orbit.target.distanceTo(goalTarget) < 0.002 && Math.abs(camera.fov - transition.fov) < 0.02) transition = null
      else moving = true
    }
    lastPosition.copy(camera.position)
    orbit.update()
    if (camera.position.distanceTo(lastPosition) > 0.0001) moving = true
    const held = ['camera', 'gallery'].includes(state.mode) ? 1 : 0
    cameraHeld = THREE.MathUtils.lerp(cameraHeld, held, amount)
    if (Math.abs(cameraHeld - held) > 0.001) moving = true
    const seated = deskView()
    const holdingDistance = (mobile ? Math.max(3.5, height / (2 * Math.tan(THREE.MathUtils.degToRad(seated.fov / 2))) * 1.95 / (width * 0.91)) : 2.25) * 0.87
    poseTarget.copy(seated.position).add(new THREE.Vector3(mobile ? 0.11 : -0.03, mobile ? -0.19 : -0.37, -holdingDistance))
    dslr.position.copy(cameraRest.position).lerp(poseTarget, cameraHeld)
    dslr.quaternion.copy(cameraRest.quaternion).slerp(identityQuaternion, cameraHeld)
    dslr.visible = state.mode !== 'viewfinder' && state.mode !== 'sky'
    nebula.visible = state.mode === 'sky'
    for (const [object, rest, active] of [[resume, resumeRest, state.mode === 'resume'], [notebook, notebookRest, state.mode === 'notebook']]) {
      const position = active ? new THREE.Vector3(0, 3.76, mobile ? 4.6 : 4.26) : rest.position
      const quaternion = active ? identityQuaternion : rest.quaternion
      object.position.lerp(position, amount)
      object.quaternion.slerp(quaternion, amount)
      if (object.position.distanceTo(position) > 0.001 || object.quaternion.angleTo(quaternion) > 0.001) moving = true
    }
    if (moving) renderer.shadowMap.needsUpdate = true
    const lensFocus = focusPoints[state.focus] || focusPoints.store
    lensCamera.position.copy(dslr.position)
    lensCamera.lookAt(lensFocus)
    if (state.mode === 'camera' && state.powered) {
      dslr.visible = false
      for (const entry of surfaces) {
        entry.hole.visible = true
        entry.hole.material = entry.previewMaterial
      }
      renderer.setRenderTarget(liveTarget)
      renderer.render(scene, lensCamera)
      renderer.setRenderTarget(null)
      dslr.visible = true
      callbacks.onLiveFrame?.(liveTarget.texture)
    }
    liveScreen.visible = false
    syncSurfaces()
    renderer.render(scene, camera)
    stage.dataset.renderer = 'webgl'
    stage.dataset.mode = state.mode
    stage.dataset.moving = moving ? 'true' : 'false'
    if (state.mode === 'viewfinder') {
      const projected = lensFocus.clone().project(camera)
      callbacks.onFocusPoint?.({ x: (projected.x + 1) * width / 2, y: (1 - projected.y) * height / 2 })
    }
    if (captured) {
      captured = 0
      const canvas = document.createElement('canvas')
      canvas.width = 480
      canvas.height = 300
      const source = renderer.domElement
      const sourceWidth = Math.min(source.width, source.height * 1.6)
      const sourceHeight = sourceWidth / 1.6
      canvas.getContext('2d').drawImage(source, (source.width - sourceWidth) / 2, (source.height - sourceHeight) / 2, sourceWidth, sourceHeight, 0, 0, 480, 300)
      callbacks.onCapture?.(state.focus, canvas.toDataURL('image/jpeg', 0.84))
    }
    if (moving) invalidate()
  }
  function setState(next, instant = false) {
    const previous = state
    if (previous.mode === 'viewfinder' && !['camera', 'desk'].includes(next.mode)) savedView = { position: camera.position.clone(), target: orbit.target.clone(), fov: camera.fov }
    state = next
    orbit.enableRotate = state.mode === 'desk' || state.mode === 'viewfinder' || state.mode === 'sky'
    orbit.minAzimuthAngle = state.mode === 'sky' ? -0.2 : -0.46
    orbit.maxAzimuthAngle = state.mode === 'sky' ? 0.2 : 0.46
    if (previous.mode !== state.mode) {
      if (state.mode === 'viewfinder' && previous.mode === 'camera') savedView = null
      moveTo(viewFor(state.mode), instant)
    } else if (state.mode === 'viewfinder' && state.focus !== previous.focus) moveTo({ position: camera.position.clone(), target: focusPoints[state.focus], fov: camera.fov }, instant)
    invalidate()
  }
  function resize() {
    const bounds = stage.getBoundingClientRect()
    width = bounds.width
    height = bounds.height
    mobile = width < 800
    nameplate.position.set(mobile ? 0 : -0.45, mobile ? 7.4 : 5.53, -3.22)
    resumeRest.position.set(mobile ? -2.55 : -4.08, mobile ? 5.58 : 4.63, -3.19)
    cameraRest.position.set(mobile ? -0.33 : -3.26, 2.705, mobile ? 1.15 : 0.94)
    monitorGroups[0].position.set(mobile ? 0 : -1.6, mobile ? 5.46 : 3.67, -1.5)
    monitorGroups[1].position.set(mobile ? 0 : 1.74, mobile ? 3.33 : 3.67, -1.5)
    monitorGroups[0].rotation.y = mobile ? 0 : 0.035
    monitorGroups[1].rotation.y = mobile ? 0 : -0.045
    for (const stand of monitorStands) stand.visible = !mobile
    portraitRig.visible = mobile
    keyboard.position.z = mobile ? -0.05 : 0.9
    contactCard.position.x = mobile ? 1.8 : 0.53
    for (const id of ['store', 'copilot', 'hello']) focusPoints[id].copy(monitorGroups[1].position).add(new THREE.Vector3(0, 0, 0.15))
    focusPoints.resume.copy(resumeRest.position)
    renderer.shadowMap.needsUpdate = true
    renderer.setSize(width, height)
    cssRenderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    moveTo(viewFor(state.mode), true)
  }
  function updateTheme() {
    const night = document.documentElement.dataset.theme === 'dark'
    scene.background = new THREE.Color(night ? '#17252a' : '#bfcfd0')
    renderer.setClearColor(scene.background, 1)
    renderer.toneMappingExposure = night ? 0.9 : 1.02
    scene.environmentIntensity = night ? 0.12 : 0.22
    key.intensity = night ? 0.45 : 3.1
    fill.intensity = night ? 0.2 : 0.48
    windowLight.intensity = night ? 1.3 : 4.4
    rearLight.intensity = night ? 16 : 9
    lampLight.intensity = night ? 11 : 5
    monitorLight.intensity = night ? 4 : 1.6
    paint.floor.color.set(night ? '#252e30' : '#3c4545')
    renderer.shadowMap.needsUpdate = true
    invalidate()
  }
  function pick(event) {
    const bounds = stage.getBoundingClientRect()
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1)
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.intersectObjects(world.children, true).find(value => !value.object.material?.transparent)
    let object = hit?.object
    while (object && !object.userData.action) object = object.parent
    return object?.userData.action
  }
  function down(event) {
    if (event.target.closest('.physical-surface, button, a')) return
    pointerStart = { x: event.clientX, y: event.clientY }
  }
  function up(event) {
    if (!pointerStart) return
    const distance = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y)
    pointerStart = null
    if (distance > 7) return
    const action = pick(event)
    if (action && action !== 'desk') callbacks.onObject?.(action)
  }
  function move(event) {
    if (event.target.closest('.physical-surface')) return
    stage.style.cursor = event.buttons ? 'grabbing' : pick(event) ? 'pointer' : orbit.enableRotate ? 'grab' : 'default'
  }
  function onVisibility() {
    if (document.hidden) { if (frame) cancelAnimationFrame(frame); frame = 0 }
    else invalidate()
  }
  function lostContext(event) {
    event.preventDefault()
    lost = true
    ready = false
    scene.environment = null
    environment.dispose()
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    callbacks.onError?.()
  }
  function restoredContext() {
    lost = false
    ready = true
    environment = environmentMap()
    scene.environment = environment.texture
    renderer.shadowMap.needsUpdate = true
    callbacks.onReady?.()
    invalidate()
  }
  orbit.addEventListener('change', invalidate)
  orbit.addEventListener('start', () => { transition = null; invalidate() })
  stage.addEventListener('pointerdown', down)
  stage.addEventListener('pointerup', up)
  stage.addEventListener('pointermove', move)
  document.addEventListener('visibilitychange', onVisibility)
  renderer.domElement.addEventListener('webglcontextlost', lostContext)
  renderer.domElement.addEventListener('webglcontextrestored', restoredContext)
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(stage)
  resize()
  updateTheme()
  Promise.all(materialLoads).then(() => renderer.compileAsync(scene, camera)).then(() => {
    if (disposed) return
    ready = true
    callbacks.onReady?.()
    invalidate()
  }).catch(error => { if (!disposed) { console.warn('Desk graphics unavailable.', error); callbacks.onError?.() } })

  return {
    setState, updateTheme,
    setActive(value) {
      active = value
      stage.dataset.active = String(value)
      if (!active && frame) { cancelAnimationFrame(frame); frame = 0 }
      else invalidate()
    },
    setSurfacePreview(id, canvas) {
      const entry = surfaces.find(value => value.id === id)
      if (!entry || disposed) return
      if (entry.previewTexture) { textures.delete(entry.previewTexture); entry.previewTexture.dispose() }
      const image = new THREE.CanvasTexture(canvas)
      image.colorSpace = THREE.SRGBColorSpace
      image.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy())
      textures.add(image)
      entry.previewTexture = image
      entry.previewMaterial.map = image
      entry.previewMaterial.color.set('#ffffff')
      entry.previewMaterial.needsUpdate = true
      invalidate()
    },
    capture() { captured = 1; invalidate() },
    zoom(direction) { if (state.mode === 'viewfinder' || state.mode === 'sky') moveTo({ position: camera.position.clone(), target: orbit.target.clone(), fov: THREE.MathUtils.clamp(camera.fov + direction * 5, 24, 58) }, reduced.matches) },
    reset() { moveTo(viewFor(state.mode)) },
    getLiveImage() {
      const pixels = new Uint8Array(640 * 400 * 4)
      renderer.readRenderTargetPixels(liveTarget, 0, 0, 640, 400, pixels)
      const canvas = document.createElement('canvas')
      canvas.width = 640
      canvas.height = 400
      const context = canvas.getContext('2d')
      const image = context.createImageData(640, 400)
      for (let row = 0; row < 400; row += 1) image.data.set(pixels.subarray((399 - row) * 2560, (400 - row) * 2560), row * 2560)
      context.putImageData(image, 0, 0)
      return canvas.toDataURL('image/jpeg', 0.8)
    },
    dispose() {
      disposed = true
      if (frame) cancelAnimationFrame(frame)
      orbit.dispose()
      resizeObserver.disconnect()
      stage.removeEventListener('pointerdown', down)
      stage.removeEventListener('pointerup', up)
      stage.removeEventListener('pointermove', move)
      document.removeEventListener('visibilitychange', onVisibility)
      const geometries = new Set()
      scene.traverse(object => { if (object.geometry) geometries.add(object.geometry) })
      for (const geometry of geometries) geometry.dispose()
      for (const value of materials) value.dispose()
      for (const value of textures) value.dispose()
      environment.dispose()
      liveTarget.dispose()
      key.shadow.map?.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      cssRenderer.domElement.remove()
    },
  }
}