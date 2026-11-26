async function loadCSV(url){return(await(await fetch(url)).text()).trim().split(/\r?\n/).map(line=>{const cols=line.split(","),arr=[];for(let i=0;i<cols.length;i++)arr.push(cols[i]);return arr})}
