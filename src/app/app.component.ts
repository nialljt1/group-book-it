import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  routes: Object[] = [
    {
      title: 'Welcome',
      route: '/welcome',
      icon: 'dashboard',
    },
    {
      title: 'Booking details',
      route: '/bookings/edit/E166F9A4-5B7B-4C9E-6513-08D45597AED5',
      icon: 'receipt',
    },
    {
      title: 'Bookings',
      route: '/bookings/list',
      icon: 'receipt',
    },
    {
      title: 'Diners',
      route: '/diners',
      icon: 'receipt',
    },
     {
      title: 'Restaurant',
      route: '/restaurant',
      icon: 'receipt',
    },
    {
      title: 'Log out',
      route: '/users',
      icon: 'people',
    },
  ];

}
