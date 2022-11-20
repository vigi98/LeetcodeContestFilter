const leetcodeApi = require('./leetCodeApi')
const sleep=require('./util/sleepLib')

function getSolutions(requireM) {
    leetcodeApi.getRankingOfContestWithSubmissions(requireM);
}

function createRequireMentObject(page, contestName, lang) {
    const requireMents = {};
    requireMents.page = page;
    requireMents.contestName = contestName;
    requireMents.lang = lang;
    return requireMents;
}

(async ()=>{
    const contestName = 'weekly-contest-320';
    const validUrl = await leetcodeApi.isValidContestName(contestName);
    
    if(!validUrl){
        console.log("Invalid Url");
        return;
    }

    for(let i=1;i<=5;i++){
        const requireMents = createRequireMentObject(i,contestName,'cpp');
        await sleep(300);
        getSolutions(requireMents)
    }

})();
