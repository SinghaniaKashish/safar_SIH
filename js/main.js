const locations = ["hindu_temple", "tourist_attraction", "restaurant", "park", "museum"];
        const placeRequests = [];
        
        // Function to create location controls
        function createLocationControls(locationName, locationIndex) {
            const locationDiv = document.createElement('div');
            locationDiv.classList.add('location');
            
            const locationLabel = document.createElement('label');
            locationLabel.textContent = ` ${locationName }  `;
            locationDiv.appendChild(locationLabel);
            
            const radiusLabel = document.createElement('label');
            radiusLabel.setAttribute('for', `radiusSlider${locationIndex}`);
            radiusLabel.textContent = 'Radius:';
            locationDiv.appendChild(radiusLabel);
            
            const radiusSlider = document.createElement('input');
            radiusSlider.type = 'range';
            radiusSlider.id = `radiusSlider${locationIndex}`;
            radiusSlider.min = '500';
            radiusSlider.max = '5000';
            radiusSlider.step = '500';
            locationDiv.appendChild(radiusSlider);
            
            const radiusValue = document.createElement('output');
            radiusValue.id = `radiusValue${locationIndex}`;
            radiusValue.textContent = '2000m  '; // Initial value
            locationDiv.appendChild(radiusValue);
            
            const ratingLabel = document.createElement('label');
            ratingLabel.setAttribute('for', `ratingSlider${locationIndex}`);
            ratingLabel.textContent = 'Rating: ';
            locationDiv.appendChild(ratingLabel);
            
            const ratingSlider = document.createElement('input');
            ratingSlider.type = 'range';
            ratingSlider.id = `ratingSlider${locationIndex}`;
            ratingSlider.min = '500';
            ratingSlider.max = '10000';
            ratingSlider.step = '500';
            locationDiv.appendChild(ratingSlider);
            
            const ratingValue = document.createElement('output');
            ratingValue.id = `ratingValue${locationIndex}`;
            
            ratingValue.textContent = '3.5 '; // Initial value
            locationDiv.appendChild(ratingValue);
            
            const reviewsLabel = document.createElement('label');
            reviewsLabel.setAttribute('for', `reviewsSlider${locationIndex}`);
            reviewsLabel.textContent = 'Reviews:';
            locationDiv.appendChild(reviewsLabel);
            
            const reviewsSlider = document.createElement('input');
            reviewsSlider.type = 'range';
            reviewsSlider.id = `reviewsSlider${locationIndex}`;
            reviewsSlider.min = '500';
            reviewsSlider.max = '10000';
            reviewsSlider.step = '500';
            locationDiv.appendChild(reviewsSlider);
            
            const reviewsValue = document.createElement('output');
            reviewsValue.id = `reviewsValue${locationIndex}`;
            reviewsValue.textContent = '5000 '; // Initial value
            locationDiv.appendChild(reviewsValue);

            const toggleLabel = document.createElement('label');
            toggleLabel.setAttribute('for', `toggle${locationIndex}`);
            toggleLabel.textContent = 'Toggle:';
            locationDiv.appendChild(toggleLabel);
            
            const toggleInput = document.createElement('input');
            toggleInput.type = 'checkbox';
            toggleInput.id = `toggle${locationIndex}`;
            locationDiv.appendChild(toggleInput);
            
            // Add event listeners to sliders
            radiusSlider.addEventListener('input', updateRadiusValue);
            ratingSlider.addEventListener('input', updateRatingValue);
            reviewsSlider.addEventListener('input', updateReviewsValue);
            
            // Append the location controls to the container
            document.getElementById('locationContainer').appendChild(locationDiv);
        }
        
        // Create controls for each location in the 'locations' array
        for (let i = 0; i < locations.length; i++) {
            createLocationControls(locations[i], i + 1);
        }

        function updateRadiusValue() {
            const locationIndex = this.id.replace('radiusSlider', '');
            const radiusValue = document.getElementById(`radiusSlider${locationIndex}`).value;
            document.getElementById(`radiusValue${locationIndex}`).textContent = radiusValue;
        }
        
        function updateRatingValue() {
            const locationIndex = this.id.replace('ratingSlider', '');
            const ratingValue = document.getElementById(`ratingSlider${locationIndex}`).value / 1000; // Convert back to decimal
            document.getElementById(`ratingValue${locationIndex}`).textContent = ratingValue.toFixed(1);
        }
        
        function updateReviewsValue() {
            const locationIndex = this.id.replace('reviewsSlider', '');
            const reviewsValue = document.getElementById(`reviewsSlider${locationIndex}`).value;
            document.getElementById(`reviewsValue${locationIndex}`).textContent = reviewsValue;
        }

        const applyButton = document.getElementById('applyButton');
        applyButton.addEventListener('click', function() {
            // Clear the placeRequests array
            placeRequests.length = 0;
            
            for (let i = 1; i <= locations.length; i++) {
                const toggleChecked = document.getElementById(`toggle${i}`).checked;
                
                if (toggleChecked) {
                    const radiusValue = parseInt(document.getElementById(`radiusSlider${i}`).value);
                    const ratingValue = parseFloat(document.getElementById(`ratingSlider${i}`).value) / 1000; // Convert back to decimal
                    const reviewsValue = parseInt(document.getElementById(`reviewsSlider${i}`).value);
                    
                    // Add a request object to placeRequests for the selected location
                    placeRequests.push({
                        type: locations[i - 1],
                        radius: radiusValue,
                        minRating: ratingValue,
                        minReviews: reviewsValue
                    });
                }
            }
            
            console.log('Updated placeRequests:', placeRequests);
        });




        var map;
        var directionsDisplay;
        var pathCoordinates = []; // Initialize an empty 2D array to store location coordinates

        function initialize() {
            map = new google.maps.Map(document.getElementById('map'), {
                zoom: 8,
                center: { lat: 20.2961, lng: 85.8245 } // Center the map on Bhubaneswar
            });

            directionsDisplay = new google.maps.DirectionsRenderer();
            directionsDisplay.setMap(map);

            var directionsService = new google.maps.DirectionsService();

            document.getElementById('getDirections').addEventListener('click', function () {
                var start = document.getElementById('start').value;
                var end = document.getElementById('end').value;

                var request = {
                    origin: start,
                    destination: end,
                    travelMode: 'DRIVING'
                };

                directionsService.route(request, function (response, status) {
                    if (status === 'OK') {
                        // Clear existing markers and route
                        clearMarkers();
                        clearRoute();
                        findAllPlacesAlongRoute(response.routes[0].overview_path);
                        displayRoute(response);
                    } else {
                        alert('Directions request failed due to ' + status);
                    }
                });
            });
        }

        var markers = [];

        // Function to clear existing markers
        function clearMarkers() {
            markers.forEach(function (marker) {
                marker.setMap(null);
            });
            markers = [];
        }

        // Function to clear existing route
        function clearRoute() {
            directionsDisplay.setDirections({ routes: [] });
        }

        // Define an array of place types and radii
        // var placeRequests = [
        //     { type: 'hindu_temple', radius: 2000, minRating: 3.5, minReviews: 5000 },
        //     { type: 'tourist_attraction', radius: 2000, minRating: 4.0, minReviews: 5000 },
        //     { type: 'restaurant', radius: 2000, minRating: 4.0, minReviews: 3000 },
        //     { type: 'park', radius: 2000, minRating: 3.0, minReviews: 5000 },
        //     { type: 'museum', radius: 2000, minRating: 4.5, minReviews: 1000 }
        // ];

        // Function to find places based on the array of requests
        function findAllPlacesAlongRoute(route) {
            clearMarkers(); // Clear existing markers

            var service = new google.maps.places.PlacesService(document.createElement('div'));

            function processResults(results, placeRequest) {
                results.forEach(function (result) {
                    var rating = result.rating || 'N/A';
                    var reviews = result.user_ratings_total || 0;
                    var photoUrl = result.photos && result.photos[0] ? result.photos[0].getUrl() : '';
                    var latitude = result.geometry.location.lat();
                    var longitude = result.geometry.location.lng();

                    if (rating >= placeRequest.minRating && reviews >= placeRequest.minReviews) {
                        // Add a marker to the map with additional info
                        addMarker({ lat: latitude, lng: longitude }, result.name, rating, photoUrl);
                    }
                });
            }

            route.forEach(function (location) {
                placeRequests.forEach(function (placeRequest) {
                    var request = {
                        location: location,
                        radius: placeRequest.radius,
                        types: [placeRequest.type]
                    };

                    service.nearbySearch(request, function (results, status) {
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            processResults(results, placeRequest);
                        }
                    });
                });
            });
        }

        // Function to add a marker to the map with click functionality
        function addMarker(location, name, rating, photoUrl) {
            var marker = new google.maps.Marker({
                position: location,
                map: map
            });

            marker.addListener('click', function () {
                // Display the information when the marker is clicked
                document.getElementById('placeName').textContent = name;
                document.getElementById('placeRating').textContent = "Rating: " + rating;
                document.getElementById('placePhoto').src = photoUrl;

                // Show the information card
                var placeInfo = document.getElementById('placeInfo');
                placeInfo.style.display = 'block';

                // Show the "Add to Path" button
                var addToPathButton = document.getElementById('addToPathButton');
                addToPathButton.style.display = 'block';

                // Handle button click event to push coordinates to the array
                addToPathButton.addEventListener('click', function () {
                    // Get the coordinates
                    var latitude = location.lat;
                    var longitude = location.lng;

                    // Check if coordinates already exist in the array
                    var coordinatesExist = pathCoordinates.some(function(coordinate) {
                        return coordinate[0] === latitude && coordinate[1] === longitude;
                    });

                    if (!coordinatesExist) {
                        // Push the coordinates to the 2D array
                        pathCoordinates.push([latitude, longitude]);

                        // Remove duplicates by converting the array to a Set and back to an array
                        pathCoordinates = [...new Set(pathCoordinates.map(JSON.stringify))].map(JSON.parse);


                        // Print the updated array for debugging (you can remove this line in production)
                        console.log('Updated Path Coordinates:', pathCoordinates);
                    } 
                });
            });

            markers.push(marker);
        }

        // Function to display the route on the map
        function displayRoute(directionsResult) {
            directionsDisplay.setDirections(directionsResult);
        }

        // Close the information card when the close button is clicked
        document.getElementById('closeInfo').addEventListener('click', function () {
            var placeInfo = document.getElementById('placeInfo');
            placeInfo.style.display = 'none';
        });

        // Define a function to create the Google Maps URL and open it
        function openGoogleMaps() {
            // Get the starting and ending points from the directionsForm
            const start = document.getElementById('start').value;
            const end = document.getElementById('end').value;
        
            // Define the waypoints using the pathCoordinates array
            const waypoints = pathCoordinates.map(coordinate => {
                const [lat, lng] = coordinate;
                return { lat, lng };
            });
        
            // Check if the user is on a mobile device
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
            if (isMobile) {
                // If on a mobile device, open the Google Maps app
                const googleMapsAppUrl = `comgooglemaps://?saddr=${start}&daddr=${end}&waypoints=${waypoints.map(point => `${point.lat},${point.lng}`).join('|')}`;
                window.open(googleMapsAppUrl);
            } else {
                // If on a desktop or non-mobile device, open the Google Maps website
                const googleMapsWebUrl = `https://www.google.com/maps/dir/?api=1&origin=${start}&destination=${end}&waypoints=${waypoints.map(point => `${point.lat},${point.lng}`).join('|')}`;
                window.open(googleMapsWebUrl);
            }
        }
        
        // Attach the openGoogleMaps function to a button's click event
        const openMapsButton = document.getElementById('openMapsButton');
        openMapsButton.addEventListener('click', openGoogleMaps);
        
        google.maps.event.addDomListener(window, 'load', initialize);
        
    


(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 45) {
            $('.navbar').addClass('sticky-top shadow-sm');
        } else {
            $('.navbar').removeClass('sticky-top shadow-sm');
        }
    });
    
    
    // Dropdown on mouse hover
    const $dropdown = $(".dropdown");
    const $dropdownToggle = $(".dropdown-toggle");
    const $dropdownMenu = $(".dropdown-menu");
    const showClass = "show";
    
    $(window).on("load resize", function() {
        if (this.matchMedia("(min-width: 992px)").matches) {
            $dropdown.hover(
            function() {
                const $this = $(this);
                $this.addClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "true");
                $this.find($dropdownMenu).addClass(showClass);
            },
            function() {
                const $this = $(this);
                $this.removeClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "false");
                $this.find($dropdownMenu).removeClass(showClass);
            }
            );
        } else {
            $dropdown.off("mouseenter mouseleave");
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: true,
        margin: 24,
        dots: true,
        loop: true,
        nav : false,
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });
    
})(jQuery);

