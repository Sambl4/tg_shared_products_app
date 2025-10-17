import { Component, Input, model, output } from '@angular/core';
import { IconComponent } from '../icons/icons.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [ IconComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  @Input() placeholder: string = '';
  @Input() iconName: string = '';
  @Input() initialValue: string = '';
  @Input() closeOnOutsideClick: boolean = true;
  onFocus = output<void>();
  onBlur = output<void>();
  onClose = output<void>();
  onSearchTermChanged = output<string>();
  
  searchTerm = model(this.initialValue);
  isSearching = false;

  onFocusToSearch() {
    this.isSearching = true;
    this.onFocus.emit();
  }

  onBlurOfSearch() {
    if(this.closeOnOutsideClick) {
      this.isSearching = false;
      this.onBlur.emit();
    };
  }

  onSearchInput(value: string) {
    this.searchTerm.set(value);
    this.onSearchTermChanged.emit(value);
  }

  onCloseOfSearch() {
    this.searchTerm.set('');
    this.isSearching = false;
    this.onClose.emit();
  }
}
