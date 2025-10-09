import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-feedback',
  imports: [],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css'
})
export class FeedbackComponent {
  feedback = signal('');

  onFeedbackChanged(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.feedback.set(textarea.value);
  }
}
