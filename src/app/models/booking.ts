import { Component } from '@angular/core';
import { DateFormatPipe } from '../components/pipes';
import { TimeFormatPipe } from '../components/pipes';

import { Organiser } from './organiser';
import { Menu } from './menu';
import { Diner } from './diner';
import * as _ from 'lodash';


export class Booking {
  id: string;
  menuId: number;
  startingAtDate: string;
  startingAtTime: string;
  cutOffDate: Date;
  numberOfDiners: number;
  createdAt: Date;

  status: any;
  menu: Menu | undefined;
  organiser: Organiser | undefined;
  diners: (Diner | undefined)[];
  // createdBy: Person;
  // lastUpatedBy: Person;

  constructor() {
    this.diners = [];
    this.status = {};
  }

   transformDate(date) {

  }

  deserialize(objectJson: any, included?: any): Booking {
    // NOTE: experimented with http://cloudmark.github.io/Json-Mapping/ but in the end
    //       decided to be verbose - see also: http://stackoverflow.com/a/22886730
    const t = this, o = objectJson;
    const a = o.attributes;
    if (o.type !== 'bookings') { throw new TypeError(); } // *** TODO: Niall - type: bookings vs booking?

    t.id = o.id;
    t.menuId = a.menuId;
    const dateFormatPipeFilter = new DateFormatPipe();
    t.startingAtDate = dateFormatPipeFilter.transform(a.startingAt);
    const timeFormatPipeFilter = new TimeFormatPipe();
    t.startingAtTime = timeFormatPipeFilter.transform(a.startingAt);
    t.numberOfDiners = a.numberOfDiners;
    t.cutOffDate = new Date(a.cutOffDate);
    t.createdAt = new Date(a.createdAt);

    function getIncludedId(name): string {
      return <string>_.get(o.relationships, name + '.data.id');
    }

    function getIncludedJson(name): object {
      // *** TODO: simplify; try to remove need for lodash
      const includedId = getIncludedId(name);
      const json = <object>(_.find(included, {'type': name + 's', 'id': includedId}));
      return json;
    }

    t.organiser = new Organiser().deserialize(getIncludedJson('organiser'));
    t.menu = new Menu().deserialize(getIncludedJson('menu'));

    // booking status *** TODO: add to some structure
    const id = getIncludedId('status');
    const bookingStatus = <object>_.find(included, {'type': 'booking-status-types', 'id': id});
    t.status.name = _.get(bookingStatus, 'attributes.name');

    // diners
    if (o.relationships.diners.data) {
      for (const item of o.relationships.diners.data) {
        const json = _.find(included, {'type': 'diners', 'id': item.id});
        const diner: Diner | undefined = new Diner().deserialize(json);
        this.diners.push(diner);
      }
    }

    return t;
  }

  // // async getById(id): Promise<Booking> {
  // //   if (!this.api) throw new Error('api not found');
  // //   const json = await this.api.bookings.getById(id);
  // //   let booking = new Booking().deserialize(json.data, json.included);
  // //   return booking;
  // // }
}
