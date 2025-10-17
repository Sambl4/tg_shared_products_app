import { Component, EventEmitter, Input, model, Output } from '@angular/core';

@Component({
  selector: 'app-toggler',
  standalone: true,
  imports: [],
  templateUrl: './toggler.component.html',
  styleUrl: './toggler.component.css'
})
export class TogglerComponent {
  @Input() isChecked: boolean = false;
  @Input() disabled: boolean = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  toggle() {
    this.isChecked = !this.isChecked;
    this.checkedChange.emit(this.isChecked);
  }
}
