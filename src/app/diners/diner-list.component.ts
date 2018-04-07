
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Diner } from '../models/diner';
import { DinerMenuItemsService } from '../services/DinerMenuItemsService';

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
import { DinerUpdateDialog } from './diner-update-dialog.component';
import { DinersListGridComponent} from './components/diner-list-grid.component';
import { MenuChoiceDialog } from './menu-choice-dialog.component';
import { DataService } from '../services/DataService';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';
import { HttpClientModule  } from '@angular/common/http';

import { BookingDetailsComponent } from './components/booking-details.component';
import { Booking } from './../models/booking';

/* TODO: Fix sorting Currently only sorts one way doesn't switch to reverse when you try to sort by a column twice */

@Component({
    selector: 'app-diner-list',
    templateUrl: 'diner-list.component.html',
    styleUrls: [
      'diner-list.component.css',
    '../css/FixedTableHeader/main.css'
  ]
})

export class DinersListComponent implements OnInit {

myEmailAddress: string;
myFirstName: string;
mySurname: string;

@ViewChild('myDinersComponent') myDinersComponent;
@ViewChild('otherDinersComponent') otherDinersComponent;

data: any = [];

filteredData: any[] = this.data;
filteredTotal: number = this.data.length;

public booking: Booking;

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
public showHideOtherDiners: boolean;
public showBookingDetails: boolean = false;

  constructor(
      private _dinerMenuItemsService: DinerMenuItemsService,
      private _route: ActivatedRoute,
      private _router: Router,
      private _dataTableService: TdDataTableService,
      private _dialogService: TdDialogService,
      private _dialog: MatDialog,
      private _dataService: DataService,
      private iconRegistry: MatIconRegistry,
      private sanitizer: DomSanitizer
  ) {
      iconRegistry.addSvgIcon(
      'thumbs-up',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/examples/thumbup-icon.svg'));
      this.loadData();
  }

  ngOnInit() {
    this._dataService.bookingData.subscribe(message => {
      if (message && message.organiser)
      {
        this.booking = message;
      }
    });
    this._dataService.myEmailAddress.subscribe(message => {
      this.myEmailAddress = message;
    });
    this.myDinersComponent.noResultsMessage = 'You haven\'t added any diners.';
    this.myDinersComponent.gridHeader = 'Diners that I have added';
    this.myDinersComponent.isMyDiners = true;
    this.otherDinersComponent.noResultsMessage = 'No diners have been diners.';
    this.otherDinersComponent.gridHeader = 'Diners that others have added';
    this.otherDinersComponent.isMyDiners = false;
  }

  combinedTotal() {
    return this.myDinersComponent.data.length;
  }

loadData(): void {
  this._dataService.loadData();
}

showHideOtherDinersText() {
  return this.showHideOtherDiners ? "Hide other diners" : "Show other diners";
}

addDiner() {
  this.myDinersComponent.openDialog({});
}

setProfile() {
  this.myDinersComponent.openDialog({}, true);
}

showOtherDiners() {
  this.showHideOtherDiners = !this.showHideOtherDiners;
}

showHideBookingDetails() {
  this.showBookingDetails = !this.showBookingDetails;

  if (this.showBookingDetails) {
    const dialogRef = this._dialog.open(BookingDetailsComponent, {
      height: '500px',
      width: '560px',
      disableClose: false
      });

      dialogRef.beforeClose().subscribe(result => {
        this.showBookingDetails = false;
      })
  }
}

myDetails(): string {
  if (this.myEmailAddress && this.myFirstName && this.mySurname) {
    return 'My Email Address: ' + this.myEmailAddress + ', My name: ' + this.myFirstName + ' ' + this.mySurname;
  } else {
    return '';
  }
}
}
