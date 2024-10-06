from django.shortcuts import render

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
# import geopandas as gpd
# from shapely.geometry import Point
import json
import os
from django.conf import settings
import json
from landsatxplore.api import API
from landsatxplore.earthexplorer import EarthExplorer

# Replace with your Earth Explorer credentials
username = "hks3333"
password = "T/j@yBW75hEbvr/"

# Initialize the API instance and get an access key
api = API(username, password)

# Load the WRS-2 shapefile (you may want to do this once, outside the view for efficiency)

@csrf_exempt
def find_wrs2_grid(request):
    # wrs2_file_path = os.path.join(settings.BASE_DIR, 'location', 'files', 'WRS2_descending.shp')
    # wrs2 = gpd.read_file(wrs2_file_path)
    # if request.method == 'POST':
    #     data = json.loads(request.body)
    #     latitude = data.get('latitude')
    #     longitude = data.get('longitude')

    #     if latitude is None or longitude is None:
    #         return JsonResponse({'error': 'Latitude and longitude are required.'}, status=400)

    #     # Create a point from the latitude and longitude
    #     location = Point(longitude, latitude)

    #     # Find the corresponding WRS-2 grid
    #     matching_grid = wrs2[wrs2.contains(location)]

    #     if not matching_grid.empty:
    #         path = int(matching_grid.iloc[0]['PATH'])
    #         row = int(matching_grid.iloc[0]['ROW'])
    #         print(path, row)

    # Search for Landsat TM scenes
    if request.method == 'POST':
        data = json.loads(request.body)
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        # start_date = data.get('start_date')
        # end_date = data.get('end_date')

        if latitude is None or longitude is None:
            return JsonResponse({'error': 'Latitude and longitude are required.'}, status=400)

    scenes = api.search(
        dataset='landsat_tm_c2_l1',
        latitude=latitude,
        longitude=longitude,
        start_date='1995-01-01', #TODO
        end_date='1995-10-01',
        max_cloud_cover=10
    )

    ee = EarthExplorer(username, password)
    
    # Process the result
    for scene in scenes:
        acquisition_date = scene['acquisition_date'].strftime('%Y-%m-%d')
        product_id = scene['landsat_product_id']  # Filename/Product ID for download

        print(f"Scene acquired on {acquisition_date}, Product ID: {product_id}")

        # Write scene footprints to disk (as GeoJSON)
        fname = f"{product_id}.geojson"
        with open(fname, "w") as f:
            json.dump(scene['spatial_coverage'].__geo_interface__, f)

        # Download the scene using the product ID
        lst = ee.download(product_id, output_dir=".")
        print(f"Scene {product_id} downloaded successfully.")
        print(lst)


    return JsonResponse(lst, safe=False)
#    else:
 #   return JsonResponse({'error': 'No matching grid found.'}, status=404)

    # return JsonResponse({'error': 'Invalid request method.'}, status=405)


