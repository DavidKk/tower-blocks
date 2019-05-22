import * as path from 'path'
import http, { IncomingMessage, ServerResponse } from 'http'
import chalk from 'chalk'
import ip from 'ip'
import express from 'express'
import Bundler, { ParcelOptions } from 'parcel-bundler'
import portscanner from 'portscanner'
import { copyJsonFile } from './share'
import * as conf from './conf'

const app = express()
const ProejctFileName = 'project.config.json'
const GameJsonFileName = 'game.json'

export default async function bundle (webEntry: string, appEntry: string, optoins?: ParcelOptions): Promise<void> {
  const bundler = new Bundler(webEntry, optoins)
  bundler.on('buildStart', async (entryPoints) => {
    entryPoints.push(appEntry)
  })

  bundler.on('bundled', () => {
    const projFile = path.join(conf.rootPath, ProejctFileName)
    const jsonFile = path.join(conf.srcPath, GameJsonFileName)

    const promises = [copyJsonFile(projFile), copyJsonFile(jsonFile)]
    return Promise.all(promises)
  })

  const host = ip.address()
  const port = await portscanner.findAPortNotInUse(3000, 8000, host)

  const defaultRoute = (request: IncomingMessage, response: ServerResponse) => {
    const options = {
      method: 'GET',
      host: host,
      port: port,
      path: '/index.html',
      headers: request.headers
    }

    const handleRequest = (proxyResponse: IncomingMessage) => {
      proxyResponse.setEncoding('utf8')

      proxyResponse.on('data', (chunk) => {
        response.write(chunk)
      })

      proxyResponse.on('close', () => {
        response.end()
      })

      proxyResponse.on('end', () => {
        response.end()
      })
    }

    const catchError = (error: Error) => {
      response.writeHead(500)
      response.end(error.message)
    }

    const proxyRequest = http.request(options, handleRequest)
    proxyRequest.on('error', catchError)
    proxyRequest.end()
  }

  if (conf.isRelease) {
    bundler.bundle()

  } else {
    app.use(bundler.middleware())
    app.get('/', defaultRoute)

    app.listen(port, host, () => {
      console.log(`\n${chalk.white.bold('Server running at')} ${chalk.cyan.bold(`http://${host}:${port}`)}`)
    })
  }
}
