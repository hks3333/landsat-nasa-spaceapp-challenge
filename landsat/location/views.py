from django.shortcuts import render

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import geopandas as gpd
from shapely.geometry import Point
import json
import os
from django.conf import settings

# Load the WRS-2 shapefile (you may want to do this once, outside the view for efficiency)

@csrf_exempt
def find_wrs2_grid(request):
    wrs2_file_path = os.path.join(settings.BASE_DIR, 'location', 'files', 'WRS2_descending.shp')
    wrs2 = gpd.read_file(wrs2_file_path)
    if request.method == 'POST':
        data = json.loads(request.body)
        latitude = data.get('latitude')
        longitude = data.get('longitude')

        if latitude is None or longitude is None:
            return JsonResponse({'error': 'Latitude and longitude are required.'}, status=400)

        # Create a point from the latitude and longitude
        location = Point(longitude, latitude)

        # Find the corresponding WRS-2 grid
        matching_grid = wrs2[wrs2.contains(location)]

        if not matching_grid.empty:
            path = int(matching_grid.iloc[0]['PATH'])
            row = int(matching_grid.iloc[0]['ROW'])
            return JsonResponse({'path': path, 'row': row})
        else:
            return JsonResponse({'error': 'No matching grid found.'}, status=404)

    return JsonResponse({'error': 'Invalid request method.'}, status=405)
