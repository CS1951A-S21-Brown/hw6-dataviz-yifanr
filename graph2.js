(function() {

    let width = 900,
        height = 500;
    // TODO: Set up SVG object with width, height and margin
    let svg = d3.select("#scatterplot")      // HINT: div id for div containing scatterplot
        .append("svg")
        .attr("width", width)     // HINT: width
        .attr("height", height)     // HINT: height
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);    // HINT: transform

    // Set up reference to tooltip
    let tooltip = d3.select("#scatterplot")     // HINT: div id for div containing scatterplot
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    /*
        Create tooltip as a div right underneath the SVG scatter plot.
        Initially tooltip is invisible (opacity 0). We add the tooltip class for styling.
     */



    // TODO: Load the billboard CSV file into D3 by using the d3.csv() method
    d3.csv("data/netflix.csv").then(function(data) {
        // TODO: Filter the data for songs of a given artist (hard code artist name here)
        let dataMap = new Map();
        data.forEach(d => {
            if (d["type"] == 'Movie'){
                let year = parseInt(d["release_year"]);
                if (year == 1964){
                    console.log(d["duration"])
                }
                if(dataMap.has(year)){
                    dataMap.set(year,
                        dataMap.get(year).concat(parseInt(d["duration"].split(" ")[0])));
                } else {
                    dataMap.set(year, [parseInt(d["duration"].split(" ")[0])]);
                }
            }
        });
        data = Array.from(dataMap, ([name, value]) => ({ name, value })).sort(
            function(a, b) {
                return a['name'] - b['name'];
            }
        )
        console.log(data);
        data.forEach(function(entry) {
            let array = entry['value'];
            entry['value'] = array.reduce((a, b) => a + b) / array.length;
        });
        console.log(data);

        // TODO: Nest the data into groups, where a group is a given song by the artist
        /*
            HINT: The key() function is used to join the data. We want to override the default key
            function to use the artist song. This should take the form of an anonymous function
            that returns the song corresponding to a given data point.
         */

        // TODO: Get a list containing the min and max years in the filtered dataset
        let extent = d3.extent(data, function(d) { return d['name']; });
        /*
            HINT: Here we introduce the d3.extent, which can be used to return the min and
            max of a dataset.

            We want to use an anonymous function that will return a parsed JavaScript date (since
            our x-axis is time). Try using Date.parse() for this.
         */
        console.log(extent);
        let range = extent[1] - extent[0];

        // TODO: Create a time scale for the x axis
        let x = d3.scaleBand()
            .domain(Array.from(new Array(range + extent[0]%5 + 1),
                (x, i) => i + (extent[0]-extent[0]%5)))
            .range([0, width - margin.left - margin.right])

        // TODO: Add x-axis label
        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)       // HINT: Position this at the bottom of the graph. Make the x shift 0 and the y shift the height (adjusting for the margin)
            .call(d3.axisBottom(x).tickValues(x.domain().filter(function(d,i){ return !(i%5)})));
        // HINT: Use the d3.axisBottom() to create your axis


        // TODO: Create a linear scale for the y axis
        let y = d3.scaleLinear()
            .domain(d3.extent(data, function(d) { return d['value']; }))
            .range([height - margin.top - margin.bottom, 0]);
        /*
            HINT: The domain should be an interval from 0 to the highest position a song has been on the Billboard
            The range should be the same as previous examples.
         */

        // TODO: Add y-axis label
        svg.append("g")
            .call(d3.axisLeft(y));


        // OPTIONAL: Adding color
        let color = d3.scaleOrdinal()
            .domain(data.map(function(d) { return d["value"] }))
            .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#ff5c7a"), range));

        // Mouseover function to display the tooltip on hover
        let mouseover = function(d) {
            let color_span = `<span style="color: ${color(d['value'])};">`;
            let html = `${d['value'].toFixed(2) + " min"}<br/>
                    ${color_span}${d['name']}</span><br/>`;       // HINT: Display the song here

            // Show the tooltip and set the position relative to the event X and Y location
            tooltip.html(html)
                .style("left", `${(d3.event.pageX) - 330}px`)
                .style("top", `${(d3.event.pageY) - 70}px`)
                .style("box-shadow", `2px 2px 5px ${color(d.song)}`)    // OPTIONAL for students
                .transition()
                .duration(200)
                .style("opacity", 0.9)
        };

        // Mouseout function to hide the tool on exit
        let mouseout = function(d) {
            // Set opacity back to 0 to hide
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        };

        // Creates a reference to all the scatterplot dots
        let dots = svg.selectAll("dot").data(data);

        // TODO: Render the dot elements on the DOM
        dots.enter()
            .append("circle")
            .attr("cx", function (d) { return x(d['name']); })      // HINT: Get x position by parsing the data point's date field
            .attr("cy", function (d) { return y(d['value']); })      // HINT: Get y position with the data point's position field
            .attr("r", 4)       // HINT: Define your own radius here
            .style("fill",  function(d){ return color(d['value']); })
            .on("mouseover", mouseover) // HINT: Pass in the mouseover and mouseout functions here
            .on("mouseout", mouseout);

        // Add x-axis label
        svg.append("text")
            .attr("transform", `translate(${(width - margin.left - margin.right) / 2},
                                        ${(height - margin.top - margin.bottom) + 30})`)       // HINT: Place this at the bottom middle edge of the graph
            .style("text-anchor", "middle")
            .text("Year");

        // Add y-axis label
        svg.append("text")
            .attr("transform", `translate(-80, ${(height - margin.top - margin.bottom) / 2})`)       // HINT: Place this at the center left edge of the graph
            .style("text-anchor", "middle")
            .text("Runtime (min)");

        // Add chart title
        svg.append("text")
            .attr("transform", `translate(${(width - margin.left - margin.right) / 2}, ${-20})`)       // HINT: Place this at the top middle edge of the graph
            .style("text-anchor", "middle")
            .style("font-size", 15)
            .text(`Average Movie Runtime by Year`);
    });

})();
