// Define the graph of Belagavi's famous places including the two new locations
const places = [
    "Belagavi Fort",          // 0
    "Gokak Falls",            // 1
    "Belgaum Military Museum", // 2
    "Kamal Basti",            // 3
    "Kittur Fort",            // 4
    "Belgaum Golf Course",    // 5
    "Rakaskop Dam",           // 6
    "Halasi Ruins",           // 7
    "Bhimgad Wildlife Sanctuary", // 8
    "Yellur Fort",            // 9
    "Railway Station",        // 10 (new)
    "Central Bus Stand"       // 11 (new)
];

// Adjacency matrix - distances in kilometers (approximate)
// 0 means no direct connection
const graph = [
    // 0   1   2   3   4   5   6   7   8   9  10  11
    [  0, 60,  5,  8, 35, 10, 25, 40, 45, 15,  7,  4], // 0: Belagavi Fort
    [ 60,  0, 55, 65, 95, 70, 85,100,105, 75, 55, 58], // 1: Gokak Falls
    [  5, 55,  0, 12, 40,  8, 20, 45, 50, 20,  3,  2], // 2: Military Museum
    [  8, 65, 12,  0, 30, 18, 30, 35, 40, 23, 12, 10], // 3: Kamal Basti
    [ 35, 95, 40, 30,  0, 45, 60, 25, 30, 50, 40, 38], // 4: Kittur Fort
    [ 10, 70,  8, 18, 45,  0, 15, 50, 55, 25,  6,  8], // 5: Golf Course
    [ 25, 85, 20, 30, 60, 15,  0, 65, 70, 40, 20, 22], // 6: Rakaskop Dam
    [ 40,100, 45, 35, 25, 50, 65,  0, 15, 55, 45, 42], // 7: Halasi Ruins
    [ 45,105, 50, 40, 30, 55, 70, 15,  0, 60, 50, 48], // 8: Bhimgad Sanctuary
    [ 15, 75, 20, 23, 50, 25, 40, 55, 60,  0, 18, 15], // 9: Yellur Fort
    [  7, 55,  3, 12, 40,  6, 20, 45, 50, 18,  0,  2], // 10: Railway Station (new)
    [  4, 58,  2, 10, 38,  8, 22, 42, 48, 15,  2,  0]  // 11: Central Bus Stand (new)
];

// Canvas setup
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.parentElement.clientWidth;
canvas.height = canvas.parentElement.clientHeight;

// Node positions (x, y coordinates) - Better spread for visibility
const nodePositions = [
    { x: 330, y: 140 },  // 0: Belagavi Fort
    { x: 680, y: 80 },   // 1: Gokak Falls
    { x: 190, y: 260 },  // 2: Military Museum
    { x: 370, y: 350 },  // 3: Kamal Basti
    { x: 800, y: 270 },  // 4: Kittur Fort
    { x: 310, y: 210 },  // 5: Golf Course
    { x: 520, y: 120 },  // 6: Rakaskop Dam
    { x: 880, y: 180 },  // 7: Halasi Ruins
    { x: 800, y: 400 },  // 8: Bhimgad Sanctuary
    { x: 550, y: 450 },  // 9: Yellur Fort
    { x: 250, y: 320 },  // 10: Railway Station (new)
    { x: 430, y: 250 }   // 11: Central Bus Stand (new)
];

// Node status colors - more vibrant colors
const colors = {
    unvisited: '#34495e',
    current: '#3498db',
    visited: '#2ecc71',
    path: '#e74c3c'
};

// Node icons - simple icons for each location type
const nodeIcons = {
    0: "🏰", // Fort
    1: "💦", // Falls
    2: "🏛️", // Museum
    3: "🕌", // Basti
    4: "🏰", // Fort
    5: "⛳", // Golf
    6: "🌊", // Dam
    7: "🏚️", // Ruins
    8: "🌳", // Wildlife
    9: "🏰", // Fort
    10: "🚂", // Railway
    11: "🚌" // Bus
};

// Pre-calculate road paths that will remain fixed
const roadPaths = [];
const roadJunctions = {};

// Generate junction points for road networks
function generateRoadNetwork() {
    // Create junctions at strategic points on the map
    roadJunctions["0-2"] = { x: 260, y: 200 }; // Junction between Fort and Museum
    roadJunctions["2-11"] = { x: 300, y: 250 }; // Junction between Museum and Bus Stand
    roadJunctions["11-3"] = { x: 400, y: 300 }; // Junction between Bus Stand and Kamal Basti
    roadJunctions["11-10"] = { x: 340, y: 280 }; // Junction between Bus Stand and Railway
    roadJunctions["10-2"] = { x: 220, y: 290 }; // Junction between Railway and Museum
    roadJunctions["0-5"] = { x: 320, y: 175 }; // Junction between Fort and Golf Course
    roadJunctions["5-6"] = { x: 415, y: 165 }; // Junction between Golf Course and Dam
    roadJunctions["6-1"] = { x: 600, y: 100 }; // Junction between Dam and Falls
    roadJunctions["0-11"] = { x: 380, y: 195 }; // Junction between Fort and Bus Stand
    roadJunctions["3-9"] = { x: 460, y: 400 }; // Junction between Kamal Basti and Yellur Fort
    roadJunctions["9-4"] = { x: 675, y: 360 }; // Junction between Yellur Fort and Kittur Fort
    roadJunctions["4-7"] = { x: 840, y: 225 }; // Junction between Kittur Fort and Halasi Ruins
    roadJunctions["7-8"] = { x: 840, y: 290 }; // Junction between Halasi Ruins and Bhimgad
    
    // Create additional junctions to make network more realistic
    roadJunctions["0-6"] = { x: 425, y: 130 }; // Junction between Fort and Dam
    roadJunctions["5-11"] = { x: 370, y: 230 }; // Junction between Golf Course and Bus Stand
    roadJunctions["10-3"] = { x: 310, y: 335 }; // Junction between Railway and Kamal Basti
    
    // Generate fixed road paths through junctions
    for (let i = 0; i < places.length; i++) {
        for (let j = i + 1; j < places.length; j++) {
            if (graph[i][j] > 0) {
                // Find if a junction exists between these two locations
                const junctionKey1 = `${i}-${j}`;
                const junctionKey2 = `${j}-${i}`;
                
                const path = {
                    from: i,
                    to: j,
                    distance: graph[i][j],
                    points: []
                };
                
                // Starting point
                path.points.push({ 
                    x: nodePositions[i].x, 
                    y: nodePositions[i].y 
                });
                
                // Add junction points if they exist
                if (roadJunctions[junctionKey1]) {
                    path.points.push(roadJunctions[junctionKey1]);
                } else if (roadJunctions[junctionKey2]) {
                    path.points.push(roadJunctions[junctionKey2]);
                } else {
                    // If no direct junction, create a midpoint with offset for a more natural look
                    const midX = (nodePositions[i].x + nodePositions[j].x) / 2;
                    const midY = (nodePositions[i].y + nodePositions[j].y) / 2;
                    
                    // Create a natural curve by offsetting the midpoint
                    const dx = nodePositions[j].x - nodePositions[i].x;
                    const dy = nodePositions[j].y - nodePositions[i].y;
                    const angle = Math.atan2(dy, dx) + Math.PI/2;
                    
                    // Offset distance based on the length of the path
                    const len = Math.sqrt(dx*dx + dy*dy);
                    const offset = len * 0.2;
                    
                    // Calculated offset point for curve
                    const offsetX = midX + Math.cos(angle) * offset;
                    const offsetY = midY + Math.sin(angle) * offset;
                    
                    path.points.push({ x: offsetX, y: offsetY });
                }
                
                // Ending point
                path.points.push({ 
                    x: nodePositions[j].x, 
                    y: nodePositions[j].y 
                });
                
                roadPaths.push(path);
            }
        }
    }
}

// Node status
let nodeStatus = new Array(places.length).fill('unvisited');
let currentNode = null; // Track current node for highlighting

// Dijkstra's algorithm variables
let distances = [];
let previous = [];
let unvisited = [];
let path = [];
let steps = [];
let animationIndex = 0;

// Function to draw a bezier curve between points
function drawCurvedPath(points, isHighlighted = false) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    if (points.length === 2) {
        // Simple line if only two points
        ctx.lineTo(points[1].x, points[1].y);
    } else if (points.length === 3) {
        // Quadratic curve if three points
        ctx.quadraticCurveTo(points[1].x, points[1].y, points[2].x, points[2].y);
    } else {
        // For more complex paths, use a series of bezier curves
        for (let i = 1; i < points.length - 2; i++) {
            const xc = (points[i].x + points[i+1].x) / 2;
            const yc = (points[i].y + points[i+1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        
        // Connect the last two points
        ctx.quadraticCurveTo(
            points[points.length-2].x, 
            points[points.length-2].y, 
            points[points.length-1].x, 
            points[points.length-1].y
        );
    }
    
    ctx.stroke();
    
    // Find the midpoint of the path for distance label
    const midIndex = Math.floor(points.length / 2);
    let labelX, labelY;
    
    if (points.length % 2 === 0) {
        // Even number of points
        labelX = (points[midIndex-1].x + points[midIndex].x) / 2;
        labelY = (points[midIndex-1].y + points[midIndex].y) / 2;
    } else {
        // Odd number of points
        labelX = points[midIndex].x;
        labelY = points[midIndex].y;
    }
    
    return { x: labelX, y: labelY };
}

// Draw the graph
function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw edges (roads)
    for (const road of roadPaths) {
        // Check if this road is part of the shortest path
        const isOnPath = path.includes(road.from) && path.includes(road.to) && 
            ((path.indexOf(road.from) === path.indexOf(road.to) - 1) || 
             (path.indexOf(road.to) === path.indexOf(road.from) - 1));
        
        if (isOnPath) {
            // Highlighted path (best route)
            ctx.strokeStyle = colors.path;
            ctx.lineWidth = 6;
            ctx.setLineDash([]);
        } else {
            // Normal road
            ctx.strokeStyle = '#aaa';
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
        }
        
        // Draw the road
        const labelPos = drawCurvedPath(road.points, isOnPath);
        
        // Draw distance label with better background
        ctx.fillStyle = 'white';
        ctx.beginPath();
        const distText = road.distance + 'km';
        const textWidth = ctx.measureText(distText).width + 10;
        ctx.rect(labelPos.x - textWidth/2, labelPos.y - 10, textWidth, 20);
        ctx.fill();
        
        ctx.fillStyle = isOnPath ? '#e74c3c' : '#555';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(distText, labelPos.x, labelPos.y);
    }
    
    // Reset line dash
    ctx.setLineDash([]);
    
    // Draw nodes with shadows for 3D effect
    for (let i = 0; i < places.length; i++) {
        // Determine node status color
        let nodeColor = colors[nodeStatus[i]];
        
        // If this is current node in the algorithm, use the current color
        if (i === currentNode) {
            nodeColor = colors.current;
        }
        
        // Draw shadow
        ctx.beginPath();
        ctx.arc(nodePositions[i].x + 2, nodePositions[i].y + 3, 25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fill();
        
        // Draw node
        ctx.beginPath();
        ctx.arc(nodePositions[i].x, nodePositions[i].y, 25, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
        
        // Add a border
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'white';
        ctx.stroke();
        
        // Display node index and icon
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw the icon and node number
        ctx.fillText(i, nodePositions[i].x, nodePositions[i].y - 8);
        ctx.font = '16px Arial';
        ctx.fillText(nodeIcons[i], nodePositions[i].x, nodePositions[i].y + 10);
        
        // Place name with a background for better readability
        const placeName = places[i];
        const textWidth = ctx.measureText(placeName).width;
        
        // Text background
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillRect(
            nodePositions[i].x - textWidth / 2 - 5,
            nodePositions[i].y + 35 - 5,
            textWidth + 10,
            20
        );
        
        // Place name text
        ctx.fillStyle = '#333';
        ctx.font = '13px Arial';
        ctx.fillText(placeName, nodePositions[i].x, nodePositions[i].y + 35);
        
        // Distance (if calculated)
        if (distances[i] !== Infinity && distances.length > 0) {
            // Distance background
            const distText = distances[i] + 'km';
            const distWidth = ctx.measureText(distText).width;
            
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.fillRect(
                nodePositions[i].x - distWidth / 2 - 5,
                nodePositions[i].y - 45 - 5,
                distWidth + 10,
                20
            );
            
            // Distance text
            ctx.fillStyle = '#e74c3c';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(distText, nodePositions[i].x, nodePositions[i].y - 45);
        }
    }
}

// Run Dijkstra's algorithm
function dijkstra(startNode, endNode) {
    steps = [];
    distances = new Array(places.length).fill(Infinity);
    previous = new Array(places.length).fill(null);
    unvisited = [...Array(places.length).keys()];
    nodeStatus = new Array(places.length).fill('unvisited');
    currentNode = startNode;
    
    distances[startNode] = 0;
    steps.push(`Starting at ${places[startNode]}`);
    
    while (unvisited.length > 0) {
        // Find the unvisited node with the smallest distance
        let minDistNode = unvisited.reduce((minNode, node) => 
            distances[node] < distances[minNode] ? node : minNode, unvisited[0]);
        
        // If we've reached the end node or if the minimum distance is infinity (unreachable)
        if (minDistNode === endNode || distances[minDistNode] === Infinity) {
            break;
        }
        
        // Remove the node from unvisited set
        unvisited.splice(unvisited.indexOf(minDistNode), 1);
        nodeStatus[minDistNode] = 'visited';
        
        // Update current node for UI highlighting
        currentNode = minDistNode;
        
        // For all adjacent nodes, update distances
        for (let neighbor = 0; neighbor < places.length; neighbor++) {
            // Skip if there's no direct connection
            if (graph[minDistNode][neighbor] === 0) {
                continue;
            }
            
            // Check if we can get to this neighbor through current node with a shorter path
            const newDist = distances[minDistNode] + graph[minDistNode][neighbor];
            
            if (newDist < distances[neighbor]) {
                distances[neighbor] = newDist;
                previous[neighbor] = minDistNode;
                steps.push(`Found a shorter path to ${places[neighbor]} via ${places[minDistNode]}: ${newDist}km`);
            }
        }
    }
    
    // Reconstruct the path from the end node to the start node
    path = [];
    let current = endNode;
    
    // If there is no path
    if (previous[endNode] === null && endNode !== startNode) {
        steps.push(`No path found from ${places[startNode]} to ${places[endNode]}`);
        return;
    }
    
    // Build the path from end to start, then reverse
    while (current !== null) {
        path.push(current);
        current = previous[current];
    }
    
    path.reverse();
    
    if (path.length > 0) {
        // Mark all nodes in the path
        for (let i = 0; i < path.length; i++) {
            nodeStatus[path[i]] = 'path';
        }
        
        // Create a nice path description
        let routeDescription = `Best route: ${places[path[0]]}`;
        for (let i = 1; i < path.length; i++) {
            routeDescription += ` → ${places[path[i]]}`;
        }
        
        steps.push(routeDescription);
        steps.push(`Total distance: ${distances[endNode]}km`);
        
        // Update the total distance display
        document.getElementById('total-distance').innerText = distances[endNode];
    }
}

// Perform one step of Dijkstra's algorithm for animation
function dijkstraStep(startNode, endNode) {
    // Initialize if this is the first step
    if (animationIndex === 0) {
        distances = new Array(places.length).fill(Infinity);
        previous = new Array(places.length).fill(null);
        unvisited = [...Array(places.length).keys()];
        nodeStatus = new Array(places.length).fill('unvisited');
        path = [];
        steps = [];
        distances[startNode] = 0;
        currentNode = startNode;
        steps.push(`Starting at ${places[startNode]}`);
        updateStepsDisplay();
        return true; // Step completed
    }
    
    // If unvisited is empty or we've reached the end, finish
    if (unvisited.length === 0) {
        return false; // No more steps
    }
    
    // Find the node with the minimum distance
    let minDistNode = unvisited.reduce((minNode, node) => 
        distances[node] < distances[minNode] ? node : minNode, unvisited[0]);
    
    // If we've reached the end node or the minimum distance is infinity
    if (minDistNode === endNode || distances[minDistNode] === Infinity) {
        // Reconstruct path
        reconstructPath(startNode, endNode);
        return false; // Algorithm complete
    }
    
    // Remove node from unvisited and mark as visited
    unvisited.splice(unvisited.indexOf(minDistNode), 1);
    nodeStatus[minDistNode] = 'visited';
    
    // Update current node for UI
    currentNode = minDistNode;
    steps.push(`Visiting ${places[minDistNode]} (distance: ${distances[minDistNode]}km)`);
    
    // Update neighbors
    let neighborsUpdated = false;
    for (let neighbor = 0; neighbor < places.length; neighbor++) {
        // Skip if no direct connection
        if (graph[minDistNode][neighbor] === 0) {
            continue;
        }
        
        const newDist = distances[minDistNode] + graph[minDistNode][neighbor];
        
        if (newDist < distances[neighbor]) {
            distances[neighbor] = newDist;
            previous[neighbor] = minDistNode;
            steps.push(`Updated ${places[neighbor]}: ${newDist}km via ${places[minDistNode]}`);
            neighborsUpdated = true;
        }
    }
    
    if (!neighborsUpdated) {
        steps.push(`No updates from ${places[minDistNode]}`);
    }
    
    updateStepsDisplay();
    return true; // Step completed
}

// Reconstruct path for step animation
function reconstructPath(startNode, endNode) {
    path = [];
    let current = endNode;
    
    // If no path exists
    if (previous[endNode] === null && endNode !== startNode) {
        steps.push(`No path found from ${places[startNode]} to ${places[endNode]}`);
        updateStepsDisplay();
        return;
    }
    
    // Build path from end to start
    while (current !== null) {
        path.push(current);
        current = previous[current];
    }
    
    path.reverse();
    
    // Mark path nodes
    for (let i = 0; i < path.length; i++) {
        nodeStatus[path[i]] = 'path';
    }
    
    // Create route description
    let routeDescription = `Best route: ${places[path[0]]}`;
    for (let i = 1; i < path.length; i++) {
        routeDescription += ` → ${places[path[i]]}`;
    }
    
    steps.push(routeDescription);
    steps.push(`Total distance: ${distances[endNode]}km`);
    
    // Update the total distance display
    document.getElementById('total-distance').innerText = distances[endNode];
    updateStepsDisplay();
}

// Update the steps display
function updateStepsDisplay() {
    const stepsDiv = document.getElementById('steps');
    stepsDiv.innerHTML = '';
    
    // Add each step as a paragraph
    steps.forEach((step, index) => {
        const p = document.createElement('p');
        p.textContent = `${index + 1}. ${step}`;
        stepsDiv.appendChild(p);
    });
    
    // Scroll to bottom to show latest steps
    stepsDiv.scrollTop = stepsDiv.scrollHeight;
}

// Initialize the visualization
function init() {
    // Generate the road network
    generateRoadNetwork();
    
    // Initial draw
    drawGraph();
    
    // Set up event handlers
    document.getElementById('find-path').addEventListener('click', () => {
        const startNode = parseInt(document.getElementById('start-node').value);
        const endNode = parseInt(document.getElementById('end-node').value);
        
        // Reset animation index
        animationIndex = 0;
        
        // Run Dijkstra's algorithm
        dijkstra(startNode, endNode);
        
        // Update the display
        drawGraph();
        updateStepsDisplay();
    });
    
    document.getElementById('reset').addEventListener('click', () => {
        // Reset all variables
        nodeStatus = new Array(places.length).fill('unvisited');
        distances = [];
        previous = [];
        unvisited = [];
        path = [];
        steps = [];
        currentNode = null;
        animationIndex = 0;
        
        // Clear steps display
        document.getElementById('steps').innerHTML = '';
        document.getElementById('total-distance').innerText = '0';
        
        // Redraw the graph
        drawGraph();
    });
    
    document.getElementById('step').addEventListener('click', () => {
        const startNode = parseInt(document.getElementById('start-node').value);
        const endNode = parseInt(document.getElementById('end-node').value);
        
        // Perform one step of the algorithm
        const hasMoreSteps = dijkstraStep(startNode, endNode);
        animationIndex++;
        
        // Update the display
        drawGraph();
        
        // Disable the step button if no more steps
        if (!hasMoreSteps) {
            document.getElementById('step').disabled = true;
        }
    });
    
    document.getElementById('animate').addEventListener('click', () => {
        const startNode = parseInt(document.getElementById('start-node').value);
        const endNode = parseInt(document.getElementById('end-node').value);
        
        // Reset for animation
        animationIndex = 0;
        nodeStatus = new Array(places.length).fill('unvisited');
        distances = new Array(places.length).fill(Infinity);
        previous = new Array(places.length).fill(null);
        unvisited = [...Array(places.length).keys()];
        path = [];
        steps = [];
        document.getElementById('steps').innerHTML = '';
        document.getElementById('total-distance').innerText = '0';
        
        // Disable buttons during animation
        document.getElementById('find-path').disabled = true;
        document.getElementById('reset').disabled = true;
        document.getElementById('step').disabled = true;
        document.getElementById('animate').disabled = true;
        
        // Start the animation
        let hasMoreSteps = true;
        
        function animateStep() {
            if (hasMoreSteps) {
                hasMoreSteps = dijkstraStep(startNode, endNode);
                animationIndex++;
                drawGraph();
                
                // Continue animation with delay
                if (hasMoreSteps) {
                    setTimeout(animateStep, 1000); // 1 second delay between steps
                } else {
                    // Re-enable buttons after animation
                    document.getElementById('find-path').disabled = false;
                    document.getElementById('reset').disabled = false;
                    document.getElementById('step').disabled = false;
                    document.getElementById('animate').disabled = false;
                }
            }
        }
        
        // Begin animation
        setTimeout(animateStep, 500); // Start after a short delay
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        drawGraph();
    });
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', init);