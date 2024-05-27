// Define the dimensions of the SVG canvas
var w = 950;
var h = 300;

// Define padding between bars
var padding = 5; // Adjust as needed for spacing between bars

// Create x scale
var xScale = d3.scaleBand()
    .rangeRound([0, w])
    .paddingInner(0.2) // Adjust the padding between bars
    .paddingOuter(0.2); // Adjust the padding at the ends

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
            svg.selectAll(".x-axis").remove(); // Remove previous axis
            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + h + ")")
                .call(xAxis)
                .selectAll("text")
                .attr("dx", "-15px")
                .attr("dy", "6px")
                .attr("font-size", "11px")
                .style("text-anchor", "end")
                .attr("transform", "rotate(-65)");

            // Create y axis
            var yAxis = d3.axisLeft(yScale)
                .tickValues([0, 20, 40, 60, 80, 100]); // Set custom tick values


            // Append y axis to SVG
            svg.selectAll(".y-axis").remove(); // Remove previous axis
            svg.append("g")
                .attr("class", "y-axis")
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
                .attr("width", xScale.bandwidth())
                .attr("height", function (d) { return yScale(d.Value); })
                .style("fill", "gray");

            // Handle the enter selection
            bars.enter()
                .append("rect")
                .attr("x", function (d) { return xScale(d.Country); })
                .attr("y", function (d) { return h; }) // Start bars at the bottom of the SVG
                .attr("width", xScale.bandwidth())
                .attr("height", 0) // Start with a height of 0
                .style("fill", "gray")
                .on("mouseover", function (event, d) {
                    d3.select(this).style("fill", "orange"); // Change color on hover
                    barGroup.append("text")
                        .attr("class", "barLabel")
                        .attr("id", "barText") // Assign id to text element
                        .attr("x", xScale(d.Country) + xScale.bandwidth() / 2)
                        .attr("y", h - yScale(d.Value))
                        .attr("text-anchor", "middle")
                        .attr("font-size", "12px")
                        .attr("fill", "black")
                        .text(d.Value);
                    // Check if #barText is being selected properly
                    console.log(d3.select("#barText").style("fill"));
                    // Apply styles to #barText
                    d3.select("#barText")
                        .style("fill", "blue")
                        .style("font-weight", "bold")
                        .style("background-color", "red");
                })
                .on("mouseout", function () {
                    d3.select(this).style("fill", "gray"); // Revert color on mouseout
                    svg.selectAll(".barLabel").remove();
                })
                .transition() // Add transition for the bars
                .duration(1000)
                .attr("y", function (d) { return h - yScale(d.Value); })
                .attr("height", function (d) { return yScale(d.Value); });
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
setActiveButton('year2020', 'Data/LifeExpectancy/LifeExpectancy2020.csv');

// Call updateChart function
updateChart('Data/LifeExpectancy/LifeExpectancy2020.csv');
