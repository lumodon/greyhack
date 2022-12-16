import_code("/home/usr/Src/includelib.src")

mx = load_library("metaxploit.so")
if not mx then exit("<color=#ff0000>No metaxploit library found</color>")

crypto = load_library("crypto.so")
if not crypto then exit("<color=#ff0000>No crypto library found</color>")

if not params.len or params.len < 3 then exit("Usage: stex kernel_module 0x5B67800A daexploitstring")
if params[0][-3:] != ".so" then params[0] = params[0] + ".so"
if params[1].len != 10 then exit("Hex should be 10 characters long such as: 0x5B67800A")
if params[2].len < 1 then exit("Missing final parameter - exploit string portion.")


metaLib = mx.load("/lib/" + params[0])
if not metaLib then
	print("<color=#EEFF00>" + targetLib + " was not found on this system.</color>")
	return []
end if

result = metaLib.overflow(params[1], params[2], "pass")
usershell = null
targetPc = null

if not result then exit("Exploit failed. Try another")

if typeof(result) == "shell" then
	result.start_terminal
	usershell = result
else if typeof(result) == "computer" then
	targetPc = result
else
	print("Non-shell hack result: " + result)
end if


if usershell then
	targetPc = usershell.host_computer
end if

if not targetPc then exit("Cannot escellate to root without a shell or computer result. Did you get login info? Try logging in")

// Get root access.
print("Attempting to get root access...")
if not crypto then exit("Error: Crypto not found on system.")
file = targetPc.File("/etc/passwd")
if not file then exit("Error: Cannot get passwd file.")
if not file.has_permission("r") then exit("/etc/passwd: Permission denied.")
if file.is_binary or file.is_folder then exit("File is either binary or a folder.")
roothash = file.get_content.split("\n")[0].split(":")[1]
if not roothash then exit("Error: Cannot get root hash.")
password = crypto.decipher(roothash)
if not password then exit("Error: Failed to decrypt root password.")
print("User: root\nPass: " + password)
get_shell("root", password).start_terminal
