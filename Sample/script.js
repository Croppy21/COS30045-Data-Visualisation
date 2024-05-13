// Define the dimensions of the SVG canvas
var w = 800;
var h = 400;

// Define padding between bars
var padding = 1;

// Create x scale
var xScale = d3.scaleBand()
    .rangeRound([0, w])
    .paddingInner(0.05);

// Create y scale
var yScale = d3.scaleLinear()
    .range([0, h]);

// Select SVG
var svg = d3.select("svg");

// Function to update chart
function updateChart(csvFile) {
    d3.csv(csvFile)
        .then(function(data) {
            // Convert 'Value' to a number
            data.forEach(function(d) {
                d.Value = +d.Value;
            });

            // Update x scale domain
            xScale.domain(d3.range(data.length));

            // Update y scale domain
            yScale.domain([0, d3.max(data, function(d) { return d.Value; })]);

            // Create bars
            var bars = svg.selectAll("rect")
                .data(data);

            bars.enter()
                .append("rect")
                .merge(bars)
                .transition()
                .duration(1000)
                .attr("x", function(d, i) { return xScale(i); })
                .attr("y", function(d) { return h - yScale(d.Value); })
                .attr("width", xScale.bandwidth() - padding)
                .attr("height", function(d) { return yScale(d.Value); })
                .style("fill", "gray");

            bars.exit().remove();

            // Add text labels to each bar
            var textLabels = svg.selectAll("text")
                .data(data);

            textLabels.enter()
                .append("text")
                .merge(textLabels)
                .text(function(d) { return d.Value; })
                .attr("x", function(d, i) { return xScale(i) + xScale.bandwidth() / 2; })
                .attr("y", function(d) { return h - yScale(d.Value) + 15; })
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .attr("fill", "white");

            textLabels.exit().remove();
        })
        .catch(function(error) {
            console.log(error);
        });
}

// Function to set active button and update chart
function setActiveButton(buttonId, csvFile) {
    // Remove active class from all buttons
    d3.selectAll(".yearButton").classed("active", false);

    // Add active class to clicked button
    d3.select("#" + buttonId).classed("active", true);

    // Update the chart with the new CSV file
    updateChart(csvFile);
}

// Load the default CSV file
setActiveButton('year2018', 'Data/LifeExpectancy/LifeExpectancy2018.csv');

// Call updateChart function
updateChart('Data/LifeExpectancy/LifeExpectancy2018.csv');
