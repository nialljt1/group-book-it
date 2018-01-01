import { DinerMenuItem } from './dinerMenuItem';

export class DinerMenuItems {
list: DinerMenuItem[] = [];

deserialize(objectJson: Array<any>, included?: any): DinerMenuItem[] {
  for (const item of objectJson) {
    const dinerMenuItem = new DinerMenuItem().deserialize(item, included);
    this.list.push(dinerMenuItem);
  }
  return this.list;
}
}
