import { MenuSection } from './menuSection';
import { DinerMenuItem } from './dinerMenuItem';

export class MenuSectionMenuItem {
  menuSectionId: number;
  menuSectionName: string;
  dinerMenuItems: DinerMenuItem[];
  displayOrder: number;
  menuSection: MenuSection;

  constructor() {
  }
}
