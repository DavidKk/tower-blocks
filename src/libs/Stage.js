import {
  OrthographicCamera, SpotLight, Scene,
  CanvasRenderer, WebGLRenderer,
  Vector3, Frustum, Matrix4
} from 'three'

let isSupport = (() => {
  try {
    let canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch (error) {
    return false
  }
})()

export default class Stage {
  constructor () {
    this.scene = new Scene()

    this.viewSize = 30

    let aspect = window.innerWidth / window.innerHeight
    this.camera = new OrthographicCamera(-this.viewSize * aspect, this.viewSize * aspect, this.viewSize, -this.viewSize, -100, 1000)
    this.camera.position.x = 2
    this.camera.position.y = 2
    this.camera.position.z = 2
    this.camera.lookAt(new Vector3(0, 0, 0))

    this.light = new SpotLight(0xffffff, 1)
    this.light.position.set(40, 50, 60)
    this.light.castShadow = true
    this.light.shadow.mapSize.width = 2048
    this.light.shadow.mapSize.height = 2048
    this.scene.add(this.light)

    this.renderer = isSupport
      ? new WebGLRenderer({ antialias: true, alpha: true })
      : new CanvasRenderer({ antialias: true, alpha: true })

    this.renderer.setSize(window.innerWidth, window.innerHeight)

    this.spinner = document.getElementById('spinner')
    this.score = document.getElementById('score')
    this.play = document.getElementById('play')
    this.message = document.getElementById('message')
    this.canvas = this.renderer.domElement

    window.addEventListener('resize', this.resize.bind(this))
    this.resize()

    document.body.style.backgroundColor = '#d0cbc7'
    this.score.parentElement.style.display = 'block'
    this.play.style.display = 'block'

    document.body.appendChild(this.canvas)
    this.toggleSpinner(false)
  }

  _toggleElement (element, isOpen = true) {
    isOpen === true ? element.classList.add('in') : element.classList.remove('in')
  }

  detectOffScreen (object) {
    this.camera.updateMatrix()
    this.camera.updateMatrixWorld()
    var frustum = new Frustum()
    frustum.setFromMatrix(new Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse))

    return frustum.intersectsObject(object) === false
  }

  resize () {
    let aspect = window.innerWidth / window.innerHeight
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.camera.left = -this.viewSize * aspect
    this.camera.right = this.viewSize * aspect
    this.camera.top = this.viewSize
    this.camera.bottom = -this.viewSize
    this.camera.updateProjectionMatrix()
  }

  add (element) {
    this.scene.add(element)
  }

  render () {
    this.renderer.render(this.scene, this.camera)
  }

  togglePlay (isOpen = true) {
    return this._toggleElement(this.play, isOpen)
  }

  toggleSpinner (isOpen = true) {
    return this._toggleElement(this.spinner, isOpen)
  }

  toggleMessage (isOpen = true) {
    return this._toggleElement(this.message, isOpen)
  }

  setScore (score) {
    this.score.innerText = score * 100
  }

  setMessage (message) {
    this.message.innerText = message
  }
}
