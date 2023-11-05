document.addEventListener('DOMContentLoaded', () => {
    // Get references to important HTML elements
    const nav = document.getElementById('nav');       // Navigation bar
    const main = document.getElementById('main');     // Main content
    const details = document.getElementById('details'); // Details
    const apiUrl = 'https://swapi.dev/api/';          // API URL
    const categories = [];                            // Stores available categories
    let currentCategoryIndex = 0;                     // Current category index
    let currentPage = 1;                               // Current page number
    const resultsPerPage = 10;                        // Number of results per page

    // Asynchronous function to get the name of the resource
    async function getResourceName(url) {
        try {
            // Make a request to the resource URL
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to get a valid response');
            }
            // Get data from the resource
            const data = await response.json();
            // Return the name if available, otherwise use the title or URL
            return data.name || data.title || url;
        } catch (error) {
            console.error('Error loading details:', error);
            return url; // In case of an error, display the URL
        }
    }

    // Function to create a link to a resource with the text "View details"
    function createResourceLink(url) {
        const linkItem = document.createElement('li');      // List item element
        const resourceLink = document.createElement('a');    // Link element
        resourceLink.href = url;                            // Link URL
        resourceLink.textContent = 'View details';            // Link text
        resourceLink.addEventListener('click', event => {
            event.preventDefault();                         // Prevent the default link action
            fetchResourceDetails(url);                    // Load resource details
        });
        linkItem.appendChild(resourceLink);                 // Add the link to the list item element
        return linkItem;                                   // Return the list item element with the link
    }

    // Function to display details of an item
    function showDetails(item) {
        details.innerHTML = '';                             // Clear previous details content
        const detailsList = document.createElement('ul');   // Unordered list for details

        for (const key in item) {
            const listItem = document.createElement('li');   // List item for each property
            if (Array.isArray(item[key])) {
                listItem.textContent = `${key}: `;
                const linkList = document.createElement('ul'); // List of links
                // Iterate through resource links and add links to details
                item[key].forEach(async link => {
                    const resourceName = await getResourceName(link);  // Get the resource name
                    const linkItem = createResourceLink(link);        // Create a link to the resource
                    linkItem.firstChild.textContent = resourceName;     // Set the name in the link
                    linkList.appendChild(linkItem);                   // Add the link to the list
                });
                listItem.appendChild(linkList);                       // Add the list of links to the list item
            } else {
                listItem.textContent = `${key}: ${item[key]}`;        // Display the property and its value
            }
            detailsList.appendChild(listItem);                        // Add the list item to the details list
        }

        details.appendChild(detailsList);             // Add the details list to the details section
        details.style.display = 'block';               // Show the details section
    }

    // Function to load details of a specific resource
    function fetchResourceDetails(url) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                showDetails(data);                    // Show details of the resource
            })
            .catch(error => {
                console.error('Error loading details:', error);
            });
    }

    // Asynchronous function to load and display data for a specific category and page
    async function fetchData(category, page) {
        details.style.display = 'none';                    // Hide the details section when loading a new category
        main.innerHTML = 'Loading...';                   // Display a loading message in the main content
        const offset = (page - 1) * resultsPerPage;        // Calculate the offset

        try {
            // Make a request to the API to get data for the category and page
            const response = await fetch(`${apiUrl}${category}/?page=${page}&limit=${resultsPerPage}&offset=${offset}`);
            if (!response.ok) {
                throw new Error('Unable to obtain a valid response');
            }
            // Get the data from the response
            const data = await response.json();
            const results = data.results;

            if (results && results.length > 0) {
                const list = document.createElement('ul');    // List of elements
                results.forEach(item => {
                    const listItem = document.createElement('li');       // List item for each result
                    listItem.textContent = item.name || item.title;     // Name or title of the result
                    listItem.addEventListener('click', () => {
                        showDetails(item);                            // Show details when clicked
                    });
                    list.appendChild(listItem);                       // Add the list item to the list
                });
                main.innerHTML = '';                                   // Clear the loading message
                main.appendChild(list);                               // Add the list of elements to the main content
            } else {
                main.innerHTML = 'No results found.';     // Message if no results are found
            }
        } catch (error) {
            console.error('Error:', error);
            main.innerHTML = 'An error occurred while loading the data.'; // Error message
        }
    }

    // Asynchronous function to create the navigation bar
    async function buildNav(categories) {
        for (const [index, category] of categories.entries()) {
            const link = document.createElement('a');                 // Navigation link
            link.href = `#${category}`;                              // Link with the category identifier
            link.textContent = category;                              // Text of the link
            link.addEventListener('click', event => {
                event.preventDefault();                               // Prevent the default action of the link
                currentCategoryIndex = index;                        // Update the current category index
                currentPage = 1;                                      // Reset the current page to 1
                fetchData(category, currentPage);                      // Load the data for the category and page
            });
            nav.appendChild(link);                                    // Add the link to the navigation bar
        }

        const prevButton = document.createElement('button');         // "Previous" button
        prevButton.textContent = '<<';                          // Text of the "Previous" button
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;                                        // Go to the previous page
                fetchData(categories[currentCategoryIndex], currentPage); // Load the data for the category and page
            }
        });

        const nextButton = document.createElement('button');         // "Next" button
        nextButton.textContent = '>>';                              // Text of the "Next" button
        nextButton.addEventListener('click', () => {
            currentPage++;                                            // Go to the next page
            fetchData(categories[currentCategoryIndex], currentPage);   // Load the data for the category and page
        });

        nav.appendChild(prevButton);                                   // Add the "Previous" button to the navigation bar
        nav.appendChild(nextButton);                                   // Add the "Next" button to the navigation bar
    }

    // Get the list of available categories when the page loads
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            categories.push(...Object.keys(data));          // Store the available categories
            buildNav(categories);                            // Create the navigation bar
        })
        .catch(error => {
            console.error('Error:', error);                  // Handle errors in case the request fails
        });
});


