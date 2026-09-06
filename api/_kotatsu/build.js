const fs=require('fs'),path=require('path');
const crew=JSON.parse(fs.readFileSync(path.join(__dirname,'crew.json'),'utf8')); const bible=fs.readFileSync(path.join(__dirname,'bible.md'),'utf8');
fs.writeFileSync(path.join(__dirname,'data.js'), '// Generated from crew.json + bible.md. Edit those, then: node api/_kotatsu/build.js\nmodule.exports = { CREW: '+JSON.stringify(crew,null,1)+',\nBIBLE: '+JSON.stringify(bible)+' };\n'); console.log('data.js written');
