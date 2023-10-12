const util = require('./util');
const assert = require('assert');
const {By, Select} = require('selenium-webdriver');

const domain = require('../../APP/DOMAIN/domain');

describe('GUI', function () {
      
  describe('Main Window', function () {
    
    let driver;
      
    before(async function() {
      driver = await util.get_driver();
    });
      
    after(async function() {
      await driver.quit()
      driver = null
    });
  
    it('Has correct title', async function () {
      await driver.getTitle().then( (title)=> {
        assert.equal(title, 'Decision Matrix');
      });
    });
      
    it('Has show/hide scores button', async function () {
      const elements = await driver.findElements(By.id('showScoreButton'));
      assert.equal(elements.length, 1);
      const buttonText = await elements[0].getAttribute('innerText');
      assert.ok(buttonText=="Show Scores" || buttonText=="Hide Scores")
    })
  
  });
  
  describe('Score Show/hide functionality', function () {
    
    let driver;
      
    before(async function() {
      driver = await util.get_driver();
    });
      
    after(async function() {
      await driver.quit()
      driver = null
    });
  
    it('All optionally hidable objects match button state on start', async function () {
      
      const button = await driver.findElements(By.id('showScoreButton'));
      assert.equal(button.length, 1);
      const buttonText = await button[0].getAttribute('innerText');

      assert.ok(buttonText=="Show Scores" || buttonText=="Hide Scores");

      const claimsVisible = (buttonText=="Hide Scores");

      const hideables = await driver.findElements(By.className('ScoreHideable'));

      for(let iHidable=0; iHidable<hideables.length;iHidable++) {
        assert.equal(await hideables[iHidable].isDisplayed(), claimsVisible);
      }
    });
  
    it('Button functions', async function () {
      
      const nTries = 5;

      for(let nTry=0; nTry<=nTries; nTry++) {
        
        let button = await driver.findElements(By.id('showScoreButton'));
        assert.equal(button.length, 1);
        
        let buttonText = await button[0].getAttribute('innerText');
        assert.ok(buttonText=="Show Scores" || buttonText=="Hide Scores");

        let beginClaimsVisible = (buttonText=="Hide Scores");
        let beginButtonText = buttonText;

        // Hidables in correct start state

        let hideables = await driver.findElements(By.className('ScoreHideable'));

        for(let iHidable=0; iHidable<hideables.length;iHidable++) {
          assert.equal(await hideables[iHidable].isDisplayed(), beginClaimsVisible);
        }

        // Press button
        button = await driver.findElements(By.id('showScoreButton'));
        assert.equal(button.length, 1);
        await driver.findElement(By.id("showScoreButton")).click();
        
        // Button text has changed
        button = await driver.findElements(By.id('showScoreButton'));
        buttonText = await button[0].getAttribute('innerText');
        assert.ok(buttonText=="Show Scores" || buttonText=="Hide Scores");
        assert.notEqual(buttonText, beginButtonText);
        assert.notEqual(buttonText=="Hide Scores", beginClaimsVisible);

        // Hidables in new correct state
        hideables = await driver.findElements(By.className('ScoreHideable'));
        for(let iHidable=0; iHidable<hideables.length;iHidable++) {
          assert.notEqual(await hideables[iHidable].isDisplayed(), beginClaimsVisible);
        }
      }
    });
  
  });
  
  describe('New Document', function () {
    
    let driver;
      
    before(async function() {
      driver = await util.get_driver();
    });
      
    after(async function() {
      await driver.quit()
      driver = null
    });
    
    describe('Default empty table', async function () {
      
      it('Two Options', async function () {
        const elements = await driver.findElements(By.className('optionNameBox'));
        assert.equal(elements.length, 2);
      })
      
      it('Option Names', async function () {
        const elements = await driver.findElements(By.className('optionNameBox'));
        for(let nEl=0; nEl<elements.length; nEl++) {
          let name = await elements[nEl].getAttribute('value');
          assert.equal(name, "Option "+String(nEl+1) );
        }
      })
      
    });
    
    describe('Create a decision', async function () {
      
      it('Add an option', async function () {
        await driver.findElement(By.id("addOptionButton")).click();
        const optionBoxes = await driver.findElements(By.className('optionNameBox'));
        const criterionBoxes = await driver.findElements(By.className('criterionNameBox'));
        assert.equal(optionBoxes.length, 3 );
        assert.equal(criterionBoxes.length, 1 );
      });
      
      it('Add a criterion', async function () {
        await driver.findElement(By.id("addCriterionButton")).click();
        const optionBoxes = await driver.findElements(By.className('optionNameBox'));
        const criterionBoxes = await driver.findElements(By.className('criterionNameBox'));
        assert.equal(optionBoxes.length, 3 );
        assert.equal(criterionBoxes.length, 2 );
      });
      
      it('Delete an option', async function () {
        const delButtons = await driver.findElements(By.className('delOptionButton'));
        assert.equal(delButtons.length, 3 );

        await delButtons[0].click();
        const optionNames = await driver.findElements(By.className('optionNameBox'));
        
        assert.equal(optionNames.length, 2 );

        assert.equal(await optionNames[0].getAttribute("value"), "Option 2" );
        assert.equal(await optionNames[1].getAttribute("value"), "New Option" );
      });
      
      it('Delete a criterion', async function () {
        const delButtons = await driver.findElements(By.css('.delCriterionButton'));
        assert.equal(delButtons.length, 2 );

        await delButtons[0].click();
        const criterionNames = await driver.findElements(By.css('.criterionNameBox'));
        
        assert.equal(criterionNames.length, 1 );

        assert.equal(await criterionNames[0].getAttribute("value"), "New Criterion" );
      });
      
    });
    
  });

  describe('New Decision', function () {
    
    let driver;
      
    before(async function() {
      driver = await util.get_driver();
    });
      
    after(async function() {
      await driver.quit()
      driver = null
    });
    
    describe('Create a decision and evaluate', async function () {
      
      const optionNames = ["Take Bus", "Call Taxi", "Ask Friend"];

      const criteriaNames = ["Low Cost", "Convenient", "Get Wet With Rain"];

      const weightTexts = ["Very Important", "Neutral", "Not Important"];
      const weightValues = [5, 3, 2];

      const evalText = [
        ["Same / Baseline", "Much Worse than baseline", "Much Better than baseline"],
        ["Same / Baseline", "Much Better than baseline", "Better than baseline"],
        ["Same / Baseline", "Better than baseline", "Much Better than baseline"]
      ];

      const evalValues = [
        [0, -2, 2],
        [0,  2, 1],
        [0,  1, 2]
      ];

      expectedScores = [
        5*0 + 3*0 + 2*0,
        5*-2 + 3*2 + 2*1,
        5*2 + 3*1 + 2*2,
      ];


      it('Add an option', async function () {
        await driver.findElement(By.id("addOptionButton")).click();
        const optionBoxes = await driver.findElements(By.className('optionNameBox'));
        const criterionBoxes = await driver.findElements(By.className('criterionNameBox'));
        assert.equal(optionBoxes.length, 3 );
        assert.equal(criterionBoxes.length, 1 );
      });
      
      it('Add two criterion', async function () {
        await driver.findElement(By.id("addCriterionButton")).click();
        await driver.findElement(By.id("addCriterionButton")).click();
        const optionBoxes = await driver.findElements(By.className('optionNameBox'));
        const criterionBoxes = await driver.findElements(By.className('criterionNameBox'));
        assert.equal(optionBoxes.length, 3 );
        assert.equal(criterionBoxes.length, 3 );
      });
      
      it('Rename options', async function () {
        
        let optionBoxes = await driver.findElements(By.className('optionNameBox'));
        assert.equal(optionBoxes.length, 3 );
        
        for(let nEl=0; nEl<optionBoxes.length; nEl++) {

          optionBoxes = await driver.findElements(By.className('optionNameBox'));
          assert.equal(optionBoxes.length, 3 );

          await optionBoxes[nEl].clear();
          await optionBoxes[nEl].sendKeys(optionNames[nEl]);
        }

        optionBoxes = await driver.findElements(By.className('optionNameBox'));
        assert.equal(optionBoxes.length, 3 );

        for(let nEl=0; nEl<optionBoxes.length; nEl++) {
          assert.equal(await optionBoxes[nEl].getAttribute("value"), optionNames[nEl] );
        }

      });
      
      it('Rename criteria', async function () {
        
        let criterionBoxes = await driver.findElements(By.className('criterionNameBox'));
        assert.equal(criterionBoxes.length, 3 );
        
        for(let nEl=0; nEl<criterionBoxes.length; nEl++) {

          criterionBoxes = await driver.findElements(By.className('criterionNameBox'));
          assert.equal(criterionBoxes.length, 3 );

          await criterionBoxes[nEl].clear();
          await criterionBoxes[nEl].sendKeys(criteriaNames[nEl]);
        }

        criterionBoxes = await driver.findElements(By.className('criterionNameBox'));
        assert.equal(criterionBoxes.length, 3 );

        for(let nEl=0; nEl<criterionBoxes.length; nEl++) {
          assert.equal(await criterionBoxes[nEl].getAttribute("value"), criteriaNames[nEl] );
        }

      });
      
      it('Set weights/importances', async function () {
        
        let weightDropdowns = await driver.findElements(By.className('weightSelect'));
        assert.equal(weightDropdowns.length, 3 );
        
        for(let nEl=0; nEl<weightDropdowns.length; nEl++) {
          weightDropdowns = await driver.findElements(By.className('weightSelect'));
          assert.equal(weightDropdowns.length, 3 );
          let select = new Select(weightDropdowns[nEl])
          await select.selectByVisibleText(weightTexts[nEl]);
        }

        weightDropdowns = await driver.findElements(By.className('weightSelect'));
        assert.equal(weightDropdowns.length, 3 );
        for(let nEl=0; nEl<weightDropdowns.length; nEl++) {
          assert.equal(await weightDropdowns[nEl].getAttribute("value"), weightValues[nEl] );
        }

      });

      it('Set scores', async function () {
        
        const nOptions = (await driver.findElements(By.className('optionNameBox'))).length;
        const nCriteria = (await driver.findElements(By.className('criterionNameBox'))).length;

        assert.equal(nOptions, 3 );
        assert.equal(nCriteria, 3 );

        for(let iCriteria=0; iCriteria<nCriteria; iCriteria++) {
          for(let iOption=0; iOption<nOptions; iOption++) {

            let evals = await driver.findElements(By.css('table tbody tr:nth-of-type('+String(iCriteria+1)+') .evalSelect'));
            assert.equal(evals.length, 3 );
            
            let select = new Select(evals[iOption])
            await select.selectByVisibleText(evalText[iCriteria][iOption]);
          }
        }

        for(let iCriteria=0; iCriteria<nCriteria; iCriteria++) {
          
          let evals = await driver.findElements(By.css('table tbody tr:nth-of-type('+String(iCriteria+1)+') .evalSelect'));
          assert.equal(evals.length, 3 );

          for(let iOption=0; iOption<nOptions; iOption++) {
            
            assert.equal(await evals[iOption].getAttribute("value"), evalValues[iCriteria][iOption]);
          }
        }

      });

      it('Final scores calculated', async function () {
        
        const nOptions = (await driver.findElements(By.className('optionNameBox'))).length;
        assert.equal(nOptions, 3 );

        const scores = await driver.findElements(By.css('.optionScore'));
        assert.equal(scores.length, 3 );


        for(let iOption=0; iOption<nOptions; iOption++) {
          let score = await scores[iOption].getText();
          assert.equal(score, expectedScores[iOption]);
        }

      });
      
    });
  });
  
});
