const fs = require('fs');
const path = require('path');
const extnMap=require('./util/langExtns');

function getFileNameWithExtn(fileName,lang){
    return extnMap[lang]!=undefined? fileName+extnMap[lang]: fileName+'.txt';
}

function getDirPath(dataObj, requirements) {
    return path.join(__dirname, requirements.contestName,requirements.lang, dataObj.qn);
}

function getFilePath(dirPath,fileNameWithExtn){
    return path.join(dirPath, `${fileNameWithExtn}`);
}

function createFile(dirPath, dataObj, data, lang) {
    try {
        const fileNameWithExtn=getFileNameWithExtn(dataObj.userName,lang);
        const filePath = getFilePath(dirPath,fileNameWithExtn);

        if (fs.existsSync(filePath)) console.log(`${fileNameWithExtn} already exists!! Writing over it`);

        fs.writeFileSync(filePath, data);
        console.log(`File written Successfull --->Qn:${dataObj.qn}, FileName:${fileNameWithExtn}`);

    } catch (err) {
        console.log('Issue in creation of file');
        console.log(err);
    }

}

function createDirectory(dirPath) {
    try {
        fs.mkdirSync(dirPath, {
            recursive: true
        });
    } catch (err) {
        console.log('Issue in creating directory');
    }
}

async function create(dataObj, requirements, code) {
    try {
        const dirPath = getDirPath(dataObj, requirements);
        createDirectory(dirPath);
        createFile(dirPath, dataObj, code,requirements.lang);
    } catch (e) {
        console.log(e);
    }
}


module.exports = {create};
