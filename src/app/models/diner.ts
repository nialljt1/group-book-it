import { DinerMenuItem } from './dinerMenuItem';
import { MenuItem } from './menuItem';
import { MenuSectionMenuItem } from './menuSectionMenuItem';

export class Diner {
  id: number;
  forename: string;
  surname: string;
  fullName: string;
  addedAt: Date;
  addedByEmailAddress: string;
  lastUpdatedByEmailAddress: string;
  lastUpdatedAt: Date;
  notes: string;
  checked: boolean;
  menuItems: (MenuItem | undefined)[];
  menuSectionMenuItems: (MenuSectionMenuItem | undefined)[];
  bookingId: string;
  constructor() {
  }


  deserialize(objectJson: any) {
    if (!objectJson) { return; }
    const t = this, o = objectJson, a = o.attributes;
    if (o.type !== 'diners') { throw new TypeError(); }
    t.id = a.id;
    t.forename = a.forename;
    t.surname = a.surname;
    t.fullName = a.forename + ' ' + a.surname;
    t.addedAt = new Date(a.addedAt);
    t.addedByEmailAddress = a.addedByEmailAddress;
    t.lastUpdatedByEmailAddress = a.lastUpdatedByEmailAddress;
    t.lastUpdatedAt =  new Date(a.lastUpdatedAt);
    t.notes = a.notes;
    t.menuSectionMenuItems = [];

    return t;
  }
}
