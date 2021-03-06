# -----------------------------------------------------------------------
# payment.py
# Author: Expresso backend developers
# -----------------------------------------------------------------------

from datetime import date
from database import connect, disconnect
from LDAP import LDAP
from sys import stderr

today = date.today()

# ensure that the four years match the current undergraduate population at Princeton
freshman = 2023
sophomore = 2022
junior = 2021
senior = 2020

# change this at beginning of year (close date for seniors)
last_valid_date_seniors = ("2020", "04", "07")


# validate whether individual can purchase coffee online: return false if not valid student or true if valid student
def validate(netid):
    year = int(today.strftime("%Y"))
    month = int(today.strftime("%m"))
    day = int(today.strftime("%d"))
    valid_class_year = (freshman, sophomore, junior, senior)
    last_valid_year = int(last_valid_date_seniors[0])
    last_valid_month = int(last_valid_date_seniors[1])
    last_valid_day = int(last_valid_date_seniors[2])

    conn = LDAP()
    conn.connect_LDAP()

    puclassyear = conn.get_puclassyear(netid)
    pustatus = conn.get_pustatus(netid)

    conn.disconnect_LDAP()

    if pustatus != 'undergraduate':
        return False
    if puclassyear not in valid_class_year:
        return False
    if puclassyear == valid_class_year[3]:
        if month > last_valid_month and year >= last_valid_year:
            return False
        if month == last_valid_month and year >= last_valid_year and day > last_valid_day:
            return False

    return True


# write to the .mp file all orders that are unpaid or are student charge
def charge(pay_file):
    mydb = connect()
    mycursor = mydb.cursor()
    todaydate = today.strftime("%Y-%m-%d")
    first = todaydate + " 00:00:00"
    last = todaydate + " 23:59:59"
    sql = "SELECT * FROM order_history WHERE timestamp BETWEEN %s and %s"
    val = (first, last)
    try:
        mycursor.execute(sql, val)
    except Exception as e:
        print("Charge failure: selecting order failed: %s", str(e), file=stderr)

    row = mycursor.fetchone()

    while row is not None:
        netid = row[0]
        netid = netid.rstrip()
        paid = row[5]
        payment_type = row[4]

        result = validate(netid)
        if not result:
            row = mycursor.fetchone()
            continue

        if payment_type or (paid == 0):
            cost = str(row[3])
            cost = cost.replace('.', '')
            pay_file.write('C,%s,110,--%s,Coffee Club\n' % (netid, cost))

        row = mycursor.fetchone()

    mycursor.close()
    disconnect(mydb)


# open an .mp file to write into
def open_file():
    name = today.strftime("%Y-%m-%d")
    pay_file = open("/Users/HariRaval/Desktop/expresso/CCcharge%s.mp" % name, "w+")
    return pay_file


# close the .mp file that is being written to
def close_file(pay_file):
    pay_file.close()


# open a file and call the main driver function to write to this file
def main():
    pay_file = open_file()
    charge(pay_file)


if __name__ == "__main__":
    main()
