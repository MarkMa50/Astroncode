 = New-Object -ComObject WScript.Shell
 = .CreateShortcut("C:\Users\markw\OneDrive\桌面\Astroncode.lnk")
.TargetPath = "C:\Users\markw\astroncode\astroncode.cmd"
.WorkingDirectory = "C:\Users\markw\astroncode"
.Description = "Astroncode - Local Coding Assistant"
.Save()
Write-Host "Shortcut created successfully"