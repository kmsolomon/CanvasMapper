// Type == what type of action occurred (ie delete, add, move)
export default class HistoryStep {
  constructor(type, obj) {
    this.type = type;
    this.obj = obj;
  }
}
