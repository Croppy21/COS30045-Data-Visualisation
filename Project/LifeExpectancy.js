// Define the dimensions of the SVG canvas
var w = 960;
var h = 400; // Increase height to provide more space for labels and axis

// Define margins to provide space for axes and labels
var margin = { top: 40, right: 20, bottom: 100, left: 60 }; // Adjust left margin for y-axis labels
var width = w - margin.left - margin.right;
var height = h - margin.top - margin.bottom;

// Define padding between bars
var padding = 5; // Adjust as needed for spacing between bars

// Create x scale
var xScale = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.2) // Adjust the padding between bars
    .paddingOuter(0.2); // Adjust the padding at the ends

// Create y scale
var yScale = d3.scaleLinear()
    .range([height, 0]); // Invert the range for y-axis

// Select SVG and append a group element
var svg = d3.select("svg")
    .attr("width", w)
    .attr("height", h)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Variable to store current data
var currentData = {};
var currentYear = "2020";

// Function to update chart
function updateChart(csvFile) {
    d3.csv(csvFile)
        .then(function (data) {
            // Convert 'Value' to a number
            data.forEach(function (d) {
                d.Value = +d.Value;
            });

            // Store the current data for download
            currentData[currentYear] = data;

            // Update x scale domain
            xScale.domain(data.map(function (d) { return d.Country; })); // Use country names for x axis

            // Update y scale domain
            var maxValue = d3.max(data, function (d) { return d.Value; });
            var minValue = d3.min(data, function (d) { return d.Value; });
            yScale.domain([0, 90]); // Set domain to max value + buffer

            // Define the color for bars
            var barColor = "steelblue";

            // Create x axis
            var xAxis = d3.axisBottom(xScale);

            // Append x axis to SVG
            svg.selectAll(".x-axis").remove(); // Remove previous axis
            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")
                .attr("dx", "-15px")
                .attr("dy", "6px")
                .attr("font-size", "11px")
                .style("text-anchor", "end")
                .attr("transform", "rotate(-65)");

            // Create y axis
            var yAxis = d3.axisLeft(yScale)
                .tickValues(d3.range(0, 100, 10)); // Set custom tick values dynamically

            // Append y axis to SVG
            svg.selectAll(".y-axis").remove(); // Remove previous axis
            svg.append("g")
                .attr("class", "y-axis")
                .call(yAxis);

            // Add y axis line
            svg.selectAll(".y-axis-line").remove();
            svg.append("line")
                .attr("class", "y-axis-line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 0)
                .attr("y2", height)
                .style("stroke", "black");

            // Update bars
            var bars = svg.selectAll("rect")
                .data(data);

            // Handle the enter selection
            bars.enter()
                .append("rect")
                .attr("x", function (d) { return xScale(d.Country); })
                .attr("y", function (d) { return yScale(d.Value); }) // Start at y=value
                .attr("width", xScale.bandwidth())
                .attr("height", function (d) { return height - yScale(d.Value); }) // Set height based on value
                .style("fill", function (d) { return d.Value === 0 ? "none" : barColor; }) // Hide bars with zero value
                .on("mouseover", function (event, d) {
                    var barWidth = xScale.bandwidth();
                    var textPadding = 5;
                    var tooltipX = parseFloat(d3.select(this).attr("x")) + barWidth / 2;
                    var tooltipY = parseFloat(d3.select(this).attr("y")) - 10;

                    var textWidth = getTextWidth(d.Country + ": " + d.Value, "12px sans-serif");

                    var tooltipWidth = textWidth + 2 * textPadding;
                    var tooltipHeight = 20;

                    svg.append("rect")
                        .attr("class", "tooltip-bg")
                        .attr("x", tooltipX - tooltipWidth / 2)
                        .attr("y", tooltipY - tooltipHeight)
                        .attr("width", tooltipWidth)
                        .attr("height", tooltipHeight)
                        .attr("fill", "orange")
                        .attr("rx", 5)
                        .attr("ry", 5);

                    svg.append("text")
                        .attr("class", "tooltip-text")
                        .attr("x", tooltipX)
                        .attr("y", tooltipY - 10)
                        .attr("text-anchor", "middle")
                        .attr("alignment-baseline", "middle")
                        .attr("fill", "black")
                        .attr("font-size", "12px")
                        .text(d.Country + ": " + d.Value);
                })
                .on("mouseout", function () {
                    svg.selectAll(".tooltip-bg").remove();
                    svg.selectAll(".tooltip-text").remove();
                })
                .merge(bars) // Merge enter and update selections
                .transition() // Add transition for the bars
                .duration(1000)
                .attr("x", function (d) { return xScale(d.Country); })
                .attr("y", function (d) { return yScale(d.Value); })
                .attr("width", xScale.bandwidth())
                .attr("height", function (d) { return height - yScale(d.Value); });

            // Append warning text for zero value bars
            svg.selectAll(".warning-text").remove(); // Remove previous warning texts
            svg.selectAll(".warning-text")
                .data(data.filter(function (d) { return d.Value === 0; })) // Filter data for zero values
                .enter()
                .append("text")
                .attr("class", "warning-text")
                .attr("x", function (d) { return xScale(d.Country) + xScale.bandwidth() / 2; })
                .attr("y", function (d) { return yScale(0) - 10; }) // Position above the bar
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .style("fill", "red") // Change the text color to red
                .style("font-weight", "bold") // Make the text bold
                .attr("font-size", "18px")
                .text("\u26A0")
                .style("opacity", 0) // Set initial opacity to 0 for fade-in effect
                .on("mouseover", function (event, d) {
                    var tooltipX = xScale(d.Country) + xScale.bandwidth() / 2;
                    var tooltipY = yScale(0) - 30; // Adjust the position of the tooltip
                    var tooltipWidth = 100; // Adjust tooltip width
                    var tooltipHeight = 20; // Adjust tooltip height

                    svg.append("rect")
                        .attr("class", "tooltip-bg")
                        .attr("x", tooltipX - tooltipWidth / 2)
                        .attr("y", tooltipY - tooltipHeight - 5)
                        .attr("width", tooltipWidth)
                        .attr("height", tooltipHeight)
                        .attr("fill", "red") // light red
                        .attr("rx", 5)
                        .attr("ry", 5);

                    svg.append("text")
                        .attr("class", "tooltip-text")
                        .attr("x", tooltipX)
                        .attr("y", tooltipY - 12)
                        .attr("text-anchor", "middle")
                        .attr("alignment-baseline", "middle")
                        .attr("fill", "black")
                        .attr("font-size", "12px")
                        .text("No Data Found");
                })
                .on("mouseout", function () {
                    svg.selectAll(".tooltip-bg").remove();
                    svg.selectAll(".tooltip-text").remove();
                })
                .transition() // Apply transition for fade-in effect
                .duration(1000) // Set duration for fade-in transition
                .style("opacity", 1); // Set opacity to 1

            // Remove warning text with fade-out transition
            svg.selectAll(".warning-text")
                .data(data.filter(function (d) { return d.Value === 0; })) // Filter data for zero values
                .exit()
                .transition() // Apply transition for fade-out effect
                .duration(1000) // Set duration for fade-out transition
                .style("opacity", 0) // Set opacity to 0 for fade-out effect
                .remove(); // Remove the warning text element after transition


            // Remove exit selection
            bars.exit().remove();
        });
}

// Function to calculate text width
function getTextWidth(text, font) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
}

// Function to set active button and update chart
function setActiveButton(buttonId, csvFile) {
    // Remove active class from all buttons
    d3.selectAll(".yearButton").classed("active", false);

    // Add active class to clicked button
    d3.select("#" + buttonId).classed("active", true);

    // Update the current year based on button ID
    currentYear = buttonId.replace('year', '');

    // Update the chart with the new CSV file
    updateChart(csvFile);
}

// Function to download CSV file
function downloadCSV() {
    var csvFilePath = "Data/LifeExpectancy/LifeExpectancyRawData.csv";
    var link = document.createElement("a");
    link.href = csvFilePath;
    link.download = "LifeExpectancyRawData.csv";
    link.click();
}

// Function to download XLSX file
function downloadXLSX() {
    var xlsxFilePath = "Data/LifeExpectancy/LifeExpectancyRawData.xlsx";
    var link = document.createElement("a");
    link.href = xlsxFilePath;
    link.download = "LifeExpectancyRawData.xlsx";
    link.click();
}

// Attach event listeners to download buttons
document.getElementById("download-csv-button").addEventListener("click", downloadCSV);
document.getElementById("download-xlsx-button").addEventListener("click", downloadXLSX);

// Function to toggle download options and arrow icon
function toggleDownloadOptions() {
    var downloadOptions = document.getElementById("download-options");
    var arrowIcon = document.getElementById("arrow-icon");
    if (downloadOptions.style.display === "none") {
        downloadOptions.style.display = "block";
        arrowIcon.innerHTML = "&#9660;"; // Change arrow to down arrow
    } else {
        downloadOptions.style.display = "none";
        arrowIcon.innerHTML = "&#128898;"; // Change arrow to right arrow
    }
}


// Attach event listener to download heading
document.getElementById("download-heading").addEventListener("click", toggleDownloadOptions);

// Load the default CSV file
setActiveButton('year2020', 'Data/LifeExpectancy/LifeExpectancy2020.csv');

// Call updateChart function
updateChart('Data/LifeExpectancy/LifeExpectancy2020.csv');
