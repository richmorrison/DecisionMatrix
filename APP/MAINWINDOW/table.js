let domainReference = undefined;

let table = {};

const defaultWeight = 3;
const defaultEvaluation = 0;

table['getTableData'] = function() { return domainReference.emptyTable(); }
table['containerId'] = "decisionMatrixContainer";

table['scoresVisible'] = true;

table['resizeToContents'] = function() {
  
  const width = document.body.clientWidth+600;
  const height = document.body.clientHeight+100;
  
  window.electronAPI.resizeWindow(width, height);
}

table['newTable'] = async function (nOptions=2, nCriteria=1) {
    
    try {
      
      let newTable = await window.electronAPI.new();
      
      for(let i=1; i<=nCriteria; i++){
        newTable = domainReference.addCriterion(newTable, "Criterion "+i, 3, 0);
      }
      
      for(let j=1; j<=nOptions; j++){
        newTable = domainReference.addOption(newTable, "Option "+j, 0);
      }
      table.reload(newTable);
      return;
      
    } catch(err) {
      console.log(err)
      return;
    }
}

table['open'] = async function() {
  
  window.electronAPI.open().then(function (result){
    table.reload(result);
  }).catch(function (error){
    console.log(error);
  })
}

table['save'] = async function() {
  
  window.electronAPI.save( table.getTableData() ).then(function (result){
    console.log("Saved");
  }).catch(function (error){
    console.log(error);
  })
}

table['saveAs'] = async function() {
  
  window.electronAPI.saveAs( table.getTableData() ).then(function (result){
    console.log("Saved");
  }).catch(function (error){
    console.log(error);
  })
}

table['requestPDF'] = async function () {
    
  const pdfWidth = document.body.clientWidth/96 + 1;
  const pdfHeight = document.body.clientHeight/96 + 1;
  
  table.PrepareElementsForExport();
  
  window.electronAPI.genPDF(pdfWidth, pdfHeight).then(function (result){
    console.log(result);
  }).catch(function (error){
    console.log(error);
  }).finally(function (){
    table.restoreElementsAfterExport();
  });  
}

table['requestPNG'] = async function () {
    
  table.PrepareElementsForExport();
  
  window.electronAPI.genPNG().then(function (result){
    console.log(result);
  }).catch(function (error){
    console.log(error);
  }).finally(function (){
    table.restoreElementsAfterExport();
  });  
}

table['applyToAllOfClass'] = function (cls, op) {
  const objs = document.querySelectorAll("."+cls);
  for(obj of objs) op(obj);
}

table['PrepareElementsForExport'] = function () {
  table.applyToAllOfClass("exportHideable", (obj)=>{obj.hidden=true;});
  table.applyToAllOfClass("exportDisable", (obj)=>{obj.readonly=true;});
};

table['restoreElementsAfterExport'] = function () {
  table.applyToAllOfClass("exportHideable", (obj)=>{obj.hidden=false;});
  table.applyToAllOfClass("exportDisable", (obj)=>{obj.readonly=false;});
};

table['setScoreVisibility'] = function (isVisible) {
  
  table.scoresVisible = isVisible;
  
  table.applyToAllOfClass("ScoreHideable", (obj)=>{obj.hidden=!isVisible;});
  
  if(isVisible) {
    document.querySelector(`#showScoreButton`).innerText="Hide Scores";
    document.querySelector(`#showScoreButton`).onclick = () => { table.setScoreVisibility(false); };
  } else {
    document.querySelector(`#showScoreButton`).innerText="Show Scores";
    document.querySelector(`#showScoreButton`).onclick = () => { table.setScoreVisibility(true); };
  }
}

table['buildShowScoresButton'] = function() {
  
  let scoreButton = document.createElement("button");
  scoreButton.innerText="Show Scores";
  scoreButton.setAttribute("id", "showScoreButton");
  scoreButton.className = "exportHideable btn btn-primary btn-lg";
  
  scoreButton.onclick = () => { table.setScoreVisibility(true) };
  
  return scoreButton
}

table['reload'] = function(tableData) {
  
  table.getTableData = function() { return tableData; }
  
  let HTMLtableContainer = document.getElementById( table.containerId );
  
  if(HTMLtableContainer.children.length > 0) {
    HTMLtableContainer.removeChild(HTMLtableContainer.lastElementChild);
  }
  
  HTMLtableContainer.appendChild( table.buildTableHTML(tableData, function(tableData){ table.reload(tableData); }) );
  
  table.setScoreVisibility(table.scoresVisible);
}

table['deleteOptionCallback'] = function(tableData, nOption, refreshCallback) {
  
  let newTable = domainReference.deleteOption(tableData, nOption);
  
  window.electronAPI.notifyUnsaved();
  
  refreshCallback(newTable);
}

table['deleteCriterionCallback'] = function(tableData, nCriterion, refreshCallback) {
  
  let newTable = domainReference.deleteCriterion(tableData, nCriterion);
  
  window.electronAPI.notifyUnsaved();
  
  refreshCallback(newTable);
}

table['updateEvalCallback'] = function(tableData, nCriterion, nOption, val, refreshCallback) {
  
  let newTable = domainReference.setEval(tableData, nCriterion, nOption, parseInt(val));
  
  window.electronAPI.notifyUnsaved();
  
  refreshCallback(newTable);
}

table['updateWeightCallback'] = function(tableData, nCriterion, val, refreshCallback) {
  
  let newTable = domainReference.setWeight(tableData, nCriterion, parseInt(val));
  
  window.electronAPI.notifyUnsaved();
  
  refreshCallback(newTable);
}

table['addOptionCallback'] = function(tableData, refreshCallback) {
  
  let newTable = domainReference.addOption(tableData, "New Option", defaultEvaluation);
  
  window.electronAPI.notifyUnsaved();
  
  refreshCallback(newTable);
}

table['addCriterionCallback'] = function(tableData, refreshCallback) {
  
  let newTable = domainReference.addCriterion(tableData, "New Criterion", defaultWeight, defaultEvaluation);
  
  window.electronAPI.notifyUnsaved();
  
  refreshCallback(newTable);
}

table['updateOptionNameCallback'] = function(tableData, nOption, target, refreshCallback) {
  
  const selectionStart = target.selectionStart;
  
  let newTable = domainReference.setOptionName(tableData, nOption, target.value);
  
  window.electronAPI.notifyUnsaved();
  
  refreshCallback(newTable);
  
  const newTarget=document.querySelector(`#decisionMatrix thead tr:nth-child(2) th:nth-child(${nOption+3}) input`);
  newTarget.focus();
  newTarget.selectionStart=selectionStart;
  newTarget.selectionEnd=selectionStart;
}

table['updateCriterionNameCallback'] = function(tableData, nCriterion, target, refreshCallback) {
  
  const selectionStart = target.selectionStart;
  
  let newTable = domainReference.setCriterionName(tableData, nCriterion, target.value);
  
  window.electronAPI.notifyUnsaved();
  
  refreshCallback(newTable);
  
  const newTarget=document.querySelector(`#decisionMatrix tbody tr:nth-child(${nCriterion+1}) th:nth-child(1) input`);
  newTarget.focus();
  newTarget.selectionStart=selectionStart;
  newTarget.selectionEnd=selectionStart;
}

table['applyAttribute'] = function(element, tooltip_text, tooltip_placement) {
  element.setAttribute('data-toggle', 'tooltip');
  element.setAttribute('data-placement', tooltip_placement);
  element.setAttribute('title', tooltip_text);
  return;
}

table['delButtonElement'] = function (tooltip_text, tooltip_placement) {
  
  let buttonSpan = document.createElement("span");
  buttonSpan.className = "bi-trash text-danger exportHideable";
  
  table.applyAttribute(buttonSpan, tooltip_text, tooltip_placement);
  return buttonSpan;
}

table['addButtonElement'] = function (tooltip_text, tooltip_placement) {
  
  let buttonSpan = document.createElement("span");
  buttonSpan.className = "bi-plus-circle text-success exportHideable";
  
  table.applyAttribute(buttonSpan, tooltip_text, tooltip_placement);
  return buttonSpan;
}

table['buildWeightSelect'] = function(value) {
  
  let weightSelect = document.createElement("select");
  
  let innerHTML=`
      <option value="5">Very Important</option>
      <option value="4">Important</option>
      <option value="3">Neutral</option>
      <option value="2">Not Important</option>
      <option value="1">Very Unimportant</option>
   `;
  
  weightSelect.innerHTML = innerHTML.trim();
  
  weightSelect.className = "weightSelect exportDisable";
  
  weightSelect.value = String(value);
  
  return weightSelect;
}

table['buildEvalSelect'] = function(value) {
  
  let scoreElement = document.createElement("select");
  
  let innerHTML=`
      <option value="2">Much Better than baseline</option>
      <option value="1">Better than baseline</option>
      <option value="0">Same / Baseline</option>
      <option value="-1">Worse than baseline</option>
      <option value="-2">Much Worse than baseline</option>
    `;
  
  scoreElement.innerHTML = innerHTML.trim();
  
  scoreElement.className = "evalSelect exportDisable";
  
  scoreElement.value = String(value);
  
  return scoreElement;
}

table['buildNameBox'] = function(name) {
  
  let box = document.createElement("input");
  box.setAttribute("type", "text");
  box.className = "text-primary exportDisable";
  
  box.value = String(name);
  
  return box;
}

table['buildTextElement'] = function(score) {
  let element = document.createElement("p");
  element.innerText = String(score);
  return element;
}

table['buildTableElement'] = function() {
  let tableElement = document.createElement("table");
  tableElement.className = "table";
  tableElement.id = "decisionMatrix";
  return tableElement;
}

table['buildTableHeadElement'] = function() {
  return document.createElement("thead");
}

table['buildTableBodyElement'] = function() {
  return document.createElement("tbody");
}

table['buildDeleteOptionsRowElement'] = function(tableData, refreshCallback) {
  
  let row = document.createElement("tr");
  
  row.append( document.createElement("th") );
  row.append( document.createElement("th") );
  for(let c=domainReference.numberColumnsEmptyTable(); c<tableData[0].length; c++) {
    let cell = document.createElement("th");
    row.append( cell );
    const nOptions = tableData[0].length-domainReference.numberColumnsEmptyTable();
    if(nOptions>2) {
      let button = table.delButtonElement("Delete option", "bottom");
      button.classList.add("delOptionButton");
      button.onclick=function(e){ table.deleteOptionCallback(tableData, c-domainReference.numberColumnsEmptyTable(), refreshCallback)};
      cell.append(button);
    }
  }
  
  let lastCell = document.createElement("th");
  row.append( lastCell );
  
  lastCell.append( table.buildShowScoresButton() );

  return row
}

table['buildOptionsRowElement'] = function(tableData, refreshCallback) {

  let row = document.createElement("tr");
  
  row.append( document.createElement("th") );
  row.append( document.createElement("th") );

  for(let c=0; c<tableData[0].length-domainReference.numberColumnsEmptyTable(); c++) {
    let cell = document.createElement("th");
    row.append( cell );
    let nameBox = table.buildNameBox(tableData[0][c+domainReference.numberColumnsEmptyTable()]);
    nameBox.classList.add("optionNameBox");
    cell.append( nameBox );
    nameBox.oninput = function(e){ table.updateOptionNameCallback(tableData, c, e.target, refreshCallback); };
  }

  let cell = document.createElement("th");
  row.append( cell );
  let button = table.addButtonElement("Add new option", "bottom");
  button.setAttribute("id","addOptionButton");
  button.onclick=function(e) { table.addOptionCallback(tableData, refreshCallback); };
  cell.append( button );

  return row;
}

table['buildScoresRowElement'] = function(tableData) {
  
  let row = document.createElement("tr");
  row.className="ScoreHideable";
  row.append(document.createElement("th"));
  
  let cell = document.createElement("th");
  row.append(cell);
  cell.append( table.buildTextElement("Score") );
  
  for(let c=domainReference.numberColumnsEmptyTable(); c<tableData[0].length; c++) {
    
    let cell = document.createElement("th");
    row.append( cell );

    let optionScore = table.buildTextElement(tableData[1][c]);
    optionScore.classList.add("optionScore");
    cell.append( optionScore );
  }
  
  row.append( document.createElement("th") );

  return row;
}

table['buildCriteriaHeadersRowElement'] = function(tableData) {

  let row = document.createElement("tr");

  let cell1 = document.createElement("th");
  row.append(cell1);

  let criteriaHeader1 = document.createElement("label");
  criteriaHeader1.innerText = "Criteria";
  cell1.append(criteriaHeader1);

  let cell2 = document.createElement("th");
  row.append(cell2);
  
  let criteriaHeader2 = document.createElement("label");
  criteriaHeader2.innerText = "Weight";
  cell2.append(criteriaHeader2);
  
  for(let c=domainReference.numberColumnsEmptyTable(); c<tableData[0].length; c++) {
    row.append( document.createElement("th") );
  }
  row.append( document.createElement("th") );

  return row;
}

table['buildEvalSelectorTDElement'] = function(tableData, iRow, iCol, refreshCallback) {
  
  let evalCell = document.createElement("td");
  
  let evalElement = table.buildEvalSelect(
    tableData[domainReference.fromDataRowIndex(tableData, iRow)][domainReference.fromDataColumnIndex(tableData, iCol)]
  );
  evalElement.onchange = function(e){ table.updateEvalCallback(tableData, iRow, iCol, e.target.value, refreshCallback); };
  evalCell.append(
    evalElement
  );
  
  let evalValueLabel = document.createElement('label');
  evalValueLabel.innerText = evalElement.value;
  evalValueLabel.className="ScoreHideable evalValue";
  evalCell.append(
    evalValueLabel
  );

  return evalCell;
}

table['buildCriteriaRowElement'] = function(tableData, refreshCallback, iRow) {
    
  let row = document.createElement("tr");
  
  // Criterion name

  let nameCell = document.createElement("th");
  row.append(nameCell);
  
  let namebox = table.buildNameBox( tableData[domainReference.fromDataRowIndex(tableData, iRow)][0] );
  namebox.classList.add("criterionNameBox");
  namebox.oninput =  function(e){ table.updateCriterionNameCallback(tableData, iRow, e.target, refreshCallback); };
  nameCell.append( namebox );
  
  // Criterion weight

  let weightCell = document.createElement("td");
  row.append(weightCell);
  
  let weightElement = table.buildWeightSelect(
    tableData[domainReference.fromDataRowIndex(tableData, iRow)][1]
  );
  weightElement.onchange = function(e){
    table.updateWeightCallback(tableData, iRow, e.target.value, refreshCallback)
  };
  weightCell.append(
    weightElement
  );
  
  // Weight value as label

  let weightValueLabel = document.createElement('label');
  weightValueLabel.innerText = weightElement.value;
  weightValueLabel.className="ScoreHideable weightValue";
  weightCell.append(
    weightValueLabel
  );
  
  // Criterion evaluation boxes

  for(let iCol=0; iCol<tableData[0].length-domainReference.numberColumnsEmptyTable(); iCol++) {
    row.append(table.buildEvalSelectorTDElement(tableData, iRow, iCol, refreshCallback));
  }

  // Criterion delete button
  let cell = document.createElement("th");
  row.append( cell );

  const nCriteria=tableData.length-domainReference.numberRowsEmptyTable();
  if(nCriteria>1){
    let button = table.delButtonElement("Delete criterion", "left");
    button.classList.add("delCriterionButton");
    button.onclick=function(e){ table.deleteCriterionCallback(tableData, iRow, refreshCallback); };
    cell.append( button );
  }

  return row;
}

table['buildNewCriterionRowElement'] = function(tableData, refreshCallback) {

  let row = document.createElement("tr");

  let cell = document.createElement("th");
  row.append( cell );

  let button = table.addButtonElement("Add new criterion", "right");
  button.setAttribute("id","addCriterionButton");
  button.onclick=function(e) { table.addCriterionCallback(tableData, refreshCallback); };
  cell.append( button );

  for(let c=0; c<tableData[0].length; c++) {
    row.append( document.createElement("td") );
  }

  return row;
}

table['buildTableHTML'] = function(tableData, refreshCallback) {
  
  let tableElement = table.buildTableElement();
  
  let tableHead = table.buildTableHeadElement();
  tableElement.append(tableHead);

  tableHead.append(table.buildDeleteOptionsRowElement(tableData, refreshCallback));
  tableHead.append(table.buildOptionsRowElement(tableData, refreshCallback));
  tableHead.append(table.buildScoresRowElement(tableData));
  tableHead.append(table.buildCriteriaHeadersRowElement(tableData));
  
  let tableBody = table.buildTableBodyElement();
  tableElement.append(tableBody);
  
  const nCriteria=tableData.length-domainReference.numberRowsEmptyTable();
  for(let r=0; r<tableData.length-domainReference.numberRowsEmptyTable(); r++) {
    tableBody.append(table.buildCriteriaRowElement(tableData, refreshCallback, r));
  }

  tableBody.append(table.buildNewCriterionRowElement(tableData, refreshCallback));
  
  return tableElement;
}

window.electronAPI.triggerNew((event) => {
  table.newTable();
});

window.electronAPI.triggerOpenrequest((event) => {
  table.open();
});

window.electronAPI.triggerSaverequest((event) => {
  table.save();
});

window.electronAPI.triggerSaveAsrequest((event) => {
  table.saveAs();
});

window.electronAPI.triggerGenPDFrequest((event) => {
  table.requestPDF();
});

window.electronAPI.triggerGenPNGrequest((event) => {
  table.requestPNG();
});

window.electronAPI.triggerShowHelp((event) => {
    window.electronAPI.showHelp();
});

window.electronAPI.triggerShowAbout((event) => {
    window.electronAPI.showAbout();
});



try {
  module.exports = (domainReferenceInjection) => {
    domainReference = domainReferenceInjection;
    return table;
  }
}
catch {
  (async function () {
    domainReference = domain;
    await table.newTable();
    table.resizeToContents();
  })();
}
