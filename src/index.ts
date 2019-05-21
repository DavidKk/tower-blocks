import Game from './libs/Game'
import Spinner from './share/spinner'

const startup = () => {
  Spinner.hide()
}

const game = new Game()
game.play().then(startup)
