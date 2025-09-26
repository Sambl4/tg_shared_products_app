import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconService } from './icons.service';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [innerHTML]="iconSvg" [class]="className"></span>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class IconComponent {
  @Input() name!: string;
  @Input() size: string = '';//'w-6 h-6';
  @Input() className: string = '';

  constructor(
    private iconService: IconService,
    private sanitizer: DomSanitizer
  ) {}

  get iconSvg(): SafeHtml {
    const svg = this.iconService.getIcon(this.name);
    // Replace size classes with the provided size
    const updatedSvg = svg.replace(/class="w-\d+ h-\d+"/, `class="${this.size}"`);
    return this.sanitizer.bypassSecurityTrustHtml(updatedSvg);
  }
}
