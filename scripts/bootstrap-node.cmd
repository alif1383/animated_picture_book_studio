@echo off
set "AGY_EXE="
if defined ANTIGRAVITY_AGENTAPI_EXE (
  for %%I in ("%ANTIGRAVITY_AGENTAPI_EXE%\..\..\..") do (
    if exist "%%~fI\Antigravity.exe" set "AGY_EXE=%%~fI\Antigravity.exe"
  )
)
if not defined AGY_EXE (
  if exist "%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe" set "AGY_EXE=%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe"
)
if not defined AGY_EXE (
  if exist "%ProgramFiles%\Antigravity\Antigravity.exe" set "AGY_EXE=%ProgramFiles%\Antigravity\Antigravity.exe"
)
set "SHIM_DIR_1=%USERPROFILE%\.gemini\antigravity\bin"
if defined ANTIGRAVITY_APP_DATA_DIR set "SHIM_DIR_1=%ANTIGRAVITY_APP_DATA_DIR:/=\%\bin"
set "SHIM_DIR_2=%APPDATA%\Antigravity\bin"
if defined AGY_EXE goto :create_shim
goto :check_args
:create_shim
if not exist "%SHIM_DIR_1%" mkdir "%SHIM_DIR_1%" 2>nul
> "%SHIM_DIR_1%\agy-node.cmd" echo @echo off
>> "%SHIM_DIR_1%\agy-node.cmd" echo set ELECTRON_RUN_AS_NODE=1
>> "%SHIM_DIR_1%\agy-node.cmd" echo "%AGY_EXE%" %%*
if not exist "%SHIM_DIR_2%" mkdir "%SHIM_DIR_2%" 2>nul
> "%SHIM_DIR_2%\agy-node.cmd" echo @echo off
>> "%SHIM_DIR_2%\agy-node.cmd" echo set ELECTRON_RUN_AS_NODE=1
>> "%SHIM_DIR_2%\agy-node.cmd" echo "%AGY_EXE%" %%*
:check_args
if "%~1"=="" (
  echo [bootstrap-node] agy-node is ready ^(backed by "%AGY_EXE%"^)
  goto :eof
)
if defined AGY_EXE (
  set ELECTRON_RUN_AS_NODE=1
  "%AGY_EXE%" %*
  goto :eof
)
where agy-node >nul 2>nul && (call agy-node %* & goto :eof)
where node >nul 2>nul && (node %* & goto :eof)
echo [bootstrap-node] ERROR: Could not locate Antigravity.exe or node.exe >&2
exit /b 1
