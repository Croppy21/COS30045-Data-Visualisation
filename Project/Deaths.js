// Define the dimensions of the SVG canvas
var w = 980;
var h = 500;
var margin = { top: 20, right: 30, bottom: 70, left: 50 };
var radius = Math.min(w, h) / 2 - margin.top;

// Select SVG and set dimensions
var svg = d3.select("svg")
    .attr("width", w)
    .attr("height", h)
    .append("g")
    .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

var color = d3.scaleOrdinal([
    "#003057", // Deep Navy Blue (dark, prominent)
    "#007bff", // Royal Blue (more prominent)
    "#17a2b8", // Sky Blue (lighter, even more prominent)
    "#43a047", // Forest Green (shifts hue, remains prominent)
    "#8bc34a", // Lime Green (lighter, more prominent)
    "#c0e853", // Light Yellow Green (light, prominent)
    "#ffc107", // Golden Yellow (lightest, most prominent)
    "#ff9933", // Light Orange (slightly less prominent)
    "#fd7e14", // Tangerine Orange (more prominent)
    "#ff0000", // Fire Engine Red (lighter, prominent again)
    "#dc3545", // Red (slightly less prominent)
    "#a020f0"  // Deep Purple (lightest, prominent, contrasting with red)
]);

// Define the pie generator
var pie = d3.pie()
    .value(d => d.value)
    .sort(null);

// Define the arc generator
var arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

// Function to update chart
function updateChart(csvFile) {
    d3.csv(csvFile).then(function (data) {
        // Convert value to a number and strip the '%' sign
        data.forEach(function (d) {
            d.value = +d.Percent.replace('%', '');
        });

        // Bind data to the arcs
        var arcs = svg.selectAll(".arc")
            .data(pie(data));

        // Enter selection for arcs
        var arcEnter = arcs.enter().append("g")
            .attr("class", "arc");

        arcEnter.append("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data["Cause of Death"]))
            .each(function(d) { this._current = d; }) // store the initial angles
            .on("mouseover", function (event, d) {
                d3.select(this).transition().duration(200).attr("d", d3.arc().innerRadius(0).outerRadius(radius + 10));
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(d.data["Cause of Death"] + "<br/>" + d.data.Percent)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                d3.select(this).transition().duration(200).attr("d", arc);
                tooltip.transition().duration(500).style("opacity", 0);
            });

        // Update selection for arcs
        arcs.select("path")
            .transition().duration(1000)
            .attrTween("d", arcTween); // smooth transition

        // Exit selection for arcs
        arcs.exit().remove();

        // Define the legend data
        var legendData = data.map(d => ({ label: d["Cause of Death"], color: color(d["Cause of Death"]) }));

        // Remove old legend
        svg.selectAll(".legend").remove();

        // Create legend
        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + (-w / 2 + 10) + "," + (-h / 2 + 10) + ")");

        // Add rectangles and text to legend
        legend.selectAll("rect")
            .data(legendData)
            .enter().append("rect")
            .attr("x", 750)
            .attr("y", function (d, i) { return i * 20; })
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function (d) { return d.color; });

        legend.selectAll("text")
            .data(legendData)
            .enter().append("text")
            .attr("x", 765)
            .attr("y", function (d, i) { return i * 20 + 5; })
            .attr("dy", ".35em")
            .text(function (d) { return d.label; });

    }).catch(function (error) {
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
// Function to download CSV file
function downloadCSV() {
    var csvFilePath = "Data/Death/EstablishedDeaths.csv";
    var link = document.createElement("a");
    link.href = csvFilePath;
    link.download = "EstablishedDeaths.csv";
    link.click();
}

// Function to download XLSX file
function downloadXLSX() {
    var xlsxFilePath = "Data/Death/EstablishedDeaths.xlsx";
    var link = document.createElement("a");
    link.href = xlsxFilePath;
    link.download = "EstablishedDeaths.xlsx";
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
setActiveButton('year2021', 'Data/Death/Deaths2021.csv');

// Call updateChart function for initial load
updateChart('Data/Death/Deaths2021.csv');

// Set up button click handlers
d3.select("#year2021").on("click", function () {
    setActiveButton('year2021', 'Data/Death/Deaths2021.csv');
});

d3.select("#year2022").on("click", function () {
    setActiveButton('year2022', 'Data/Death/Deaths2022.csv');
});

// Define the tooltip
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Function for smooth transition between arcs
function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
        return arc(i(t));
    };
}
