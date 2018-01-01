import { NotificationsService } from 'angular2-notifications';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SecurityService } from './../services/SecurityService';
import { MenuItem } from './../models/menuItem';
import { DinerMenuItem } from './../models/dinerMenuItem';
import { Diner } from './../models/diner';
import { MenuSection } from './../models/menuSection';
import { MenuSectionsService } from './../services/MenuSectionsService';
import { DinerMenuItemsService } from './../services/DinerMenuItemsService';

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { BookingsService } from '../services/BookingsService';
import { Booking } from '../models/booking';
import { MenuSections } from '../models/menuSections';
import { DinerMenuItems } from '../models/dinerMenuItems';
import { MenuSectionMenuItem } from '../models/menuSectionMenuItem';

import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { TdDialogService, CovalentLayoutModule, CovalentStepsModule, CovalentPagingModule } from '@covalent/core';
@Component({
    selector: 'app-diners',
    templateUrl: 'diners.component.html'
})

export class DinersComponent {

}
