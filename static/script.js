document.addEventListener('DOMContentLoaded', function() {
    const generateButton = document.getElementById('generate_button');
    const progressSection = document.querySelector('.progress-section');
    const reportText = document.getElementById('report-text');
    const backButton = document.getElementById('back_button');
    const inputSection = document.querySelector('.input-section');
    const plotsContainer = document.querySelector('.plots-container');
    const reportTitle = document.getElementById('report_title');
    const progressLabel = document.querySelector('.progress-label')
    const colors = ['#40e0d0', '#ffa07a', '#90ee90', '#add8e6', '#ffb6c1', '#d3d3d3', '#f0e68c'];

     const plotQueue = [];
    let isProcessing = false;
     
  const enqueuePlot = (data, name, type) => {
       plotQueue.push({ data, name, type });
       processPlotQueue();
    };

   const processPlotQueue = () => {
      if (isProcessing || plotQueue.length === 0) {
          return;
        }
      isProcessing = true;
      const { data, name, type } = plotQueue.shift();
        setTimeout(() => {
            generatePlot(data, name, type);
           isProcessing = false;
           processPlotQueue();
      }, 0);

    };


    const generatePlot = function(data, name, type){
        const container = document.createElement("div")
        container.classList.add("plot-container")
        const canvas = document.createElement("canvas")
        canvas.id = `${name}-plot`
        container.appendChild(canvas)

        plotsContainer.appendChild(container);

        const ctx = canvas.getContext('2d');
        let chart;
        
        let labels = Object.keys(data);
           //sort the labels in ascending order
            labels.sort((a,b)=>{
                if(typeof a === 'number' && typeof b === 'number'){
                  return a - b;
                } else if (typeof a === 'string' && typeof b === 'string') {
                  return a.localeCompare(b);
                } else {
                  return 0
                 }
            })
       const values = labels.map(label => data[label])
         const backgroundColors = labels.map((_, index) => colors[index % colors.length]);
         if(type === "bar"){
                chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                    label: name,
                    data: values,
                      backgroundColor: backgroundColors,
                    borderColor: 'black',
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                        beginAtZero: true
                        }
                    }
                }
                });
            }else if(type === "hist"){
                const hist = createHistogram(data, 5);
                 chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: hist.bins.map(bin => `${bin.min.toFixed(2)} - ${bin.max.toFixed(2)} MB`),
                    datasets: [{
                      label: name,
                      data: hist.counts,
                      backgroundColor: '#40e0d0',
                      borderColor: 'black',
                    }]
                },
               options: {
                 responsive: true,
                 maintainAspectRatio: false,
                  scales: {
                     y: {
                       beginAtZero: true
                     }
                 }
               }
             });
          }
      }

    const createHistogram = (data, binCount) => {
        if(!data || data.length === 0){
           return {bins:[], counts:[]};
        }
        const sortedData = [...data].sort((a, b) => a - b);
        const min = sortedData[0];
        const max = sortedData[sortedData.length-1]
        const range = max - min;
        let binSize = range / binCount;
        const order = Math.pow(10, Math.floor(Math.log10(binSize)));
        binSize = Math.ceil(binSize/order) * order;

        const bins = [];
        const counts = new Array(binCount).fill(0);

          let currentBinMin = min;
          for (let i = 0; i < binCount; i++) {
            const currentBinMax = currentBinMin + binSize;
            bins.push({ min: currentBinMin, max: currentBinMax });
              currentBinMin = currentBinMax;
          }
        
           for(const value of data){
            for(let i = 0; i < bins.length; i++){
              if(value >= bins[i].min && value <= bins[i].max){
                counts[i]++;
                break;
              }
            }
        }
           return {bins: bins, counts: counts};
    }

    const createFixedFpsGroups = (data) => {
        const counts = {
          "<30fps": 0,
          "30fps": 0,
          "60fps": 0,
          ">60fps": 0
        };
  
        for (const fps of data) {
          if (fps < 30) {
            counts["<30fps"]++;
          } else if (fps === 30) {
            counts["30fps"]++;
          } else if (fps === 60) {
            counts["60fps"]++;
          } else {
            counts[">60fps"]++;
          }
        }
          
        return counts;
      };


    const calculateMedian = (arr) => {
        const mid = Math.floor(arr.length / 2),
            nums = [...arr].sort((a, b) => a - b);
        return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
    };

    const createSmartSizeGroups = (data) => {
      if (!data || data.length === 0) {
          return {};
      }
        const median = calculateMedian(data);
        const binSize = median / 5;
        const groups = {};
        const ranges = [];

        for(let i = 0; i < 5; i++){
             const min = (i*2) * binSize;
             let max = (i*2+2) * binSize;
             if(i === 4){
                max = Infinity;
             }
             ranges.push({min:min, max:max})
        }

        for (const value of data) {
            for (let i = 0; i < ranges.length; i++) {
                if (value >= ranges[i].min && value <= ranges[i].max) {
                     const label = ranges[i].max === Infinity ? `${ranges[i].min.toFixed(2)}+ MB`: `${ranges[i].min.toFixed(2)} - ${ranges[i].max.toFixed(2)} MB`;
                     groups[label] = (groups[label] || 0) + 1;
                    break;
                }
            }
        }
        return groups;
    };

    const createSmartGroups = (data, maxGroups, label_function) =>{
        if(!data || data.length === 0){
           return {};
        }
          const counts = {};
            const sortedData = [...data].sort((a, b) => {
              if (typeof a === 'string' && typeof b === 'string') {
                return a.localeCompare(b)
              }
                return a - b
            });

         const topGroups = {}
        for (const item of sortedData) {
           topGroups[item] = (topGroups[item] || 0) + 1;
        }

         const sortedTopGroups = Object.entries(topGroups).sort(([, countA], [, countB]) => countB - countA);
        const groups = []
       for(let i = 0; i < sortedTopGroups.length; i++){
            if(i < maxGroups -1){
                 groups.push({label:sortedTopGroups[i][0], value:sortedTopGroups[i][1]})
             }
       }

         let otherValue = 0
          for(let i = maxGroups -1; i < sortedTopGroups.length; i++){
              otherValue += sortedTopGroups[i][1]
         }
        if(otherValue > 0){
           groups.push({label:"Outros", value:otherValue})
        }

        for (const group of groups) {
           counts[group.label] = group.value;
       }
       return counts
    }


    generateButton.addEventListener('click', function() {
        const reportName = document.getElementById('report_name').value || "Analisador de Biblioteca de Vídeos"
         const videoDir = document.getElementById('video_dir').value;
        if(!videoDir){
        alert('Por favor, informe o diretorio');
            return;
         }
        inputSection.style.display = 'none';
        progressSection.style.display = 'block';
        progressLabel.style.display = 'block';
        
        reportTitle.textContent = `${reportName}`;

        fetch('/generate_report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'video_root_dir=' + encodeURIComponent(videoDir)
        })
            .then(response => response.json())
              .then(data => {
                   if(data.error){
                      alert(`Erro ao gerar relatório:${data.error}`)
                       progressSection.style.display = 'none';
                       inputSection.style.display = 'flex';
                       return;
                  }
                   reportText.textContent = data.report;
                    progressLabel.style.display = 'none';
                   backButton.style.display = 'block';

                  const videoDurationsData = {};
                   const durations = data.plots.video_durations
                   const bins = [0, 10, 20, 30, 45, 60, 90, Infinity]
                   const labels = ['1-10s', '11-20s', '21-30s', '31-45s', '46-60s', '61-90s', '91s+']

                      for(const duration of durations){
                        for(let i = 0; i < bins.length-1; i++){
                          if(duration >= bins[i] && duration < bins[i+1]){
                           if(videoDurationsData[labels[i]]){
                            videoDurationsData[labels[i]]++;
                           }else{
                             videoDurationsData[labels[i]] = 1;
                           }
                             break;
                          }
                        }
                    }
                     enqueuePlot(videoDurationsData, "Distribuição da Duração dos Vídeos", "bar")

                  const videoSizes = data.plots.video_sizes.map(size => size/ (1024 * 1024))
                   
                  const sizeData = createSmartSizeGroups(videoSizes)
                    enqueuePlot(sizeData, "Distribuição do Tamanho dos Vídeos", "bar")

                  const resolutionData = createSmartGroups(data.plots.video_resolutions, 7, (group)=> {
                     return group;
                    });
                     enqueuePlot(resolutionData, "Distribuição da Resolução dos Vídeos", "bar")

                  const fpsData = createFixedFpsGroups(data.plots.video_fps);
                  enqueuePlot(fpsData, "Distribuição da Taxa de Quadros", "bar")
              })
             .catch(error => {
                alert('Erro ao gerar relatório:' + error);
                 progressSection.style.display = 'none';
                 inputSection.style.display = 'flex';
            });
    });

    backButton.addEventListener('click', function() {
        progressSection.style.display = 'none';
        inputSection.style.display = 'flex';
          reportText.textContent = "";
        plotsContainer.innerHTML = "";
        reportTitle.textContent = "Analisador de Biblioteca de Vídeos"
          progressLabel.style.display = 'none';
        backButton.style.display = 'none'
    });
});
