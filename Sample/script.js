// Define the dimensions of the SVG canvas
var w = 950;
var h = 200;

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
        .then(function (data) {
            // Convert 'Value' to a number
            data.forEach(function (d) {
                d.Value = +d.Value;
            });

            // Update x scale domain
            xScale.domain(data.map(function (d) { return d.Country; })); // Use country names for x axis


            // Update y scale domain
            yScale.domain([0, d3.max(data, function (d) { return d.Value; })]);

            // Create x axis
            var xAxis = d3.axisBottom(xScale);

            // Append x axis to SVG
            svg.append("g")
                .attr("transform", "translate(0," + h + ")")
                .call(xAxis)
                .selectAll("text")
                .attr("dx", "-15px")
                .attr("dy", "6px")
                .attr("font-size", "11px")
                .style("text-anchor", "end")
                .attr("transform", "rotate(-65)");

            // Create y axis
            var yAxis = d3.axisLeft(yScale);

            // Append y axis to SVG
            svg.append("g")
                .call(yAxis);

            // Remove old bars and labels
            svg.selectAll("rect").remove();
            svg.selectAll(".barLabel").remove();

            // Create a group for the bars
            var barGroup = svg.append("g");

            // Create bars
            var bars = barGroup.selectAll("rect")
                .data(data);

            // Handle the update selection
            bars
                .attr("x", function (d) { return xScale(d.Country); })
                .attr("y", function (d) { return h - yScale(d.Value); })
                .attr("width", xScale.bandwidth() - padding)
                .attr("height", function (d) { return yScale(d.Value); })
                .style("fill", "gray");

            // Handle the enter selection
            bars.enter()
                .append("rect")
                .attr("x", function (d) { return xScale(d.Country); })
                .attr("y", function (d) { return h; }) // Start bars at the bottom of the SVG
                .attr("width", xScale.bandwidth() - padding)
                .attr("height", 0) // Start with a height of 0
                .style("fill", "gray")
                .attr("y", function (d) { return h - yScale(d.Value); })
                .attr("height", function (d) { return yScale(d.Value); });

            // Add text labels to each bar
            var textLabels = svg.selectAll(".barLabel")
                .data(data);

            // Handle the exit selection
            textLabels.exit().remove();

            // Handle the update selection
            textLabels
                .attr("x", function (d) { return xScale(d.Country) + xScale.bandwidth() / 2; })
                .attr("y", function (d) { return h - yScale(d.Value) + 30; })
                .text(function (d) { return d.Value; });

            // Handle the enter selection
            textLabels.enter()
                .append("text")
                .attr("class", "barLabel")
                .attr("x", function (d) { return xScale(d.Country) + xScale.bandwidth() / 2; })
                .attr("y", function (d) { return h; }) // Start labels at the bottom of the SVG
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .text(function (d) { return d.Value; })
                .attr("y", function (d) { return h - yScale(d.Value) + 15; });
        })
        .catch(function (error) {
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
