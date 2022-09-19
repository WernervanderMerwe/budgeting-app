import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'budgeting-app';
  active = 1;

  months: string[] = [
    '25 April - 25 May',
    '25 June - 25 July',
    '25 August - 25 September',
  ];
}
