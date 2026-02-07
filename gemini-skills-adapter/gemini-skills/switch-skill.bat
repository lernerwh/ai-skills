@echo off
REM Superpowers 技能切换脚本 (Windows)
REM 用法: switch-skill.bat <skill-name>

setlocal
set "SKILLS_DIR=%~dp0"
set "SKILL_NAME=%~1"

if "%SKILL_NAME%"=="" (
    echo 用法: %~nx0 ^<skill-name^>
    echo.
    echo 可用技能:
    dir /b "%SKILLS_DIR%*.md" | findstr /v "switch-skill"
    exit /b 1
)

set "SKILL_FILE=%SKILLS_DIR%%SKILL_NAME%.md"

if not exist "%SKILL_FILE%" (
    echo ❌ 技能不存在: %SKILL_NAME%
    echo.
    echo 可用技能:
    dir /b "%SKILLS_DIR%*.md" | findstr /v "switch-skill"
    exit /b 1
)

set GEMINI_SYSTEM_MD=%SKILL_FILE%
echo ✅ 已切换到技能: %SKILL_NAME%
echo    系统提示词: %SKILL_FILE%
