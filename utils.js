const generateColor = () => {
  const colors = ["#ff1ad9", "#c069ff", "#45a1ff", "#00feff", "#30e60b", "#ffe900", "#ff9400", "#ff0039"];
  const i = Math.floor(Math.random() * colors.length);
  return {
    main: colors[i],
    alt: colors[(i+1) % colors.length]
  }
}

module.exports = { generateColor }