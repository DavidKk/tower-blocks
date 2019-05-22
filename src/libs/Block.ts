import pick from 'lodash/pick'
import defaults from 'lodash/defaults'
import { BoxGeometry, MeshLambertMaterial, Mesh } from 'three'
import * as Typings from '../typings'

export default class Block {
  public moving: boolean
  public dropping: boolean
  public direction: keyof typeof Typings.BlockDirection
  public speed: number
  public color: number
  public geometry: BoxGeometry
  public material: MeshLambertMaterial
  public mesh: Mesh
  private moveXStart: number
  private moveXEnd: number
  private moveZStart: number
  private moveZEnd: number
  private v: number = 0
  static g: number = 0.098

  get dimension () {
    let { width, height, depth } = this.geometry.parameters
    return { width, height, depth }
  }

  get position () {
    return this.mesh.position
  }

  get metadata () {
    let keys = ['moving', 'direction', 'speed', 'dimension', 'position', 'color']
    return pick(this, keys)
  }

  get moveStart () {
    return this.direction === 'x' ? this.moveXStart : this.moveZStart
  }

  get moveEnd () {
    return this.direction === 'x' ? this.moveXEnd : this.moveZEnd
  }

  constructor (props: Typings.BlockOptions = {}) {
    let position = defaults({}, props.position, { x: 0, y: 0, z: 0 })
    let dimension = defaults({}, props.dimension, { width: 10, height: 1, depth: 10 })

    this.moving = props.hasOwnProperty('moving') ? props.moving : false
    this.dropping = props.hasOwnProperty('dropping') ? props.dropping : false
    this.direction = props.hasOwnProperty('direction') ? props.direction : Typings.BlockDirection.x
    this.speed = props.hasOwnProperty('speed') ? props.speed : 0.2
    this.moveXStart = props.hasOwnProperty('moveXStart') ? props.moveXStart : position.x - 12
    this.moveXEnd = props.hasOwnProperty('moveXEnd') ? props.moveXEnd : position.x + 12
    this.moveZStart = props.hasOwnProperty('moveZStart') ? props.moveZStart : position.z - 12
    this.moveZEnd = props.hasOwnProperty('moveZEnd') ? props.moveZEnd : position.z + 12
    this.color = props.hasOwnProperty('color') ? props.color : 0x333344

    this.geometry = new BoxGeometry(dimension.width, dimension.height, dimension.depth)
    this.material = new MeshLambertMaterial({ color: this.color })
    this.mesh = new Mesh(this.geometry, this.material)

    this.mesh.castShadow = true
    this.mesh.position.x = position.x
    this.mesh.position.y = position.y
    this.mesh.position.z = position.z
  }

  public move (): void {
    this.moving = true
  }

  public drop (): void {
    this.dropping = true
  }

  public stop (): void {
    this.moving = false
    this.dropping = false
  }

  public reverseDirection (): void {
    this.speed *= -1
  }

  public nextTick (): void {
    if (this.moving === true) {
      let pos = this.mesh.position
      if (pos[this.direction] < this.moveStart || pos[this.direction] > this.moveEnd) {
        this.reverseDirection()
      }

      pos[this.direction] += this.speed
    } else if (this.dropping === true) {
      this.mesh.position.y -= this.v
      this.v += Block.g
    }
  }
}
