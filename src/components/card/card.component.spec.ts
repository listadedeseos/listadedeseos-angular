import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent.formattedPrice', () => {
  let card: CardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
    card = TestBed.createComponent(CardComponent).componentInstance;
  });

  const priceFor = (price: any) => {
    card.price = price;
    return card.formattedPrice.replace(/\s/g, ' ');
  };

  it('formats numeric values as euros', () => {
    expect(priceFor(9.5)).toBe('9,50 €');
    expect(priceFor('24.90')).toBe('24,90 €');
  });

  it('passes already formatted scraper prices through', () => {
    expect(priceFor('19,99€')).toBe('19,99€');
  });

  it('is empty when there is no price', () => {
    expect(priceFor('')).toBe('');
    expect(priceFor(null)).toBe('');
    expect(priceFor(undefined)).toBe('');
  });
});
