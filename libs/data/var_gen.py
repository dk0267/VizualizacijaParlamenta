from os import listdir
from os import getcwd
from os.path import isfile, join
onlyfiles = [f for f in listdir(getcwd()) if isfile(join(getcwd(), f))]

fajl = open("datas.txt","w")
fajl.write("var datas = { \n")
for fil in onlyfiles:
    if fil != "var_gen.py":
        fajl.write("\""+fil+"\",\n")
fajl.write("};")
fajl.close()
