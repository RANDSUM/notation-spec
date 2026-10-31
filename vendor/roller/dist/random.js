function R(n){let e={seed:n},o=4294967296;return()=>(e.seed=((e.seed*1664525+1013904223)%4294967296+4294967296)%4294967296,e.seed/4294967296)}function c(n){let{sides:e,rolls:o,rerollRolls:t,explodeRolls:a,compoundRolls:u,penetrateRolls:s,sequenceRolls:m}=n,r=[...o,...t??[],...a??[],...u??[],...s??[],...m??[]],l={index:0};return()=>{let d=r[l.index];if(d===void 0)throw Error(`createQueueRandom: queue exhausted after ${r.length} call(s). Provide more rolls.`);return l.index+=1,(d-1)/e}}export{c as createQueueRandom,R as createSeededRandom};

//# debugId=41F49D339324E94564756E2164756E21
