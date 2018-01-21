
import { NotificationsService } from 'angular2-notifications';
import { DinerService } from './../services/DinerService';
import { Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Diner } from '../models/diner';
import { ITdDynamicElementConfig, TdDynamicElement, TdDynamicType,
  ITdDynamicElementValidator, TdDynamicFormsComponent } from '@covalent/dynamic-forms';
  import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
  import { DataService } from '../services/DataService';

 @Component({
  // tslint:disable-next-line:component-selector
  selector: 'diner-update-dialog',
  templateUrl: 'diner-update-dialog.html',
})
// tslint:disable-next-line:component-class-suffix
export class DinerUpdateDialog implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DinerUpdateDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dinerService: DinerService,
    private _notificationsService: NotificationsService,
    private centralData: DataService
  ) {}

  @ViewChild('myDetailsForm')
  _myDetailsForm: TdDynamicFormsComponent;

  @ViewChild('dinerForm')
  _dinerForm: TdDynamicFormsComponent;

  public id: number;
  public forename: string;
  public surname: string;
  public notes: string;
  public bookingId: string;
  public isUpdateDiner: boolean;
  public reuseName: boolean;

  myDetailsTextElements: ITdDynamicElementConfig[] = [
    {
    name: 'myFirstName',
    label: 'Forename',
    type: TdDynamicElement.Input,
    required: true,
    maxLength: 30
  },
  {
    name: 'mySurname',
    label: 'Surname',
    type: TdDynamicElement.Input,
    required: true,
    maxLength: 30
  },
  {
    name: 'myEmailAddress',
    label: 'Email address',
    type: TdDynamicElement.Input,
    required: true,
    maxLength: 100
  },
  {
    name: 'reuseName',
    label: 'Use my name when adding first diner',
    type: TdDynamicElement.Checkbox,
    default: true
  }
 ];

  textElements: ITdDynamicElementConfig[] = [
    {
    name: 'Forename',
    type: TdDynamicElement.Input,
    required: true,
    maxLength: 30
  },
  {
    name: 'Surname',
    type: TdDynamicElement.Input,
    required: true,
    maxLength: 30
  },
  {
    name: 'Notes',
    type: TdDynamicElement.Textarea,
    required: false
  }
 ];

 myEmailAddress: string;
 myFirstName: string;
 mySurname: string;

 ngOnInit() {
  this.centralData.myEmailAddress.subscribe(myEmailAddress => this.myEmailAddress = myEmailAddress);
  this.centralData.myFirstName.subscribe(myFirstName => this.myFirstName = myFirstName);
  this.centralData.mySurname.subscribe(mySurname => this.mySurname = mySurname);
}

myDetailsEntered(): boolean {
  return this.myEmailAddress !== '';
}

  cancel() {
    this.dialogRef.close();
  }

  title() {
    return this.isUpdateDiner ? 'Update Diner' : 'Add Diner';
  }

  delete() {
    this._dinerService.Delete(this.id).subscribe(response =>  {
      const diner = new Diner();
      diner.id = this.id;
      diner.bookingId = '-1';
      this._notificationsService.success('Diner removed', 'You have successfully removed a diner.');
      this.dialogRef.close(diner);
    });
  }

  addMyDetails(): void {
    const myFirstName = this._myDetailsForm.value.myFirstName;
    const mySurname = this._myDetailsForm.value.mySurname;
    this.centralData.updateMyDetails(this._myDetailsForm.value.myEmailAddress, myFirstName, mySurname);
    if (this._myDetailsForm.value.reuseName) {
      this.textElements[0].default = myFirstName;
      this.textElements[1].default = mySurname;
    }
  }

  save() {
        const diner = new Diner();
        diner.id = this.id;
        diner.forename = this._dinerForm.value.Forename;
        diner.surname = this._dinerForm.value.Surname;
        diner.notes = this._dinerForm.value.Notes;
        diner.lastUpdatedAt = new Date();
        diner.lastUpdatedByEmailAddress = this.myEmailAddress;
        if (!this.isUpdateDiner) {
          diner.bookingId = 'E166F9A4-5B7B-4C9E-6513-08D45597AED5';
          diner.lastUpdatedByEmailAddress = this.myEmailAddress;
          diner.lastUpdatedAt = new Date();
          diner.addedByEmailAddress = this.myEmailAddress;
          diner.addedAt = new Date();
          this._dinerService.Add(diner).subscribe(response =>  {
            diner.id = response.json().id;
            this._notificationsService.success('Diner added', 'You have successfully added a diner.');
            this.dialogRef.close(diner);
          }
        );
        } else {
            this._dinerService.Update(diner).subscribe(response =>  {
              this._notificationsService.success('Diner updated', 'You have successfully updated diner details.');
              this.dialogRef.close(diner);
          }
        );
        }
      }
  }
