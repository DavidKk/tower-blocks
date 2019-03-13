import Game from './libs/Game'

export default new Game()

let spinner = document.getElementById('spinner')
spinner.classList.add('out')
setTimeout(() => spinner.parentElement.removeChild(spinner), 0.36e3)
