const fs = require('fs');


const generateAssets = async function (forgeConfig, platform, arch) {
  
  return new Promise( async (resolve, reject) => {
    
    const commit = await require('child_process')
      .execSync('git rev-parse HEAD')
      .toString().trim();
    
    const packageObject = await JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    let newName = packageObject.name.replace(/-/g, ' ').split(' ');
    for (let i = 0; i < newName.length; i++) {
      newName[i] = newName[i][0].toUpperCase() + newName[i].substr(1);
    }
    newName=newName.join(" ");
    
    await fs.readFile('./APP/applicationDetails.template', 'utf8', async function (err,data) {
      if (err) {
        reject(err);
        return;
      }
      let result = data;
      result = result.replace(/hashPlaceholder/g, commit);
      result = result.replace(/platformPlaceholder/g, platform);
      result = result.replace(/archPlaceholder/g, arch);
      result = result.replace(/authorPlaceholder/g, packageObject.author);
      result = result.replace(/namePlaceholder/g, newName);
      result = result.replace(/releaseTagPlaceholder/g, packageObject.releaseTag);
      
      await fs.writeFile('./APP/applicationDetails.js', result, 'utf8', function (err) {
        if (err) {
         reject(err);
         return;
        }
      });
    });
    
    resolve();
    return;
  });
}

module.exports = {
  packagerConfig: {
    icon: './icons/positive-feedback-icon',
    ignore: ["test"]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        //iconUrl: 'https://url/to/icon.ico', // displayed in Control Panel > Programs and Features, must be a URL
        setupIcon: './icons/positive-feedback-icon.ico',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: './icons/positive-feedback-icon.png'
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          icon: './icons/positive-feedback-icon.png'
        }
      },
    },
  ],
  hooks: {
    generateAssets: generateAssets,
  },
};
