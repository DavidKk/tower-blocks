import * as path from 'path'
import * as fs from 'fs-extra'
import * as chokidar from 'chokidar'
import chalk from 'chalk'

const isWatch = -1 !== process.argv.indexOf('--watch')
const fileName = 'project.config.json'
const jsonName = 'game.json'
const rootPath = path.join(__dirname, '../')
const srcPath = path.join(rootPath, './src')
const distPath = path.join(rootPath, './app')

const projFile = path.join(rootPath, fileName)
const jsonFile = path.join(srcPath, jsonName)

copyFile(projFile)
copyFile(jsonFile)

if (isWatch) {
  let watcher = chokidar.watch([projFile, jsonFile])
  watcher.on('change', copyFile)

  let handleProcessSigint = process.exit.bind(process)
  let handleProcessExit = function () {
    watcher && watcher.close()

    process.removeListener('exit', handleProcessExit)
    process.removeListener('SIGINT', handleProcessSigint)

    handleProcessExit = undefined
    handleProcessSigint = undefined
    watcher = undefined
  }

  process.on('exit', handleProcessExit)
  process.on('SIGINT', handleProcessSigint)
}

function copyFile (filePath: string): void {
  let optoins = fs.readJSONSync(filePath)
  delete optoins.miniprogramRoot

  let file = path.join(distPath, path.basename(filePath))
  fs.ensureDirSync(distPath)
  fs.writeFileSync(file, JSON.stringify(optoins))

  console.log(chalk.green(`Write file ${chalk.bold(file)} completed`))
}
