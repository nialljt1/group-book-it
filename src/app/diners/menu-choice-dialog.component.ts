import { NotificationsService } from 'angular2-notifications';
import { DinerMenuItemsService } from './../services/DinerMenuItemsService';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, Inject } from '@angular/core';
import { ITdDataTableColumn, TdDataTableSortingOrder } from '@covalent/core';
import { DinerMenuItem } from '../models/dinerMenuItem';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'menu-choice-dialog',
  templateUrl: 'menu-choice-dialog.html',
  styleUrls: ['menu-choice.component.css']
})
// tslint:disable-next-line:component-class-suffix
export class MenuChoiceDialog {

  // Could leave this as a TODO: addn instructions at the top saying you can add a note to put a requirement for that item. Add toggle
  // add not

  constructor(
    public dialogRef: MatDialogRef<MenuChoiceDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dinerMenuItemsService: DinerMenuItemsService,
    private _notificationsService: NotificationsService,

  ) { }

  tableData: any[] = [];
  columns: ITdDataTableColumn[] =
    [
      { name: 'name', label: 'Name'},
      { name: 'description', label: 'Description'},
      { name: 'quantity', label: 'Quantity'}
    ];

    filteredData: any[] = this.tableData;
    filteredTotal: number = this.tableData.length;

    searchTerm = '';
    fromRow = 1;
    currentPage = 1;
    pageSize = 5;
    sortBy = 'name';
    selectedRows: any[] = [];
    sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;

  public menuSectionName: string;
  public dinerId: number;

  addMenuItem(row: any, event: any) {
    const target = event.target || event.srcElement || event.currentTarget;
    const quantity = target.parentElement.parentElement.parentElement.children[2].children[0].value;
    const dinerMenuItem = new DinerMenuItem();
    dinerMenuItem.menuItemId = row.id;
    dinerMenuItem.quantity = quantity;
    dinerMenuItem.dinerId = this.dinerId;
    // TODO: implement note
    //// dinerMenuItem.note = 'test'
    this._dinerMenuItemsService.Add(dinerMenuItem).subscribe(response =>  {

      this._notificationsService.success('Menu choice added', 'You have successfully added a menu choice');
      this.dialogRef.close( {name: row.name, id : response.json().id} );
    }
  );
}

  search(event: any) {
  }

  cancel() {
    this.dialogRef.close();
  }

  }
