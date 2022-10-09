import { Component, OnInit } from '@angular/core';
import { throwIfEmpty } from 'rxjs';
import data from './data.json';

// interface Entries {
//   budget: string;
//   description: string;
//   amount: number;
// }

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

  budgetEntries: {
    budget: string;
    description: string;
    amount: number;
  }[];

  groceriesFiltered: {
    budget: string;
    description: string;
    amount: number;
  }[] = [];
  fuelFiltered: {
    budget: string;
    description: string;
    amount: number;
  }[] = [];
  eatingOutFiltered: {
    budget: string;
    description: string;
    amount: number;
  }[] = [];
  hobbiesFiltered: {
    budget: string;
    description: string;
    amount: number;
  }[] = [];

  constructor() {
    this.months = data.months;
    this.payments = data.monthlyPayments;
    this.budgets = data.monthlyBudgets;
    this.budgetEntries = data.budgetEntries;
  }

  ngOnInit() {
    this.groceryFilter();
    this.fuelFilter();
    this.eatingOutFilter();
    this.hobbiesFilter();
    console.log(this.groceriesFiltered);
  }

  groceryFilter() {
    const newArray = this.budgetEntries.filter(
      (item) => 'Groceries' === item.budget
    );
    this.groceriesFiltered = [...newArray];
    console.log(this.groceriesFiltered);
  }

  fuelFilter() {
    const newArray = this.budgetEntries.filter(
      (item) => 'Fuel' === item.budget
    );
    this.fuelFiltered = [...newArray];
  }

  eatingOutFilter() {
    const newArray = this.budgetEntries.filter(
      (item) => 'Eating Out' === item.budget
    );
    this.fuelFiltered = [...newArray];
  }

  hobbiesFilter() {
    const newArray = this.budgetEntries.filter(
      (item) => 'Hobbies' === item.budget
    );
    this.hobbiesFiltered = [...newArray];
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

  get groceriesTotal(): number {
    let value = 0;
    this.groceriesFiltered.forEach((val) => (value += val.amount));
    return value;
  }

  /*
  someFn() {
    
  const someField = "Groceries";
  
  
  //const items = budgetEntries.filter(i => i.budget === someField)
  const budgetKeys = new Set(Object.keys(bodygetEnties));
  const objInit = Object.entries(budgetKeys.values().map(i => ([i, []])))
  
  const budgetObject = budgetKeys.reduce((acc, curr) => {
    acc[curr.budget].push(curr);
  },objInit)
  
  
  budgetObject.Groceries = [
    { "budget": "Groceries", "description": "Checkers", "amount": 340 },
    { "budget": "Groceries", "description": "Woolies", "amount": 420 },
  ]
  
  
  ////
  let someActiveDataSet;
  function onClick(someKey) {
    return function() {
      someActiveDataSet = budgetObject[someKey]
    }
  }
  
  
  ////
  ngFor="let budgetItems of someActiveDataSet"
  }
  */
}
