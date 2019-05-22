import * as path from 'path'
import * as fs from 'fs-extra'
import { promisify } from 'util'
import * as conf from './conf'

const writeFileAsync = promisify(fs.writeFile.bind(fs))

export const copyJsonFile = (filePath: string): Promise<void> => {
  let optoins = fs.readJSONSync(filePath)
  delete optoins.miniprogramRoot

  let file = path.join(conf.appPath, path.basename(filePath))

  fs.ensureDirSync(conf.appPath)
  return writeFileAsync(file, JSON.stringify(optoins))
}
