import { Component, OnInit } from '@angular/core';
import data from './data.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'budgeting-app';
  active = 1;

  months: string[];

  payments: {
    description: string;
    amount: number;
  }[];

  budgets: {
    description: string;
    amount: number;
  }[];

  constructor() {
    this.months = data.months;
    this.payments = data.monthlyPayments;
    this.budgets = data.monthlyBudgets;
  }

  ngOnInit() {
    // console.log(this.payments);
  }

  get paymentSubTotal(): number {
    let value = 0;
    this.payments.forEach((val) =>
      val.description == 'Income'
        ? (value += val.amount)
        : (value -= val.amount)
    );
    return value;
  }

  get budgetSubTotal(): number {
    let value = 0;
    this.budgets.forEach((val) => (value += val.amount));
    return value;
  }
}
