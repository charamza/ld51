export default class Score {
  public rescuedPeople: number;
  public killedPeople: number;

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.rescuedPeople = 0;
    this.killedPeople = 0;
  }
}
