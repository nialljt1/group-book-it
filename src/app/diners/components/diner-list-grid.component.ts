import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Diner } from '../../models/diner';
import { DinerMenuItemsService } from '../../services/DinerMenuItemsService';

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// import { Observable } from 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/observable/forkJoin';

import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { TdDialogService, CovalentLayoutModule, CovalentStepsModule, CovalentPagingModule, CovalentSearchModule } from '@covalent/core';
import { ITdDynamicElementConfig, TdDynamicElement, TdDynamicType,
  ITdDynamicElementValidator, TdDynamicFormsComponent } from '@covalent/dynamic-forms';

import {Directive, Input, ViewChild} from '@angular/core';
import { DinerUpdateDialog } from './../diner-update-dialog.component';
import { MenuChoiceDialog } from './../menu-choice-dialog.component';
import { DataService } from '../../services/DataService';

import { MatSnackBar } from '@angular/material';

/* TODO: Fix sorting Currently only sorts one way doesn't switch to reverse when you try to sort by a column twice */

@Component({
    selector: 'app-diner-list-grid',
    templateUrl: 'diner-list-grid.component.html',
    styleUrls: [
      'diner-list-grid.component.css',
    '../../css/FixedTableHeader/main.css'
  ]
})
export class DinersListGridComponent implements OnInit, OnDestroy   {

  myEmailAddress: string;
  myFirstName: string;
  mySurname: string;
  isMyDiners: boolean;

  noResultsMessage: string;
  gridHeader: string;

  data: any = [];

  filteredData: any[] = this.data;
  filteredTotal: number = this.data.length;

  searchTerm = '';
  fromRow = 1;
  currentPage = 1;
  pageSize = 500;
  sortBy = 'name';
  selectedRows: any[] = [];
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;

  public message: string;
  private sub: any;
  public downloadUrl: string;
  public showEditPanel = false;

  public expandedDiners: Diner[] = [];

    constructor(
        private _dinerMenuItemsService: DinerMenuItemsService,
        private _route: ActivatedRoute,
        private _router: Router,
        private _dataTableService: TdDataTableService,
        private _dialogService: TdDialogService,
        private _dialog: MatDialog,
        private _dataService: DataService,
        public _snackBar: MatSnackBar
    ) {
        this.message = 'Diners';
        this.loadData();
    }

    ngOnInit(): void {
      this._dataService.myEmailAddress.subscribe(message => {
          this.myEmailAddress = message;
          this.loadData();
        });
      this._dataService.myFirstName.subscribe(message => this.myFirstName = message);
      this._dataService.mySurname.subscribe(message => this.mySurname = message);
      this._dataService.dinerData.subscribe(message => {
          this.data = message;
          this.filteredData = this.data;
          this.filteredTotal = this.data.length;
          this.filter();
        }
      );
    }

    openDialog(row: any, setProfileOnly: boolean = false) {
      const dialogRef = this._dialog.open(DinerUpdateDialog, {
      height: '512px',
      disableClose: false
      });

      dialogRef.componentInstance.id = row.id;
      dialogRef.componentInstance.dinerForename = row.forename;
      dialogRef.componentInstance.dinerSurname = row.surname;
      dialogRef.componentInstance.dinerNotes = row.notes;
      dialogRef.componentInstance.isUpdateDiner = (row.id != null);
      dialogRef.componentInstance.setProfileOnly = setProfileOnly;

      if (this.myEmailAddress)
      {
        dialogRef.componentInstance.userForename = this.myFirstName;
        dialogRef.componentInstance.userSurname = this.mySurname;
        dialogRef.componentInstance.userEmailAddress = this.myEmailAddress;
      }

      dialogRef.beforeClose().subscribe(result => {
        if (result) {
          if (row.id != null) {
            const diner = this.data.find(s => s.id === result.id);
            if (result.bookingId === '-1') {
              this.data = this.data.filter(s => s.id !== result.id);
              this._snackBar.open('Diner deleted', null, { duration: 2000 });
              this.filter();
            } else {
              diner.forename = result.forename;
              diner.surname = result.surname;
              diner.notes = result.notes;
              this._snackBar.open('Diner updated', null, {
                duration: 2000,
              });
            }

          } else {
            const dinerToAdd = new Diner();
            dinerToAdd.id = result.id;
            dinerToAdd.id = result.id;
            dinerToAdd.forename = result.forename;
            dinerToAdd.surname = result.surname;
            dinerToAdd.notes = result.notes;
            dinerToAdd.addedByEmailAddress = this.myEmailAddress;
            dinerToAdd.addedAt = new Date();
            this.menuChoiceColumns().forEach(column => {
              dinerToAdd[column.name] = [];
            });
            this.data.push(dinerToAdd);
            this.filter();

            this._snackBar.open('Diner added', null, {
              duration: 2000,
            });
          }
        }
      });
    }

  addMenuItem(row: any, column: any) {
    const dialogRef = this._dialog.open(MenuChoiceDialog, {
    height: '500px',
    width: '800px',
    disableClose: false
    });

   dialogRef.componentInstance.dinerId = row.id;
   dialogRef.componentInstance.dinerName = row.forename + " " + row.surname;
   dialogRef.componentInstance.menuSectionName = column;
   dialogRef.componentInstance.tableData = this._dataService.menuSections.find(s => s.name === column.name).menuItems;
   dialogRef.componentInstance.filteredData =  dialogRef.componentInstance.tableData;

   dialogRef.beforeClose().subscribe(result => {
    if (result) {
      const diner = this.data.find(s => s.id === row.id);
      diner[column.name].push(result);
    }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._snackBar.open('Menu choice added', null, { duration: 2000 });
      }
      });
  }

  getCountMenuChoices(row: any): number {
    let menuChoiceCount = 0;

    this.menuChoiceColumns().forEach(column => {
      menuChoiceCount += row[column.name].length;
    });

    return menuChoiceCount;
  }

  deleteMenuItem(dinerMenuItemId: number, dinerId: number, columnName: string) {
    this._dinerMenuItemsService.Delete(dinerMenuItemId).subscribe(response =>  {
      const diner = this.data.find(s => s.id === dinerId);
      const menuChoice = diner[columnName].find(s => s.id === dinerMenuItemId);
      const index = diner[columnName].indexOf(menuChoice);
      if (index > -1) {
        diner[columnName].splice(index, 1);
        this._snackBar.open('Menu choice deleted', null, { duration: 2000 });
      }
    }
    );
  }

  loadData(): void {
    this.filter();
  }

  myDetails(): string {
    if (this.myEmailAddress && this.myFirstName && this.mySurname) {
      return 'My Email Address: ' + this.myEmailAddress + ', My name: ' + this.myFirstName + ' ' + this.mySurname;
    } else {
      return '';
    }
  }

  menuChoiceColumns(): ITdDataTableColumn[] {
    return this._dataService.columns.filter(c => c.name !== 'name');
  }

  sort(sortEvent: ITdDataTableSortChangeEvent): void {
    this.sortBy = sortEvent.name;
    this.sortOrder = sortEvent.order;
    this.filter();
  }

  search(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filter();
  }

  page(pagingEvent: IPageChangeEvent): void {
    this.fromRow = pagingEvent.fromRow;
    this.currentPage = pagingEvent.page;
    this.pageSize = pagingEvent.pageSize;
    this.filter();
  }

  filter(): void {
    let newData: any[] = this.data;
    const excludedColumns: string[] = this._dataService.columns
    .filter((column: ITdDataTableColumn) => {
      return ((column.filter === undefined && column.hidden === true) ||
              (column.filter !== undefined && column.filter === false));
    }).map((column: ITdDataTableColumn) => {
      return column.name;
    });
    newData = this._dataTableService.filterData(newData, this.searchTerm, true, excludedColumns);
    newData = this._dataTableService.sortData(newData, this.sortBy, this.sortOrder);
    newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
    if (this.isMyDiners) {
      if (this.myEmailAddress) {
        newData = this.data.filter(s => s.addedByEmailAddress === this.myEmailAddress);
      } else {
        newData = [];
      }

    } else {
      newData = this.data.filter(s => s.addedByEmailAddress !== this.myEmailAddress);
    }
    this.filteredTotal = newData.length;
    this.filteredData = newData;
  }

  expandRow(row: any): void {
    if (!this.isExpanded(row)) {
      this.expandedDiners.push(row);
    } else {
      this.expandedDiners.splice(row);
    }
  }

  isExpanded(row: any): boolean {
    return this.expandedDiners.indexOf(row) !== -1;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
