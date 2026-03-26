document.addEventListener("turbo:load", function() {


var ul = document.getElementById("ulist");
var maxListSize = 200;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////// PLACE //////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
$("#placeFavorite").click(function(e) {

    var $t = $("#placeFavSign");

    var placeid = window.location.href.substring(window.location.href.lastIndexOf('/') + 1).substring(0,36);

    var handlerurl;
    if($t.hasClass("fa-plus")) handlerurl = '/Place/' + placeid + '?handler=AddFavorite';
    else handlerurl = '/Place/' + placeid + '?handler=RemoveFavorite';
    
    console.log(handlerurl);

    $.ajax({
        type: 'POST',
        url: handlerurl,
        data: {
            favid: placeid
        },
        datatype: "html",
        headers: {
            RequestVerificationToken: 
                $('input:hidden[name="__RequestVerificationToken"]').val()
        },
        success: function(data)          
        {   
            $t.toggleClass("fa-plus fa-heart");

            var ptext = $t.hasClass("fa-plus") ? "Favorite" : "Favorited";
            document.getElementById("placeFavText").innerHTML = ptext;
        },
        error: function () {
            // window.location.href = '/Identity/Account/Register';
            console.log("not working");
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
    var mapStyleUrl = window.mapboxStyleUrl;
    var admap = new mapboxgl.Map({
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

// tooltip modern styling
$('[data-toggle="tooltip"]').tooltip();

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
        li = ul.getElementsByTagName('li');

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

///////////////
// updateMap //
///////////////
var showedFeatures = [];
var viewedList = [];
function updateMap()
{
    //clearing all previous features
    showedFeatures= [];

    try
    {    
        var li = viewedList; //ul.getElementsByTagName('li');

        var ll = li.length;
        for (i = 0; i < ll; i++)
        {
            var rent = li[i].getElementsByTagName("h5")[0].textContent;
            var type = li[i].getElementsByTagName("p")[0].textContent;    // 1rst <p>
            var rawlong = li[i].getElementsByTagName("p")[1].textContent; // 2nd  <p>
            var rawlat = li[i].getElementsByTagName("p")[2].textContent;  // 3rd  <p>
            var rawid = li[i].getElementsByTagName("p")[3].textContent;   // 4th  <p>
            var adlocation = [parseFloat(rawlong), parseFloat(rawlat)];

            var feature = { "type": "Feature", "geometry": { "type": "Point", "coordinates": adlocation }, "properties": {"name": rawid, "rent": rent, "placetype": type} }

            if(li[i].style.display != "none")
            {
                showedFeatures.push(feature);                 
            }
        }

        var mapdata = { "type": "FeatureCollection", "features": showedFeatures }

        map.loadImage(window.defaultIconUrl, function(error, image){
            if (error) throw error;
            if(!map.hasImage("default-marker")){
                map.addImage("default-marker", image);
            }
            
            if (!map.getLayer('places')) {
                map.addLayer({
                    "id": "places",
                    "type": "symbol",
                    "source": {
                        "type": "geojson",
                        "data": mapdata
                    },
                    'paint':{
                        "icon-opacity": 1,
                        "icon-opacity-transition": {
                            "duration": 0,
                            "delay": 0
                        }
                    },
                    'layout': {
                        "icon-image": "default-marker",
                        "icon-allow-overlap": true,
                        "icon-size":  1,
                        "icon-offset": [0, -20]
                    }
                });
            }
            else map.getSource('places').setData(mapdata);
        });
        
    }
    catch(error){}
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
var lookupAreaSize = 3;
var lookupArea = null;
var initArea = true;
var bb, nwbb, nebb, sebb, swbb;
 
function LoadPlacesFromServer(polygon)
{
    var turfBB = turf.polygon([polygon]);
    var largerTurfBB = turf.transformScale(turfBB, lookupAreaSize);
    lookupArea = largerTurfBB.geometry.coordinates[0];
    
    $.ajax({
        type: 'POST',
        url: '/Map?handler=Area',
        data: {
            lookuparea: JSON.stringify({
                "nwbb" : lookupArea[0],
                "nebb" : lookupArea[1],
                "sebb" : lookupArea[2],
                "swbb" : lookupArea[3]
            })
        },
        dataType: "html",
        headers: {
            RequestVerificationToken: 
                $('input:hidden[name="__RequestVerificationToken"]').val()
        },
        success: function(response)          
        {   
            // filling list with all places within specified area
            $("#ulist").html(response);
            // filtering locally
            update();
        },
        error: function () {}
    });
}

///////////////
// updateImp //
///////////////
function updateImp(lrent, urent, beds_selection)
{
    viewedList = [];

    function AllUnchecked()
    {
        function filterIsActive(beds)
        {
            var id;
            if(beds==0) id="#0bed";
            if(beds==1) id="#1bed";
            if(beds==2) id="#2bed";
            if(beds==3) id="#3bed";
            if(beds==4) id="#4bed";

            if($(id).hasClass("button-filter-activ") || $(id).hasClass("button-filter-lg-activ")){
                return true;
            }
            return false;
        }

        var i;
        var cpt=0;
        for(i = 0; i < 5; i++){
            if(!filterIsActive(i)){
                cpt=cpt+1;
            }
        }
        return cpt == 5 ? true : false;
    }


    var i, rent, beds, rent_tmp, beds_tmp, a, p;

    try
    {
        li = ul.getElementsByTagName('li');

        var ll = li.length;
        for (i = 0; i < ll; i++)
        {
            // reading rent
            a = li[i].getElementsByTagName("h5")[0];
            rent_tmp = a.textContent;
            rent_tmp = rent_tmp.replace(/\$/g, ''); // removing $ sign
            rent = parseInt(rent_tmp);

            // reading bedrooms
            p = li[i].getElementsByTagName("p")[0]; // 1rst <p>
            beds_tmp = p.textContent;

            if(beds_tmp.trim() === "STUDIO")
            {
                beds = 0;
            }
            else
            {
                beds = parseInt(beds_tmp);
                beds = beds >= 4 ? 4 : beds;
            }
            
            var isBedSelected = beds_selection[beds]==1;
            if(AllUnchecked()) isBedSelected = true;

            // checking if marker is inside map's current bounding box
            var isInsideMap;
            var rawlong = li[i].getElementsByTagName("p")[1].textContent; // 2nd <p>
            var rawlat = li[i].getElementsByTagName("p")[2].textContent;  // 3rd <p>
            var location = [parseFloat(rawlong), parseFloat(rawlat)];
            var mapbounds = map.getBounds();

            if(inbounds(location, 
                        mapbounds.getNorthEast().toArray(), 
                        mapbounds.getSouthWest().toArray())) isInsideMap = true;
            else isInsideMap = false;


            // filtering
            if( ( (rent <= urent && rent >= lrent) ||
                  (urent == 5000 && rent >= 5000) 
                )
                                &&
                           isBedSelected
                                &&
                           isInsideMap
                )
            {
                li[i].style.display = ""; // show
            }
            else{
                li[i].style.display = "none"; // hide
            }
        }

        // finish by sorting the list by highest or lowest rent // TO BE OPTIMIZED
        viewedList = $('#ulist > li').filter(function() { return $(this).css("display") != "none" });

        viewedList.sort(function(a,b){

            var keyA = parseInt(a.getElementsByTagName("h5")[0].textContent.replace(/\$/g, ''));
            var keyB = parseInt(b.getElementsByTagName("h5")[0].textContent.replace(/\$/g, ''));
            if (keyA < keyB) return HighestFirst ? 1 : -1;
            else return HighestFirst ? -1 : 1;
        });

        var ll = viewedList.length;
        for (i = maxListSize; i < ll; i++) viewedList[i].style.display = "none";
        viewedList = viewedList.slice(0, maxListSize);

        $.each(viewedList, function(i, lii){
            ul.append(lii); /* This removes li from the old spot and moves it */
        });
    }
    catch(error){}
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
    types: 'address',
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

function centerOnLocation(map){
    if (navigator.geolocation) 
    {
        navigator.geolocation.getCurrentPosition(function(position) {
            var currLocation = [position.coords.longitude, position.coords.latitude];
            map.setCenter(currLocation);
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
    var map = new mapboxgl.Map({
        attributionControl: false,
        container: 'map',
        style: mapStyleUrl,
        // Default to Algiers, Algeria.
        center: [3.0588, 36.7538],
        zoom: 11
        // No custom min/max zoom constraints; allow Mapbox defaults.
    });

    map.dragRotate.disable();
    map.addControl(new mapboxgl.NavigationControl({showCompass:false}));
    if(window.location.search.includes("location")) centerOnLocation(map);
    map.addControl(geolocate);

    map.on('load', function()
    {
        if(window.location.search.includes("location")) geolocate.trigger();

        map.on('moveend', function()
        {
            // Pulling places from server
            bb   = map.getBounds();
            nwbb = bb.getNorthWest().toArray();
            nebb = bb.getNorthEast().toArray();
            sebb = bb.getSouthEast().toArray();
            swbb = bb.getSouthWest().toArray();
            
            if(!inbounds(nwbb, lookupArea[1], lookupArea[3]) || 
            !inbounds(nebb, lookupArea[1], lookupArea[3]) || 
            !inbounds(sebb, lookupArea[1], lookupArea[3]) || 
            !inbounds(swbb, lookupArea[1], lookupArea[3]) )
            {
                // if current bounding box goes outside lookupArea, then update lookup Area
                LoadPlacesFromServer([nwbb, nebb, sebb, swbb, nwbb]);
            }
            else
            {
                // filtering preview list locally only
                update(); 
            }      
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

        map.on('click', 'places', function (e) {
            // displays popup
            map.getCanvas().style.cursor = 'pointer';
            var coordinates = e.features[0].geometry.coordinates;
            var description = e.features[0].properties.rent + " | " + e.features[0].properties.placetype.toLowerCase();
            var place_url =  "Place/" + e.features[0].properties.name;
            popup.setLngLat(coordinates)
                .setHTML('<a href= "' + place_url + '" >' + description + '</a>')
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
}

   


var HighestFirst = false;
var UpRange, LoRange;
var BedsSelection = [0,0,0,0,0]; // binary array. Display all by default

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
    //console.log("stage 1");
    updateImp(LoRange, UpRange, BedsSelection);
    //console.log("stage 2");
    updateMap();
    //console.log("stage 3");
    updatePreview();
    //console.log("stage 4");
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////// CREATE PLACE //////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

if($("#file-upload").length != 0)
{

    $("#file-upload").change(function(){
        $("#file-count").text(this.files.length + (this.files.length == 1 ? " file" : " files") + " selected.");
    });

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
    $(document).on('click', function(e) 
    {
        var list = document.getElementById('mbaa-result-address-autocomplete2');

        // ✅ FIX 1: check if list exists
        if (!list) return;

        if (!addressSearch.is(e.target) && addressSearch.has(e.target).length === 0)
        {
            var items = list.getElementsByTagName('li');

            // ✅ FIX 2: check if list has items
            if (items.length === 0) {
                list.style.display = "none";
                return;
            }

            var firstli = items[0];

            if(addressSearch.val() && !longitude.val())
            {
                addressSearch.val(firstli.textContent); 
                $(firstli).click();
            }

            list.style.display = "none";
        }
        else {
            list.style.display = "";
        }
    });


}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////// MY PLACES/APPS /////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var selectedAppOrPlace;
$('.btn-delete').click(function(e){
    selectedAppOrPlace = e.target.parentElement;
});

$('#actionDelete').click(function(e){
    var btns = document.getElementsByClassName("finalDelete");
    for (i = 0; i < btns.length; i++)
    {
        if(btns[i].parentElement == selectedAppOrPlace){
            btns[i].click();
        }
    }
});

// Sending a message to an applicant
$('#MessageModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    var recipientId = $("#modal-applicantid");
    var recipientName = button.data('username');
    var modal = $(this);
    recipientId.val(button.data('applicantid'));
    modal.find('.modal-title').text('New Message to ' + recipientName)
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////// MANAGE ////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#imagePreview').css('background-image', 'url(' + e.target.result + ')');
            $('#imagePreview').hide();
            $('#imagePreview').fadeIn(650);
        }
        reader.readAsDataURL(input.files[0]);
    }
}
$("#imageUpload").change(function() {
    readURL(this);
});

});

document.addEventListener('turbo:load', function () {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-upload');
    const previewContainer = document.getElementById('image-preview');
    const fileCountEl = document.getElementById('file-count');

    if (!dropzone || !fileInput) return;

    let filesArray = [];

    function renderPreviews() {
        previewContainer.innerHTML = '';
        filesArray.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const div = document.createElement('div');
                div.className = 'relative group';
                div.innerHTML = `
                    <img src="${e.target.result}" 
                        class="w-full aspect-square object-cover rounded-2xl shadow-sm border border-gray-200">
                    <button type="button" 
                            data-index="${index}"
                            class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow transition-all opacity-0 group-hover:opacity-100">
                        ✕
                    </button>
                    <div class="text-xs text-gray-500 mt-1 truncate">${file.name}</div>
                `;
                previewContainer.appendChild(div);
            };
            reader.readAsDataURL(file);
        });

        fileCountEl.textContent = `${filesArray.length} file${filesArray.length === 1 ? '' : 's'} selected`;
    }

    function syncFilesToInput() {
        const dt = new DataTransfer();
        filesArray.forEach(file => dt.items.add(file));
        fileInput.files = dt.files;
    }

    // === CLICK TO BROWSE ===
    // Only trigger manually if the click was OUTSIDE the label
    // (clicks on the label already open the dialog natively)
    dropzone.addEventListener('click', function (e) {
        if (e.target.closest('label')) return;
        fileInput.click();
    });

    // === SYNC FILES ON SUBMIT ===
    const form = dropzone.closest('form');
    form.addEventListener('submit', function () {
        syncFilesToInput();
    });

    // === FILE SELECTED ===
    fileInput.addEventListener('change', function (e) {
        const newFiles = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));

        if (newFiles.length > 0) {
            filesArray = [...filesArray, ...newFiles].slice(0, 10);
            renderPreviews();
        }

        setTimeout(() => { fileInput.value = ''; }, 0);
    });

    // === DRAG & DROP ===
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '#ff8138';
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = '';
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '';

        const newFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        filesArray = [...filesArray, ...newFiles].slice(0, 10);
        renderPreviews();
    });

    // === REMOVE IMAGE ===
    previewContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-index]');
        if (btn) {
            const index = parseInt(btn.dataset.index);
            filesArray.splice(index, 1);
            renderPreviews();
        }
    });
});