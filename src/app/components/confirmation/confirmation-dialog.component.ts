import { Component, Input } from '@angular/core';
///import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
  selector: 'confirm-dialog',
  templateUrl: './confirmation-dialog.component.html',
})
export class ConfirmationDialogComponent {
  constructor(
    ////public dialogRef: MatDialogRef<ConfirmationDialogComponent>
  ) {}

  public confirmMessage:string;
}
