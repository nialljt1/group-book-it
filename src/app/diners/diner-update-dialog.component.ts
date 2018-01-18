
import { NotificationsService } from 'angular2-notifications';
import { DinerService } from './../services/DinerService';
import { Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Diner } from '../models/diner';
import { ITdDynamicElementConfig, TdDynamicElement, TdDynamicType,
  ITdDynamicElementValidator, TdDynamicFormsComponent } from '@covalent/dynamic-forms';
  import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'diner-update-dialog',
  templateUrl: 'diner-update-dialog.html',
})
// tslint:disable-next-line:component-class-suffix
export class DinerUpdateDialog {

  constructor(
    public dialogRef: MatDialogRef<DinerUpdateDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dinerService: DinerService,
    private _notificationsService: NotificationsService,

  ) {}

  @ViewChild('dinerForm')
  _dinerForm: TdDynamicFormsComponent;

  public id: number;
  public forename: string;
  public surname: string;
  public notes: string;
  public bookingId: string;
  public isUpdateDiner: boolean;

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

  save() {
        const diner = new Diner();
        diner.id = this.id;
        diner.forename = this._dinerForm.value.Forename;
        diner.surname = this._dinerForm.value.Surname;
        diner.notes = this._dinerForm.value.Notes;
        diner.lastUpdatedAt = new Date();
        // TODO: change this to use signed in user
        diner.lastUpdatedByEmailAddress = 'nialltucker@gmail.com';
        if (!this.isUpdateDiner) {
          diner.bookingId =  'E166F9A4-5B7B-4C9E-6513-08D45597AED5';
          diner.lastUpdatedByEmailAddress = 'nialltucker@gmail.com';
          diner.lastUpdatedAt = new Date();
          diner.addedByEmailAddress = 'nialltucker@gmail.com';
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
