var colors=require("colors"),path=require("path"),benchmarks_files=process.env.BENCHMARKS.split(" "),all=[].concat(benchmarks_files),first=all.shift(),benchmarks={};benchmarks_files.forEach(function(file){benchmarks[file]=require(path.join(__dirname,"..",file))}),benchmarks_files.forEach(function(file){var benchmark=benchmarks[file],next_file=all.shift(),next=benchmarks[next_file];function complete(){next?(console.log(`
Starting benchmark `.grey+next_file.yellow),next.run()):console.log(`

Benchmark completed in`.grey,(Date.now()-start).toString().green+" ms".grey)}benchmark.on("complete",complete)});var start=Date.now();console.log("Starting benchmark ".grey+first.yellow),benchmarks[first].run();
