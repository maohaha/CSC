import mysql.connector
import json

class parkingmanager:
    cnx = None
    def __init__(self, cnx) :
        self.cnx = cnx
    def __del__(self) :
        self.cnx.close()
    # we can't send email in python, so leave it to the php people
    def updateParking(self, username) :
        cursor = self.cnx.cursor(buffered=True)
        query1 = ("SELECT * FROM `parking` WHERE `username`=%s")
        data_query1 = (username,)
        cursor.execute(query1, data_query1)
        self.cnx.commit()
        ret = "["
        for row in cursor :
            ret += json.dumps(row)
            ret += ","
        ret = ret[:len(ret)-1] # delete last comma
        ret += "]"
        print ret

    def removeParkingSection(self, username) :
        cursor = self.cnx.cursor(buddered=True)
        query1 = ("SELECT * FROM `parking` WHERE `username`=%s")
        data_query1 = (username,)
        cursor.execute(query1, data_query1)
        self.cnx.commit()
        if cursor.rowcount <= 0 :
            return "1"  # doesn't have the record
        else :
            query2 = ("DELETE FROM `parking` WHERE `username`=%s")
            data_query2 = (username,)
            cursor.execute(query2, data_query2)
            self.cnx.commit()
        
        return "0"  #success delet

