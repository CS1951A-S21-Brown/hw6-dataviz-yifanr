// TODO: Set up SVG object with width, height and margin
let svg2 = d3.select("#barplot2")
    .append("svg")
    .attr("width", width)     // HINT: width
    .attr("height", height)     // HINT: height
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);    // HINT: transform

// TODO: Create a linear scale for the x axis (number of occurrences)
let x2 = d3.scaleLinear()
    .range([0,width - margin.left - margin.right]);

// TODO: Create a scale band for the y axis (artist)
let y2 = d3.scaleBand()
    .range([0,height - margin.top - margin.bottom])
    .padding(0.1);  // Improves readability
/*
    Here we will create global references to the x and y axis with a fixed range.
    We will update the domain of the axis in the setData function based on which data source
    is requested.
 */

// Set up reference to count SVG group
let countRef2 = svg2.append("g");
// Set up reference to y axis label to update text in setData
let y_axis_label2 = svg2.append("g");

// TODO: Add x-axis label
svg2.append("text")
    .attr("transform", `translate(${(width - margin.left - margin.right) / 2},
                                ${(height - margin.top - margin.bottom) + 30})`)       // HINT: Place this at the bottom middle edge of the graph
    .style("text-anchor", "middle")
    .text("Count");
// Since this text will not update, we can declare it outside of the setData function


// TODO: Add y-axis label
let y_axis_text2 = svg2.append("text")
    .attr("transform", `translate(-180, ${(height - margin.top - margin.bottom) / 2}) rotate(-90) `) // HINT: Place this at the center left edge of the graph
    .style("text-anchor", "middle");

// TODO: Add chart title
let title2 = svg2.append("text")
    .attr("transform", `translate(${(width - margin.left - margin.right) / 2}, ${-20})`)       // HINT: Place this at the top middle edge of the graph
    .style("text-anchor", "middle")
    .style("font-size", 15);
/*
    We declare global references to the y-axis label and the chart title to update the text when
    the data source is changed.
 */

let numExamples = 40;

/**
 * Sets the data on the barplot using the provided index of valid data sources and an attribute
 * to use for comparison
 */
function setData2(titles) {
    // TODO: Load the artists CSV file into D3 by using the d3.csv() method. Index into the filenames array
    d3.csv("data/netflix.csv").then(function(data) {
        // TODO: Clean and strip desired amount of data for barplot
        let dataMap = new Map();
        data.forEach(d => {
            if(titles.includes(d["type"]) && d["director"] !== '' && d["cast"] !== ''){
                d["director"].split(', ').forEach(director => {
                    d["cast"].split(', ').forEach(actor => {
                        let key = director + ", " + actor
                        console.log(key)
                        if(dataMap.has(key)){
                            dataMap.set(key, dataMap.get(key)+1);
                        } else {
                            dataMap.set(key, 1);
                        }
                    });
                });
            }
        });
        data = Array.from(dataMap, ([name, value]) => ({ name, value })).sort(
            function(a, b) {
                return b['value'] - a['value'];
            }
        ).slice(0,numExamples);
        console.log(data);
        // TODO: Update the x axis domain with the max count of the provided data
        x2.domain([0, d3.max(data.map(d => d['value']))]);

        // TODO: Update the y axis domains with the desired attribute
        y2.domain(data.map(entry => entry['name']));
        // HINT: Use the attr parameter to get the desired attribute for each data point

        // TODO: Render y-axis label
        y_axis_label2.call(d3.axisLeft(y2).tickSize(0).tickPadding(10));

        /*
            This next line does the following:
                1. Select all desired elements in the DOM
                2. Count and parse the data values
                3. Create new, data-bound elements for each data value
         */
        let bars = svg2.selectAll("rect").data(data);

        // TODO: Render the bar elements on the DOM
        /*
            This next section of code does the following:
                1. Take each selection and append a desired element in the DOM
                2. Merge bars with previously rendered elements
                3. For each data point, apply styling attributes to each element

            Remember to use the attr parameter to get the desired attribute for each data point
            when rendering.
         */
        let color = d3.scaleOrdinal()
            .domain(data.map(function(d) { return d["name"] }))
            .range(d3.quantize(d3.interpolateHcl("#5680e2", "#91d2c3"), data.length));
        bars.enter()
            .append("rect")
            .merge(bars)
            .transition()
            .attr("fill", function(d) { return color(d['name']);}) // Here, we are using functin(d) { ... } to return fill colors based on the data point d
            .duration(1000)
            .attr("x", x2(0))
            .attr("y", function(d) {return y2(d['name']);})               // HINT: Use function(d) { return ...; } to apply styles based on the data point (d)
            .attr("width", function(d) {return x2(d['value']);})
            .attr("height", y2.bandwidth());        // HINT: y.bandwidth() makes a reasonable display height

        /*
            In lieu of x-axis labels, we are going to display the count of the artist next to its bar on the
            bar plot. We will be creating these in the same manner as the bars.
         */
        let counts = countRef2.selectAll("text").data(data);

        // TODO: Render the text elements on the DOM
        counts.enter()
            .append("text")
            .merge(counts)
            .transition()
            .duration(1000)
            .attr("x", function(d) {return x2(d['value'])+6})       // HINT: Add a small offset to the right edge of the bar, found by x(d.count)
            .attr("y", function(d) {return y2(d['name'])+12})       // HINT: Add a small offset to the top edge of the bar, found by y(d.artist)
            .style("text-anchor", "start")
            .text(function(d) {return d['value']});           // HINT: Get the count of the artist

        y_axis_text2.text("Director, Actor");
        title2.text("Top Director/Actor Pairs");

        // Remove elements not in use if fewer groups in new dataset
        bars.exit().remove();
        counts.exit().remove();
    });
}


// On page load, render the barplot with the artist data
setData2(["Movie", "TV Show"]);
