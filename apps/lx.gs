import_code("/home/usr/Src/includelib.src")
import_code("/home/usr/Src/hackutils.src")

mx = load_library("metaxploit.so")
if not mx then exit("<color=#ff0000>No metaxploit library found</color>")

crypto = load_library("crypto.so")
if not crypto then exit("<color=#ff0000>No crypto library found</color>")

hackLibs = get_local_hacks()
shells = []

for hackLib in hackLibs
	if hackLib.hacks.len == 0 then exit("<color=#FF0000>Error: No local hacks found.\nSWITCH YOUR WI-FI YOU'RE GOING TO EVENTUALLY GET CAUGHT</color>")

	lib = hackLib.dump
	if not lib then
		print("Strange Error: lib " + hackLib.library + " had no associated metaLib")
		continue
	end if

	print("Attempting " + hackLib.library)
	for hack in hackLib.hacks
		for value in hack.values
			result = lib.overflow(hack.memory, value, "pass")

			if not result then continue

			print("hack result: " + result)
			if typeof(result) == "shell" then
				shells.push(get_shell_type(result))
			end if

		end for
	end for
end for


if shells.len == 0 then exit("<color=#EEFF00>Warning: No shells obtained from those local hacks. Better hope you got a password otherwise prepare to dc and switch wifi</color>")

default = null
while not default
	i = 1
	while i < shells.len
		print(i + ". Shell [" + shells[i]["user"] + "]")
		i = i + 1
	end while
	print("0. Exit")
	answer = user_input("Enter choice: ")
	answer = answer.val
	if answer > 0 and answer < shells.len then
		default = shells[answer - 1]
	end if
	if answer == 0 then exit("You chose to exit instead.")
end while

// Login to normal user account.
print("Logging into normal user account...")
homedir = default.shell.host_computer.File("/home")
if not homedir then exit("Error: Could not get home directory.")
username = null
usershell = null
for dir in homedir.get_folders
	if dir.name != "guest" then
		username = dir.name
		usershell = get_shell(username, "pass")
		if usershell != null then break
	end if
end for
if not usershell then
	print("Password not modified, logging into guest shell.")
	default.shell.start_terminal
end if

// Get root access.
print("Getting root access...")
if not crypto then exit("Error: Crypto not found on system.")
file = usershell.host_computer.File("/etc/passwd")
if not file then exit("Error: Cannot get passwd file.")
if not file.has_permission("r") then exit("/etc/passwd: Permission denied.")
if file.is_binary or file.is_folder then exit("File is either binary or a folder.")
roothash = file.get_content.split("\n")[0].split(":")[1]
if not roothash then exit("Error: Cannot get root hash.")
password = crypto.decipher(roothash)
if not password then exit("Error: Failed to decrypt root password.")
print("User: root\nPass: " + password)
get_shell("root", password).start_terminal
