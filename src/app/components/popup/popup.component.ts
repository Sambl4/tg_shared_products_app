import { Component, EventEmitter, Input, Output, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icons/icons.component';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.css'
})
export class PopupComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() showCloseButton: boolean = true;
  @Input() closeOnOutsideClick: boolean = true;
  @Input() closeOnEscape: boolean = true;
  @Input() maxWidth: string = '90vw';
  @Input() maxHeight: string = '80vh';
  
  @Output() closePopup = new EventEmitter<void>();
  
  @ViewChild('popupContent', { static: false }) popupContent?: ElementRef;

//   @HostListener('document:keydown.escape', ['$event'])
//   onEscapeKey(event: KeyboardEvent) {
//     if (this.isOpen && this.closeOnEscape) {
//       this.close();
//     }
//   }

  onBackdropClick(event: MouseEvent) {
    if (this.closeOnOutsideClick && event.target === event.currentTarget) {
      this.close();
    }
  }

  close() {
    this.closePopup.emit();
  }

  // Prevent content click from closing popup
  onContentClick(event: MouseEvent) {
    event.stopPropagation();
  }
}