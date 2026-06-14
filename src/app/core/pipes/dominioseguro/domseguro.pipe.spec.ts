import { DomseguroPipe } from './domseguro.pipe';

describe('DomseguroPipe', () => {
  it('create an instance', () => {
    let pipe: DomseguroPipe;
    // @ts-ignore
    pipe = new DomseguroPipe();
    expect(pipe).toBeTruthy();
  });
});
