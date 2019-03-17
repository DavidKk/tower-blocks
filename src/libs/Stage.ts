import {
  OrthographicCamera, SpotLight, Scene,
  WebGLRenderer,
  Vector3, Frustum, Matrix4, Object3D
} from 'three'
import { createCanvas } from '../share/adapter'
import { isWeChat } from '../share/device'

export default class Stage {
  private canvas: HTMLCanvasElement
  private viewSize: number
  private renderer: WebGLRenderer
  private light: SpotLight
  private scene: Scene
  private camera: OrthographicCamera

  constructor (canvas?: HTMLCanvasElement) {
    this.viewSize = 30
    this.scene = new Scene()

    let screenWidth = window.innerWidth
    let screenHeight = window.innerHeight
    let aspect = screenWidth / screenHeight

    this.camera = new OrthographicCamera(-this.viewSize * aspect, this.viewSize * aspect, this.viewSize, -this.viewSize, -100, 1000)
    this.camera.position.set(2, 2, 2)
    this.camera.lookAt(new Vector3(0, 0, 0))

    this.light = new SpotLight(0xffffff, 1)
    this.light.position.set(40, 50, 60)
    this.light.castShadow = true
    this.light.shadow.mapSize.width = 2048
    this.light.shadow.mapSize.height = 2048
    this.scene.add(this.light)

    this.canvas = canvas || createCanvas()
    this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true })
    this.renderer.setSize(screenWidth, screenHeight)

    if (isWeChat) {
      this.renderer.setClearColor(0xd0cbc7, 1)
    } else {
      window.addEventListener('resize', this.resize.bind(this))
      this.resize()
    }
  }

  public add (element: Object3D): void {
    this.scene.add(element)
  }

  public render (): void {
    this.renderer.render(this.scene, this.camera)
  }

  public resize (): void {
    let screenWidth = window.innerWidth
    let screenHeight = window.innerHeight
    let aspect = screenWidth / screenHeight

    this.renderer.setSize(screenWidth, screenHeight)
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

  public getCanvas (): HTMLCanvasElement {
    return this.canvas
  }
}
