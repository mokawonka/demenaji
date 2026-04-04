var isLoadingPlaces = false;
var lastLoadedZoom = 11;
var RENT_MAX = 200000;
var HighestFirst = false;
var UpRange = RENT_MAX;
var LoRange = 0;
var BedsSelection = [0,0,0,0,0];
var lookupAreaSize = 3;
var lookupArea = null;
var initArea = true;
var bb, nwbb, nebb, sebb, swbb;
var showedFeatures = [];
var viewedList = [];
var map = null;
var admap = null;
var ul = document.getElementById("ulist");
var ALGERIA_BOUNDS = [
    [-8.67, 18.97],   // Southwest corner (lng, lat)
    [12.00, 37.12]    // Northeast corner (lng, lat)
];

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////// PLACE //////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
$("#placeFavorite").click(function(e) {

    var $t = $("#placeFavSign");

    var placeid = window.location.href.substring(window.location.href.lastIndexOf('/') + 1).substring(0,36);

    var handlerurl;
    if($t.hasClass("fa-plus")) handlerurl = '/Place/' + placeid + '?handler=AddFavorite';
    else handlerurl = '/Place/' + placeid + '?handler=RemoveFavorite';
    
    $.ajax({
        type: 'POST',
        url: handlerurl,
        data: {
            favid: placeid
        },
        datatype: "html",
        headers: {
            'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
        },
        success: function(data)          
        {   
            $t.toggleClass("fa-plus fa-heart");

            var ptext = $t.hasClass("fa-plus") ? "Favori" : "Favori";
            document.getElementById("placeFavText").innerHTML = ptext;
        },
        error: function () {
            console.log("disconnected");
        }
    });
});



$(document).on("click", ".heart", function(e) {
    e.preventDefault();

    var $t = $(this);
    var placeid = getIdFromLi($t.closest("li")[0]);
    var isFaved = $t.hasClass("fa-solid");
    var handlerurl = isFaved ? '/Map?handler=RemoveFavorite' : '/Map?handler=AddFavorite';

    $.ajax({
        type: 'POST',
        url: handlerurl,
        data: { favid: placeid },
        dataType: "html",
        headers: {
            'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
        },
        success: function() {
            if (isFaved) {
                $t.attr('title', 'Ajouter aux favoris');
            } else {
                $t.attr('title', 'Retirer des favoris');
            }
            $t.toggleClass("fa-solid fa-regular");
        },
        error: function() {
            console.log("disconnected");
        }
    });
});

// carousel picture zoom
var modal = document.getElementById("carouselModal");
var modalImg = document.getElementById("carouselModalImg");
var currentIndex = 0;
var images = [];
$("#carouselcenter img").each(function(){
    images.push($(this).attr("src"));
});
$("#carouselcenter").on("click", function(){
    currentIndex = $(".carousel-item.active").index();
    showImage();
    modal.style.display = "flex";
});
function showImage() {
    modalImg.src = images[currentIndex];
}
$("#modalNext").click(function(e){
    e.stopPropagation();
    currentIndex = (currentIndex + 1) % images.length;
    showImage();
});
$("#modalPrev").click(function(e){
    e.stopPropagation();
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage();
});
$("#carouselModal").click(function(e){
    if(e.target === modal || e.target.id === "carouselModalClose"){
        modal.style.display = "none";
    }
});

// map visualization

if($("#admap").length != 0)
{
    var lng  = parseFloat($("#admap").data("lng"));
    var lat  = parseFloat($("#admap").data("lat"));
    var loc  = [lng, lat];

    var mapStyleUrl = window.mapboxStyleUrl;
    admap = new mapboxgl.Map({
        container: 'admap',
        style: mapStyleUrl,
        center:loc,
        zoom:10
    });

    admap.addControl(new mapboxgl.NavigationControl({ showCompass: false }));
    admap.dragRotate.disable();

    admap.on('load', function() {

        admap.setCenter(loc);

        // Current Address
        admap.loadImage(window.defaultIconUrl, function(error, image) {
            if (error) throw error;
            if (!admap.hasImage("default-marker")) {
                admap.addImage("default-marker", image);
            }

            if (!admap.getLayer('admarker')) {
                admap.addLayer({
                    "id": "admarker",
                    "type": "symbol",
                    "source": {
                        "type": "geojson",
                        "data": {
                            "type": "FeatureCollection",
                            "features": [
                                {
                                    "type": "Feature",
                                    "geometry": {
                                        "type": "Point",
                                        "coordinates": loc
                                    }
                                }
                            ]
                        }
                    },
                    'layout': {
                        "icon-image": "default-marker",
                        'icon-ignore-placement': true,
                        "icon-size": 1,
                        "icon-offset":[0,-20]
                    }
                });
            }
        });
    });
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////// INDEX //////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function toggle_visibility(id1, id2) 
{
    var e = document.getElementById(id1);
    var e2 = document.getElementById(id2);        
    e.style.display = 'none';
    e.style.visibility = 'hidden';                   
    e2.style.display = '';
    e2.style.visibility = 'visible';
}

function updatePreview()
{
    ul.scrollTop = 0;
    try
    {    
        var li = ul.getElementsByTagName('li');

        var cpt = 0;
        var ll = li.length;
        for (i = 0; i < ll; i++)
        {
            if(li[i].style.display == "none") cpt=cpt+1;
        }
    
        if (cpt == ll)  toggle_visibility("showedPlaces", "hiddenPlaces"); // display message
        else toggle_visibility("hiddenPlaces", "showedPlaces");            // display list
    }
    catch(error){
        toggle_visibility("showedPlaces", "hiddenPlaces");
    }
}

function jitterDuplicates(features) {
  const seen = {}
  return features.map(f => {
    const key = f.geometry.coordinates.join(",")
    if (!seen[key]) {
      seen[key] = 0
    }
    seen[key]++
    if (seen[key] > 1) {
      // offset by ~10 meters per duplicate
      const angle = (seen[key] - 1) * (2 * Math.PI / 8)
      const offset = 0.0001
      f = JSON.parse(JSON.stringify(f)) // clone to avoid mutating original
      f.geometry.coordinates = [
        f.geometry.coordinates[0] + offset * Math.cos(angle),
        f.geometry.coordinates[1] + offset * Math.sin(angle)
      ]
    }
    return f
  })
}

///////////////
// updateMap //
///////////////
function updateMap() {

  showedFeatures = [];

  try {
        var li = viewedList;
        var ll = li.length;
        for (var i = 0; i < ll; i++) {
            var feature = {
                "type": "Feature",
                "geometry": {
                "type": "Point",
                "coordinates": [getLngFromLi(li[i]), getLatFromLi(li[i])]
                },
                "properties": {
                "name":      getIdFromLi(li[i]),
                "rent":      li[i].querySelector('.ad-rent').textContent,
                "placetype": li[i].querySelector('.ad-beds').textContent
                }
            };
            if (li[i].style.display != "none") showedFeatures.push(feature);
        }

        showedFeatures = jitterDuplicates(showedFeatures);

        // ← write jittered coords back to DOM
        showedFeatures.forEach(function(f) {
            var id  = f.properties.name;
            var li  = ul.querySelector('li p.d-none:nth-of-type(3)'); // fallback
            // find the exact li by id
            var lis = ul.getElementsByTagName('li');
            for (var i = 0; i < lis.length; i++) {
                if (getIdFromLi(lis[i]) === id) {
                    lis[i].querySelectorAll('p.d-none')[0].textContent = f.geometry.coordinates[0]; // lng
                    lis[i].querySelectorAll('p.d-none')[1].textContent = f.geometry.coordinates[1]; // lat
                    break;
                }
            }
        });

        var mapdata = { "type": "FeatureCollection", "features": showedFeatures };

        if (!map.getSource('places')) {
            map.addSource('places', {
                type: 'geojson',
                data: mapdata,
                cluster: true,
                clusterMaxZoom: 22,
                clusterRadius: 40
            });

            map.addLayer({
                id: 'clusters',
                type: 'circle',
                source: 'places',
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': '#17a2b8',
                    'circle-radius': [
                        'step', ['get', 'point_count'],
                        18, 10, 24, 50, 30
                    ],
                    'circle-opacity': 0.85
                }
            });

            map.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: 'places',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': '{point_count_abbreviated}',
                    'text-size': 13,
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold']
                },
                paint: { 'text-color': '#ffffff' }
            });

            map.addLayer({
                id: 'places',
                type: 'symbol',
                source: 'places',
                filter: ['!', ['has', 'point_count']],
                layout: {
                    'icon-image': 'default-marker',
                    'icon-allow-overlap': true,
                    'icon-size': 1,
                    'icon-offset': [0, -20]
                }
            });

            map.on('click', 'clusters', function(e) {
                var features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
                var clusterId = features[0].properties.cluster_id;
                map.getSource('places').getClusterExpansionZoom(clusterId, function(err, zoom) {
                    if (err) return;
                    map.easeTo({ center: features[0].geometry.coordinates, zoom: zoom });
                });
            });

            map.on('mouseenter', 'clusters', function() { map.getCanvas().style.cursor = 'pointer'; });
            map.on('mouseleave', 'clusters', function() { map.getCanvas().style.cursor = ''; });

        } else {
            map.getSource('places').setData(mapdata);
        }
    }
    catch(error) { console.log("updateMap error:", error.message); }
}

//////////////
// inbounds //
//////////////
function inbounds(loc, ne, sw){     
    // var lng = (loc[0] - ne[0]) * (loc[0] - sw[0]) < 0;
    // var lat = (loc[1] - ne[1]) * (loc[1] - sw[1]) < 0;
    return ((loc[0] - ne[0]) * (loc[0] - sw[0]) < 0) && ((loc[1] - ne[1]) * (loc[1] - sw[1]) < 0);
}

//////////////////////////
// LoadPlacesFromServer //
////////////////////////// 
function showLoading() {
  document.getElementById("list-overlay").classList.add("active")
  $("#ulist").css({ "opacity": "0.4", "transition": "opacity 0.2s" })
}

function hideLoading() {
  document.getElementById("list-overlay").classList.remove("active")
  $("#ulist").css({ "opacity": "1", "transition": "opacity 0.3s" })
}

function LoadPlacesFromServer(polygon) {
  if (isLoadingPlaces) return;
  isLoadingPlaces = true;

  showLoading()

  var zoom = map.getZoom();
  var turfBB = turf.polygon([polygon]);
  var largerTurfBB = turf.transformScale(turfBB, lookupAreaSize);
  lookupArea = largerTurfBB.geometry.coordinates[0];

  $.ajax({
    type: 'POST',
    url: '/Map?handler=Area',
    data: {
      lookuparea: JSON.stringify({
        "nebb": lookupArea[1],
        "swbb": lookupArea[3]
      }),
      zoom: zoom,
      page: 1
    },
    dataType: "json",
    headers: {
      'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
    },
    success: function(response) {
      $("#ulist").html(response.html);
      update();
      lastLoadedZoom = zoom;
    },
    error: function() { console.log("Load failed"); },
    complete: function() {
      isLoadingPlaces = false;
      hideLoading()
    }
  });
}

function parseRentToDA(text) {
  text = text.trim();
  if (text.includes('Milliard')) {
    var num = parseFloat(text.replace(/[^0-9,\.]/g, '').replace(',', '.'));
    return Math.round(num * 10000000);
  }
  if (text.includes('Million')) {
    var num = parseFloat(text.replace(/[^0-9,\.]/g, '').replace(',', '.'));
    return Math.round(num * 10000);
  }
  // plain DA — strip spaces and "DA"
  return parseInt(text.replace(/DA/g, '').replace(/\s/g, '').trim()) || 0;
}

function getRentFromLi(li) {
  return parseRentToDA(li.querySelector('.ad-rent').textContent);
}
function getBedsFromLi(li) {
  return li.querySelector('.ad-beds').textContent.trim();
}
function getLngFromLi(li)  { return parseFloat(li.querySelectorAll('p.d-none')[0].textContent); }
function getLatFromLi(li)  { return parseFloat(li.querySelectorAll('p.d-none')[1].textContent); }
function getIdFromLi(li)   { return li.querySelectorAll('p.d-none')[2].textContent.trim(); }

///////////////
// updateImp //
///////////////
function updateImp(lrent, urent, beds_selection) {
  viewedList = [];

  function AllUnchecked() {
    for (var i = 0; i < 5; i++) {
      var id = ["#0bed","#1bed","#2bed","#3bed","#4bed"][i];
      if ($(id).hasClass("button-filter-activ") || $(id).hasClass("button-filter-lg-activ")) return false;
    }
    return true;
  }

  try {
    var li = ul.getElementsByTagName('li');
    var ll = li.length;

    for (var i = 0; i < ll; i++) {
      var rent = getRentFromLi(li[i]);

      var beds_tmp = getBedsFromLi(li[i]);
      var beds;
      if (beds_tmp === "STUDIO") beds = 0;
      else {
        beds = parseInt(beds_tmp);
        beds = beds >= 4 ? 4 : beds;
      }

      var isBedSelected = beds_selection[beds] == 1;
      if (AllUnchecked()) isBedSelected = true;

      var location = [getLngFromLi(li[i]), getLatFromLi(li[i])];
      var mapbounds = map.getBounds();
      var isInsideMap = inbounds(location,
        mapbounds.getNorthEast().toArray(),
        mapbounds.getSouthWest().toArray());

      var isRentMatch = (rent >= lrent) && (rent <= urent || urent >= RENT_MAX);

      li[i].style.display = (isRentMatch && isBedSelected && isInsideMap) ? "" : "none";
    }

    viewedList = $('#ulist > li').filter(function() {
      return $(this).css("display") != "none";
    });

    viewedList.sort(function(a, b) {
      var keyA = getRentFromLi(a);
      var keyB = getRentFromLi(b);
      if (keyA < keyB) return HighestFirst ? 1 : -1;
      return HighestFirst ? -1 : 1;
    });

    $.each(viewedList, function(i, lii) { ul.append(lii); });

  } catch(error) {
    console.log("ERROR:", error.message, error.stack);
  }
}



//////////////////
// changeButton // 
//////////////////
function changeButton(id, index, islarge=false)
{
    if(islarge)
    {
        if($(id).hasClass("button-filter-lg")){
            $(id).removeClass("button-filter-lg");
            $(id).addClass("button-filter-lg-activ");
            BedsSelection[index] = 1; //checking
        }
        else{
            $(id).removeClass("button-filter-lg-activ");
            $(id).addClass("button-filter-lg");
            BedsSelection[index] = 0; //unchecking
        }
        return;
    }

    if($(id).hasClass("button-filter")){
        $(id).removeClass("button-filter");
        $(id).addClass("button-filter-activ");
        BedsSelection[index] = 1; //checking
    }
    else{
        $(id).removeClass("button-filter-activ");
        $(id).addClass("button-filter");
        BedsSelection[index] = 0; //unchecking
    }
}

/////////////////////
// Main Search Bar //
/////////////////////
var inputAddress = $('#search-input').mapboxAutocomplete({
    accessToken: mapboxgl.accessToken,
    endpoint: 'https://api.mapbox.com/geocoding/v5/',
    mode: 'mapbox.places',
    types: 'address,place,locality',
    countries: 'dz',
    language: 'fr',
    width: '100%',
    zindex: '1000'
});

inputAddress.on('mapboxAutocomplete.found.address', function (e,object,feature) {

    function gotolocation()
    {
        if(!feature.hasOwnProperty('bbox'))
        {
            if(object.hasOwnProperty('point')){
                var target = [object.point.long, object.point.lat];
                map.jumpTo({center: target, zoom:15});
            }
        }
        else{
            map.fitBounds([[feature.bbox[0], feature.bbox[1] ], [feature.bbox[2], feature.bbox[3]]], {duration: 0});
        }
    }

    var locsearch=$('#search-input').val();
    var queryString = "?location=" + locsearch;

    if ($('#map').length) // dont redirect if already on main page containing the map
    {
        gotolocation();
        $('#search-input').blur();
        window.history.pushState("", "/", queryString); // updating url after a search
    }
    else 
    {
        window.location.href = '/' + queryString; // redirect to main page
    }
});

// Processing URL in index page
var queryString = decodeURIComponent(window.location.search);
queryString = queryString.substring(1);
var queries = queryString.split("&");

for (var i = 0; i < queries.length; i++)
{
    var fields = queries[i].split('=');

    if(fields[0] == "location")
    {
        $('#search-input').val(fields[1]);
        $('#search-input').focus();
        $('#search-input').trigger('keyup');
                        
        var list = document.getElementById('mbaa-result-address-autocomplete');
        list.style.display = "none";

        setTimeout(function(){
            var firstli = list.getElementsByTagName('li')[0];
            $(firstli).click();
        }, 500);
    }
}

// hiding search autocomplete list when clicking away on page
$(document).on('click',function(e) 
{
    var mainSearch = $("#search-input");
    list = document.getElementById('mbaa-result-address-autocomplete');

    // if the target of the click isn't the container nor a descendant of the container
    if (!mainSearch.is(e.target) && mainSearch.has(e.target).length === 0) 
    {
        list.style.display = "none"; // hide
    }
    else list.style.display = ""; 
});

$(window).resize(function () {

    var mapdiv = $('#map');
    var addbuttondiv = $('#addbutton');
    
    if($(this).width() < 768)
    {
        mapdiv.css("bottom", "130px");
        addbuttondiv.css("bottom", "150px");
        $('#placesList').append(mapdiv);
        $('#placesList').append(addbuttondiv);
    }
    
    if($(this).width() >= 768)
    {
        mapdiv.css("bottom", "0vmax");
        addbuttondiv.css("bottom", "20px");
        $('#placesPin').append(mapdiv);
        $('#placesPin').append(addbuttondiv);          
    }
}).resize();


function onError(error) {
    //alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
}

function centerOnLocation(mapInstance) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var currLocation = [position.coords.longitude, position.coords.latitude];
            mapInstance.setCenter(currLocation);
        }, onError, {enableHighAccuracy: true});
    }
}


const geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    fitBoundsOptions:{
        zoom:11,
        duration:0
    },
    trackUserLocation: false
});



var popup = new mapboxgl.Popup({ 
    closeButton: false, 
    closeOnClick: false, 
    anchor:'bottom-left',
    offset: [0, -24]
});

function openInNewTab(url) {
    var win = window.open(url, '_blank');
}


if($("#map").length != 0)
{
    var mapStyleUrl = window.mapboxStyleUrl;
    map = new mapboxgl.Map({
        attributionControl: false,
        container: 'map',
        style: mapStyleUrl,
        center: [3.0588, 36.7538],   // Center on Algiers
        zoom: 11,
        maxBounds: ALGERIA_BOUNDS,   // ← THIS RESTRICTS THE MAP TO ALGERIA
        minZoom: 5.5,                // Optional: prevents extreme zoom out (good UX)
        maxZoom: 18                  // Optional: prevents too much zoom in
    });

    map.dragRotate.disable();
    map.addControl(new mapboxgl.NavigationControl({showCompass:false}));

    map.addControl(geolocate);

    map.on('load', function()
    {
        var moveTimeout;

        map.on('moveend', function()
        {
            clearTimeout(moveTimeout);

            moveTimeout = setTimeout(() => {

                bb   = map.getBounds();
                nwbb = bb.getNorthWest().toArray();
                nebb = bb.getNorthEast().toArray();
                sebb = bb.getSouthEast().toArray();
                swbb = bb.getSouthWest().toArray();

                var currentPolygon = [nwbb, nebb, sebb, swbb, nwbb];
                var currentZoom = map.getZoom();

                if (!lookupArea) {
                    LoadPlacesFromServer(currentPolygon);
                    return;
                }

                var stillCovered = inbounds(nwbb, lookupArea[1], lookupArea[3]) &&
                                   inbounds(nebb, lookupArea[1], lookupArea[3]) &&
                                   inbounds(sebb, lookupArea[1], lookupArea[3]) &&
                                   inbounds(swbb, lookupArea[1], lookupArea[3]);

                // Reload when zooming in significantly (to get more local ads)
                var zoomedInSignificantly = currentZoom > lastLoadedZoom + 0.7;

                var needsReload = !stillCovered || zoomedInSignificantly;

                if (needsReload) {
                    LoadPlacesFromServer(currentPolygon);
                } else {
                    update();   // just client-side filter
                }

            }, 450);   // higher debounce = smoother zoom/pan
        });


        // load images once at startup
        map.loadImage(window.defaultIconUrl, function(error, image) {
            if (error) throw error;
            if (!map.hasImage("default-marker")) map.addImage("default-marker", image);
        });

        map.loadImage(window.redIconUrl, function(error, image){
            if (error) throw error;
            if(!map.hasImage("red-marker")){
                map.addImage("red-marker", image);
            }
            
            // Change Markers on hover  
            map.on('mousemove', 'places', function (e) {
                map.getCanvas().style.cursor = 'pointer';
                map.setLayoutProperty("places", 'icon-image', ["case", ["==", ["get", "name"], e.features[0].properties.name], "red-marker", "default-marker"]);
                //map.setLayoutProperty("places", 'icon-offset', ["case", ["==", ["get", "name"], e.features[0].properties.name], ["literal", [0, -30]],["literal", [0, -20]]]);
                //map.setLayoutProperty("places", 'icon-size', ["case", ["==", ["get", "name"], e.features[0].properties.name], 1, 1]);
            });
            
            map.on('mouseleave', 'places', function (e) {
                map.getCanvas().style.cursor = '';
                map.setLayoutProperty("places", 'icon-image', "default-marker");
                //map.setLayoutProperty("places", 'icon-offset', [0,-20]);
                //map.setLayoutProperty('places', 'icon-size', 1);
            });
        });

        map.on('click', 'places', function(e) {
            map.getCanvas().style.cursor = 'pointer';
            var coordinates = e.features[0].geometry.coordinates;
            var rent        = e.features[0].properties.rent;
            var type        = e.features[0].properties.placetype.toLowerCase();
            var place_url   = "Place/" + e.features[0].properties.name;

            popup.setLngLat(coordinates)
                .setHTML(
                '<div class="map-popup">' +
                    '<a href="' + place_url + '">' +
                    '<div class="map-popup-rent">' + rent + '</div>' +
                    '<div class="map-popup-type">' + type + '</div>' +
                    '</a>' +
                '</div>'
                )
                .addTo(map);
        });

        map.on('click', function (e) {
            // discard clicks on markers
            var features = map.queryRenderedFeatures(e.point, { layers: ['places']});
            if (features.length != 0) return;

            // hides popup 
            map.getCanvas().style.cursor = '';
            popup.remove();
        });
    });

    // Change markers on li hover
    $('#ulist').on('mouseenter', 'li', function() {
    if (!map.getLayer('places')) return;
    try {
        var placeid   = getIdFromLi(this);
        var lng       = getLngFromLi(this);
        var lat       = getLatFromLi(this);
        var rent      = this.querySelector('.ad-rent').textContent;
        var type      = this.querySelector('.ad-beds').textContent.toLowerCase();
        var place_url = "Place/" + placeid;

        map.setLayoutProperty("places", 'icon-image', [
        "case", ["==", ["get", "name"], placeid],
        "red-marker", "default-marker"
        ]);
        map.getCanvas().style.cursor = 'pointer';

        popup.setLngLat([lng, lat])
        .setHTML(
            '<div class="map-popup">' +
            '<a href="' + place_url + '">' +
                '<div class="map-popup-rent">' + rent + '</div>' +
                '<div class="map-popup-type">' + type + '</div>' +
            '</a>' +
            '</div>'
        )
        .addTo(map);
    } catch(error) {}

    }).on('mouseleave', 'li', function() {
        if (!map.getLayer('places')) return;
        map.setLayoutProperty("places", 'icon-image', "default-marker");
        map.getCanvas().style.cursor = '';
        popup.remove();
    });


    map.on('load', function()
    {   
        // Getting places for 1rst time
        if(initArea)
        {
            initArea = false;
            bb   = map.getBounds();
            nwbb = bb.getNorthWest().toArray();
            nebb = bb.getNorthEast().toArray();
            sebb = bb.getSouthEast().toArray();
            swbb = bb.getSouthWest().toArray();
            LoadPlacesFromServer([nwbb, nebb, sebb, swbb, nwbb]);
        }

        // Sorting filters
        $("#sorting").change(function() {
            if($(this).prop('checked')) 
                HighestFirst = true;
            else HighestFirst = false;

            update();
        });

        // bedrooms filters
        $("#0bed").on("click", function() {
            changeButton("#0bed", 0, true);
            update();
        });

        $("#1bed").on("click", function() {
            changeButton("#1bed", 1);
            update();
        });

        $("#2bed").on("click", function() {
            changeButton("#2bed", 2);
            update();
        });

        $("#3bed").on("click", function() {
            changeButton("#3bed", 3);
            update();
        });

        $("#4bed").on("click", function() {
            changeButton("#4bed", 4);
            update();
        });
    });

    map.on('error', function(e) {
        if (!navigator.onLine) {
            document.getElementById('map').style.display = 'none';
            document.getElementById('map-offline').style.display = 'flex';
        }
    });

    window.addEventListener('offline', function() {
        document.getElementById('map').style.display = 'none';
        document.getElementById('map-offline').style.display = 'flex';
    });

    window.addEventListener('online', function() {
        document.getElementById('map').style.display = 'block';
        document.getElementById('map-offline').style.display = 'none';

        if (map) {
            map.setStyle(window.mapboxStyleUrl);

            map.once('styledata', function() {
                initArea = true;
                lookupArea = null;
                bb   = map.getBounds();
                nwbb = bb.getNorthWest().toArray();
                nebb = bb.getNorthEast().toArray();
                sebb = bb.getSouthEast().toArray();
                swbb = bb.getSouthWest().toArray();
                LoadPlacesFromServer([nwbb, nebb, sebb, swbb, nwbb]);
            });
        }
    });
}


// rent filters
$("#dual-rent-slider").ionRangeSlider({
    type: "double",
    min: 0,
    max: 200000,
    min_interval: 5000,
    from: 0,
    to: 200000,
    step: 5000,
    prefix: "DA",
    max_postfix: "+",
    onStart: function (data) 
    {
        LoRange = data.from;
        UpRange = data.to;
    },
    onChange: function (data) 
    {
        LoRange = data.from;
        UpRange = data.to;
    },
    onFinish: function (data) 
    {
        update();
    }
});

function update()
{
    updateImp(LoRange, UpRange, BedsSelection);
    updateMap();
    updatePreview();
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////// CREATE PLACE //////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

if($("#search-address").length != 0)
{
    var addressSearch = $("#search-address");
    var longitude = $("#placeLongitude");
    var latitude = $("#placeLatitude");

    addressSearch.on('input', function(){
        longitude.val(''); 
        latitude.val('');
    });


    var inputAddress = addressSearch.mapboxAutocomplete2({
        accessToken: mapboxgl.accessToken,
        endpoint: 'https://api.mapbox.com/geocoding/v5/',
        mode: 'mapbox.places',
        types: 'address',
        countries: 'dz',
        language: 'fr',
        width: '100%',
        zindex: '1000'
    }).on('mapboxAutocomplete.found.address', function (e,object,feature) {
            longitude.val(object.point.long);
            latitude.val(object.point.lat);
    });

    // hiding search list when clicking away and adding 1rst address when address is incomplete
    $(document).on('click', e => {
        const list = document.getElementById('mbaa-result-address-autocomplete2');
        if (!list) return;

        const outside = !addressSearch.is(e.target) && !addressSearch.has(e.target).length;
        if (!outside) return list.style.display = "";

        const first = list.querySelector('li');
        if (first && addressSearch.val() && !longitude.val()) {
            addressSearch.val(first.textContent);
            first.click();
        }
        list.style.display = "none";
    });
}

$(document).on('click', '.poster-avatar, .applicant-profile-pic', function() {
  var src = $(this).attr('src');
  if (!src) return;
  $('#avatar-modal-img').attr('src', src);
  $('#avatar-modal').addClass('open');
});

$('#avatar-modal').on('click', function() {
  $('#avatar-modal').removeClass('open');
});
