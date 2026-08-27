import { inject, Injectable, signal } from '@angular/core';
import { CreateNote, Note } from '../models/note.model';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  private httpClient = inject(HttpClient);
  private note = signal<Note[]>([]);
  allNote = this.note.asReadonly();

  fetchNotes(): Observable<Note[]> {
    return this.httpClient.get<Note[]>(`http://localhost:3000/notes`).pipe(
      tap((note) => this.note.set(note)),
      catchError(() => {
        return throwError(() => new Error('Something went wrong fetching the notes.'));
      }),
    );
  }

  addNote(note: CreateNote): Observable<Note> {
    return this.httpClient
      .post<Note>(`http://localhost:3000/notes`, {
        ...note,
        createdAt: new Date().toISOString(),
      })
      .pipe(
        tap((newNote) => {
          this.note.update((notes) => [...notes, newNote]);
        }),
        catchError(() => {
          return throwError(() => new Error('Something went wrong creating the note.'));
        }),
      );
  }

  deleteNote(id: number): Observable<void> {
    return this.httpClient.delete<void>(`http://localhost:3000/notes/${id}`).pipe(
      tap(() => {
        this.note.update((notes) => notes.filter((note) => note.id !== id));
      }),
      catchError(() => {
        return throwError(() => new Error('Something went wrong deleting the note.'));
      }),
    );
  }
}
