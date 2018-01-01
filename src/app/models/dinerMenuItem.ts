import { MenuItem } from './menuItem';
import * as _ from 'lodash';

export class DinerMenuItem {
  id: number;
  dinerId: number;
  note: string;
  quantity: number;
  menuItem: MenuItem | undefined;
  menuItemId: number;

  constructor() {
  }

  deserialize(objectJson: any, included?: any) {
    if (!objectJson) { return; }
    const t = this, o = objectJson, a = o.attributes;
    if (o.type !== 'diner-menu-items') { throw new TypeError(); }

    t.id = o.id;
    t.dinerId = a.dinerId;
    t.note = a.note;
    t.quantity = a.quantity;

    function getIncludedId(name): string {
      return <string>_.get(o.relationships, name + '.data.id');
    }

    function getIncludedJson(name): object {
      // *** TODO: simplify; try to remove need for lodash
      const id = getIncludedId(name);

      const json = <object>(_.find(included, {'type': 'menu-items', 'id': id}));
      return json;
    }

    t.menuItem = new MenuItem().deserialize(getIncludedJson('menuItem'));

    return t;
  }
}
