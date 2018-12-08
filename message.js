module.exports = class Message {
  constructor(from, content) {
    this.from = from;
    this.time = Date.now;
    this.content = content;
  }
}