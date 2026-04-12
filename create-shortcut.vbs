Set WshShell = CreateObject("WScript.Shell")
Set shortcut = WshShell.CreateShortcut("C:\Users\Public\Desktop\Astroncode.lnk")
shortcut.TargetPath = "C:\Users\markw\astroncode\astroncode.cmd"
shortcut.WorkingDirectory = "C:\Users\markw\astroncode"
shortcut.Description = "Astroncode - Local Coding Assistant"
shortcut.Save
WScript.Echo "Shortcut created successfully"
