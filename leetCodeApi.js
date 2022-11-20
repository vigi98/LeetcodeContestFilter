const axios = require('axios');
const fileCreation = require('./file');
const sleep = require('./util/sleepLib');


function getRegionSpecificUrl(region) {
    return region === 'US' ? 'https://leetcode.com/api/submissions' : 'https://leetcode.cn/api/submissions';
}

function qnMapCreation(response) {
    const qnMap = new Map();
    response.questions.forEach(qObj => {
        qnMap.set(qObj.question_id, qObj.title);
    });
    return qnMap;
}

function getTotalStudents(response) {
    return response.total_rank.length;
}

function createDataObject(userName, qnMap, ansSubmitted) {
    const dataObj = {};
    dataObj.userName = userName;
    dataObj.qnId = ansSubmitted.question_id;
    dataObj.region = ansSubmitted.data_region;
    dataObj.submissionId = ansSubmitted.submission_id;
    dataObj.qn = qnMap.get(dataObj.qnId);
    return dataObj;
}

async function getSoln(dataObj, requirements) {
    try {
        const regionSpecificUrl = getRegionSpecificUrl(dataObj.region);

        const response = await axios.get(`${regionSpecificUrl}/${dataObj.submissionId}/`, {
            headers: {
                'authority': 'leetcode.com',
                'accept': 'application/json, text/javascript, */*; q=0.01',
                'accept-language': 'en-US,en;q=0.9',
                'content-type': 'application/json',
                'cookie': 'csrftoken=EHUkGkHE92sGrhW9NGp3AknC5XIuBOkJuj5VRvxzxqtssKWM515EsQLRCYgRyi3Y; _gid=GA1.2.772499120.1668142470; gr_user_id=ba617d81-2f93-4153-a54c-559fadff135b; 87b5a3c3f1a55520_gr_session_id=44e0632a-5419-41a5-947e-f23f538a987a; 87b5a3c3f1a55520_gr_session_id_44e0632a-5419-41a5-947e-f23f538a987a=true; _ga_CDRWKZTDEX=GS1.1.1668142478.1.0.1668142481.0.0.0; _ga=GA1.2.1982206472.1668142470; _gat=1',
                'referer': `https://leetcode.com/contest/${requirements.contestName}`,
                'sec-ch-ua': '"Microsoft Edge";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.35',
                'x-newrelic-id': 'UAQDVFVRGwEAXVlbBAg=',
                'x-requested-with': 'XMLHttpRequest'
            }
        });

        // console.log("Successfully processed "+dataObj.submissionId);
        if (response.data.lang != requirements.lang) return;

        await fileCreation.create(dataObj, requirements, response.data.code);

    } catch (e) {
        console.log("Issue in getting submission url:");

        if (e.response) {
            console.log(e.response.status);
            console.log(e.config.url);
        } else console.log(e.code);

        console.log(`Sleeping for sometime --->Qn:${dataObj.qn}, User:${dataObj.userName}`);
        console.log('\n');
        await sleep(5000);
        console.log(`Retrying for --->Qn:${dataObj.qn}, User:${dataObj.userName}`);
        await getSoln(dataObj, requirements);
    }
}

async function getRankingOfContestWithSubmissions(requirements) {
    const config = {
        method: 'get',
        url: `https://leetcode.com/contest/api/ranking/${requirements.contestName}/?pagination=${requirements.page}&region=global`,
        headers: {
            'authority': 'leetcode.com',
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'accept-language': 'en-US,en;q=0.9',
            'content-type': 'application/json',
            'cookie': 'csrftoken=33qWT1kw3sLNAvSsBKjttVXFNlgn37OoCTYCgCxEtpJ2ltaYejZTUThiiFfIcAMy; _gid=GA1.2.1926217271.1667893293; gr_user_id=54c573c8-1767-4002-87e7-c901f348c68a; _ga_CDRWKZTDEX=GS1.1.1667893306.1.0.1667893311.0.0.0; _ga=GA1.2.188532390.1667893293; _gat=1; csrftoken=33qWT1kw3sLNAvSsBKjttVXFNlgn37OoCTYCgCxEtpJ2ltaYejZTUThiiFfIcAMy',
            'referer': `https://leetcode.com/contest/${requirements.contestName}`,
            'sec-ch-ua': '"Microsoft Edge";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.35',
            'x-newrelic-id': 'UAQDVFVRGwEAXVlbBAg=',
            'x-requested-with': 'XMLHttpRequest'
        }
    };
    try {
        const PromiseResponse = await axios(config);
        const response = PromiseResponse.data;

        const qnMap = qnMapCreation(response)
        
        let totalStudents = getTotalStudents(response);

        //Checking all users soln for current given page
        for (let i = 0; i < totalStudents; i++) {
            let userName = response.total_rank[i].username;
            await sleep(600);
            
            //Checking each soln of given username
            Object.values(response.submissions[i]).forEach(async ansSubmittedByCurrentUser => {
                let dataObj = createDataObject(userName, qnMap, ansSubmittedByCurrentUser);               
                await getSoln(dataObj, requirements);
            });

        }

    } catch (e) {
        console.log("Issue in getting contest url:");

        if (e.response) console.log('Status Code:' + e.response.status);
        else console.log(e.code);

        console.log(`Sleeping for sometime retrying again for contest:${requirements.contestName},
         page:${requirements.page}`);
        console.log('\n');
        await sleep(5000);
        console.log(`Retrying for contest:${requirements.contestName}, page:${requirements.page}`);
        await getRankingOfContestWithSubmissions(requirements);

    }
}

async function isValidContestName(contestName) {
    const config = {
        method: 'get',
        url: `https://leetcode.com/contest/api/info/${contestName}`,
        headers: {
            'authority': 'leetcode.com',
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'accept-language': 'en-US,en;q=0.9',
            'content-type': 'application/json',
            'cookie': 'csrftoken=pxZSlncCmbJMvlTw4DjChXcXXNeyS8M2sVKjaGlynURXIWRVy7FHStak6el81f0b; gr_user_id=efd8e5ca-c1d6-4085-9af7-79aefc045e34; __stripe_mid=5bc3947d-3a60-4c03-98d7-aa5875b8c1e5270097; _gid=GA1.2.1022077916.1668853060; NEW_PROBLEMLIST_PAGE=1; 87b5a3c3f1a55520_gr_session_id=ee8c6618-9ea8-4dae-8686-b418c0e0155a; 87b5a3c3f1a55520_gr_session_id_ee8c6618-9ea8-4dae-8686-b418c0e0155a=true; _gat=1; _ga_CDRWKZTDEX=GS1.1.1668944941.4.0.1668944944.0.0.0; _ga=GA1.2.1803209942.1654590049; csrftoken=33qWT1kw3sLNAvSsBKjttVXFNlgn37OoCTYCgCxEtpJ2ltaYejZTUThiiFfIcAMy',
            'referer': `https://leetcode.com/contest/${contestName}/`,
            'sec-ch-ua': '"Microsoft Edge";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.52',
            'x-newrelic-id': 'UAQDVFVRGwEAXVlbBAg=',
            'x-requested-with': 'XMLHttpRequest'
        }
    };
    try {
        const response = await axios(config);
        return response.data.error!=undefined?false:true; 

    } catch (e) {
        console.log('Issue in Validating URL. Retrying after some time');
        await sleep(1000);
        console.log('Retrying URL check')
        const ans= await isValidContestName(contestName);
        return ans;
    }

}

module.exports = {getRankingOfContestWithSubmissions,isValidContestName};
