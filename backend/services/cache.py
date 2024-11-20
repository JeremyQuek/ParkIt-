import requests
import os
import psycopg2
from psycopg2 import Error
from dotenv import load_dotenv
from utils.performance import measure_time
from services.api import retrieve_HDB_lots, retrieve_LTA_lots
from services.database import open_connection

load_dotenv()
DB_PARAMS = {
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST')
}

@measure_time
def cache_lots_and_update_db():
    data = retrieve_HDB_lots()
    data.extend(retrieve_LTA_lots())
    data = [(d['carpark_id'], d['lot_type'], d['lots_available'], d['total_lots']) for d in data][:2]

    conn = open_connection()
    try:
        cur = conn.cursor()

        # Create the table if it doesn't exist
        cur.execute("""
            CREATE TABLE IF NOT EXISTS temp_carpark_updates (
                carpark_id VARCHAR(200),
                lot_type VARCHAR(200),
                lots_available VARCHAR(200),
                total_lots VARCHAR(200)
            )
        """)

        # Prepare data for COPY
        csv_data = "\n".join([f"{carpark_id},{lot_type},{lots_available},{total_lots}" for carpark_id, lot_type, lots_available, total_lots in data])
        from io import StringIO
        # Use StringIO to simulate a file-like object
        csv_file = StringIO(csv_data)

        # Perform the bulk insert using COPY
        cur.copy_from(csv_file, 'temp_carpark_updates', sep=',')

        # Perform the update from the temp table to the actual table
        cur.execute("""
            UPDATE carpark
            SET
                lot_type = temp_carpark_updates.lot_type,
                lots_available = temp_carpark_updates.lots_available,
                total_lots = temp_carpark_updates.total_lots
            FROM temp_carpark_updates
            WHERE carpark.carpark_id = temp_carpark_updates.carpark_id
        """)

        conn.commit()
        print("Database updated successfully")
        return True
    except Exception as e:
        print(f"Error updating database: {e}")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

# if __name__ == "__main__":
#     retrieve_and_update_db()
