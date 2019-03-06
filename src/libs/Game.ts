import defaultsDeep from 'lodash/defaultsDeep'
import { Group, Color } from 'three'
import Block from './Block'
import Stage from './Stage'
import DevTool from './DevTool'
import {
  TouchEventHandle,
  BlockDirection,
  BlockOptions,
  BlockPosition
} from '../types'
import { isMobile } from '../share/device'

export default class Game {
  static offsetColor = Math.round(Math.random() * 100)
  static movingRanges = {
    moveXStart: -12,
    moveXEnd: 12,
    moveZStart: -12,
    moveZEnd: 12
  }

  private playing: boolean
  private finished: boolean
  private missed: boolean
  private index: number
  private score: number
  private blocks: Array<Block>
  private movingBlock: Block
  private dropBlock: Block
  private topBlock: Block
  private movingSpeed: number
  private viewMaxY: number
  private viewOffsetY: number
  private devTool: DevTool
  private stage: Stage
  private moves: Group
  private drops: Group
  private chops: Group
  private handleKeyDown: TouchEventHandle
  private handleClick: TouchEventHandle
  private handleTouch: TouchEventHandle

  constructor () {
    this.playing = false
    this.finished = false
    this.missed = false
    this.index = 0
    this.score = 0
    this.blocks = []
    this.movingBlock = null
    this.topBlock = null
    this.movingSpeed = 0.2
    this.viewMaxY = 30
    this.viewOffsetY = -15

    this.devTool = new DevTool()
    this.stage = new Stage()
    this.moves = new Group()
    this.drops = new Group()
    this.chops = new Group()

    this.nextTick = this.nextTick.bind(this)

    this.stage.add(this.moves)
    this.stage.add(this.drops)
    this.stage.add(this.chops)

    this.initController()
    this.nextTick()

    this.topBlock = this.addChoppedBlock()
  }

  private genOffsetColor (zIndex: number) {
    let offset = zIndex + Game.offsetColor
    let r = Math.sin(0.3 * offset) * 55 + 200
    let g = Math.sin(0.3 * offset + 2) * 55 + 200
    let b = Math.sin(0.3 * offset + 4) * 55 + 200
    return new Color(r / 255, g / 255, b / 255)
  }

  private initController () {
    this.handleKeyDown = (event) => event instanceof KeyboardEvent && event.keyCode === 32 && this.onActions()
    this.handleClick = () => this.onActions()
    this.handleTouch = () => this.onActions()

    if (isMobile) {
      document.addEventListener('touchstart', this.handleTouch)
    } else {
      document.addEventListener('keydown', this.handleKeyDown)
      document.addEventListener('click', this.handleClick)
    }
  }

  private onActions () {
    if (this.playing === true) {
      this.crop()
      return
    }

    if (this.finished === true) {
      this.reset()
      return
    }

    if (this.playing === false && this.finished === false) {
      this.start()
    }
  }

  public addBlock (props: BlockOptions = {}) {
    let direction = this.index % 2 ? 'x' : 'z'
    let position = { x: 0, y: this.index, z: 0 }
    let color = this.genOffsetColor(position.y)
    let speed = this.movingSpeed + this.index * 0.005
    let options = defaultsDeep({}, props, { position, direction, color, speed, ...Game.movingRanges })

    options.position.y += this.viewOffsetY
    return new Block(options)
  }

  public addChoppedBlock (props: BlockOptions = {}) {
    let block = this.addBlock({ ...props })

    this.chops.add(block.mesh)
    this.blocks.push(block)

    return block
  }

  public delChoppedBlock (block: Block) {
    let index = this.blocks.indexOf(block)
    if (index !== -1) {
      this.blocks.splice(index, 1)
      this.chops.remove(block.mesh)
      return true
    }

    return false
  }

  public addMovingBlock (props: BlockOptions = {}) {
    let moving = this.devTool.isCheat === true ? false : true
    let block = this.addBlock({ ...props, moving })

    this.moves.add(block.mesh)
    this.blocks.push(block)

    return block
  }

  public delMovingBlock (block: Block) {
    let index = this.blocks.indexOf(block)
    if (index !== -1) {
      this.blocks.splice(index, 1)
      this.moves.remove(block.mesh)
      return true
    }

    return false
  }

  public addDropedBlock (props: BlockOptions = {}) {
    let block = this.addBlock({ ...props, dropping: true })

    this.drops.add(block.mesh)
    this.blocks.push(block)

    return block
  }

  public delDroppedBlock (block: Block) {
    let index = this.blocks.indexOf(block)
    if (index !== -1) {
      this.blocks.splice(index, 1)
      this.drops.remove(block.mesh)
      return true
    }

    return false
  }

  public crop () {
    if (this.topBlock && this.movingBlock) {
      let axis = this.movingBlock.direction
      let size = axis === 'x' ? 'width' : 'depth'

      let delta = this.topBlock.position[axis] - this.movingBlock.position[axis]
      let overlap = this.topBlock.dimension[size] - Math.abs(delta)

      if (overlap > 0) {
        let { position, dimension, color } = this.movingBlock
        let { x, z } = position
        let { height, width, depth } = dimension

        let dropPosition = { x, y: this.index >= this.viewMaxY ? this.viewMaxY - 1 : this.index, z }
        let dropDimension = { width, height, depth }

        let chopPosition = { x, y: this.index >= this.viewMaxY ? this.viewMaxY - 1 : this.index, z }
        let chopDimension = { width, height, depth }

        let movePosition = { x, y: this.index >= this.viewMaxY ? this.viewMaxY : this.index + 1, z }

        let positive = delta > 0 ? -1 : 1
        dropPosition[axis] = dropPosition[axis] + overlap / 2 * positive
        dropDimension[size] -= overlap

        chopPosition[axis] = chopPosition[axis] - (chopDimension[size] - overlap) / 2 * positive
        chopDimension[size] = overlap

        let randomKey = Math.round(Math.random())
        movePosition[axis] = chopPosition[axis]
        movePosition[axis === 'x' ? 'z' : 'x'] = axis === 'x'
          ? [Game.movingRanges.moveXStart, Game.movingRanges.moveXEnd][randomKey]
          : [Game.movingRanges.moveZStart, Game.movingRanges.moveZEnd][randomKey]

        if (this.devTool.isCheat === true) {
          delete movePosition[axis === 'x' ? 'z' : 'x']
        }

        this.index ++

        if (overlap > 0.8) {
          this.delMovingBlock(this.movingBlock)

          if (Math.abs(delta) > 0.3) {
            this.dropBlock = this.addDropedBlock({ dimension: dropDimension, position: dropPosition, color })
          }

          this.topBlock = this.addChoppedBlock({ dimension: chopDimension, position: chopPosition, color })
          this.movingBlock = this.addMovingBlock({ dimension: chopDimension, position: movePosition })

          if (this.index >= this.viewMaxY) {
            this.blocks.forEach((block) => {
              block.mesh.position.y --
            })
          }

          this.score ++
          this.stage.setScore(this.score)

        } else {
          if (overlap > 0.3) {
            this.delMovingBlock(this.movingBlock)
            this.dropBlock = this.addDropedBlock({ dimension: dropDimension, position: dropPosition, color })
            this.topBlock = this.addChoppedBlock({ dimension: chopDimension, position: chopPosition, color })

            this.score++
            this.stage.setScore(this.score)
          }

          this.end()
        }
      } else {
        this.lose()
      }
    }
  }

  public start () {
    if (this.playing === true) {
      return
    }

    this.stage.togglePlay(false)
    this.topBlock && this.delChoppedBlock(this.topBlock)
    this.topBlock = this.addChoppedBlock()
    this.index++

    let direction = this.index % 2 ? BlockDirection.x : BlockDirection.z
    let randomKey = Math.round(Math.random())
    let position: BlockPosition = {
      [direction]: direction === BlockDirection.x
        ? [Game.movingRanges.moveXStart, Game.movingRanges.moveXEnd][randomKey]
        : [Game.movingRanges.moveZStart, Game.movingRanges.moveZEnd][randomKey]
    }

    if (this.devTool.isCheat === true) {
      delete position[direction]
    }

    this.movingBlock = this.addMovingBlock({ position })
    this.playing = true
  }

  public end () {
    let { dimension, position } = this.movingBlock
    this.delMovingBlock(this.movingBlock)
    this.dropBlock = this.addDropedBlock({ dimension, position })

    this.playing = false
    this.finished = true

    this.stage.setMessage('Game Over')
    this.stage.toggleMessage(true)
  }

  public lose () {
    this.end()
    this.missed = true
  }

  public reset () {
    return new Promise((resolve) => {
      this.blocks.forEach((block) => {
        block.moving = false
        block.dropping = true
      })

      const finished = () => {
        this.blocks = this.blocks.filter((block) => !this.stage.detectOffScreen(block.mesh))

        if (this.blocks.length > 0) {
          requestAnimationFrame(finished)
        } else {
          this.playing = false
          this.finished = false
          this.missed = false
          this.score = 0
          this.index = 0
          this.viewOffsetY = -15

          this.topBlock = this.addChoppedBlock()
          this.stage.setScore(this.score)
          this.stage.togglePlay(true)

          resolve()
        }
      }

      this.stage.toggleMessage(false)

      finished()
    })
  }

  public nextTick () {
    this.devTool.begin()

    this.stage.render()
    this.blocks.forEach((block) => block.nextTick())

    // auto remove drop blocks
    if (this.dropBlock && this.stage.detectOffScreen(this.dropBlock.mesh)) {
      this.delDroppedBlock(this.dropBlock)
      this.dropBlock = null
    }

    this.devTool.end()
    requestAnimationFrame(this.nextTick)
  }

  public destory () {
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('click', this.handleClick)
    document.removeEventListener('touchstart', this.handleTouch)

    this.handleKeyDown = undefined
    this.handleClick = undefined
    this.handleTouch = undefined
  }
}
