import {
  OrthographicCamera, SpotLight, Scene,
  WebGLRenderer,
  Vector3, Frustum, Matrix4, Object3D
} from 'three'

export default class Stage {
  private scene: Scene
  private viewSize: number
  private camera: OrthographicCamera
  private light: SpotLight
  private renderer: WebGLRenderer
  private spinner: HTMLElement
  private score: HTMLElement
  private play: HTMLElement
  private message: HTMLElement
  private canvas: HTMLElement

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

    this.renderer = new WebGLRenderer({ antialias: true, alpha: true })
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

  private toggleElement (element: HTMLElement, isOpen: boolean = true) {
    isOpen === true ? element.classList.add('in') : element.classList.remove('in')
  }

  public detectOffScreen (object: Object3D) {
    this.camera.updateMatrix()
    this.camera.updateMatrixWorld(false)

    var frustum = new Frustum()
    frustum.setFromMatrix(new Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse))

    return frustum.intersectsObject(object) === false
  }

  public resize () {
    let aspect = window.innerWidth / window.innerHeight
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.camera.left = -this.viewSize * aspect
    this.camera.right = this.viewSize * aspect
    this.camera.top = this.viewSize
    this.camera.bottom = -this.viewSize
    this.camera.updateProjectionMatrix()
  }

  public add (element: Object3D) {
    this.scene.add(element)
  }

  public render () {
    this.renderer.render(this.scene, this.camera)
  }

  public setScore (score: number) {
    this.score.innerText = score * 100 + ''
  }

  public setMessage (message: string) {
    this.message.innerText = message
  }

  public togglePlay (isOpen: boolean = true) {
    return this.toggleElement(this.play, isOpen)
  }

  public toggleSpinner (isOpen: boolean = true) {
    return this.toggleElement(this.spinner, isOpen)
  }

  public toggleMessage (isOpen: boolean = true) {
    return this.toggleElement(this.message, isOpen)
  }
}
