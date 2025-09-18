const mongoose = require('mongoose');
const Closet = require('../../models/closetModel');

describe('Closet model schema', () => {
  const oid = () => new mongoose.Types.ObjectId();

  it('accepts a valid document', () => {
    const doc = new Closet({
      title: 'Cozy Sweater',
      user: oid(),
      photo: 'uploads/private/img/closet/sweater.jpg',
      categories: ['winter', 'autumn'],
      colors: ['red', 'navy'],
    });

    const err = doc.validateSync();
    expect(err).toBeUndefined();
  });

  it('applies defaults for categories and colors when omitted', () => {
    const doc = new Closet({
      title: 'Plain Tee',
      user: oid(),
      photo: 'uploads/private/img/closet/tee.jpg',
    });

    // defaults are applied at instantiation time
    expect(doc.categories).toEqual([]);
    expect(doc.colors).toEqual([]);

    const err = doc.validateSync();
    expect(err).toBeUndefined();
  });

  it('requires title', () => {
    const doc = new Closet({
      user: oid(),
      photo: 'uploads/private/img/closet/item.jpg',
    });

    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.title).toBeDefined();
    expect(err.errors.title.message).toBe('A title is required.');
  });

  it('requires photo', () => {
    const doc = new Closet({
      title: 'No Photo',
      user: oid(),
    });

    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.photo).toBeDefined();
    expect(err.errors.photo.message).toBe('An image is required.');
  });

  it('requires user ObjectId', () => {
    const doc = new Closet({
      title: 'No User',
      photo: 'uploads/private/img/closet/item.jpg',
    });

    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.user).toBeDefined();
    // default mongoose required message since no custom message was provided
    expect(err.errors.user.message).toMatch(/Path `user` is required/);
  });

  it('validates categories against predefined list (case-sensitive)', () => {
    const doc = new Closet({
      title: 'Bad Cat',
      user: oid(),
      photo: 'uploads/private/img/closet/item.jpg',
      categories: ['winter', 'monsoon'], // invalid value
    });

    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.categories).toBeDefined();
    expect(err.errors.categories.message).toBe(
      'Categories must be one or more of the following: winter, spring, autumn, summer.',
    );
  });

  it('rejects categories with wrong casing', () => {
    const doc = new Closet({
      title: 'Case Cat',
      user: oid(),
      photo: 'uploads/private/img/closet/item.jpg',
      categories: ['Winter'], // wrong casing -> invalid
    });

    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.categories).toBeDefined();
  });

  it('rejects empty or whitespace-only color strings', () => {
    const base = {
      title: 'Tee',
      user: new mongoose.Types.ObjectId(),
      photo: 'uploads/private/img/closet/tee.jpg',
    };

    // empty string should fail
    const withEmpty = new Closet({ ...base, colors: ['red', ''] });
    let err = withEmpty.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.colors.message).toBe('Colors must be non-empty strings.');

    // whitespace-only should fail
    const withSpace = new Closet({ ...base, colors: ['   '] });
    err = withSpace.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.colors.message).toBe('Colors must be non-empty strings.');

    // valid non-empty strings should pass
    const ok = new Closet({ ...base, colors: ['red', 'blue'] });
    expect(ok.validateSync()).toBeUndefined();

    // non-strings get cast; allowed (optional sanity check)
    const casted = new Closet({ ...base, colors: [123] });
    expect(casted.validateSync()).toBeUndefined();
    expect(casted.colors).toEqual(['123']);
  });
});
