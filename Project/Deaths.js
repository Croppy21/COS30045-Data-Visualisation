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

// Define the color scale
var color = d3.scaleOrdinal(d3.schemeSet3);

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
    d3.csv(csvFile).then(function(data) {
        // Convert value to a number and strip the '%' sign
        data.forEach(function(d) {
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
            .on("mouseover", function(event, d) {
                d3.select(this).transition().duration(200).attr("d", d3.arc().innerRadius(0).outerRadius(radius + 10));
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(d.data["Cause of Death"] + "<br/>" + d.data.Percent)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                d3.select(this).transition().duration(200).attr("d", arc);
                tooltip.transition().duration(500).style("opacity", 0);
            });


        // Update selection for arcs
        arcs.select("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data["Cause of Death"]));

        arcs.select("text")
            .attr("transform", d => "translate(" + arc.centroid(d) + ")")
            .text(d => d.data["Cause of Death"]);

        // Remove exit selection for arcs
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
            .attr("x", 800)
            .attr("y", function(d, i) { return i * 20; })
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function(d) { return d.color; });

        legend.selectAll("text")
            .data(legendData)
            .enter().append("text")
            .attr("x", 815)
            .attr("y", function(d, i) { return i * 20 + 5; })
            .attr("dy", ".35em")
            .text(function(d) { return d.label; });
    }).catch(function(error) {
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
setActiveButton('year2021', 'Data/Death/Deaths2021.csv');

// Call updateChart function for initial load
updateChart('Data/Deaths2021.csv');

// Set up button click handlers
d3.select("#year2021").on("click", function() {
    setActiveButton('year2021', 'Data/Death/Deaths2021.csv');
});

d3.select("#year2022").on("click", function() {
    setActiveButton('year2022', 'Data/Death/Deaths2022.csv');
});

// Define the tooltip
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
