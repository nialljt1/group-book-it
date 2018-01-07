import { NotificationsService } from 'angular2-notifications';
import { DinersListComponent, MenuChoiceDialog, DialogOverviewExampleDialog } from './diners/diner-list.component';
import { DinerService } from './services/DinerService';
import { DinerMenuItemsService } from './services/DinerMenuItemsService';
import { Configuration } from './app.constants';
import { BookingsService } from './services/BookingsService';
import { BookingsEditComponent } from './bookings/bookings-edit.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DateFormatPipe, TimeFormatPipe } from './components/pipes';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatCardModule, MatMenuModule, MatToolbarModule,
         MatIconModule, MatDialogModule, MatDialogRef, MatListModule } from '@angular/material';

import { CovalentLayoutModule, CovalentStepsModule, /*, any other modules */
TdLayoutManageListComponent} from '@covalent/core';
// (optional) Additional Covalent Modules imports
import { CovalentHttpModule } from '@covalent/http';
import { CovalentHighlightModule } from '@covalent/highlight';
import { CovalentMarkdownModule } from '@covalent/markdown';
import { CovalentDynamicFormsModule } from '@covalent/dynamic-forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TdDataTableService, TdDialogService } from '@covalent/core';
import { CovalentSearchModule } from '@covalent/core';

import { AppComponent } from './app.component';

import { WelcomeComponent } from './welcome/welcome.component';
import { RestaurantComponent } from './restaurant/restaurant.component';
import { DinersComponent } from './diners/diners.component';
import { PageNotFoundComponent } from './pageNotFound/pageNotFound.component';
import { SecurityService } from './services/SecurityService';
import { MenuSectionsService } from './services/MenuSectionsService';

const appRoutes: Routes = [
  { path: 'restaurant', component: RestaurantComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'diners', component: DinersListComponent },
  { path: 'bookings/edit/E166F9A4-5B7B-4C9E-6513-08D45597AED5', component: BookingsEditComponent },
  { path: '',
    redirectTo: '/welcome',
    pathMatch: 'full'
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    RestaurantComponent,
    BookingsEditComponent,
    DinersListComponent,
    DinersComponent,
    PageNotFoundComponent,
    MenuChoiceDialog,
    DialogOverviewExampleDialog,
    DateFormatPipe,
    TimeFormatPipe
  ],
  entryComponents:
  [
    MenuChoiceDialog,
    DialogOverviewExampleDialog
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatMenuModule,
    MatCardModule,
    MatDialogModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    CovalentLayoutModule,
    CovalentStepsModule,
    // (optional) Additional Covalent Modules imports
    CovalentHttpModule.forRoot(),
    CovalentHighlightModule,
    CovalentMarkdownModule,
    CovalentDynamicFormsModule,
    CovalentSearchModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    BookingsService,
    Configuration,
    SecurityService,
    DinerMenuItemsService,
    DinerService,
    MenuSectionsService,
    TdDataTableService,
    TdDialogService,
    NotificationsService
  ],
  exports: [
    DateFormatPipe,
    TimeFormatPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
