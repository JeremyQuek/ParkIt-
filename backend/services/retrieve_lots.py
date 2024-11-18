import os
import requests
from services.api import retrieve_HDB_lots, retrieve_LTA_lots
from utils.performance import measure_time
from utils.token import get_token
from dotenv import load_dotenv

load_dotenv()
HDB_URL=os.getenv("HDB_LOTS_URL")
LTA_URL=os.getenv("LTA_LOTS_URL")
ACCESS_KEY=os.getenv("LTA_ACCESS_KEY")

def search_by_id_HDB(id, lots_data):
    for lot in lots_data:
        if lot["carpark_number"]==id:
            return lot["carpark_info"]

@measure_time
def update_result_with_HDB_lots(carpark_data):
    lots_data = retrieve_HDB_lots()
    for carpark in carpark_data:
        res=search_by_id_HDB(carpark["carpark_id"], lots_data)
        carpark.update(res[0]) if res else carpark.update({"lot_type":None})
    return carpark_data

def search_by_id_LTA(id, lots_data):
    for lot in lots_data:
        if lot["CarParkID"]==id:
            return {"lot_type": lot["LotType"],
                "lots_available": lot["AvailableLots"],
                "total_lots": None
            }
@measure_time
def update_result_with_LTA_lots(carpark_data):
    lots_data = retrieve_LTA_lots()
    for carpark in carpark_data:
        res=search_by_id_LTA(carpark["carpark_id"], lots_data)
        carpark.update(res) if res else None
    return carpark_data
