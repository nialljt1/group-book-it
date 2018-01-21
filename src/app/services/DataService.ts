import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DataService {
  private messageSourceEmailAddress = new BehaviorSubject<string>('');
  myEmailAddress: Observable<string> = this.messageSourceEmailAddress.asObservable();

  private messageSourceFirstName = new BehaviorSubject<string>('');
  myFirstName = this.messageSourceFirstName.asObservable();

  private messageSourceSurname = new BehaviorSubject<string>('');
  mySurname = this.messageSourceSurname.asObservable();

  constructor() { }
  updateMyDetails(emailAddress: string, firstName: string, surname: string) {
    this.messageSourceEmailAddress.next(emailAddress);
    this.messageSourceFirstName.next(firstName);
    this.messageSourceSurname.next(surname);
  }
}
