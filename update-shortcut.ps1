Add-Type -AssemblyName Shell32
$shell = New-Object -ComObject Shell.Application
$desktop = $shell.Namespace(0x0) # Desktop
$shortcut = $desktop.ParseName("Astroncode.lnk")
if ($shortcut) {
    $sh = New-Object -ComObject WScript.Shell
    $lnk = $sh.CreateShortcut("$env:USERPROFILE\OneDrive\桌面\Astroncode.lnk")
    $lnk.TargetPath = "C:\Users\markw\astroncode\astroncode.cmd"
    $lnk.WorkingDirectory = "C:\Users\markw\astroncode"
    $lnk.Description = "Astroncode - Local Coding Assistant"
    $lnk.Save()
    Write-Host "Shortcut updated successfully"
} else {
    Write-Host "Shortcut not found"
}
