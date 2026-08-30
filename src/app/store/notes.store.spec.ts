import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { NotesStore } from './notes.store';
import { Note } from '../models/note.model';

describe('NotesStore', () => {
  let store: InstanceType<typeof NotesStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    store = TestBed.inject(NotesStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should have empty initial state', () => {
    expect(store.notes()).toEqual([]);
    expect(store.isFetching()).toBe(false);
    expect(store.error()).toBe('');
  });

  it('should fetch notes and update state on success', () => {
    const mockNotes: Note[] = [
      { id: 1, title: 'Test note', content: 'Some content', createdAt: '2026-01-01' },
    ];

    store.fetchNotes();

    const req = httpMock.expectOne('http://localhost:3000/notes');
    expect(req.request.method).toBe('GET');

    req.flush(mockNotes);

    expect(store.notes()).toEqual(mockNotes);
    expect(store.isFetching()).toBe(false);
  });

  it('should set error state when fetch fails', () => {
    store.fetchNotes();

    const req = httpMock.expectOne('http://localhost:3000/notes');
    req.flush('fail', { status: 500, statusText: 'Server Error' });

    expect(store.error()).toBe('Something went wrong fetching the notes.');
    expect(store.isFetching()).toBe(false);
  });

  it('should add a note to state on success', () => {
    const newNote: Note = { id: 2, title: 'New', content: 'New content', createdAt: '2026-01-02' };

    store.addNote({ title: 'New', content: 'New content' });

    const req = httpMock.expectOne('http://localhost:3000/notes');
    expect(req.request.method).toBe('POST');

    req.flush(newNote);

    expect(store.notes()).toEqual([newNote]);
    expect(store.isAdding()).toBe(false);
  });

  it('should remove a note from state on delete', () => {
    // Първо "засаждаме" начално състояние с една note, все едно вече е fetch-ната
    const existingNote: Note = { id: 1, title: 'A', content: 'B', createdAt: '2026-01-01' };
    store.fetchNotes();
    httpMock.expectOne('http://localhost:3000/notes').flush([existingNote]);

    store.deleteNote(1);

    const req = httpMock.expectOne('http://localhost:3000/notes/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(store.notes()).toEqual([]);
  });
});
