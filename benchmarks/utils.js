// time in ms
const time = () => new Date().getTime();

// define test function with options
const benchmark = async function(fn, options = {}){
    if(arguments.length === 1 && typeof arguments[0] !== "function"){
        fn = arguments[0].fn || arguments[0].bench;
        options = arguments[0];
    }
    // every test cycle can access a test environment
    const env = {};
    const name = options.name || 'benchmark-'+Math.random().toString(32).substr(2,7);
    // a test produces results in form of a list of test cycles [runs] and the resulting average, median, min, max values
    const results = { name, runs : [], average: Infinity, median: Infinity, min: Infinity, max: 0};
    // bind the environment to the test function
    fn = fn.bind(env);
    const numberOfRuns = options.numberOfRuns || 100;
    const includeFailedRunsInCalculations = options.includeFailedRunsInCalculations || false;
    // block of hook setups
    const beforeAll = (options.beforeAll || function(){}).bind(env);
    const afterAll = (options.afterAll || function(){}).bind(env);
    const beforeEach = (options.before || options.beforeEach || function(){}).bind(env);
    const afterEach = (options.after || options.afterEach || function(){}).bind(env);
    let onError = (options.onError || function(err){console.error(err)}).bind(env);
    
    
    //start testing
    await Promise.resolve(beforeAll(env));
    results.startedAll = time();
    for(let i = 0; i < numberOfRuns; i++){
        const result = {
            failed: false,
        };
        await Promise.resolve(beforeEach(env, i));
        try{
            result.start = time();
            await Promise.resolve(fn(env, i));
        }catch(err){
            onError(err, env, i);
            result.failed = true;
        }finally{
            result.end = time();
            result.duration = result.end - result.start;
        }
        await afterEach(env, i);
        results.runs.push(result);
    }
    results.finishedAll = time();
    results.completeDuration = results.finishedAll - results.startedAll;
    await Promise.resolve(afterAll(env));
    const failed = results.runs.filter(r => r.failed).length;
    let sortedEligible = results.runs.filter(r => includeFailedRunsInCalculations ? true : !r.failed).sort((a, b) => a.duration-b.duration);
    if(!sortedEligible.length) sortedEligible = [{duration: 0}];
    const eligibleLen = sortedEligible.length;
    results.min = sortedEligible[0].duration;
    results.max = sortedEligible[eligibleLen-1].duration;
    results.median = eligibleLen % 2 === 0 ? (sortedEligible[eligibleLen/2].duration+sortedEligible[eligibleLen/2 - 1].duration)/2 : sortedEligible[Math.floor(eligibleLen/2)].duration;
    results.average = sortedEligible.reduce((sum, r) => r.duration + sum, 0) / eligibleLen;
    results.output = (destination='console') => {
        destination = destination.toLowerCase();
        if(destination === 'console'){
            console.log('Benchmark '+results.name+' finished after '+results.completeDuration+' milliseconds');
            console.log('fastest:', results.min);
            console.log('slowest:', results.max);
            console.log('average:', results.average);
            console.log('median:', results.median);
            if(!failed) console.log('no benchmark failed with an error');
            else console.warn('there have been '+(failed)+' errors during this test procedure');
            console.log('runs:', results.runs);
            console.log("\r\n");
        }
        if(destination === 'html'){
            writeLn = text => document.body.innerHTML += "<p class='benchmark-result-line'>"+text+"</p><br>";
            writeLn('Benchmark '+results.name+' finished after '+results.completeDuration+' milliseconds');
            writeLn('fastest: '+ results.min);
            writeLn('slowest: '+ results.max);
            writeLn('average: '+results.average);
            writeLn('median: '+results.median);
            if(!failed) writeLn('no benchmark failed with an error');
            else writeLn('<span style="color:red;">there have been '+(failed)+' errors during this test procedure</span>');
            writeLn("<hr>");
        }
    };
    return results;
};
