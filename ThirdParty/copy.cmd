robocopy %1 %2 %3 /Z
if errorlevel 8 (exit /B errorlevel) else (exit /B 0)
