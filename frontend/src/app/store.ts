import { BehaviorSubject } from 'rxjs';
import { State } from './state';
import { distinctUntilChanged } from 'rxjs/operators';

const state: State = {
  budgets: undefined,
};

export class Store {
  private subject = new BehaviorSubject<State>(state);
  //   private store = this.subject.asObservable().distinctUntilChanged();

  set(name: string, state: any) {
    // this.subject.next({});
  }
}
