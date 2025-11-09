function runAllStrategies() {
  const blockSizes = document.getElementById("blockSizes").value
    .split(",")
    .map(Number);
  const processSizes = document.getElementById("processSizes").value
    .split(",")
    .map(Number);

  const firstFit = allocate(processSizes, [...blockSizes], "firstFit");
  const bestFit = allocate(processSizes, [...blockSizes], "bestFit");
  const worstFit = allocate(processSizes, [...blockSizes], "worstFit");

  showComparison(processSizes, firstFit, bestFit, worstFit);

  drawDiagram(firstFit, processSizes, blockSizes, "firstFitDiagram");
  drawDiagram(bestFit, processSizes, blockSizes, "bestFitDiagram");
  drawDiagram(worstFit, processSizes, blockSizes, "worstFitDiagram");
}

function allocate(processSizes, blockSizes, strategy) {
  let blocks = blockSizes.map((size, index) => ({
    size,
    index
  }));

  let allocation = new Array(processSizes.length).fill(-1);

  for (let i = 0; i < processSizes.length; i++) {
    let selectedIndex = -1;

    for (let j = 0; j < blocks.length; j++) {
      if (blocks[j].size >= processSizes[i]) {
        if (strategy === "firstFit") {
          selectedIndex = j;
          break;
        } else if (strategy === "bestFit") {
          if (
            selectedIndex === -1 ||
            blocks[j].size < blocks[selectedIndex].size
          ) {
            selectedIndex = j;
          }
        } else if (strategy === "worstFit") {
          if (
            selectedIndex === -1 ||
            blocks[j].size > blocks[selectedIndex].size
          ) {
            selectedIndex = j;
          }
        }
      }
    }

    if (selectedIndex !== -1) {
      allocation[i] = blocks[selectedIndex].index + 1;
      blocks[selectedIndex].size -= processSizes[i];
    }
  }

  return allocation;
}

function showComparison(processes, firstFit, bestFit, worstFit) {
  const tbody = document.getElementById("resultBody");
  tbody.innerHTML = "";

  processes.forEach((size, i) => {
    const row = document.createElement("tr");

    const pNo = document.createElement("td");
    pNo.textContent = i + 1;

    const pSize = document.createElement("td");
    pSize.textContent = size;

    const ff = document.createElement("td");
    ff.textContent = firstFit[i] !== -1 ? `Block ${firstFit[i]}` : "Not Allocated";

    const bf = document.createElement("td");
    bf.textContent = bestFit[i] !== -1 ? `Block ${bestFit[i]}` : "Not Allocated";

    const wf = document.createElement("td");
    wf.textContent = worstFit[i] !== -1 ? `Block ${worstFit[i]}` : "Not Allocated";

    row.appendChild(pNo);
    row.appendChild(pSize);
    row.appendChild(ff);
    row.appendChild(bf);
    row.appendChild(wf);

    tbody.appendChild(row);
  });
}

function drawDiagram(allocation, processes, originalBlocks, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  let blocks = originalBlocks.map(size => ({
    size,
    originalSize: size,
    processes: []
  }));

  processes.forEach((pSize, i) => {
    const alloc = allocation[i];
    if (alloc !== -1) {
      blocks[alloc - 1].processes.push({
        id: i + 1,
        size: pSize
      });
      blocks[alloc - 1].size -= pSize;
    }
  });

  blocks.forEach((block, i) => {
    const blockWrapper = document.createElement("div");
    blockWrapper.className = "block-container";

    const title = document.createElement("div");
    title.className = "block-title";
    title.textContent = `Block ${i + 1} (Total Size: ${block.originalSize})`;
    blockWrapper.appendChild(title);

    block.processes.forEach(proc => {
      const procDiv = document.createElement("div");
      procDiv.className = "sub-block";
      procDiv.textContent = `Process ${proc.id} (${proc.size})`;
      blockWrapper.appendChild(procDiv);
    });

    if (block.size > 0) {
      const unusedDiv = document.createElement("div");
      unusedDiv.className = "sub-block unallocated";
      unusedDiv.textContent = `Unused (${block.size})`;
      blockWrapper.appendChild(unusedDiv);
    }

    container.appendChild(blockWrapper);
  });
}
