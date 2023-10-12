let domain = {};


domain['deepCopy'] = function(object) {
  return JSON.parse(JSON.stringify(object));
}

domain['emptyTable'] = function() {

  return [
    [null, null],
    [null, null]
  ];
  
}

domain['iRowOptionNames'] = function (){return 0;}
domain['iRowScores'] = function (){return 1;}
domain['iColumnCriterionName'] = function (){return 0;}
domain['iColumnWeight'] = function (){return 1;};

domain['numberRowsEmptyTable'] = function() {
  return domain.emptyTable().length;
}

domain['numberColumnsEmptyTable'] = function() {
  return domain.emptyTable()[0].length;
}

domain['recalculate'] = function (oldTable) {
  
  let table = domain.deepCopy(oldTable);
  
  // Zero scores
  for(let c=domain.numberColumnsEmptyTable(); c<table[domain.iRowScores()].length; c++) {
    table[domain.iRowScores()][c] = 0;
  }
  
  // Calc scores
  for(let c=domain.numberColumnsEmptyTable(); c<table[domain.iRowOptionNames()].length; c++) {
    for(let r=domain.numberRowsEmptyTable(); r<table.length; r++) {
      table[domain.iRowScores()][c] = table[domain.iRowScores()][c]+(table[r][domain.iColumnWeight()]*table[r][c]);
    }
  }
  
  return table;
}

domain['addOption'] = function(oldTable, name, defaultEvaluated) {
  
  let table = domain.deepCopy(oldTable);
  
  // Add option name header
  table[domain.iRowOptionNames()].push(name);
  
  // expand score row
  table[domain.iRowScores()].push( 0 );
  
  // add default values
  for(let r=domain.numberRowsEmptyTable(); r<table.length; r++) {
    table[r].push( defaultEvaluated );
  }
  
  return domain.recalculate(table);
}

domain['addCriterion'] = function (oldTable, name, weight, defaultEvaluated) {
  
  let table = domain.deepCopy(oldTable);
  
  let row = [name, weight]
  
  for(let c=domain.numberColumnsEmptyTable(); c<table[0].length; c++) {
    row.push(defaultEvaluated);
  }
  
  table.push(row);
  
  return domain.recalculate(table);
}

domain['setWeight'] = function (oldTable, iCriterion, weight=defaultWeight() ) {
  
  let table = domain.deepCopy(oldTable);
  
  table[domain.fromDataRowIndex(table, iCriterion)][1]=weight;
  
  return domain.recalculate(table);
}

domain['fromDataColumnIndex'] = function (table, c) {
  
  if( domain.numberColumnsEmptyTable()+c >= table[domain.iRowOptionNames()].length) {
    return null;
  }
  
  return domain.numberColumnsEmptyTable()+c;
}

domain['fromDataRowIndex'] = function (table, r) {
  
  if( domain.numberRowsEmptyTable()+r >= table.length) {
    return null;
  }
  
  return domain.numberRowsEmptyTable()+r;
}

domain['fromDataIndex'] = function(table, i, j) {
  
  const row = domain.fromDataRowIndex(table, i);
  const col = domain.fromDataColumnIndex(table, j);
  
  if(row && col) {
    
    return {
      row: row,
      col: col
    };
  }
  
  return null;
}

domain['setCriterionName'] = function (oldTable, i, name) {
  
  let table = domain.deepCopy(oldTable);
  
  const rowIndex = domain.fromDataRowIndex(oldTable, i);
  
  if(rowIndex) {
    table[rowIndex][domain.iColumnCriterionName()] = name;
  }
  
  return domain.recalculate(table);
}

domain['setOptionName'] = function (oldTable, i, name) {
  
  let table = domain.deepCopy(oldTable);
  
  const colIndex = domain.fromDataColumnIndex(oldTable, i);
  
  if(colIndex) {
    table[domain.iRowOptionNames()][colIndex] = name;
  }
  
  return domain.recalculate(table);
}

domain['setEval'] = function (oldTable, row, col, value) {
  
  let table = domain.deepCopy(oldTable);
  
  const index = domain.fromDataIndex(oldTable, row, col);
  
  if(index) {
    table[index.row][index.col] = value;
  }
  
  return domain.recalculate(table);
}

domain['deleteOption'] = function (oldTable, i) {
  
  let table = domain.deepCopy(oldTable);
  
  const colIndex = domain.fromDataColumnIndex(oldTable, i);
  
  if(colIndex) for(let row of table) {
    row.splice(colIndex, 1);
  }
  
  return domain.recalculate(table);
}

domain['deleteCriterion'] = function (oldTable, i) {
  
  let table = domain.deepCopy(oldTable);
  
  const rowIndex = domain.fromDataRowIndex(oldTable, i);
  
  if(rowIndex) table.splice(rowIndex, 1);
  
  return domain.recalculate(table);
}

try {
  module.exports = domain;
}
catch {
  null;
}
