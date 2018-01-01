// ref: https://github.com/Microsoft/TypeScript/issues/11919#issuecomment-258363437

import { Booking } from './booking';
import { Generic } from '../services/generic/generic';

export class Bookings {
  list: Booking[] = [];

  // // constructor(private api: Api) {
  // //   this.api = api;
  // // }

  // // async get(): Promise<Bookings> {
  // //   const json = await this.api.bookings.get();
  // //   this.deserialize(json.data, json.included);
  // //   return this;
  // // }

  // // deserialize(objectJson: Array<any>, included?: any): Bookings {
  // //   this.list = [];
  // //   for (let item of objectJson) {
  // //     let booking = new Booking().deserialize(item, included);
  // //     this.list.push(booking);
  // //   }
  // //   return this;
  // // }

}
