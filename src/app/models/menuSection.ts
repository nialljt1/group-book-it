import { MenuItem } from './menuItem';
import * as _ from 'lodash';

export class MenuSection {
  id: number;
  menuId: number;
  name: string;
  notes: string;
  displayOrder: number;
  menuItems: (MenuItem | undefined)[];

  constructor() {
    this.menuItems = [];
  }

  deserialize(objectJson: any, included?: any) {
    if (!objectJson) { return; }
    const t = this, o = objectJson, a = o.attributes;
    if (o.type !== 'menu-sections') { throw new TypeError(); }
    t.id = a.id;
    t.menuId = a.menuId;
    t.name = a.name;
    t.notes = a.notes;
    t.displayOrder = a.displayOrder;

    // menuItems
    if (o.relationships.menuItems.data) {
      for (const item of o.relationships.menuItems.data) {
        const json = _.find(included, {'type': 'menu-items', 'id': item.id} );
        const menuItem: MenuItem | undefined = new MenuItem().deserialize(json);
        this.menuItems.push(menuItem);
      }
    }

    return t;
  }
}
