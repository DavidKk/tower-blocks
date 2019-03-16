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
  private canvas: HTMLCanvasElement

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

    this.canvas = document.createElement('canvas')
    this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    window.addEventListener('resize', this.resize.bind(this))
    this.resize()

    document.body.style.backgroundColor = '#d0cbc7'
    document.body.appendChild(this.canvas)
  }

  public add (element: Object3D): void {
    this.scene.add(element)
  }

  public render (): void {
    this.renderer.render(this.scene, this.camera)
  }

  public resize (): void {
    let aspect = window.innerWidth / window.innerHeight
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.camera.left = -this.viewSize * aspect
    this.camera.right = this.viewSize * aspect
    this.camera.top = this.viewSize
    this.camera.bottom = -this.viewSize
    this.camera.updateProjectionMatrix()
  }

  public detectOffScreen (object: Object3D): boolean {
    this.camera.updateMatrix()
    this.camera.updateMatrixWorld(false)

    let frustum = new Frustum()
    frustum.setFromMatrix(new Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse))

    return frustum.intersectsObject(object) === false
  }
}
