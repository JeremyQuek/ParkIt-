from dotenv.main import load_dotenv
import psycopg2
import csv
import os
from psycopg2 import Error

load_dotenv()
DB_PARAMS = {
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST')
}

def open_connection():
    """Create a database connection"""
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        return conn
    except Error as e:
        print(f"Error connecting to PostgreSQL: {e}")
        return None

def create_table(conn):
    """Create the carpark table if it doesn't exist"""
    try:
        cur = conn.cursor()
        cur.execute('''
            CREATE TABLE IF NOT EXISTS carpark (
                agency VARCHAR(10) NOT NULL,
                carpark_id VARCHAR(20) NOT NULL PRIMARY KEY,
                address VARCHAR(200) NOT NULL,
                lat VARCHAR(200) NOT NULL,
                long VARCHAR(200) NOT NULL,
                price VARCHAR(200) NOT NULL,
                price_weekend VARCHAR(200) NOT NULL,
                ev VARCHAR(10) NOT NULL
            )
        ''')
        conn.commit()
        print("Table created successfully")
    except Error as e:
        print(f"Error creating table: {e}")
    finally:
        if cur:
            cur.close()

def populate_carparks(data, conn):
    """Populate the carpark table with data using COPY"""
    try:
        cur = conn.cursor()

        # Create a temporary table for new data
        cur.execute('''
            CREATE TEMP TABLE temp_carpark (
                agency VARCHAR(10) NOT NULL,
                carpark_id VARCHAR(20) NOT NULL,
                address VARCHAR(200) NOT NULL,
                lat VARCHAR(200) NOT NULL,
                long VARCHAR(200) NOT NULL,
                price VARCHAR(200) NOT NULL,
                price_weekend VARCHAR(200) NOT NULL,
                ev VARCHAR(10) NOT NULL
            )
        ''')

        # Use StringIO to create a file-like object in memory
        from io import StringIO
        buffer = StringIO()
        for row in data:
            buffer.write('\t'.join(str(item) for item in row) + '\n')
        buffer.seek(0)

        # Use COPY to bulk insert data
        cur.copy_from(
            buffer,
            'temp_carpark',
            columns=('agency', 'carpark_id', 'address', 'lat', 'long', 'price', 'price_weekend', 'ev'),
            sep='\t'
        )

        # Insert from temp table to main table, avoiding duplicates
        cur.execute('''
            INSERT INTO carpark
            SELECT * FROM temp_carpark
        ''')

        conn.commit()
        print("Populated carpark table")
    except Error as e:
        print(f"An error occurred while updating carparks: {e}")
    finally:
        if cur:
            cur.close()
def main():
    # Connect to database
    conn = open_connection()
    if not conn:
        return

    try:
        # Create table
        create_table(conn)

        # Prepare data from CSV
        desired_headers = ['agency', 'carpark_id', 'address', 'lat', 'long',
                         'price', 'price_weekend', 'EV']

        csv_file_path = '/Users/jeremyquek/Desktop/Projects/app projects/ParkIt_App/backend/assets/CarparkInformation_final.csv'
        data = []

        with open(csv_file_path, mode='r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                selected_row = {key: row[key] for key in desired_headers if key in row}
                data.append(tuple(selected_row.values()))

        # Populate database
        populate_carparks(data, conn)

        # Print row count for verification
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM carpark")
        count = cur.fetchone()[0]
        print(f"Total rows in database: {count}")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        if conn:
            conn.close()
            print("Database connection closed")

def retrieve_carparks():
    conn=open_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM carpark")
        rows = cur.fetchall()

        # Get column names from cursor description
        columns = [desc[0] for desc in cur.description]

        carpark_dict = {
            row[1]: {  # carpark_id is at index 1
                columns[0]: row[0],  # agency
                columns[1]: row[1],  # carpark_id
                columns[2]: row[2],  # address
                columns[3]: row[3],  # lat
                columns[4]: row[4],  # long
                columns[5]: row[5],  # price
                columns[6]: row[6],  # price_weekend
                columns[7]: row[7]   # ev
            }
            for row in rows
        }

        return carpark_dict
    except psycopg2.Error as e:
        print(f"An error occurred while retrieving carparks: {e}")
        return {}
    finally:
        if cur:
            cur.close()

if __name__ == "__main__":
    main()
