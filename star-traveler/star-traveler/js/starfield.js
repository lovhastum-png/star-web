// js/starfield.js

// ========== 1. 基本状态 ==========

// 当前阶段：idle | locked | scanning
let phase = 'idle'
let currentStar = null

// 恒星示例数据
const stars = [
  {
    id: 1,
    name: '太阳系 Sun',
    distance: '0 ly',
    description: '我们的家园，从这里开始星际考古之旅。',
  },
  {
    id: 2,
    name: 'TRAPPIST-1',
    distance: '39 ly',
    description: '一颗有多颗类地行星的红矮星，宜居带的热门候选。',
  },
  {
    id: 3,
    name: '比邻星 Proxima Centauri',
    distance: '4.24 ly',
    description: '距离太阳最近的恒星，拥有已知系外行星。',
  },
]

// DOM 引用
let coreButton
let statusText
let targetText
let infoContent

// 状态文字
const phaseTextMap = {
  idle: '待命 · 在星图中漫游，点击左侧画布随机锁定一颗恒星',
  locked: '已锁定恒星 · 准备跃迁',
  scanning: '扫描中 · 模拟科学小游戏和数据分析',
}

// 随机选恒星
function pickRandomStar() {
  const randomStar = stars[Math.floor(Math.random() * stars.length)]
  currentStar = randomStar
  phase = 'locked'
  updateUI()
}

// 更新顶部状态条
function updateStatusBar() {
  statusText.textContent = phaseTextMap[phase]
  targetText.textContent = currentStar ? currentStar.name : '未选择'
}

// 更新底部核心按钮
function updateCoreButton() {
  if (!currentStar || phase === 'idle') {
    coreButton.textContent = '开始探索 · 随机锁定一颗恒星'
    coreButton.onclick = pickRandomStar
    return
  }

  if (phase === 'locked') {
    coreButton.textContent = '跃迁至 ' + currentStar.name
    coreButton.onclick = function () {
      phase = 'scanning'
      updateUI()
    }
    return
  }

  // phase === 'scanning'
  coreButton.textContent = '前往小游戏页面（开始扫描）'
  coreButton.onclick = function () {
    // 跳转到小游戏页面，并把恒星名带在 URL 里（可选）
    const url = 'game.html?star=' + encodeURIComponent(currentStar.name)
    window.location.href = url
  }
}

// 不同状态对应的信息面板内容
function renderIdleCard() {
  infoContent.innerHTML = `
    <div class="card">
      <h2>欢迎来到星图探索</h2>
      <p>这里展示的是一个基于 HTML5 canvas + Three.js 的简易 3D 星空。</p>
      <ol>
        <li>单击左侧星空画布，随机锁定一颗恒星。</li>
        <li>查看右侧面板中的恒星信息与当前状态。</li>
        <li>通过底部核心按钮，进入「跃迁」和「扫描 / 小游戏」阶段。</li>
      </ol>
      <p class="muted">
        小提示：当前版本使用随机选星方式，后续可以改成用 Raycaster 精确点选星点。
      </p>
    </div>
  `
}

function renderLockedCard() {
  infoContent.innerHTML = `
    <div class="card">
      <h2>已锁定恒星：${currentStar.name}</h2>
      <p>距离地球：<strong>${currentStar.distance}</strong></p>
      <p>${currentStar.description}</p>
      <p class="muted">点击底部核心按钮，模拟「跃迁」到该恒星系。</p>
    </div>
  `
}

function renderScanningCard() {
  infoContent.innerHTML = `
    <div class="card">
      <h2>正在对 ${currentStar.name} 进行深度扫描</h2>
      <p>
        在正式作品中，这个阶段会与科学小游戏、数据可视化结合，
        本作业中我们把小游戏放到独立的 <strong>game.html</strong> 页面中。
      </p>
      <p>
        点击底部核心按钮，会跳转到「科学小游戏」页面，完成一次简易的观测任务。
      </p>
      <p class="muted">
        当前状态文字为「扫描中 · 模拟科学小游戏和数据分析」，
        原本的乱码就是这里的中文编码不统一导致的，现在已改为 UTF-8。
      </p>
    </div>
  `
}

function updateInfoContent() {
  if (phase === 'idle') {
    renderIdleCard()
  } else if (phase === 'locked') {
    renderLockedCard()
  } else if (phase === 'scanning') {
    renderScanningCard()
  }
}

function updateUI() {
  updateStatusBar()
  updateCoreButton()
  updateInfoContent()
}

// ========== Three.js 星空部分 ==========
function initStarfield() {
  const canvas = document.getElementById('starfield')
  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x000000, 0.001)

  const camera = new THREE.PerspectiveCamera(
    60,
    canvas.clientWidth / canvas.clientHeight,
    1,
    1000
  )
  camera.position.z = 200

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  })
  renderer.setPixelRatio(window.devicePixelRatio || 1)

  function resizeRenderer() {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (width === 0 || height === 0) return

    if (canvas.width !== width || canvas.height !== height) {
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
  }

  resizeRenderer()

  // 生成星点
  const starCount = 2000
  const positions = new Float32Array(starCount * 3)

  for (let i = 0; i < starCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 800
    positions[i + 1] = (Math.random() - 0.5) * 800
    positions[i + 2] = (Math.random() - 0.5) * 800
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.2,
    sizeAttenuation: true,
  })

  const starsPoints = new THREE.Points(geometry, material)
  scene.add(starsPoints)

  function animate() {
    requestAnimationFrame(animate)

    starsPoints.rotation.y += 0.0007
    starsPoints.rotation.x += 0.0003

    resizeRenderer()
    renderer.render(scene, camera)
  }

  animate()

  // 点击画布 = 随机锁定一颗恒星
  canvas.addEventListener('click', function () {
    pickRandomStar()
  })

  window.addEventListener('resize', resizeRenderer)
}

// ========== 页面加载时初始化 ==========
window.addEventListener('DOMContentLoaded', function () {
  coreButton = document.getElementById('coreButton')
  statusText = document.getElementById('statusText')
  targetText = document.getElementById('targetText')
  infoContent = document.getElementById('infoContent')

  updateUI()
  initStarfield()
})

