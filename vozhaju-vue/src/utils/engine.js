export function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function partitionGrid(size, targetLengths) {
    let grid = Array.from({length: size}, () => Array(size).fill(-1));
    let paths = [];
    let iters = 0;
    
    let initialTarget = [...targetLengths].sort((a,b)=>b-a);
    
    function solve(currentTargets) {
        iters++;
        if (iters > 20000) return false;
        
        let startR = -1, startC = -1;
        outer: for(let i=0; i<size; i++) {
            for(let j=0; j<size; j++) {
                if (grid[i][j] === -1) {
                    startR = i; startC = j;
                    break outer;
                }
            }
        }
        if (startR === -1) {
            return true;
        }
        
        let lengthsToTry = new Set();
        for(let l of currentTargets) lengthsToTry.add(l);
        let fallbacks = shuffleArray([4, 5, 6, 3]);
        for(let f of fallbacks) lengthsToTry.add(f);
        lengthsToTry.add(2); // Allow 2-letter words for tight corners
        
        for(let L of lengthsToTry) {
            if (L > size * size) continue; // Sanity check
            
            let path = [];
            if (dfsPath(startR, startC, L, path)) {
                paths.push([...path]);
                
                let nextTargets = [...currentTargets];
                let idx = nextTargets.indexOf(L);
                if (idx !== -1) nextTargets.splice(idx, 1);
                
                if (solve(nextTargets)) return true;
                
                paths.pop();
                for(let p of path) grid[p.r][p.c] = -1;
            }
        }
        return false;
        
        function dfsPath(cr, cc, remLength, path) {
            grid[cr][cc] = paths.length; // temporary marker
            path.push({r: cr, c: cc});
            
            if (remLength === 1) {
                return true;
            }
            
            let dirs = shuffleArray([[0,1],[1,0],[0,-1],[-1,0]]);
            for(let d of dirs) {
                let nr = cr + d[0], nc = cc + d[1];
                if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === -1) {
                    if (dfsPath(nr, nc, remLength - 1, path)) {
                        return true;
                    }
                }
            }
            grid[cr][cc] = -1;
            path.pop();
            return false;
        }
    }
    
    if (solve(initialTarget)) return paths;
    return null;
}

export function generateGridFromWords(levelWords, levelId, allDictWords = []) {
    let size = 5;
    if (levelId <= 5) size = 3;
    else if (levelId <= 15) size = 4;
    else if (levelId <= 30) size = 5;
    else if (levelId <= 45) size = 6;
    else if (levelId <= 100) size = 7;
    else size = 8; // challenge levels

    // Restrict the number of words from levelWords so the grid can actually be partitioned
    // 3x3: 2 words, 4x4: 4 words, 5x5: 6 words, 6x6: 9 words, 7x7: 12 words, 8x8: 15 words
    let allowedWordsCount = size === 3 ? 2 : size === 4 ? 4 : size === 5 ? 6 : size === 6 ? 9 : size === 7 ? 12 : 15;
    let slicedLevelWords = levelWords.slice(0, allowedWordsCount);

    let targetLengths = slicedLevelWords.map(w => w.length);
    let maxWordLen = targetLengths.length > 0 ? Math.max(...targetLengths) : 4;
    if (size * size < maxWordLen) {
        size = Math.ceil(Math.sqrt(maxWordLen));
    }
    
    let paths = null;
    for (let tryCount = 0; tryCount < 50; tryCount++) {
        paths = partitionGrid(size, targetLengths);
        if (paths) break;
    }
    
    if (!paths) {
        console.warn("Partition failed, fallback to 4x4 simple");
        size = 4;
        paths = [
            [{r:0,c:0},{r:0,c:1},{r:0,c:2},{r:0,c:3}],
            [{r:1,c:0},{r:1,c:1},{r:1,c:2},{r:1,c:3}],
            [{r:2,c:0},{r:2,c:1},{r:2,c:2},{r:2,c:3}],
            [{r:3,c:0},{r:3,c:1},{r:3,c:2},{r:3,c:3}]
        ];
    }
    
    let levelWordsCopy = [...slicedLevelWords];
    let allDictCopy = [...allDictWords].filter(w => !levelWordsCopy.includes(w));
    
    let levelByLen = {};
    for (let w of levelWordsCopy) {
        let L = w.length;
        if (!levelByLen[L]) levelByLen[L] = [];
        levelByLen[L].push(w);
    }
    
    let dictByLen = {};
    for (let w of allDictCopy) {
        let L = w.length;
        if (!dictByLen[L]) dictByLen[L] = [];
        dictByLen[L].push(w);
    }
    
    let grid = Array.from({length: size}, () => Array(size).fill(''));
    let finalWords = [];
    let finalPathsMap = {};
    let usedWords = new Set();
    
    for (let path of paths) {
        let L = path.length;
        let wordToUse = null;
        
        if (levelByLen[L] && levelByLen[L].length > 0) {
            let idx = Math.floor(Math.random() * levelByLen[L].length);
            wordToUse = levelByLen[L][idx];
            levelByLen[L].splice(idx, 1);
        } else if (dictByLen[L]) {
            let available = dictByLen[L].filter(w => !usedWords.has(w));
            if (available.length > 0) {
                let idx = Math.floor(Math.random() * available.length);
                wordToUse = available[idx];
            }
        }
        
        if (!wordToUse) {
            // Use Ӯ for 1-letter, or pad with О
            wordToUse = L === 1 ? "Ӯ" : "О".repeat(L);
        }
        
        usedWords.add(wordToUse);
        finalWords.push(wordToUse);
        finalPathsMap[wordToUse] = path.map(p => p.r * size + p.c);
        
        for (let i = 0; i < L; i++) {
            grid[path[i].r][path[i].c] = wordToUse[i];
        }
    }
    
    // Sort finalWords randomly so they don't appear strictly grouped by length in the UI
    finalWords = shuffleArray(finalWords);
    
    return { grid: grid.flat(), size: size, words: finalWords, paths: finalPathsMap };
}
