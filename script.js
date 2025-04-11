// Feel free to change or delete any of the code you see in this editor!
var svg = d3.select("#svgContainer") // 修改选择器以选择新的SVG容器
   .append("svg")
   .attr("id", "barChart")
   .attr("width", 960)
   .attr("height", 600);

var tickDuration = 500;

var top_n = 12;
var height = 600;
var width = 960;

const margin = {
   top: 80,
   right: 0,
   bottom: 5,
   left: 0
};

let barPadding = (height-(margin.bottom+margin.top))/(top_n*5);

let title = svg.append('text')
   .attr('class', 'title')
   .attr('y', 24)
   .html('18 years of Interbrand’s Top Global Brands');

let subTitle = svg.append("text")
   .attr("class", "subTitle")
   .attr("y", 55)
   .html("Brand value, $m");

let caption = svg.append('text')
   .attr('class', 'caption')
   .attr('x', width)
   .attr('y', height-5)
   .style('text-anchor', 'end')
   .html('Source: Interbrand');

let year = 2000;
console.log("done.....");
document.addEventListener('DOMContentLoaded', function() { // 确保DOM完全加载后再添加事件监听器

   console.log("DOMContentLoaded.....");
   document.getElementById('loadDataButton').addEventListener('click', function() { // 添加按钮点击事件监听器
      console.log("loadDataButton.....");
      d3.csv('brand_values.csv').then(function(data) {
         //if (error) throw error;

         console.log(data);

         data.forEach(d => {
            d.value = +d.value,
               d.lastValue = +d.lastValue,
               d.value = isNaN(d.value) ? 0 : d.value,
               d.year = +d.year,
               d.colour = d3.hsl(Math.random()*360,0.75,0.75)
         });

         console.log(data);

         let yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
            .sort((a,b) => b.value - a.value)
            .slice(0, top_n);

         yearSlice.forEach((d,i) => d.rank = i);

         console.log('yearSlice: ', yearSlice)

         let x = d3.scaleLinear()
            .domain([0, d3.max(yearSlice, d => d.value)])
            .range([margin.left, width-margin.right-65]);

         let y = d3.scaleLinear()
            .domain([top_n, 0])
            .range([height-margin.bottom, margin.top]);

         let xAxis = d3.axisTop()
            .scale(x)
            .ticks(width > 500 ? 5:2)
            .tickSize(-(height-margin.top-margin.bottom))
            .tickFormat(d => d3.format(',')(d));

         svg.append('g')
            .attr('class', 'axis xAxis')
            .attr('transform', `translate(0, ${margin.top})`)
            .call(xAxis)
            .selectAll('.tick line')
            .classed('origin', d => d == 0);

         svg.selectAll('rect.bar')
            .data(yearSlice, d => d.name)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', x(0)+1)
            .attr('width', d => x(d.value)-x(0)-1)
            .attr('y', d => y(d.rank)+5)
            .attr('height', y(1)-y(0)-barPadding)
            .style('fill', d => d.colour);

         svg.selectAll('text.label')
            .data(yearSlice, d => d.name)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', d => x(d.value)-8)
            .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
            .style('text-anchor', 'end')
            .html(d => d.name);

         svg.selectAll('text.valueLabel')
            .data(yearSlice, d => d.name)
            .enter()
            .append('text')
            .attr('class', 'valueLabel')
            .attr('x', d => x(d.value)+5)
            .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
            .text(d => d3.format(',.0f')(d.lastValue));

         let yearText = svg.append('text')
            .attr('class', 'yearText')
            .attr('x', width-margin.right)
            .attr('y', height-25)
            .style('text-anchor', 'end')
            .html(~~year)
            .call(halo, 10);

         // 初始化CCapture
         // var capturer = new CCapture({
         //    format: 'png',
         //    framerate: 60,
         //    name: 'barChartRace',
         //    quality: 100,
         //    verbose: true
         // });

         // // 开始录制前1秒的延迟
         // setTimeout(function() {
         //    capturer.start();
         // }, 1000);

         let ticker = d3.interval(e => {

            yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
               .sort((a,b) => b.value - a.value)
               .slice(0,top_n);

            yearSlice.forEach((d,i) => d.rank = i);

            //console.log('IntervalYear: ', yearSlice);

            x.domain([0, d3.max(yearSlice, d => d.value)]); 

            svg.select('.xAxis')
               .transition()
               .duration(tickDuration)
               .ease(d3.easeLinear)
               .call(xAxis);

            let bars = svg.selectAll('.bar').data(yearSlice, d => d.name);

            bars
               .enter()
               .append('rect')
               .attr('class', d => `bar ${d.name.replace(/\s/g,'_')}`)
               .attr('x', x(0)+1)
               .attr( 'width', d => x(d.value)-x(0)-1)
               .attr('y', d => y(top_n+1)+5)
               .attr('height', y(1)-y(0)-barPadding)
               .style('fill', d => d.colour)
               .transition()
               .duration(tickDuration)
               .ease(d3.easeLinear)
               .attr('y', d => y(d.rank)+5);

            bars
               .transition()
               .duration(tickDuration)
               .ease(d3.easeLinear)
               .attr('width', d => x(d.value)-x(0)-1)
               .attr('y', d => y(d.rank)+5);

            bars
               .exit()
               .transition()
               .duration(tickDuration)
               .ease(d3.easeLinear)
               .attr('width', d => x(d.value)-x(0)-1)
               .attr('y', d => y(top_n+1)+5)
               .remove();

            let labels = svg.selectAll('.label')
               .data(yearSlice, d => d.name);

            labels
               .enter()
               .append('text')
               .attr('class', 'label')
               .attr('x', d => x(d.value)-8)
               .attr('y', d => y(top_n+1)+5+((y(1)-y(0))/2))
               .style('text-anchor', 'end')
               .html(d => d.name)    
               .transition()
               .duration(tickDuration)
               .ease(d3.easeLinear)
               .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);


            labels
               .transition()
               .duration(tickDuration)
               .ease(d3.easeLinear)
               .attr('x', d => x(d.value)-8)
               .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);

            labels
               .exit()
               .transition()
               .duration(tickDuration)
               .ease(d3.easeLinear)
               .attr('x', d => x(d.value)-8)
               .attr('y', d => y(top_n+1)+5)
               .remove();

            let valueLabels = svg.selectAll('.valueLabel').data(yearSlice, d => d.name);

            valueLabels
               .enter()
               .append('text')
               .attr('class', 'valueLabel')
               .attr('x', d => x(d.value)+5)
               .attr('y', d => y(top_n+1)+5)
               .text(d => d3.format(',.0f')(d.lastValue))
               .transition()
               .duration(tickDuration)
               .ease(d3.easeLinear)
               .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);

            valueLabels
               .transition()
               .duration(tickDuration)
               .ease(d3.easeLinear)
               .attr('x', d => x(d.value)+5)
               .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
               .tween("text", function(d) {
                  let i = d3.interpolateRound(d.lastValue, d.value);
                  return function(t) {
                     this.textContent = d3.format(',')(i(t));
                  };
               });

            valueLabels
               .exit()
               .transition()
               .duration(tickDuration)
               .ease(d3.easeLinear)
               .attr('x', d => x(d.value)+5)
               .attr('y', d => y(top_n+1)+5)
               .remove();

            yearText.html(~~year);

            if(year == 2001) {
               ticker.stop();
               // 停止录制后1秒
               // setTimeout(function() {
               //    capturer.stop();
               //    capturer.save();
               // }, 1000);
            }
            year = d3.format('.1f')((+year) + 0.1);
         },tickDuration);

         // 每帧捕获
         // function captureFrame() {
         //    // 确保SVG元素已经渲染完成
         //    let svgElement = document.getElementById('barChart');
         //    if (!svgElement) {
         //       console.error('SVG element not found');
         //       return;
         //    }

         //    // 使用html2canvas捕获SVG元素
         //    html2canvas(svgElement, {
         //       useCORS: true,
         //       allowTaint: true,
         //       logging: true,
         //       scale: 2
         //    }).then(canvas => {
         //       console.log('Captured canvas:', canvas);
         //       capturer.capture(canvas);
         //       // 使用setTimeout来减少requestAnimationFrame的调用频率
         //       setTimeout(captureFrame, 1000); // 每1000ms捕获一次
         //    }).catch(error => {
         //       console.error('Error capturing frame:', error);
         //    });
         // }
         // 使用setTimeout来启动捕获，而不是立即调用requestAnimationFrame
         // setTimeout(captureFrame, 2000); // 延迟2秒启动捕获

      });
   });
});

const halo = function(text, strokeWidth) {
   text.select(function() { return this.parentNode.insertBefore(this.cloneNode(true), this); })
      .style('fill', '#ffffff')
      .style('stroke','#ffffff')
      .style('stroke-width', strokeWidth)
      .style('stroke-linejoin', 'round')
      .style('opacity', 1);

}