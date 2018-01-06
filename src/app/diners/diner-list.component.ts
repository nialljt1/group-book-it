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
import { ITdDynamicElementConfig, TdDynamicElement, TdDynamicType, ITdDynamicElementValidator } from '@covalent/dynamic-forms';


/* TODO: Fix sorting Currently only sorts one way doesn't switch to reverse when you try to sort by a column twice */

@Component({
    selector: 'app-diner-list',
    templateUrl: 'diner-list.component.html'
})
export class DinersListComponent implements OnInit, OnDestroy   {

data: any[] = [];
columns: ITdDataTableColumn[] =
  [
    { name: 'forename', label: 'Forename'},
    { name: 'surname', label: 'Surname'},
    { name: 'notes', label: 'Notes' }
  ];

  filteredData: any[] = this.data;
  filteredTotal: number = this.data.length;

  searchTerm = '';
  fromRow = 1;
  currentPage = 1;
  pageSize = 5;
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
      const dialogRef = this._dialog.open(DialogOverviewExampleDialog, {
      height: '700px',
      width: '700px',
      disableClose: false
    });

   dialogRef.componentInstance.id = row.id;
   dialogRef.componentInstance.forename = row.forename;
   dialogRef.componentInstance.surname = row.surname;
   dialogRef.componentInstance.notes = row.notes;

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const diner = this.data.find(s => s.id === result.id);
        diner.forename = result.forename;
        diner.surname = result.surname;
        diner.notes = result.notes;
      }
    });
  }

  addMenuItem(row: any, column: any) {
    const dialogRef = this._dialog.open(MenuChoiceDialog, {
    height: '500px',
    width: '600px',
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

  ngOnInit(): void {
    this.loadData();
  }

  setColumnsAndData() {
    if (this.menuSections && this.booking.diners) {
      this.menuSections.forEach(menuSection => {
        this.columns.push({ name: menuSection.name, label: menuSection.name });
      });
      this.booking.diners.forEach(diner => {
        const dinerDetails = { id: diner.id, forename: diner.forename, surname: diner.surname, notes: diner.notes };
        diner.menuSectionMenuItems.forEach(menuSectionMenuItem => {
          const menuChoices = [];
                menuSectionMenuItem.dinerMenuItems.forEach(dinerMenuItem => {
                    menuChoices.push(dinerMenuItem.menuItem.name);

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


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog-overview-example-dialog.html',
})
// tslint:disable-next-line:component-class-suffix
export class DialogOverviewExampleDialog {

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dinerService: DinerService,
    private _notificationsService: NotificationsService,

  ) { }


  public id: number;
  public forename: string;
  public surname: string;
  public notes: string;

  textElements: ITdDynamicElementConfig[] = [
    {
    name: 'forename',
    type: TdDynamicElement.Input,
    required: true,
    maxLength: 30
  },
  {
    name: 'surname',
    type: TdDynamicElement.Input,
    required: true,
    maxLength: 30
  },
  {
    name: 'notes',
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
        diner.forename = this.forename;
        diner.surname = this.surname;
        diner.notes = this.notes;
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



@Component({
  // tslint:disable-next-line:component-selector
  selector: 'menu-choice-dialog',
  templateUrl: 'menu-choice-dialog.html',
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
      this.dialogRef.close(row.name);
    }
  );
}

  search(event: any) {
  }

  cancel() {
    this.dialogRef.close();
  }

  }

  export interface ITdDynamicElementConfig {
    label?: string;
    name: string;
    type: TdDynamicType | TdDynamicElement;
    required?: boolean;
    min?: any;
    max?: any;
    minLength?: string;
    maxLength?: string;
    selections?: any[];
    default?: any;
    validators?: ITdDynamicElementValidator[];
  }
