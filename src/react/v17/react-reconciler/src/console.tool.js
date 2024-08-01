
const logColor = ({name, color, args}) => {
  console.log(`%c${name}`, `color: ${color};`, ...args);
}

const logGreen = ({ name, args }) => {
  logColor({args, color: 'green', name});
}

const logRed = ({name, args}) => {
  logColor({args, color: 'red', name});
}
const logWhite = ({name, args}) => {
  logColor({args, color: 'white', name});
}
const logPink = ({name, args}) => {
  logColor({args, color: 'pink', name});
}
export { logColor, logGreen, logRed, logWhite, logPink };