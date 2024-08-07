import { HistoryDetail, HistoryType } from "./types";

// Type == what type of action occurred (ie delete, add, move)
export default class HistoryStep {
  step: HistoryDetail;

  constructor(h: HistoryDetail) {
    this.step = h;
  }
}
