
:: use call so if a program fails, the bat continues to run

:: move to the working directory
cd C:\vagrant\
:: run mocha
call C:\Users\vagrant\AppData\Roaming\npm\mocha.cmd test\sp-scquery.js
set elevate=
call C:\Users\vagrant\AppData\Roaming\npm\mocha.cmd test\index.js
call C:\Users\vagrant\AppData\Roaming\npm\mocha.cmd test\funct.js
set elevate="yes"
call C:\Users\vagrant\AppData\Roaming\npm\mocha.cmd test\index.js
call C:\Users\vagrant\AppData\Roaming\npm\mocha.cmd test\funct.js
