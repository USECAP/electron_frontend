import {TailPipe} from './tail.pipe';

describe('TailPipe', () => {
  let pipe: TailPipe;

  beforeEach(() => {
    pipe = new TailPipe();
  });

  it('should not transform strings without linebreaks', () => {
     expect(pipe.transform('foo', 1)).toEqual('foo');
  });

  it('should show last line', () => {
    expect(pipe.transform('first\nsecond', 1)).toEqual('second');
  });

  it('should filter many line breaks', () => {
    expect(pipe.transform('\n\n\nlast\nlines', 2)).toEqual('last\nlines');
  });
});
