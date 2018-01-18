import { NotificationsService } from 'angular2-notifications';
import { DinerService } from '../services/DinerService';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SecurityService } from '../services/SecurityService';
import { MenuItem } from '../models/menuItem';
import { DinerMenuItem } from '../models/dinerMenuItem';
import { Diner } from '../models/diner';
import { MenuSection } from '../models/menuSection';
import { MenuSectionsService } from '../services/MenuSectionsService';
import { DinerMenuItemsService } from '../services/DinerMenuItemsService';

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { BookingsService } from '../services/BookingsService';
import { Booking } from '../models/booking';
import { MenuSections } from '../models/menuSections';
import { DinerMenuItems } from '../models/dinerMenuItems';
import { MenuSectionMenuItem } from '../models/menuSectionMenuItem';
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
import { DinerUpdateDialog } from './diner-update-dialog.component';
import { MenuChoiceDialog } from './menu-choice-dialog.component';

/* TODO: Fix sorting Currently only sorts one way doesn't switch to reverse when you try to sort by a column twice */

@Component({
    selector: 'app-diner-list',
    templateUrl: 'diner-list.component.html',
    styleUrls: ['diner-list.component.css']
})
export class DinersListComponent implements OnInit, OnDestroy   {

data: any[] = [];
columns: ITdDataTableColumn[] =
  [
    { name: 'forename', label: 'Forename', width: 150},
    { name: 'surname', label: 'Surname', width: 150},
    { name: 'notes', label: 'Notes', width: 150}
  ];

  filteredData: any[] = this.data;
  filteredTotal: number = this.data.length;

  searchTerm = '';
  fromRow = 1;
  currentPage = 1;
  pageSize = 500;
  sortBy = 'name';
  selectedRows: any[] = [];
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;

  private id: string;
  public message: string;
  private sub: any;
  public booking: Booking;
  public menuSections: MenuSection[];
  public dinerMenuItems: DinerMenuItem[];
  public _booking: Observable<Booking>;
  public downloadUrl: string;
  public diner: Diner;
  public showEditPanel = false;

  constructor(
      private _bookingsService: BookingsService,
      private _menuSectionsService: MenuSectionsService,
      private _dinerMenuItemsService: DinerMenuItemsService,
      public securityService: SecurityService,
      private _route: ActivatedRoute,
      private _router: Router,
      private _dataTableService: TdDataTableService,
      private _dialogService: TdDialogService,
      private _dialog: MatDialog
  ) {
      this.message = 'Diners';
  }

   openDialog(row: any) {
      const dialogRef = this._dialog.open(DinerUpdateDialog, {
      height: '700px',
      width: '700px',
      disableClose: false
    });

   dialogRef.componentInstance.id = row.id;
   dialogRef.componentInstance.textElements[0].default = row.forename;
   dialogRef.componentInstance.textElements[1].default = row.surname;
   dialogRef.componentInstance.textElements[2].default = row.notes;
   dialogRef.componentInstance.isUpdateDiner = (row.id != null);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (row.id != null) {
          const diner = this.data.find(s => s.id === result.id);
          if (result.bookingId === '-1') {
            this.data = this.data.filter(s => s.id !== result.id);
            this.filter();
          } else {
            diner.forename = result.forename;
            diner.surname = result.surname;
            diner.notes = result.notes;
          }

        } else {
          const dinerToAdd = new Diner();
          dinerToAdd.id = result.id;
          dinerToAdd.forename = result.forename;
          dinerToAdd.surname = result.surname;
          dinerToAdd.notes = result.notes;
          this.data.push(dinerToAdd);
          this.filter();
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
 dialogRef.componentInstance.menuSectionName = column;
 dialogRef.componentInstance.tableData = this.menuSections.find(s => s.name === column.name).menuItems;
 dialogRef.componentInstance.filteredData =  dialogRef.componentInstance.tableData;

 dialogRef.afterClosed().subscribe(result => {
  if (result) {
    const diner = this.data.find(s => s.id === row.id);
    diner[column.name].push(result);
  }
  });
}

deleteMenuItem(dinerMenuItemId: number, dinerId: number, columnName: string) {
  this._dinerMenuItemsService.Delete(dinerMenuItemId).subscribe(response =>  {
    const diner = this.data.find(s => s.id === dinerId);
    const menuChoice = diner[columnName].find(s => s.id === dinerMenuItemId);
    const index = diner[columnName].indexOf(menuChoice);
    if (index > -1) {
      diner[columnName].splice(index, 1);
  }
    // this._notificationsService.success('Menu choice added', 'You have successfully added a menu choice');
  }
  );
}

  ngOnInit(): void {
    this.loadData();
  }

  setColumnsAndData() {
    if (this.menuSections && this.booking.diners) {
      this.menuSections.forEach(menuSection => {
        this.columns.push({ name: menuSection.name, label: menuSection.name, class: 'menu-item-table-header' });
      });
      this.booking.diners.forEach(diner => {
        const dinerDetails = { id: diner.id, forename: diner.forename, surname: diner.surname, notes: diner.notes };
        diner.menuSectionMenuItems.forEach(menuSectionMenuItem => {
          const menuChoices = [];
                menuSectionMenuItem.dinerMenuItems.forEach(dinerMenuItem => {
                    menuChoices.push( {name: dinerMenuItem.menuItem.name, id: dinerMenuItem.id });

            });
          dinerDetails[menuSectionMenuItem.menuSection.name] = menuChoices;
        });
        this.data.push(dinerDetails);
      });
    }

    this.filter();
  }

  menuChoiceColumns(): ITdDataTableColumn[] {
    return this.columns.filter(c => c.name !== 'forename' && c.name !== 'surname' && c.name !== 'notes');
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
    const excludedColumns: string[] = this.columns
    .filter((column: ITdDataTableColumn) => {
      return ((column.filter === undefined && column.hidden === true) ||
              (column.filter !== undefined && column.filter === false));
    }).map((column: ITdDataTableColumn) => {
      return column.name;
    });
    newData = this._dataTableService.filterData(newData, this.searchTerm, true, excludedColumns);
    this.filteredTotal = newData.length;
    newData = this._dataTableService.sortData(newData, this.sortBy, this.sortOrder);
    newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
    this.filteredData = newData;
  }

  loadData() {
      console.log('IsAuthorized:' + this.securityService.IsAuthorized());
      console.log('HasAdminRole:' + this.securityService.HasAdminRole);
      this.sub = this._route.params.subscribe(params => {
          let id = params['id'];
          id = 'E166F9A4-5B7B-4C9E-6513-08D45597AED5';
          this.downloadUrl =  this._bookingsService.actionUrl + 'excel-export/' + id;
          if (!this.booking) {

              this._bookingsService.GetById(id)
                  .subscribe(json => {
                    this.booking = new Booking().deserialize(json.data, json.included);
                    Observable.forkJoin(
                        this._menuSectionsService.GetForMenu(this.booking.menuId),
                        this._dinerMenuItemsService.GetForBooking(this.booking.id)
                  ).subscribe(
                    // tslint:disable-next-line:no-shadowed-variable
                    json => {
                    this.menuSections = new MenuSections().deserialize(json[0].data, json[0].included);
                    this.dinerMenuItems = new DinerMenuItems().deserialize(json[1].data, json[1].included);
                    this.setMenuItemsForDiners();
                    this.setColumnsAndData();
                  },
                  err => console.error(err)
                );
                    console.log(this.booking);
                  },
                  error => this.securityService.HandleError(error),
                  () => console.log('booking Get complete'));
          }
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  setMenuSections() {
    this._menuSectionsService.GetForMenu(this.booking.menuId)
    .subscribe(json => {
      this.menuSections = new MenuSections().deserialize(json.data, json.included);
    },
    error => this.securityService.HandleError(error),
    () => console.log('menuSections get complete'));
  }

  setDinerMenuItems() {
    this._dinerMenuItemsService.GetForBooking(this.booking.id)
    .subscribe(json => {
      this.dinerMenuItems = new DinerMenuItems().deserialize(json.data, json.included);
      this.setMenuItemsForDiners();
    },
    error => this.securityService.HandleError(error),
    () => console.log('dinerMenuItems get complete'));
  }

  setMenuItemsForDiners() {
      this.booking.diners.forEach(diner => {
        const dinerMenuItems = this.dinerMenuItems.filter(i => i.dinerId === diner.id);
        diner.menuItems = dinerMenuItems.map(a => {
          a.menuItem.dinerMenuItemId = a.id;
          return a.menuItem; });
        diner.menuItems.forEach(i => {
          i.menuSection = this.menuSections.find(s => s.id === i.menuSectionId);
        });

        this.menuSections.forEach(menuSection => {
          const menuSectionMenuItem = new MenuSectionMenuItem();
          menuSectionMenuItem.menuSectionId = menuSection.id;
          menuSectionMenuItem.displayOrder = menuSection.displayOrder;
          menuSectionMenuItem.menuSection = menuSection;
          menuSectionMenuItem.dinerMenuItems = dinerMenuItems
          .filter(i => i.menuItem.menuSectionId === menuSection.id);
          diner.menuSectionMenuItems.push(menuSectionMenuItem);
        });

      });
  }
}


  // export interface ITdDynamicElementConfig {
  //   label?: string;
  //   name: string;
  //   type: TdDynamicType | TdDynamicElement;
  //   required?: boolean;
  //   min?: any;
  //   max?: any;
  //   minLength?: string;
  //   maxLength?: string;
  //   selections?: any[];
  //   default?: any;
  //   validators?: ITdDynamicElementValidator[];
  // }
