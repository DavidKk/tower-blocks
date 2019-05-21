export class Spinner {
  public isOpen: boolean
  public node: HTMLElement

  constructor () {
    this.isOpen = true
    this.node = document.getElementById('spinner')
  }

  public show (): void {
    if (this.isOpen !== true) {
      this.node.classList.add('in')
      this.isOpen = true
    }
  }

  public hide (): void {
    if (this.isOpen !== false) {
      this.node.classList.remove('in')
      this.isOpen = false
    }
  }
}

export default new Spinner()
