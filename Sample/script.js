document.addEventListener("DOMContentLoaded", function () {
    // Initialize current slide index
    let currentSlide = 0;

    // Show the current slide
    function showSlide(index) {
        const slides = document.querySelectorAll(".carousel-item");
        slides.forEach((slide, i) => {
            if (i === index) {
                slide.style.display = "block";
            } else {
                slide.style.display = "none";
            }
        });
    }

        // Call the function to create bar chart visual inside each carousel container
        createBarChartVisual("#visual1", [25, 4, 27, 8, 11, 30, 15, 20, 13, 1, 6, 19]);
        createBarChartVisual("#visual2", [30, 20, 10, 40, 50]); // Example data for visual 2
        createBarChartVisual("#visual3", [20, 40, 50, 30, 10]); // Example data for visual 3
    // Function to create bar chart visual inside a container
    function createBarChartVisual(containerId, dataset) {
        var w = 500;
        var h = 150;

        // Define padding between bars
        var padding = 1;

        // Create x scale
        var xScale = d3.scaleBand()
            .domain(d3.range(dataset.length))
            .rangeRound([0, w])
            .paddingInner(0.05);

        // Create y scale
        var yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset)])
            .range([0, h]);

        // Create SVG
        var svg = d3.select(containerId)
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        // Create rectangles for each data point
        var bars = svg.selectAll("rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("x", function (d, i) {
                return xScale(i); // Set the x-coordinate of each bar
            })
            .attr("y", function (d) {
                return h - yScale(d); // Remove the subtraction
            })
            .attr("width", xScale.bandwidth() - padding) // Set the width of each bar
            .attr("height", yScale) // Use the scale directly
            .style("fill", "gray")
            // Mouseover event handler
            .on("mouseover", function (d, i) {
                d3.select(this)
                    .style("fill", "orange"); // Change fill color to orange

                // Append text value on hover
                svg.append("text")
                    .attr("class", "tooltip")
                    .attr("x", xScale(i) + xScale.bandwidth() / 2)
                    .attr("y", h - yScale(d) - 5) // Adjust the y position for better placement
                    .attr("text-anchor", "middle")
                    .attr("font-size", "12px")
                    .attr("fill", "black")
                    .text(d);
            })
            .on("mouseout", function () {
                d3.select(this)
                    .style("fill", "gray"); // Change fill color back to gray

                // Remove text value on mouseout
                svg.select(".tooltip").remove();
            });
    }

    // Show initial slide
    showSlide(currentSlide);

    // Button event listeners
    document.getElementById("prevBtn").addEventListener("click", function () {
        currentSlide = (currentSlide - 1 + 3) % 3; // 3 is the number of slides
        showSlide(currentSlide);
    });

    document.getElementById("nextBtn").addEventListener("click", function () {
        currentSlide = (currentSlide + 1) % 3; // 3 is the number of slides
        showSlide(currentSlide);
    });
});
