import {
  WebGLRenderer, OrthographicCamera,
  Scene, SpotLight, Texture,
  PlaneGeometry, MeshBasicMaterial, Mesh,
  LinearFilter, Vector3, Frustum, Matrix4, Object3D, Color
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
  private hudCanvas: HTMLCanvasElement
  private hudScene: Scene
  private hudCamera: OrthographicCamera
  private needUpdateTextures: Array<Texture>

  constructor (canvas?: HTMLCanvasElement) {
    this.viewSize = 30
    this.needUpdateTextures = []
    this.scene = new Scene()
    this.scene.background = new Color(0xd0cbc7)

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
    this.renderer.autoClear = false

    if (!isWeChat) {
      window.addEventListener('resize', this.resize.bind(this))
      this.resize()
    }
  }

  public add (element: Object3D): void {
    this.scene.add(element)
  }

  public render (): void {
    this.needUpdateTextures.forEach((texture: Texture) => {
      texture.needsUpdate = true
    })

    // this.renderer
    // this.renderer.setClearColor(0xd0cbc7, 1)
    this.renderer.render(this.scene, this.camera)

    if (this.hudScene && this.hudCamera) {
      this.renderer.render(this.hudScene, this.hudCamera)
    }
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

  public setOffScreenCanvas (canvas: HTMLCanvasElement): void {
    let screenWidth = window.innerWidth
    let screenHeight = window.innerHeight

    let hudScene = new Scene()
    let hudCamera = new OrthographicCamera(screenWidth / -2, screenWidth / 2, screenHeight / 2, screenHeight / -2, 0, 30)
    let uiTexture = new Texture(canvas)

    uiTexture.minFilter = uiTexture.magFilter = LinearFilter
    uiTexture.needsUpdate = true

    let uiMaterial = new MeshBasicMaterial({ map: uiTexture, transparent: true })
    let uiGeometry = new PlaneGeometry(screenWidth, screenHeight)
    let uiMesh = new Mesh(uiGeometry, uiMaterial)

    hudScene.add(uiMesh)

    this.needUpdateTextures.push(uiTexture)
    this.hudCanvas = canvas
    this.hudScene = hudScene
    this.hudCamera = hudCamera
  }
}
