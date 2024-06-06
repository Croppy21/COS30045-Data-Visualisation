// Define the dimensions of the SVG canvas
var w = 960;
var h = 500; // Increased height for better visualization

// Define margins
var margin = { top: 20, right: 30, bottom: 70, left: 50 };
var width = w - margin.left - margin.right;
var height = h - margin.top - margin.bottom;

// Create an array of month names for the x-axis
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Create x scale
var xScale = d3.scaleBand()
    .domain(months)
    .range([0, width]);

// Create y scale
var yScale = d3.scaleLinear()
    .range([height, 0]);

// Define the line generator
var line = d3.line()
    .x(d => xScale(d.month) + xScale.bandwidth() / 2)
    .y(d => yScale(d.amount));

// Select SVG and set dimensions
var svg = d3.select("svg")
    .attr("width", w)
    .attr("height", h)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function updateChart(data) {
    // Calculate the maximum data amount
    var maxAmount = d3.max(data, function (d) { return d.amount; });

    // Set a buffer for the y-axis scale
    var yBuffer = maxAmount * 0.1; // Adjust this factor as needed for spacing

    // Update y scale domain with buffer
    yScale.domain([0, maxAmount + yBuffer]);

    // Create x axis
    var xAxis = d3.axisBottom(xScale);

    // Create y axis
    var yAxis = d3.axisLeft(yScale);

    // Append x axis to SVG
    svg.selectAll(".x-axis").remove();
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("dy", "8px")
        .attr("font-size", "11px")
        .style("text-anchor", "center");

    // Append y axis to SVG
    svg.selectAll(".y-axis").remove();
    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
        .selectAll("line")
        .attr("class", "grid-line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("stroke", "lightgray")
        .attr("stroke-dasharray", "3,3");

    // Remove old lines, dots, and labels
    svg.selectAll(".line").remove();
    svg.selectAll(".dot").remove();
    svg.selectAll(".hitbox").remove();
    svg.selectAll(".lineLabel").remove();

    // Group data by year
    var dataByYear = d3.groups(data, d => d.year);

    // Create the lines and dots
    dataByYear.forEach(function ([year, yearData]) {
        // Append a path for each line
        var path = svg.append("path")
            .datum([])
            .attr("class", "line line" + year)
            .attr("fill", "none")
            .attr("stroke", () => {
                if (year === '2020') return 'steelblue';
                if (year === '2021') return 'green';
                return 'red';
            })
            .attr("stroke-width", 2)
            .attr("d", line);

        // Transition the path
        path.transition()
            .duration(3000)
            .attrTween("d", function () {
                var previousPoints = [];
                return function (t) {
                    var currentPoints = yearData.slice(0, Math.floor(t * yearData.length));
                    var interpolatedPoints = d3.interpolateArray(previousPoints, currentPoints);
                    previousPoints = currentPoints;
                    return line(interpolatedPoints(t));
                };
            });

        // Add dot points to each data point
        svg.selectAll(".dot" + year)
            .data(yearData)
            .enter()
            .append("circle")
            .attr("class", "dot dot" + year)
            .attr("cx", function (d) { return xScale(d.month) + xScale.bandwidth() / 2; })
            .attr("cy", function (d) { return yScale(d.amount); })
            .attr("r", 4)
            .attr("fill", function () {
                if (year === '2020') return 'steelblue';
                if (year === '2021') return 'green';
                return 'red';
            })
            .style("opacity", 0) // Initially set opacity to 0
            .transition() // Apply transition
            .duration(3000) // Duration of transition
            .style("opacity", 1); // Fade in

        // Add text labels to each data point and show them on hover
        var labels = svg.selectAll(".lineLabel" + year)
            .data(yearData)
            .enter()
            .append("text")
            .attr("class", "lineLabel lineLabel" + year)
            .attr("x", function (d) { return xScale(d.month) + xScale.bandwidth() / 2; })
            .attr("y", function (d) { return yScale(d.amount) - 10; }) // Position above the data point
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text(function (d) { return d.amount; })
            .style("opacity", 0); // Initially set opacity to 0

        // Add invisible circles for larger hitbox
        svg.selectAll(".hitbox" + year)
            .data(yearData)
            .enter()
            .append("circle")
            .attr("class", "hitbox hitbox" + year)
            .attr("cx", function (d) { return xScale(d.month) + xScale.bandwidth() / 2; })
            .attr("cy", function (d) { return yScale(d.amount); })
            .attr("r", 15) // Larger radius for hitbox
            .attr("fill", "transparent") // Invisible hitbox
            .on("mouseover", function(event, d) {
                d3.selectAll(".lineLabel" + year)
                    .filter(label => label === d)
                    .style("opacity", 1); // Show label on hover
            })
            .on("mouseout", function(event, d) {
                d3.selectAll(".lineLabel" + year)
                    .filter(label => label === d)
                    .style("opacity", 0); // Hide label on mouse out
            });
    });

    // Define the legend data
    var legendData = [
        { year: "2020", color: "steelblue" },
        { year: "2021", color: "green" },
        { year: "2022", color: "red" }
    ];

    // Create legend
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width - 100) + ", 20)");

    // Add rectangles and text to legend
    legend.selectAll("rect")
        .data(legendData)
        .enter().append("rect")
        .attr("x", 0)
        .attr("y", function (d, i) { return i * 20; })
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function (d) { return d.color; });

    legend.selectAll("text")
        .data(legendData)
        .enter().append("text")
        .attr("x", 15)
        .attr("y", function (d, i) { return i * 20 + 9; })
        .attr("dy", ".35em")
        .text(function (d) { return d.year; });

    // Add x-axis label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 30)
        .text("Months");

    // Add y-axis label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("x", (-height / 2) + 60)
        .attr("y", -margin.left + 11)
        .text("Covid Cases");
}

// Load the CSV file and initialize chart
d3.csv('Data/Covid/CovidAllYears.csv').then(function (data) {
    // Convert 'amount' to a number
    data.forEach(function (d) {
        d.amount = +d.amount;
    });

    // Initialize chart with all years shown
    updateChart(data);

    // Set up button click handlers
    d3.select("#year2020").on("click", function () {
        toggleVisibility('2020');
    });

    d3.select("#year2021").on("click", function () {
        toggleVisibility('2021');
    });

    d3.select("#year2022").on("click", function () {
        toggleVisibility('2022');
    });
});

// Function to download CSV file
function downloadCSV() {
    var csvFilePath = "Data/Covid/CovidCases.csv";
    var link = document.createElement("a");
    link.href = csvFilePath;
    link.download = "CovidCases.csv";
    link.click();
}

// Function to download XLSX file
function downloadXLSX() {
    var xlsxFilePath = "Data/Covid/CovidCases.xlsx";
    var link = document.createElement("a");
    link.href = xlsxFilePath;
    link.download = "CovidCases.xlsx";
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

function toggleVisibility(year) {
    var isVisible = d3.selectAll(".line" + year).style("display") !== "none";

    // Toggle visibility of lines, dots, and labels
    d3.selectAll(".line" + year).style("display", isVisible ? "none" : "inline");
    d3.selectAll(".dot" + year).style("display", isVisible ? "none" : "inline");
    d3.selectAll(".hitbox" + year).style("display", isVisible ? "none" : "inline");
    d3.selectAll(".lineLabel" + year).style("display", isVisible ? "none" : "inline");

    // Toggle button color
    d3.select("#year" + year)
        .style("background-color", isVisible ? "grey" : "#4CAF50")
        .style("color", "white")
        .classed("active", !isVisible);
}
