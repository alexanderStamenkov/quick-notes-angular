import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { concatMap, exhaustMap, pipe, switchMap, tap } from 'rxjs';
import { CreateNote, Note } from '../models/note.model';

type NotesState = {
  notes: Note[];
  isFetching: boolean;
  error: string;
  isAdding: boolean;
};

const initialState: NotesState = {
  notes: [],
  isFetching: false,
  error: '',
  isAdding: false,
};

export const NotesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, http = inject(HttpClient)) => ({
    fetchNotes: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isFetching: true })),
        switchMap(() =>
          http.get<Note[]>('http://localhost:3000/notes').pipe(
            tapResponse({
              next: (notes) => {
                patchState(store, { notes, isFetching: false });
              },
              error: () => {
                patchState(store, {
                  isFetching: false,
                  error: 'Something went wrong fetching the notes.',
                });
              },
            }),
          ),
        ),
      ),
    ),

    addNote: rxMethod<CreateNote>(
      pipe(
        tap(() => patchState(store, { isAdding: true })),
        exhaustMap((note) =>
          http.post<Note>('http://localhost:3000/notes', note).pipe(
            tapResponse({
              next: (newNote) => {
                patchState(store, (state) => ({
                  notes: [...state.notes, newNote],
                  isAdding: false,
                }));
              },
              error: () => {
                patchState(store, {
                  error: 'Something went wrong creating the note.',
                  isAdding: false,
                });
              },
            }),
          ),
        ),
      ),
    ),

    deleteNote: rxMethod<number>(
      pipe(
        concatMap((id) =>
          http.delete<void>(`http://localhost:3000/notes/${id}`).pipe(
            tapResponse({
              next: () => {
                patchState(store, (state) => ({
                  notes: state.notes.filter((note) => note.id !== id),
                }));
              },
              error: () => {
                patchState(store, { error: 'Something went wrong deleting the note.' });
              },
            }),
          ),
        ),
      ),
    ),
  })),
);

// switchMap	Отменя старата, интересува те само последната (search-as-you-type)
// concatMap	Опашка — изчаква старата да завърши, после праща новата, по ред
// exhaustMap	Игнорира новата, докато старата "тече" (не позволява duplicate)
