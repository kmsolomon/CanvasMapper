// Type == what type of action occurred (ie delete, add, move)
export default class HistoryStep {
  constructor(type, object) {
    this.type = type;
    this.object = object;
  }
}
