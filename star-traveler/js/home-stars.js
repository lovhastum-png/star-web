// js/home-stars.js  文件编码：UTF-8
// 作用：在首页银河背景上叠加一层静止但闪烁的星星

window.addEventListener('DOMContentLoaded', function () {
  const canvas = document.getElementById('home-stars')
  if (!canvas) return

  const ctx = canvas.getContext('2d')

  let width = 0
  let height = 0
  let stars = []

  // 首页用的是背景图，这里只做强化亮星的闪烁，不需要太密
  const STAR_COUNT = 320

  function resize() {
    const dpr = window.devicePixelRatio || 1
    width = canvas.clientWidth || window.innerWidth
    height = canvas.clientHeight || window.innerHeight

    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  window.addEventListener('resize', function () {
    resize()
    createStars()
  })

  resize()

  function createStars() {
    stars = []

    // 普通星 + 少量亮星
    const normalCount = Math.floor(STAR_COUNT * 0.75)
    const brightCount = STAR_COUNT - normalCount

    // 普通星：分布更广，闪烁明显
    for (let i = 0; i < normalCount; i++) {
      stars.push(createStar({
        radiusMin: 0.7,
        radiusMax: 1.5,
        baseAlphaMin: 0.12,
        baseAlphaMax: 0.35,
        twinkleAmpMin: 0.35,
        twinkleAmpMax: 0.7,
        isBright: false,
      }))
    }

    // 亮星：数量少、对比强，偏银河带区域
    for (let i = 0; i < brightCount; i++) {
      const biasY = 0.35 + Math.random() * 0.3 // 大致在画面中间偏下的银河带上方
      stars.push(createStar({
        radiusMin: 1.6,
        radiusMax: 2.6,
        baseAlphaMin: 0.25,
        baseAlphaMax: 0.5,
        twinkleAmpMin: 0.45,
        twinkleAmpMax: 0.85,
        isBright: true,
        biasY,
      }))
    }
  }

  function createStar(opts) {
    const {
      radiusMin, radiusMax,
      baseAlphaMin, baseAlphaMax,
      twinkleAmpMin, twinkleAmpMax,
      isBright,
      biasY,
    } = opts

    const x = Math.random() * width
    const y = biasY
      ? biasY * height + (Math.random() - 0.5) * height * 0.15
      : Math.random() * height

    const radius = radiusMin + Math.random() * (radiusMax - radiusMin)
    const baseAlpha = baseAlphaMin + Math.random() * (baseAlphaMax - baseAlphaMin)
    const twinkleAmp = twinkleAmpMin + Math.random() * (twinkleAmpMax - twinkleAmpMin)

    const color = pickStarColor(isBright)

    return {
      x,
      y,
      radius,
      baseAlpha,
      twinkleAmp,
      twinkleSpeed: 0.4 + Math.random() * 1.0,
      phase: Math.random() * Math.PI * 2,
      color,
      isBright,
    }
  }

  // 偏冷的蓝白色为主，少量黄 / 淡红，接近你那张银河图的色调
  function pickStarColor(isBright) {
    const r = Math.random()

    if (isBright) {
      if (r < 0.6) return { r: 245, g: 248, b: 255 } // 亮冷白
      if (r < 0.9) return { r: 215, g: 225, b: 255 } // 亮淡蓝
      return { r: 255, g: 235, b: 210 }              // 少量暖黄
    }

    if (r < 0.55) {
      return { r: 230, g: 235, b: 255 } // 冷白
    }
    if (r < 0.82) {
      return { r: 205, g: 215, b: 245 } // 淡蓝
    }
    if (r < 0.95) {
      return { r: 255, g: 235, b: 205 } // 暖黄
    }
    return { r: 255, g: 210, b: 210 }   // 少量略红
  }

  createStars()

  let lastTime = 0

  function animate(time) {
    const t = time * 0.001
    const dt = lastTime ? (t - lastTime) : 0
    lastTime = t

    // 不填充背景，只清理，保持透明，让下面的银河图透出来
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, width, height)

    // 使用 lighter 模式，让星星发光效果更自然
    ctx.globalCompositeOperation = 'lighter'

    for (const star of stars) {
      star.phase += star.twinkleSpeed * dt

      // 闪烁：同一颗星从“更暗”到“更亮”，差分比较大
      let alpha = star.baseAlpha + Math.sin(star.phase) * star.twinkleAmp
      if (alpha < 0) alpha = 0
      if (alpha > 1) alpha = 1

      const r = star.radius
      const c = star.color

      const grad = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, r * 2.0
      )
      grad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 1)`)
      grad.addColorStop(0.4, `rgba(${c.r}, ${c.g}, ${c.b}, 0.9)`)
      grad.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`)

      ctx.globalAlpha = alpha
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(star.x, star.y, r * 2.0, 0, Math.PI * 2)
      ctx.fill()

      // 最亮的一些星加一点淡淡的十字光芒
      if (star.isBright && r > 2.0) {
        ctx.globalAlpha = alpha * 0.6
        ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.9)`
        ctx.lineWidth = 0.5

        const len = r * 3.2

        ctx.beginPath()
        ctx.moveTo(star.x - len, star.y)
        ctx.lineTo(star.x + len, star.y)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(star.x, star.y - len)
        ctx.lineTo(star.x, star.y + len)
        ctx.stroke()
      }
    }

    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
})

