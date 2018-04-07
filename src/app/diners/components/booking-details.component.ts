import { Booking } from './../../models/booking';
import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { DataService } from '../../services/DataService';

@Component({
  selector: 'app-booking-details',
  templateUrl: 'booking-details.component.html',
  styleUrls: [
    'booking-details.component.css'
]
})

export class BookingDetailsComponent implements OnInit   {

  public booking: Booking;
  
  constructor(
    public dialogRef: MatDialogRef<BookingDetailsComponent>,
    private _dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}


  ngOnInit(): void {
    this.changePosition();
    this._dataService.bookingData.subscribe(message => {
      this.booking = message;
    }
  );
  }

  changePosition() {
    this.dialogRef.updatePosition({ top: '130px', left: '32px' });
  }

  close() {
    this.dialogRef.close();
  }
}
