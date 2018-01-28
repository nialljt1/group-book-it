import { ITdDataTableColumn } from '@covalent/core';
import { DateFormatPipe, TimeFormatPipe } from './../components/pipes';
import { DinerMenuItems } from './../models/dinerMenuItems';
import { MenuSections } from './../models/menuSections';
import { DinerMenuItem } from './../models/dinerMenuItem';
import { MenuSection } from './../models/menuSection';
import { DinerMenuItemsService } from './DinerMenuItemsService';
import { MenuSectionsService } from './MenuSectionsService';
import { Booking } from './../models/booking';
import { BookingsService } from './BookingsService';
import { ActivatedRoute } from '@angular/router';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { SecurityService } from '../services/SecurityService';
import { MenuSectionMenuItem } from '../models/menuSectionMenuItem';

@Injectable()
export class DataService implements OnInit {
  private messageSourceEmailAddress = new BehaviorSubject<string>('');
  myEmailAddress: Observable<string> = this.messageSourceEmailAddress.asObservable();

  private messageSourceFirstName = new BehaviorSubject<string>('');
  myFirstName = this.messageSourceFirstName.asObservable();

  private messageSourceSurname = new BehaviorSubject<string>('');
  mySurname = this.messageSourceSurname.asObservable();
  private sub: any;
  public downloadUrl: string;
  public booking: Booking;
  public menuSections: MenuSection[];
  public dinerMenuItems: DinerMenuItem[];

  tempData: any = [];
  private bsDinerData = new BehaviorSubject<any>([]);
  dinerData: Observable<any> = this.bsDinerData.asObservable();

  columns: ITdDataTableColumn[] =
  [
    { name: 'name', label: 'Name', class: 'name-column'}
  ];

  constructor(
    public securityService: SecurityService,
    private _route: ActivatedRoute,
    private _bookingsService: BookingsService,
    private _menuSectionsService: MenuSectionsService,
    private _dinerMenuItemsService: DinerMenuItemsService,
  ) { }

  ngOnInit(): void {
    // this.dinerData.subscribe(message => this.data = message);
  }

  updateMyDetails(emailAddress: string, firstName: string, surname: string) {
    this.messageSourceEmailAddress.next(emailAddress);
    this.messageSourceFirstName.next(firstName);
    this.messageSourceSurname.next(surname);
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
                  this.bsDinerData.next(this.tempData);
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

setColumnsAndData() {
  if (this.menuSections && this.booking.diners) {
    this.menuSections.forEach(menuSection => {
      this.columns.push({ name: menuSection.name, label: menuSection.name, class: 'menu-item-table-header' });
    });

    const dateFormatPipeFilter = new DateFormatPipe();
    const timeFormatPipeFilter = new TimeFormatPipe();
    this.booking.diners.forEach(diner => {
      const dinerDetails = {
        id: diner.id,
        forename: diner.forename,
        surname: diner.surname,
        notes: diner.notes,
        addedAt: dateFormatPipeFilter.transform(diner.addedAt.toString()) + ' ' +
        timeFormatPipeFilter.transform(diner.addedAt.toString()),
        addedByEmailAddress: diner.addedByEmailAddress
      };

      diner.menuSectionMenuItems.forEach(menuSectionMenuItem => {
        const menuChoices = [];
              menuSectionMenuItem.dinerMenuItems.forEach(dinerMenuItem => {
                  menuChoices.push( {name: dinerMenuItem.menuItem.name, id: dinerMenuItem.id });

          });
        dinerDetails[menuSectionMenuItem.menuSection.name] = menuChoices;
      });
      this.tempData.push(dinerDetails);
    });
  }
}
}
