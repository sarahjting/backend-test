/* eslint-disable no-undef */
import { groupBy, sumBy, chunk, luhnCheck } from './main';

describe('GroupBy', () => {
  /* 
  Creates an object composed of keys generated from the results of running each element of collection thru iteratee. 
  The order of grouped values is determined by the order they occur in collection. 
  The corresponding value of each key is an array of elements responsible for generating the key. 
  The iteratee is invoked with one argument: (value).

  groupBy([ [{animal: 'cat', name: 'Felix'}, {animal: 'dog, name: 'Chilli'}, {animal: 'cat', name: 'Chester'}] ], ({item}) => item.animal);
  => { 
    cat: [ {animal: 'cat', name: 'Felix'}, {animal: 'cat', name: 'Chester'}],
    dob: [{animal: 'dog, name: 'Chilli'}],
    }
  */

  test('1a Group by', () => {
    const bets = [
      {
        currency: 'btc',
        amount: 0.01,
        game: 'dice'
      },
      {
        currency: 'btc',
        amount: 0.02,
        game: 'dice'
      },
      {
        currency: 'ltc',
        amount: 1,
        game: 'roulette'
      },
      {
        currency: 'xrp',
        amount: 5,
        game: 'dice'
      }
    ];

    const result = groupBy(bets, bet => bet.currency);

    expect(result).toEqual({
      btc: [
        { currency: 'btc', amount: 0.01, game: 'dice' },
        { currency: 'btc', amount: 0.02, game: 'dice' }
      ],
      ltc: [{ currency: 'ltc', amount: 1, game: 'roulette' }],
      xrp: [{ currency: 'xrp', amount: 5, game: 'dice' }]
    });
  });
});

/* 

const objects = [{ 'n': 4 }, { 'n': 2 }, { 'n': 8 }, { 'n': 6 }];
 
sumBy(objects, o => o.n );
// => 20

*/
describe('Sum By', () => {
  test('2a Sum by', () => {
    const bets = {
      btc: [
        { currency: 'btc', amount: 0.01, game: 'dice' },
        { currency: 'btc', amount: 0.02, game: 'dice' }
      ],
      ltc: [{ currency: 'ltc', amount: 1, game: 'roulette' }],
      xrp: [{ currency: 'xrp', amount: 5, game: 'dice' }]
    };

    const result = sumBy(bets, bet => bet.currency);

    expect(result).toEqual({
      btc: 0.03,
      ltc: 1,
      xrp: 5
    });
  });
});

describe('Chunk', () => {
  test('3a Chunk', () => {
    const arraySize = 1e6;
    const chunkSize = 5;

    const array = [...Array(1e6).keys()];

    const result = chunk(array, chunkSize);

    expect(result).toHaveLength(arraySize);
  });
});

describe('Luhn Checksum', () => {
  /* 
  Parse the input.
  Strings of length 1 or less are not valid.
  Spaces are allowed in the input, but they should be stripped before checking
  All other non-digit characters are disallowed

  eg. 4539 1488 0343 6467

  Double every second digit, starting from the right. 
    eg. 4_3_ 1_8_ 0_4_ 6_6_

  If doubling the number results in a number greater than 9 then subtract 9 from the doubled product.
    eg. 8569 2478 0383 3437
  
  Sum all of the digits:
  8+5+6+9+2+4+7+8+0+3+8+3+3+4+3+7 = 80

  If the sum is evenly divisible by 10, then the number is valid.

  */

  describe('xxxxx', () => {
    test('4a single digit strings can not be valid', () => {
      expect(luhnCheck('1')).toEqual(false);
    });

    test('4b a single zero is invalid', () => {
      expect(luhnCheck('0')).toEqual(false);
    });

    test('4c a valid Canadian SIN', () => {
      expect(luhnCheck('055 444 285')).toEqual(true);
    });

    test('4d invalid Canadian SIN', () => {
      expect(luhnCheck('055 444 286')).toEqual(false);
    });

    test('4e invalid credit card', () => {
      expect(luhnCheck('8273 1232 7352 0569')).toEqual(false);
    });

    test('4f valid number with an even number of digits', () => {
      expect(luhnCheck('095 245 88')).toEqual(true);
    });

    test('4g valid number with an odd number of spaces', () => {
      expect(luhnCheck('234 567 891 234')).toEqual(true);
    });

    test('4h valid strings with symbols included become invalid', () => {
      expect(luhnCheck('055# 444$ 285')).toEqual(false);
    });

    test('4j valid strings with punctuation included become invalid', () => {
      expect(luhnCheck('055-444-285')).toEqual(false);
    });

    // test('4c a simple valid SIN that remains valid if reversed', () => {
    //   expect(luhnCheck('059')).toEqual(true);
    // });

    // test('4d a simple valid SIN that becomes invalid if reversed', () => {
    //   expect(luhnCheck('59')).toEqual(true);
    // });

    // test('4j valid strings with a non-digit added at the end invalid', () => {
    //   expect(luhnCheck('059a')).toEqual(false);
    // });

    // test('4m single zero with space is invalid', () => {
    //   expect(luhnCheck(' 0')).toEqual(false);
    // });

    // test('4n more than a single zero is valid', () => {
    //   expect(luhnCheck('0000 0')).toEqual(true);
    // });

    // test('4o input digit 9 is correctly converted to output digit 9', () => {
    //   expect(luhnCheck('091')).toEqual(true);
    // });

    // test("4l using ascii value for non-doubled non-digit isn't allowed", () => {
    //   expect(luhnCheck('055b 444 285')).toEqual(false);
    // });

    // test("4m using ascii value for doubled non-digit isn't allowed", () => {
    //   expect(luhnCheck(':9')).toEqual(false);
    // });
  });
});
