import { Component, inject, OnInit, signal } from '@angular/core';
import { NoteService } from './services/note.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private noteService = inject(NoteService);
  notes = this.noteService.allNote;
  isFetching = signal(false);
  error = signal('');
  noteToDelete = signal<number | null>(null);
  showDeleteModal = signal(false);

  form = new FormGroup({
    title: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1)],
    }),
    content: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1)],
    }),
  });

  ngOnInit(): void {
    this.error.set('');
    this.isFetching.set(true);
    this.noteService
      .fetchNotes()
      .pipe(
        finalize(() => {
          this.isFetching.set(false);
        }),
      )
      .subscribe({
        error: (error: Error) => {
          this.error.set(error.message);
        },
      });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const newNote = this.form.getRawValue();

    this.noteService.addNote(newNote).subscribe({
      next: () => {
        this.form.reset();
      },
      error: (err: Error) => this.error.set(err.message),
    });
  }

  closeDeleteModal(): void {
    this.noteToDelete.set(null);
    this.showDeleteModal.set(false);
  }

  confirmDelete() {
    const id = this.noteToDelete();
    if (id === null) return;

    this.noteService.deleteNote(id).subscribe({
      error: (err: Error) => this.error.set(err.message),
    });
    this.showDeleteModal.set(false);
  }

  openDeleteModal(id: number): void {
    this.showDeleteModal.set(true);
    this.noteToDelete.set(id);
  }
}
