
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

  save() {
        const diner = new Diner();
        diner.id = this.id;
        diner.forename = this._dinerForm.value.Forename;
        diner.surname = this._dinerForm.value.Surname;
        diner.notes = this._dinerForm.value.Notes;
        diner.lastUpdatedAt = new Date();
        // TODO: change this to use signed in user
        diner.lastUpdatedByEmailAddress = 'nialltucker@gmail.com';

        this._dinerService.Update(diner).subscribe(response =>  {
            this._notificationsService.success('Diner updated', 'You have successfully updated diner details.');
            this.dialogRef.close(diner);
        }
        );
      }
  }
