import psycopg2

def queryDB():
    conn = psycopg2.connect("dbname=candle_companion_db user=admin password=AFFicioman123123")

    cur = conn.cursor()

    cur.execute('SELECT * from candles')

    candles = cur.fetchall()

    print(candles)

queryDB()