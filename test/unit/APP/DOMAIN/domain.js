let assert = require('assert');

let domain = require('../../../../APP/DOMAIN/domain');

const assertSerialisedEqual = function(output, expected) {
      const expectedAsString = JSON.stringify(expected);
      const outputAsString = JSON.stringify( output );
      assert.equal(outputAsString, expectedAsString);
}

describe('domain', function () {
  
  describe('deepCopy()', function () {
    
    describe('Nested Array', function () {
      
      const input = [
        'a',
        ['b','c'],
        'd'
      ];
      
      const copied = domain.deepCopy(input);
      
      it('Length of top level equal', function () {
        assert.equal(copied.length, 3);
      });
      
      it('Shallow member', function () {
        assert.equal(copied[0], 'a');
      });
      
      it('Nested member', function () {
        assert.equal(copied[1].length, 2);
        assert.equal(copied[1][0], 'b');
        assert.equal(copied[1][1], 'c');
      });
      
      it('Last item', function () {
        assert.equal(copied[2], 'd');
      });
      
    });
    
  });
  
  describe('emptyTable()', function () {
    
    const empty = domain.emptyTable();
    
    const expected = [
      [null, null],
      [null, null]
    ];
    
    it('Correct length', function () {
      assert.equal(empty.length, expected.length);
    });
    
    it('Correct width', function () {
      assert.equal(empty[0].length, expected[0].length);
      assert.equal(empty[1].length, expected[1].length);
    });
    
    it('Expected content', function () {
      emptyAsString = JSON.stringify(empty);
      expectedAsString = JSON.stringify(expected);
      assert.equal(emptyAsString, expectedAsString);
    });
  });
  
  describe('iRowOptionNames()', function () {
    it('Asserts option names in first row', function () {
      assert.equal(domain.iRowOptionNames(), 0);
    });
  });
  
  describe('iRowScores()', function () {
    it('Asserts scores in second row', function () {
      assert.equal(domain.iRowScores(), 1);
    });
  });
  
  describe('iColumnCriterionName()', function () {
    it('Asserts criterion names in first column', function () {
      assert.equal(domain.iColumnCriterionName(), 0);
    });
  });
  
  describe('iColumnWeight()', function () {
    it('Asserts criterion weights in second column', function () {
      assert.equal(domain.iColumnWeight(), 1);
    });
  });
  
  describe('numberRowsEmptyTable()', function () {
    it('Correct number of rows in empty table', function () {
      assert.equal(domain.numberRowsEmptyTable(), 2);
    });
  });
  
  describe('numberColumnsEmptyTable()', function () {
    it('Correct number of columns in empty table', function () {
      assert.equal(domain.numberColumnsEmptyTable(), 2);
    });
  });
  
  describe('recalculate()', function () {
    it('Empty table', function () {
      
      const input = [
        [null, null],
        [null, null]
      ];
      
      const expected = [
        [null, null],
        [null, null]
      ];
      
      const inputAsString = JSON.stringify(input);
      const expectedAsString = JSON.stringify(expected);
      
      const outputAsString = JSON.stringify( domain.recalculate(input) );
      
      assert.equal(outputAsString, expectedAsString);
    });
    
    it('Populated table', function () {
      
      const input = [
        [    null, null, "Opt 1", "Opt 2"],
        [    null, null,    null,    null],
        ["Crit 1",    1,       1,       2],
        ["Crit 2",    2,       3,       4],
      ];
      
      const expected = [
        [    null, null, "Opt 1", "Opt 2"],
        [    null, null,       7,      10],
        ["Crit 1",    1,       1,       2],
        ["Crit 2",    2,       3,       4],
      ];
      
      const inputAsString = JSON.stringify(input);
      const expectedAsString = JSON.stringify(expected);
      
      const outputAsString = JSON.stringify( domain.recalculate(input) );
      
      assert.equal(outputAsString, expectedAsString);
    });
  });
  
  describe('addOption()', function () {
    
    it('Empty table', function () {
      
      const input = [
        [null, null],
        [null, null]
      ];
      
      const expected = [
        [null, null, "Opt 1"],
        [null, null,       0]
      ];
      
      assertSerialisedEqual(
        domain.addOption(input, "Opt 1", 0),
        expected
      );
    });
    
    it('Existing option', function () {
      
      const input = [
        [null, null, "Opt 1"],
        [null, null,       0]
      ];
      
      const expected = [
        [null, null, "Opt 1", "Opt 2"],
        [null, null,       0,       0]
      ];
      
      assertSerialisedEqual(
        domain.addOption(input, "Opt 2", 0),
        expected
      );
      
    });
    
    it('Existing criteria and options', function () {
      
      const input = [
        [    null, null, "Opt 1"],
        [    null, null,       0],
        ["Crit 1",    1,       0]
      ];
      
      const expected = [
        [    null, null, "Opt 1", "Opt 2"],
        [    null, null,       0,       0],
        ["Crit 1",    1,       0,       0]
      ];
      
      assertSerialisedEqual(
        domain.addOption(input, "Opt 2", 0),
        expected
      );
    });
    
  });
  
  describe('addCriterion()', function () {
    
    it('Empty table', function () {
      
      const input = [
        [null, null],
        [null, null]
      ];
      
      const expected = [
        [    null, null],
        [    null, null],
        ["Crit 1",    1]
      ];
      
      assertSerialisedEqual(
        domain.addCriterion(input, "Crit 1", 1, 1),
        expected
      );
    });
    
    it('Existing criterion', function () {
      
      const input = [
        [   null, null],
        [   null, null],
        ["Crit 1",   4]
      ];
      
      const expected = [
        [   null, null],
        [   null, null],
        ["Crit 1",   4],
        ["Crit 2",   8],
      ];
      
      assertSerialisedEqual(
        domain.addCriterion(input, "Crit 2", 8, 1),
        expected
      );
      
    });
    
    it('Existing criteria and options', function () {
      
      const input = [
        [    null, null, "Opt 1"],
        [    null, null,    null],
        ["Crit 1",    1,       2]
      ];
      
      const expected = [
        [    null, null, "Opt 1"],
        [    null, null,      14],
        ["Crit 1",    1,       2],
        ["Crit 2",    3,       4]
      ];
      
      assertSerialisedEqual(
        domain.addCriterion(input, "Crit 2", 3, 4),
        expected
      );
    });
    
  });
  
  describe('setWeight()', function () {
  
    it('Data exists', function () {
    
      const input = [
        [    null, null, "Opt 1"],
        [    null, null,      14],
        ["Crit 1",    1,       2],
        ["Crit 2",    2,       4]
      ];
    
      const expected = [
        [    null, null, "Opt 1"],
        [    null, null,      14],
        ["Crit 1",    1,       2],
        ["Crit 2",    3,       4]
      ];
      
      assertSerialisedEqual(
        domain.setWeight(input, 1, 3),
        expected
      );
      
    });
    
  });
  
  describe('fromDataColumnIndex()', function () {
    
    const input = [
      [    null, null, "Opt 1", "Opt 2", "Opt 3"],
      [    null, null,       6,       6,       6],
      ["Crit 1",    1,       1,       1,       1],
      ["Crit 2",    2,       1,       1,       1],
      ["Crit 3",    3,       1,       1,       1]
    ];
    
    it('First item', function () {
      assert.equal(domain.fromDataColumnIndex(input, 0), 2);
    });
    
    it('Middle item', function () {
      assert.equal(domain.fromDataColumnIndex(input, 1), 3);
    });
    
    it('Last item', function () {
      assert.equal(domain.fromDataColumnIndex(input, 2), 4);
    });
    
  });
  
  describe('fromDataRowIndex()', function () {
    
    const input = [
      [    null, null, "Opt 1", "Opt 2", "Opt 3"],
      [    null, null,       6,       6,       6],
      ["Crit 1",    1,       1,       1,       1],
      ["Crit 2",    2,       1,       1,       1],
      ["Crit 3",    3,       1,       1,       1]
    ];
    
    it('First item', function () {
      assert.equal(domain.fromDataRowIndex(input, 0), 2);
    });
    
    it('Middle item', function () {
      assert.equal(domain.fromDataRowIndex(input, 1), 3);
    });
    
    it('Last item', function () {
      assert.equal(domain.fromDataRowIndex(input, 2), 4);
    });
    
  });
  
  describe('fromDataIndex()', function () {
    
    const input = [
      [    null, null, "Opt 1", "Opt 2", "Opt 3"],
      [    null, null,       6,       6,       6],
      ["Crit 1",    1,       1,       1,       1],
      ["Crit 2",    2,       1,       1,       1],
      ["Crit 3",    3,       1,       1,       1]
    ];
    
    it('First item', function () {
      
      const row = 1;
      const col = 2;
      const expected = {row: 3, col: 4};
      
      assertSerialisedEqual(domain.fromDataIndex(input, row, col), expected );
    });
    
  });
  
  describe('setCriterionName()', function () {
    
    const input = [
      [    null, null, "Opt 1", "Opt 2", "Opt 3"],
      [    null, null,       6,       6,       6],
      ["Crit 1",    1,       1,       1,       1],
      ["Crit 2",    2,       1,       1,       1],
      ["Crit 3",    3,       1,       1,       1]
    ];
    
    it('First item', function () {
      
      const newName = "New 1"
      const expected = [
        [    null, null, "Opt 1", "Opt 2", "Opt 3"],
        [    null, null,       6,       6,       6],
        [ newName,    1,       1,       1,       1],
        ["Crit 2",    2,       1,       1,       1],
        ["Crit 3",    3,       1,       1,       1]
      ];
      
      assertSerialisedEqual(domain.setCriterionName(input, 0, newName), expected );
    });
    
    it('Last item', function () {
      
      const newName = "New 3"
      const expected = [
        [    null, null, "Opt 1", "Opt 2", "Opt 3"],
        [    null, null,       6,       6,       6],
        ["Crit 1",    1,       1,       1,       1],
        ["Crit 2",    2,       1,       1,       1],
        [ newName,    3,       1,       1,       1]
      ];
      
      assertSerialisedEqual(domain.setCriterionName(input, 2, newName), expected );
    });
    
  });
  
  describe('setOptionName()', function () {
    
    const input = [
      [    null, null, "Opt 1", "Opt 2", "Opt 3"],
      [    null, null,       6,       6,       6],
      ["Crit 1",    1,       1,       1,       1],
      ["Crit 2",    2,       1,       1,       1],
      ["Crit 3",    3,       1,       1,       1]
    ];
    
    it('First item', function () {
      
      const newName = "New 1"
      const expected = [
        [    null, null, newName, "Opt 2", "Opt 3"],
        [    null, null,       6,       6,       6],
        ["Crit 1",    1,       1,       1,       1],
        ["Crit 2",    2,       1,       1,       1],
        ["Crit 3",    3,       1,       1,       1]
      ];
      
      assertSerialisedEqual(domain.setOptionName(input, 0, newName), expected );
    });
    
    it('Last item', function () {
      
      const newName = "New 3"
      const expected = [
        [    null, null, "Opt 1", "Opt 2", newName],
        [    null, null,       6,       6,       6],
        ["Crit 1",    1,       1,       1,       1],
        ["Crit 2",    2,       1,       1,       1],
        ["Crit 3",    3,       1,       1,       1]
      ];
      
      assertSerialisedEqual(domain.setOptionName(input, 2, newName), expected );
    });
    
  });
  
  describe('setEval()', function () {
    
    const input = [
      [    null, null, "Opt 1", "Opt 2", "Opt 3"],
      [    null, null,       6,       6,       6],
      ["Crit 1",    1,       1,       1,       1],
      ["Crit 2",    2,       1,       1,       1],
      ["Crit 3",    3,       1,       1,       1]
    ];
    
    it('Opt 1, Crit 1', function () {
      
      const expected = [
        [    null, null, "Opt 1", "Opt 2", "Opt 3"],
        [    null, null,      10,       6,       6],
        ["Crit 1",    1,       5,       1,       1],
        ["Crit 2",    2,       1,       1,       1],
        ["Crit 3",    3,       1,       1,       1]
      ];
      
      assertSerialisedEqual(domain.setEval(input, 0, 0, 5), expected );
    });
    
    it('Opt 3, Crit 3', function () {
      
      const expected = [
        [    null, null, "Opt 1", "Opt 2", "Opt 3"],
        [    null, null,       6,       6,      18],
        ["Crit 1",    1,       1,       1,       1],
        ["Crit 2",    2,       1,       1,       1],
        ["Crit 3",    3,       1,       1,       5]
      ];
      
      assertSerialisedEqual(domain.setEval(input, 2, 2, 5), expected );
    });
    
  });
  
  describe('deleteOption()', function () {
    
    const input = [
      [    null, null, "Opt 1", "Opt 2", "Opt 3"],
      [    null, null,       6,       6,       6],
      ["Crit 1",    1,       1,       1,       1],
      ["Crit 2",    2,       1,       1,       1],
      ["Crit 3",    3,       1,       1,       1]
    ];
    
    it('Opt 1', function () {
      
      const expected = [
        [    null, null, "Opt 2", "Opt 3"],
        [    null, null,       6,       6],
        ["Crit 1",    1,       1,       1],
        ["Crit 2",    2,       1,       1],
        ["Crit 3",    3,       1,       1]
      ];
      
      assertSerialisedEqual(domain.deleteOption(input, 0), expected );
    });
    
    it('Opt 2', function () {
      
      const expected = [
        [    null, null, "Opt 1", "Opt 3"],
        [    null, null,       6,       6],
        ["Crit 1",    1,       1,       1],
        ["Crit 2",    2,       1,       1],
        ["Crit 3",    3,       1,       1]
      ];
      
      assertSerialisedEqual(domain.deleteOption(input, 1), expected );
    });
    
    it('Opt 3', function () {
      
      const expected = [
        [    null, null, "Opt 1", "Opt 2"],
        [    null, null,       6,       6],
        ["Crit 1",    1,       1,       1],
        ["Crit 2",    2,       1,       1],
        ["Crit 3",    3,       1,       1]
      ];
      
      assertSerialisedEqual(domain.deleteOption(input, 2), expected );
    });
    
  });
  
  describe('deleteCriterion()', function () {
    
    const input = [
      [    null, null, "Opt 1", "Opt 2", "Opt 3"],
      [    null, null,       6,       6,       6],
      ["Crit 1",    1,       1,       1,       1],
      ["Crit 2",    2,       1,       1,       1],
      ["Crit 3",    3,       1,       1,       1]
    ];
    
    it('Crit 1', function () {
      
      const expected = [
        [    null, null, "Opt 1", "Opt 2", "Opt 3"],
        [    null, null,       5,       5,       5],
        ["Crit 2",    2,       1,       1,       1],
        ["Crit 3",    3,       1,       1,       1]
      ];
      
      assertSerialisedEqual(domain.deleteCriterion(input, 0), expected );
    });
    
    it('Crit 2', function () {
      
      const expected = [
        [    null, null, "Opt 1", "Opt 2", "Opt 3"],
        [    null, null,       4,       4,       4],
        ["Crit 1",    1,       1,       1,       1],
        ["Crit 3",    3,       1,       1,       1]
      ];
      
      assertSerialisedEqual(domain.deleteCriterion(input, 1), expected );
    });
    
    it('Crit 3', function () {
      
      const expected = [
        [    null, null, "Opt 1", "Opt 2", "Opt 3"],
        [    null, null,       3,       3,       3],
        ["Crit 1",    1,       1,       1,       1],
        ["Crit 2",    2,       1,       1,       1]
      ];
      
      assertSerialisedEqual(domain.deleteCriterion(input, 2), expected );
    });
    
  });
  
});
