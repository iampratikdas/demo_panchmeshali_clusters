function GenKey(length, type = "") {
  let result = '';
  switch (type) {
      case "number":
          let characters =
              '0123456789';
          let charactersLengths = characters.length;
          for (let i = 0; i < length; i++) {
              result += characters.charAt(Math.floor(Math.random() * charactersLengths));
          }
          break;

      default:
          let character =
              'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          let charactersLength = character.length;
          for (let i = 0; i < length; i++) {
              result += character.charAt(Math.floor(Math.random() * charactersLength));
          }
          break;
  }
  return result;
}
module.exports = GenKey;