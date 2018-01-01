import { MenuSection } from './menuSection';
export class MenuItem {
  id: number;
  menuSectionName: string;
  menuSectionId: number;
  name: string;
  description: string;
  number: number;
  displayOrder: number;
  checked: boolean;
  menuSection: MenuSection;
  dinerMenuItemId: number;

  constructor() {
  }

  deserialize(objectJson: any) {
    if (!objectJson) { return; }
    const t = this, o = objectJson, a = o.attributes;
    if (o.type !== 'menu-items') { throw new TypeError(); }

    t.menuSectionId = a.menuSectionId;
    t.name = a.name;
    t.description = a.description;
    t.number = a.number;
    t.displayOrder = a.displayOrder;
    t.id = a.id;
    return t;
  }
}
